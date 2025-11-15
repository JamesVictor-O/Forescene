// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IPredictionRegistry} from "../interfaces/IPredictionRegistry.sol";
import {IPredictionMarket} from "../interfaces/IPredictionMarket.sol";

/**
 * @title PredictionRegistry
 * @notice Registry for creating and managing predictions
 * @dev Handles prediction lifecycle: creation, locking, status management
 */
contract PredictionRegistry is IPredictionRegistry, Ownable, ReentrancyGuard {
    // Storage
    mapping(uint256 => Prediction) private _predictions;
    uint256 private _nextPredictionId = 1;

    mapping(uint256 => mapping(address => bool)) private _copiers;
    mapping(uint256 => uint256) private _copyCounts;

    // Config
    address public treasury;
    uint16 public defaultFeeBps = 250; // 2.5% default platform fee
    uint256 public minLockTime = 1 hours; // Minimum time before deadline to lock
    address public market;
    address public socialMetrics;

    // Errors
    error InvalidDeadline();
    error InvalidFee();
    error PredictionNotFound();
    error PredictionNotLocked();
    error Unauthorized();
    error InvalidStatus();
    error AlreadyCopied();

    modifier onlyValidPrediction(uint256 predictionId) {
        if (_predictions[predictionId].id == 0) revert PredictionNotFound();
        _;
    }

    modifier onlyCreator(uint256 predictionId) {
        if (_predictions[predictionId].creator != msg.sender) revert Unauthorized();
        _;
    }

    modifier onlyMarket() {
        if (msg.sender != market) revert Unauthorized();
        _;
    }

    constructor(address initialOwner, address _treasury) Ownable(initialOwner) {
        treasury = _treasury;
    }

    /**
     * @notice Create a new prediction
     * @param contentCID IPFS CID of the prediction content
     * @param format VIDEO or TEXT
     * @param category Category string (e.g., "crypto", "sports")
     * @param deadline Unix timestamp when prediction resolves
     * @param creatorFeeBps Creator fee in basis points (0-10000)
     * @param creatorStake Amount of tokens creator is staking (must be > 0)
     * @return predictionId The ID of the created prediction
     */
    function createPrediction(
        string memory contentCID,
        Format format,
        string memory category,
        uint256 deadline,
        uint16 creatorFeeBps,
        uint256 creatorStake
    ) external override nonReentrant returns (uint256) {
        if (deadline <= block.timestamp) revert InvalidDeadline();
        if (creatorFeeBps > 10000) revert InvalidFee();
        if (creatorStake == 0) revert InvalidFee(); // Reuse InvalidFee error for stake validation

        uint256 predictionId = _nextPredictionId++;

        _predictions[predictionId] = Prediction({
            id: predictionId,
            creator: msg.sender,
            contentCID: contentCID,
            format: format,
            category: category,
            deadline: deadline,
            lockTime: deadline - minLockTime,
            status: Status.ACTIVE,
            isActive: true,
            creatorFeeBps: creatorFeeBps == 0 ? defaultFeeBps : creatorFeeBps
        });

        // Initialize pool with creator's stake
        if (market != address(0)) {
            IPredictionMarket(market).initializePoolWithCreatorStake(predictionId, creatorStake, msg.sender);
        }

        emit PredictionCreated(predictionId, msg.sender, contentCID, format, category, deadline);

        return predictionId;
    }

    /**
     * @notice Lock a prediction (no more edits/stakes after this)
     * @param predictionId The prediction to lock
     */
    function lockPrediction(uint256 predictionId) external override onlyValidPrediction(predictionId) {
        Prediction storage pred = _predictions[predictionId];

        if (pred.status != Status.ACTIVE) revert InvalidStatus();
        if (block.timestamp < pred.lockTime) revert InvalidDeadline();

        pred.status = Status.LOCKED;

        emit PredictionLocked(predictionId);
    }

    /**
     * @notice Set prediction active status (moderation)
     * @param predictionId The prediction ID
     * @param isActive New active status
     */
    function setPredictionActive(uint256 predictionId, bool isActive)
        external
        override
        onlyOwner
        onlyValidPrediction(predictionId)
    {
        _predictions[predictionId].isActive = isActive;
        emit PredictionActiveChanged(predictionId, isActive);
    }

    /**
     * @notice Update prediction status (for resolution)
     * @param predictionId The prediction ID
     * @param newStatus New status
     */
    function setPredictionStatus(uint256 predictionId, Status newStatus)
        external
        override
        onlyValidPrediction(predictionId)
    {
        if (msg.sender != owner() && msg.sender != market) revert Unauthorized();
        _predictions[predictionId].status = newStatus;
        emit PredictionStatusChanged(predictionId, newStatus);
    }

    /**
     * @notice Get prediction details
     * @param predictionId The prediction ID
     * @return Prediction struct
     */
    function getPrediction(uint256 predictionId) external view override returns (Prediction memory) {
        if (_predictions[predictionId].id == 0) revert PredictionNotFound();
        return _predictions[predictionId];
    }

    /**
     * @notice Check if prediction is locked
     * @param predictionId The prediction ID
     * @return bool True if locked
     */
    function isLocked(uint256 predictionId) external view override returns (bool) {
        Prediction memory pred = _predictions[predictionId];
        return pred.status == Status.LOCKED || block.timestamp >= pred.lockTime;
    }

    /**
     * @notice Get next prediction ID (for frontend)
     * @return uint256 Next ID
     */
    function getNextPredictionId() external view returns (uint256) {
        return _nextPredictionId;
    }

    function recordCopy(uint256 predictionId, address copier) external onlyMarket onlyValidPrediction(predictionId) {
        if (_copiers[predictionId][copier]) revert AlreadyCopied();
        _copiers[predictionId][copier] = true;
        _copyCounts[predictionId] += 1;
    }

    function hasCopied(uint256 predictionId, address user) external view returns (bool) {
        return _copiers[predictionId][user];
    }

    function getCopyCount(uint256 predictionId) external view returns (uint256) {
        return _copyCounts[predictionId];
    }

    // Admin functions
    function setTreasury(address _treasury) external onlyOwner {
        treasury = _treasury;
    }

    function setDefaultFeeBps(uint16 _feeBps) external onlyOwner {
        if (_feeBps > 10000) revert InvalidFee();
        defaultFeeBps = _feeBps;
    }

    function setMinLockTime(uint256 _minLockTime) external onlyOwner {
        minLockTime = _minLockTime;
    }

    function setMarket(address _market) external onlyOwner {
        market = _market;
    }

    function setSocialMetrics(address _socialMetrics) external onlyOwner {
        socialMetrics = _socialMetrics;
    }
}

