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

  

    struct Market {
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
        string contentCID; 
        string category;
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
    
    // --- ERRORS ---

    error UnauthorizedOracle();
    error InvalidMarketStatus();
    error InvalidStakeAmount();
    error InvalidOutcome();
    error DeadlineExceeded();
    error AlreadyClaimed();
    error NoWinnings();
    error UnauthorizedCaller();
    error FeeBurnFailed(); // Added for clarity

    // --- CONSTRUCTOR & ADMIN ---

    constructor(address initialOwner, address _kpTokenAddress, address _treasuryAddress) 
        Ownable(initialOwner) {
        kpToken = IERC20(_kpTokenAddress); 
        treasuryAddress = _treasuryAddress;
    }

    function setTreasuryAddress(address _newTreasury) external onlyOwner {
        treasuryAddress = _newTreasury;
    }

 
    function createMarket(
        string memory _contentCID,
        string memory _category,
        address _oracle,
        uint256 _deadlineTimestamp,
        uint256 _platformFeeBps // e.g., 500 for 5%
    ) external returns (uint256 marketId) {
        require(_deadlineTimestamp > block.timestamp, "Deadline must be in the future");
        require(_platformFeeBps <= BASIS_POINTS, "Fee too high");

        marketId = nextMarketId++;
        
        markets[marketId] = Market({
            contentCID: _contentCID,
            category: _category,
            oracle: _oracle,
            marketStartTimestamp: block.timestamp,
            deadlineTimestamp: _deadlineTimestamp,
            totalYesStakedRaw: 0,
            totalNoStakedRaw: 0,
            totalYesStakedWeighted: 0,
            totalNoStakedWeighted: 0,
            platformFeeBps: _platformFeeBps,
            status: Status.ACTIVE,
            winningOutcome: Outcome.INVALID,
            creator: msg.sender
        });

        emit MarketCreated(marketId, msg.sender, _contentCID, _category, _deadlineTimestamp);
    }
    
    // --- WEIGHTED STAKE CALCULATION (Early Bird Bonus) ---

    /// @notice Calculates the bonus multiplier based on time elapsed.
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

    /// @notice Places a prediction stake on a market.
    function placePrediction(uint256 marketId, Outcome _choice, uint256 _amount) 
        external nonReentrant 
    {
        Market storage market = markets[marketId];
        
        if (market.status != Status.ACTIVE) revert InvalidMarketStatus();
        if (block.timestamp >= market.deadlineTimestamp) revert DeadlineExceeded();
        if (_amount == 0) revert InvalidStakeAmount();
        if (_choice != Outcome.YES && _choice != Outcome.NO) revert InvalidOutcome();

        // 1. Token Transfer (from user to this contract)
        kpToken.safeTransferFrom(msg.sender, address(this), _amount);

        // 2. Calculate Weighted Stake
        uint256 multiplier = _calculateWeightMultiplier(market);
        uint256 weightedAmount = _amount * multiplier / BASIS_POINTS;

        // 3. Update Storage
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

        // 4. Emit Event
        emit PredictionPlaced(
            marketId, 
            msg.sender, 
            _choice, 
            _amount, 
            weightedAmount,
            multiplier
        );
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


        // 3. Transfer Total Winnings (User's original stake + Net Reward)
        uint256 totalTransferAmount = userRawStake + finalPayout;

        // Payout is sent from the contract's internal balance
        kpToken.safeTransfer(msg.sender, totalTransferAmount); 

        userStake.claimed = true;

        emit PayoutClaimed(marketId, msg.sender, totalTransferAmount, finalPayout);
    }
    
    // --- EVENTS ---

      event MarketCreated(
        uint256 indexed marketId,
        address indexed creator,
        string contentCID,
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
}