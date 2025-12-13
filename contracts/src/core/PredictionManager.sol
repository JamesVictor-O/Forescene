// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";


contract PredictionManager is Ownable, ReentrancyGuard {
   
    using SafeERC20 for IERC20; 


    enum Outcome { INVALID, YES, NO }
    enum Status { ACTIVE, LOCKED, RESOLVED }
    
    uint256 private constant BASIS_POINTS = 10000; 
    uint256 private constant MAX_BONUS = 2000; 

  

    enum MarketType { CrowdWisdom, Binary }
    
    struct Market {
        MarketType marketType;
        address oracle;
        uint256 marketStartTimestamp;
        uint256 deadlineTimestamp;
        uint256 totalYesStakedRaw;
        uint256 totalNoStakedRaw;
        uint256 totalYesStakedWeighted;
        uint256 totalNoStakedWeighted;
        uint256 platformFeeBps; 
        Status status;
        Outcome winningOutcome;
        string question; 
        string category;
        string initialOutcomeLabel;
        address creator;
    }

    struct UserStake {
        uint256 yesAmountWeighted;
        uint256 noAmountWeighted;
        uint256 yesAmountRaw; 
        uint256 noAmountRaw;
        bool claimed;
    }


    IERC20 public immutable kpToken; 
    address public treasuryAddress;
    uint256 public nextMarketId = 1;

    mapping(uint256 => Market) public markets;
    mapping(uint256 => mapping(address => UserStake)) public userStakes;
    mapping(uint256 => string[]) public marketOutcomes; 
    mapping(uint256 => mapping(string => uint256)) public outcomeToIndex; 
    mapping(uint256 => mapping(uint256 => uint256)) public outcomePoolAmounts; 
    mapping(uint256 => mapping(address => mapping(uint256 => uint256))) public userOutcomeStakes; 
    mapping(uint256 => uint256) public maxOutcomesPerMarket; 
    
    error UnauthorizedOracle();
    error InvalidMarketStatus();
    error InvalidStakeAmount();
    error InvalidOutcome();
    error DeadlineExceeded();
    error AlreadyClaimed();
    error NoWinnings();
    error UnauthorizedCaller();
    error FeeBurnFailed(); // Added for clarity


    constructor(address initialOwner, address _kpTokenAddress, address _treasuryAddress) 
        Ownable(initialOwner) {
        kpToken = IERC20(_kpTokenAddress); 
        treasuryAddress = _treasuryAddress;
    }

    function setTreasuryAddress(address _newTreasury) external onlyOwner {
        treasuryAddress = _newTreasury;
    }

 
    function createMarket(
        MarketType _marketType,
        string memory _question,
        string memory _category,
        uint256 _endTime,
        uint256 _initialStake,
        uint8 _initialSide,
        string memory _initialOutcomeLabel
    ) external nonReentrant returns (uint256 marketId) {
        require(bytes(_question).length > 0, "MarketFactory: empty question");
        require(bytes(_category).length > 0, "MarketFactory: empty category");
        require(_endTime > block.timestamp, "MarketFactory: invalid end time");
        require(_endTime <= block.timestamp + 365 days, "MarketFactory: end time too far");
        require(_initialStake > 0, "MarketFactory: initial stake required");

        if (_marketType == MarketType.CrowdWisdom) {
            require(bytes(_initialOutcomeLabel).length > 0, "MarketFactory: CrowdWisdom requires initial outcome");
        }

     
        kpToken.safeTransferFrom(msg.sender, address(this), _initialStake);

        marketId = nextMarketId++;
        
       
        address _oracle = msg.sender;
        uint256 _platformFeeBps = 500;
        
    
        markets[marketId] = Market({
            marketType: _marketType,
            question: _question,
            category: _category,
            oracle: _oracle,
            marketStartTimestamp: block.timestamp,
            deadlineTimestamp: _endTime,
            totalYesStakedRaw: 0,
            totalNoStakedRaw: 0,
            totalYesStakedWeighted: 0,
            totalNoStakedWeighted: 0,
            platformFeeBps: _platformFeeBps,
            status: Status.ACTIVE,
            winningOutcome: Outcome.INVALID,
            initialOutcomeLabel: _initialOutcomeLabel,
            creator: msg.sender
        });

        // Place the initial stake based on market type
        Market storage newMarket = markets[marketId];
        uint256 multiplier = _calculateWeightMultiplier(newMarket);
        uint256 weightedAmount = _initialStake * multiplier / BASIS_POINTS;

        if (_marketType == MarketType.Binary) {
            // Binary market: use Yes/No
            Outcome initialChoice = _initialSide == 0 ? Outcome.YES : Outcome.NO;
            
            if (initialChoice == Outcome.YES) {
                newMarket.totalYesStakedRaw = _initialStake;
                newMarket.totalYesStakedWeighted = weightedAmount;
            } else {
                newMarket.totalNoStakedRaw = _initialStake;
                newMarket.totalNoStakedWeighted = weightedAmount;
            }

            // Record the creator's initial stake
            UserStake memory initialStake = UserStake({
                yesAmountWeighted: initialChoice == Outcome.YES ? weightedAmount : 0,
                noAmountWeighted: initialChoice == Outcome.NO ? weightedAmount : 0,
                yesAmountRaw: initialChoice == Outcome.YES ? _initialStake : 0,
                noAmountRaw: initialChoice == Outcome.NO ? _initialStake : 0,
                claimed: false
            });
            userStakes[marketId][msg.sender] = initialStake;

            emit PredictionPlaced(marketId, msg.sender, initialChoice, _initialStake, weightedAmount, multiplier);
        } else {
            // CrowdWisdom market: create first outcome
            maxOutcomesPerMarket[marketId] = 50; // Default max outcomes
            
            string memory normalizedLabel = _normalizeString(_initialOutcomeLabel);
            require(bytes(normalizedLabel).length > 0, "PredictionManager: invalid outcome label");
            
            marketOutcomes[marketId].push(normalizedLabel);
            outcomeToIndex[marketId][normalizedLabel] = 0;
            outcomePoolAmounts[marketId][0] = _initialStake;
            userOutcomeStakes[marketId][msg.sender][0] = _initialStake;
            
            // Also update total pools for compatibility
            newMarket.totalYesStakedRaw = _initialStake;
            newMarket.totalYesStakedWeighted = weightedAmount;

            emit OutcomeCreated(marketId, 0, normalizedLabel);
            emit PredictionPlaced(marketId, msg.sender, Outcome.YES, _initialStake, weightedAmount, multiplier);
        }

        emit MarketCreated(marketId, msg.sender, _question, _category, _endTime);
    }
    
    // --- WEIGHTED STAKE CALCULATION (Early Bird Bonus) ---

    function _calculateWeightMultiplier(Market storage market) 
        internal view returns (uint256 multiplier) 
    {
        uint256 totalDuration = market.deadlineTimestamp - market.marketStartTimestamp;
        if (totalDuration == 0) return BASIS_POINTS;

        uint256 timeElapsed = block.timestamp - market.marketStartTimestamp;

        if (timeElapsed >= totalDuration) return BASIS_POINTS; 

        uint256 timeRemaining = totalDuration - timeElapsed;
        
        uint256 bonus = MAX_BONUS * timeRemaining / totalDuration;
        
        return BASIS_POINTS + bonus;
    }

    // --- STAKING ---

    /// @notice Places a prediction stake on a Binary market.
    function placePrediction(uint256 marketId, Outcome _choice, uint256 _amount) 
        external nonReentrant 
    {
        Market storage market = markets[marketId];
        
        if (market.status != Status.ACTIVE) revert InvalidMarketStatus();
        if (block.timestamp >= market.deadlineTimestamp) revert DeadlineExceeded();
        if (_amount == 0) revert InvalidStakeAmount();
        if (_choice != Outcome.YES && _choice != Outcome.NO) revert InvalidOutcome();
        require(market.marketType == MarketType.Binary, "PredictionManager: use commentAndStake for CrowdWisdom");

        kpToken.safeTransferFrom(msg.sender, address(this), _amount);

        uint256 multiplier = _calculateWeightMultiplier(market);
        uint256 weightedAmount = _amount * multiplier / BASIS_POINTS;
        UserStake storage userStake = userStakes[marketId][msg.sender];

        if (_choice == Outcome.YES) {
            market.totalYesStakedRaw += _amount;
            market.totalYesStakedWeighted += weightedAmount;
            userStake.yesAmountWeighted += weightedAmount;
            userStake.yesAmountRaw += _amount;
        } else {
            market.totalNoStakedRaw += _amount;
            market.totalNoStakedWeighted += weightedAmount;
            userStake.noAmountWeighted += weightedAmount;
            userStake.noAmountRaw += _amount;
        }

        emit PredictionPlaced(
            marketId, 
            msg.sender, 
            _choice, 
            _amount, 
            weightedAmount,
            multiplier
        );
    }

    function commentAndStake(
        uint256 marketId,
        string memory outcomeLabel,
        uint256 amount
    ) external nonReentrant returns (uint256 outcomeIndex) {
        Market storage market = markets[marketId];
        
        require(market.deadlineTimestamp > 0, "PredictionManager: market does not exist");
        require(market.marketType == MarketType.CrowdWisdom, "PredictionManager: use placePrediction for Binary");
        if (market.status != Status.ACTIVE) revert InvalidMarketStatus();
        if (block.timestamp >= market.deadlineTimestamp) revert DeadlineExceeded();
        if (amount == 0) revert InvalidStakeAmount();
        require(bytes(outcomeLabel).length > 0, "PredictionManager: empty outcome label");
        
        string memory normalized = _normalizeString(outcomeLabel);
        require(bytes(normalized).length > 0, "PredictionManager: invalid outcome label");
        
        // Check if outcome already exists
        bool outcomeExists = false;
        uint256 existingIndex = 0;
        
        for (uint256 i = 0; i < marketOutcomes[marketId].length; i++) {
            if (keccak256(bytes(marketOutcomes[marketId][i])) == keccak256(bytes(normalized))) {
                outcomeExists = true;
                existingIndex = i;
                break;
            }
        }
        
        if (outcomeExists) {
            outcomeIndex = existingIndex;
        } else {
            // New outcome - check limits and create
            uint256 maxOutcomes = maxOutcomesPerMarket[marketId];
            require(
                maxOutcomes == 0 || marketOutcomes[marketId].length < maxOutcomes,
                "PredictionManager: max outcomes reached"
            );
            
            outcomeIndex = marketOutcomes[marketId].length;
            marketOutcomes[marketId].push(normalized);
            outcomeToIndex[marketId][normalized] = outcomeIndex;
            
            emit OutcomeCreated(marketId, outcomeIndex, normalized);
        }
        
        // Transfer tokens
        kpToken.safeTransferFrom(msg.sender, address(this), amount);
        
        // Calculate weighted amount
        uint256 multiplier = _calculateWeightMultiplier(market);
        uint256 weightedAmount = amount * multiplier / BASIS_POINTS;
        
        // Update pools
        outcomePoolAmounts[marketId][outcomeIndex] += amount;
        userOutcomeStakes[marketId][msg.sender][outcomeIndex] += amount;
        
        // Update market totals (using yes pool for compatibility)
        market.totalYesStakedRaw += amount;
        market.totalYesStakedWeighted += weightedAmount;
        
        emit PredictionPlaced(marketId, msg.sender, Outcome.YES, amount, weightedAmount, multiplier);
        return outcomeIndex;
    }

    /// @notice Stake on existing outcome in CrowdWisdom market
    function stakeOnOutcome(
        uint256 marketId,
        uint256 outcomeIndex,
        uint256 amount
    ) external nonReentrant {
        Market storage market = markets[marketId];
        
        require(market.deadlineTimestamp > 0, "PredictionManager: market does not exist");
        require(market.marketType == MarketType.CrowdWisdom, "PredictionManager: use placePrediction for Binary");
        if (market.status != Status.ACTIVE) revert InvalidMarketStatus();
        if (block.timestamp >= market.deadlineTimestamp) revert DeadlineExceeded();
        if (amount == 0) revert InvalidStakeAmount();
        require(outcomeIndex < marketOutcomes[marketId].length, "PredictionManager: invalid outcome index");
        
        // Transfer tokens
        kpToken.safeTransferFrom(msg.sender, address(this), amount);
        
        // Calculate weighted amount
        uint256 multiplier = _calculateWeightMultiplier(market);
        uint256 weightedAmount = amount * multiplier / BASIS_POINTS;
        
        // Update pools
        outcomePoolAmounts[marketId][outcomeIndex] += amount;
        userOutcomeStakes[marketId][msg.sender][outcomeIndex] += amount;
        
        // Update market totals
        market.totalYesStakedRaw += amount;
        market.totalYesStakedWeighted += weightedAmount;
        
        emit PredictionPlaced(marketId, msg.sender, Outcome.YES, amount, weightedAmount, multiplier);
    }
    
    // --- MARKET RESOLUTION ---

    /// @notice Resolves the market with the final outcome.
    function resolveMarket(uint256 marketId, Outcome _outcome) external nonReentrant {
        Market storage market = markets[marketId];
        
        if (market.status != Status.ACTIVE) revert InvalidMarketStatus();
        if (block.timestamp < market.deadlineTimestamp) revert DeadlineExceeded(); 
        if (msg.sender != market.oracle && msg.sender != owner()) revert UnauthorizedCaller();
        if (_outcome != Outcome.YES && _outcome != Outcome.NO) revert InvalidOutcome();

        market.winningOutcome = _outcome;
        market.status = Status.RESOLVED;

        emit MarketResolved(marketId, _outcome);
    }

    // --- PAYOUT CLAIMING ---

    /// @notice Allows a user to claim their proportionate winnings.
    function claimWinnings(uint256 marketId) external nonReentrant {
        Market storage market = markets[marketId];
        UserStake storage userStake = userStakes[marketId][msg.sender];
        
        if (market.status != Status.RESOLVED) revert InvalidMarketStatus();
        if (userStake.claimed) revert AlreadyClaimed();

        Outcome winningOutcome = market.winningOutcome;
        
        uint256 userWinningWeightedStake;
        uint256 totalWinningWeightedStake;
        uint256 totalLosingRawStake;
        uint256 userRawStake;

        if (winningOutcome == Outcome.YES) {
            userWinningWeightedStake = userStake.yesAmountWeighted;
            totalWinningWeightedStake = market.totalYesStakedWeighted;
            totalLosingRawStake = market.totalNoStakedRaw;
            userRawStake = userStake.yesAmountRaw;
        } else if (winningOutcome == Outcome.NO) {
            userWinningWeightedStake = userStake.noAmountWeighted;
            totalWinningWeightedStake = market.totalNoStakedWeighted;
            totalLosingRawStake = market.totalYesStakedRaw;
            userRawStake = userStake.noAmountRaw;
        } else {
            revert InvalidOutcome(); 
        }

        if (userWinningWeightedStake == 0) revert NoWinnings();
        
        uint256 payoutPool = totalLosingRawStake; 

        // 1. Calculate Platform Fee
        uint256 grossReward = payoutPool * userWinningWeightedStake / totalWinningWeightedStake;
        uint256 platformFee = grossReward * market.platformFeeBps / BASIS_POINTS;
        uint256 finalPayout = grossReward - platformFee;

        if (platformFee > 0) {
          
            kpToken.safeTransfer(treasuryAddress, platformFee);
            
          
        }

        uint256 totalTransferAmount = userRawStake + finalPayout;

        kpToken.safeTransfer(msg.sender, totalTransferAmount); 

        userStake.claimed = true;

        emit PayoutClaimed(marketId, msg.sender, totalTransferAmount, finalPayout);
    }
    
    // --- EVENTS ---

      event MarketCreated(
        uint256 indexed marketId,
        address indexed creator,
        string question,
        string category,
        uint256 deadline
    );
    
    event PredictionPlaced(
        uint256 indexed marketId,
        address indexed user,
        Outcome choice,
        uint256 rawAmount,
        uint256 weightedAmount,
        uint256 multiplier
    );

    event MarketResolved(uint256 indexed marketId, Outcome winningOutcome);
    
    event PayoutClaimed(
        uint256 indexed marketId,
        address indexed user,
        uint256 totalTransferAmount,
        uint256 netReward
    );
    
    event OutcomeCreated(
        uint256 indexed marketId,
        uint256 indexed outcomeIndex,
        string outcomeLabel
    );

    // --- VIEW FUNCTIONS FOR CROWDWISDOM ---
    
    function getMarketOutcomes(uint256 marketId) external view returns (string[] memory outcomes, uint256[] memory outcomePools) {
        Market storage market = markets[marketId];
        require(market.deadlineTimestamp > 0, "PredictionManager: market does not exist");
        require(market.marketType == MarketType.CrowdWisdom, "PredictionManager: not a CrowdWisdom market");
        
        uint256 length = marketOutcomes[marketId].length;
        outcomes = new string[](length);
        outcomePools = new uint256[](length);
        
        for (uint256 i = 0; i < length; i++) {
            outcomes[i] = marketOutcomes[marketId][i];
            outcomePools[i] = outcomePoolAmounts[marketId][i];
        }
        
        return (outcomes, outcomePools);
    }
    
    function getOutcomeLabel(uint256 marketId, uint256 outcomeIndex) external view returns (string memory) {
        Market storage market = markets[marketId];
        require(market.deadlineTimestamp > 0, "PredictionManager: market does not exist");
        require(market.marketType == MarketType.CrowdWisdom, "PredictionManager: not a CrowdWisdom market");
        require(outcomeIndex < marketOutcomes[marketId].length, "PredictionManager: invalid outcome index");
        return marketOutcomes[marketId][outcomeIndex];
    }
    
    function getUserOutcomeStake(uint256 marketId, address user, uint256 outcomeIndex) external view returns (uint256) {
        return userOutcomeStakes[marketId][user][outcomeIndex];
    }
    
    function getOutcomePoolAmount(uint256 marketId, uint256 outcomeIndex) external view returns (uint256) {
        return outcomePoolAmounts[marketId][outcomeIndex];
    }
    

    function _normalizeString(string memory label) internal pure returns (string memory) {
        bytes memory labelBytes = bytes(label);
        bytes memory result = new bytes(labelBytes.length);
        
        uint256 resultLength = 0;
        bool skipSpace = true;
        
        for (uint256 i = 0; i < labelBytes.length; i++) {
            bytes1 char = labelBytes[i];
           
            if (char >= 0x41 && char <= 0x5A) {
                char = bytes1(uint8(char) + 32);
            }
            
            if (char == 0x20) {
                if (!skipSpace) {
                    result[resultLength] = char;
                    resultLength++;
                    skipSpace = true;
                }
            } else {
                result[resultLength] = char;
                resultLength++;
                skipSpace = false;
            }
        }
        
  
        while (resultLength > 0 && result[resultLength - 1] == 0x20) {
            resultLength--;
        }
        
        bytes memory finalResult = new bytes(resultLength);
        for (uint256 i = 0; i < resultLength; i++) {
            finalResult[i] = result[i];
        }
        
        return string(finalResult);
    }
}
