// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IPredictionRegistry} from "../interfaces/IPredictionRegistry.sol";
import {IPredictionMarket} from "../interfaces/IPredictionMarket.sol";
import {Pausable} from "./Pausable.sol";
import {TokenRescuer} from "../utils/TokenRescuer.sol";

/**
 * @title PredictionMarket
 * @notice Market for staking on predictions using CPMM (Constant Product Market Maker)
 * @dev Handles staking, liquidity, odds calculation, and payouts
 */
contract PredictionMarket is IPredictionMarket, Pausable, ReentrancyGuard, TokenRescuer {
    using SafeERC20 for IERC20;

    // Constants
    uint256 private constant BASIS_POINTS = 10000;
    uint256 private constant PRECISION = 1e18;

    // Storage
    IERC20 public immutable token; // FORE token
    IPredictionRegistry public immutable registry;

    mapping(uint256 => Pool) private _pools;
    mapping(uint256 => mapping(address => Position)) private _positions;
    mapping(uint256 => bool) private _resolved; // Track if prediction is resolved
    mapping(uint256 => Side) private _outcomes; // Final outcome (FOR or AGAINST)

    // Quick stake presets
    uint256[4] public presetAmounts = [10 * 1e18, 25 * 1e18, 50 * 1e18, 100 * 1e18];

    // Oracle address (for resolution)
    address public oracle;

    // Errors
    error PredictionNotFound();
    error PredictionLocked();
    error PredictionNotResolved();
    error InvalidAmount();
    error InsufficientLiquidity();
    error AlreadyResolved();
    error NoPosition();
    error NoPayout();
    error Unauthorized();

    modifier onlyValidPrediction(uint256 predictionId) {
        IPredictionRegistry.Prediction memory pred = registry.getPrediction(predictionId);
        if (pred.id == 0) revert PredictionNotFound();
        if (registry.isLocked(predictionId)) revert PredictionLocked();
        _;
    }

    constructor(address initialOwner, address _token, address _registry)
        Pausable(initialOwner)
        TokenRescuer(initialOwner)
    {
        token = IERC20(_token);
        registry = IPredictionRegistry(_registry);
    }

    /**
     * @notice Stake FOR a prediction
     * @param predictionId The prediction ID
     * @param amount Amount to stake
     */
    function stakeFor(uint256 predictionId, uint256 amount)
        external
        override
        nonReentrant
        onlyValidPrediction(predictionId)
    {
        _stake(predictionId, Side.FOR, amount);
    }

    /**
     * @notice Stake AGAINST a prediction
     * @param predictionId The prediction ID
     * @param amount Amount to stake
     */
    function stakeAgainst(uint256 predictionId, uint256 amount)
        external
        override
        nonReentrant
        onlyValidPrediction(predictionId)
    {
        _stake(predictionId, Side.AGAINST, amount);
    }

    /**
     * @notice Quick stake with preset amounts
     * @param predictionId The prediction ID
     * @param side FOR or AGAINST
     * @param presetId Index in presetAmounts array (0-3)
     */
    function quickStake(uint256 predictionId, Side side, uint256 presetId)
        external
        override
        nonReentrant
        onlyValidPrediction(predictionId)
    {
        if (presetId >= presetAmounts.length) revert InvalidAmount();
        _stake(predictionId, side, presetAmounts[presetId]);
    }

    /**
     * @notice Internal stake function
     * @param predictionId The prediction ID
     * @param side FOR or AGAINST
     * @param amount Amount to stake
     */
    function _stake(uint256 predictionId, Side side, uint256 amount) internal whenNotPaused {
        if (amount == 0) revert InvalidAmount();

        Pool storage pool = _pools[predictionId];
        IPredictionRegistry.Prediction memory pred = registry.getPrediction(predictionId);

        // Calculate odds using CPMM: x * y = k
        uint256 odds = _calculateOdds(pool, side, amount);

        // Transfer tokens
        token.safeTransferFrom(msg.sender, address(this), amount);

        // Update pool
        if (side == Side.FOR) {
            pool.forPool += amount;
            _positions[predictionId][msg.sender].forAmount += amount;
        } else {
            pool.againstPool += amount;
            _positions[predictionId][msg.sender].againstAmount += amount;
        }

        pool.totalStaked += amount;
        pool.feeBps = pred.creatorFeeBps;

        emit StakePlaced(predictionId, msg.sender, side, amount, odds);
    }

    /**
     * @notice Quote odds for a stake
     * @param predictionId The prediction ID
     * @param side FOR or AGAINST
     * @param amount Amount to stake
     * @return odds Odds as multiplier (e.g., 2.3x = 2300000000000000000)
     */
    function quoteOdds(uint256 predictionId, Side side, uint256 amount) external view override returns (uint256 odds) {
        Pool memory pool = _pools[predictionId];
        return _calculateOdds(pool, side, amount);
    }

    /**
     * @notice Calculate odds using CPMM
     * @param pool Current pool state
     * @param side FOR or AGAINST
     * @param amount Stake amount
     * @return odds Odds multiplier
     */
    function _calculateOdds(Pool memory pool, Side side, uint256 amount) internal pure returns (uint256 odds) {
        // Initialize pools if empty (bootstrap with 1 token each side)
        uint256 forPool = pool.forPool == 0 ? 1e18 : pool.forPool;
        uint256 againstPool = pool.againstPool == 0 ? 1e18 : pool.againstPool;

        if (side == Side.FOR) {
            // Calculate new pool after stake: (forPool + amount) * againstPool = k
            // Odds = (forPool + amount) / forPool
            uint256 newForPool = forPool + amount;
            odds = (newForPool * PRECISION) / forPool;
        } else {
            // Calculate new pool after stake: forPool * (againstPool + amount) = k
            // Odds = (againstPool + amount) / againstPool
            uint256 newAgainstPool = againstPool + amount;
            odds = (newAgainstPool * PRECISION) / againstPool;
        }
    }

    /**
     * @notice Add liquidity to a pool
     * @param predictionId The prediction ID
     * @param amount Amount to add
     * @param side Which side to add liquidity to
     */
    function addLiquidity(uint256 predictionId, uint256 amount, Side side)
        external
        nonReentrant
        onlyValidPrediction(predictionId)
    {
        if (amount == 0) revert InvalidAmount();

        token.safeTransferFrom(msg.sender, address(this), amount);

        Pool storage pool = _pools[predictionId];
        if (side == Side.FOR) {
            pool.forPool += amount;
        } else {
            pool.againstPool += amount;
        }
        pool.totalStaked += amount;

        emit LiquidityAdded(predictionId, msg.sender, amount, side);
    }

    /**
     * @notice Claim payout after resolution
     * @param predictionId The prediction ID
     */
    function claimPayout(uint256 predictionId) external override nonReentrant whenNotPaused {
        if (!_resolved[predictionId]) revert PredictionNotResolved();

        Position storage position = _positions[predictionId][msg.sender];
        Side outcome = _outcomes[predictionId];

        uint256 payout;
        if (outcome == Side.FOR && position.forAmount > 0) {
            payout = _calculatePayout(predictionId, position.forAmount, Side.FOR);
            position.forAmount = 0; // Clear position
        } else if (outcome == Side.AGAINST && position.againstAmount > 0) {
            payout = _calculatePayout(predictionId, position.againstAmount, Side.AGAINST);
            position.againstAmount = 0; // Clear position
        } else {
            revert NoPayout();
        }

        if (payout == 0) revert NoPayout();

        token.safeTransfer(msg.sender, payout);
        emit PayoutClaimed(predictionId, msg.sender, payout);
    }

    /**
     * @notice Calculate payout for a winning position
     * @param predictionId The prediction ID
     * @param stakeAmount Original stake amount
     * @param side Side staked on
     * @return payout Payout amount
     */
    function _calculatePayout(uint256 predictionId, uint256 stakeAmount, Side side)
        internal
        view
        returns (uint256 payout)
    {
        Pool memory pool = _pools[predictionId];
        IPredictionRegistry.Prediction memory pred = registry.getPrediction(predictionId);

        uint256 totalPool = side == Side.FOR ? pool.forPool : pool.againstPool;
        uint256 oppositePool = side == Side.FOR ? pool.againstPool : pool.forPool;

        // Payout = stakeAmount * (oppositePool / totalPool) * (1 - fee)
        uint256 grossPayout = (stakeAmount * oppositePool) / totalPool;
        uint256 fee = (grossPayout * pred.creatorFeeBps) / BASIS_POINTS;
        payout = grossPayout - fee;
    }

    /**
     * @notice Resolve prediction (called by oracle)
     * @param predictionId The prediction ID
     * @param outcome FOR or AGAINST
     */
    function resolvePrediction(uint256 predictionId, Side outcome) external {
        if (msg.sender != oracle && msg.sender != owner()) revert Unauthorized();
        if (_resolved[predictionId]) revert AlreadyResolved();

        IPredictionRegistry.Prediction memory pred = registry.getPrediction(predictionId);
        if (pred.deadline > block.timestamp) revert InvalidAmount(); // Too early

        _resolved[predictionId] = true;
        _outcomes[predictionId] = outcome;

        // Update registry status
        registry.setPredictionStatus(predictionId, IPredictionRegistry.Status.RESOLVED);
    }

    /**
     * @notice Get user position
     * @param predictionId The prediction ID
     * @param user User address
     * @return Position struct
     */
    function getPosition(uint256 predictionId, address user) external view override returns (Position memory) {
        return _positions[predictionId][user];
    }

    /**
     * @notice Get pool state
     * @param predictionId The prediction ID
     * @return Pool struct
     */
    function getPool(uint256 predictionId) external view override returns (Pool memory) {
        return _pools[predictionId];
    }

    /**
     * @notice Check if prediction is resolved
     * @param predictionId The prediction ID
     * @return bool True if resolved
     */
    function isResolved(uint256 predictionId) external view returns (bool) {
        return _resolved[predictionId];
    }

    /**
     * @notice Get outcome
     * @param predictionId The prediction ID
     * @return Side FOR or AGAINST
     */
    function getOutcome(uint256 predictionId) external view returns (Side) {
        return _outcomes[predictionId];
    }

    // Admin
    function setPresetAmounts(uint256[4] memory _presets) external onlyOwner {
        presetAmounts = _presets;
    }

    function setOracle(address _oracle) external onlyOwner {
        oracle = _oracle;
    }
}

