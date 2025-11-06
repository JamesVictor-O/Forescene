// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IPredictionRegistry} from "../interfaces/IPredictionRegistry.sol";
import {IPredictionMarket} from "../interfaces/IPredictionMarket.sol";
import {IResolutionOracle} from "../interfaces/IResolutionOracle.sol";

/**
 * @title ResolutionOracle
 * @notice Oracle for resolving prediction outcomes
 * @dev Handles outcome proposals, disputes, and finalization
 */
contract ResolutionOracle is IResolutionOracle, Ownable, ReentrancyGuard {
    // Storage
    IPredictionRegistry public immutable registry;
    IPredictionMarket public immutable market;

    mapping(uint256 => Outcome) private _proposedOutcomes;
    mapping(uint256 => Dispute) private _disputes;
    mapping(uint256 => uint256) private _proposalTime; // Timestamp when outcome was proposed
    mapping(uint256 => bool) private _finalized;

    // Config
    uint256 public disputeWindow = 7 days; // Time window for disputes
    uint256 public disputeBond = 1000 * 1e18; // Bond required to dispute (in FORE)
    address public treasury;

    // Role management
    mapping(address => bool) public oracles; // Oracle addresses

    // Errors
    error PredictionNotFound();
    error PredictionNotLocked();
    error OutcomeAlreadyProposed();
    error DisputeWindowExpired();
    error DisputeWindowActive();
    error InsufficientBond();
    error NotOracle();
    error AlreadyFinalized();
    error InvalidOutcome();

    modifier onlyOracle() {
        if (!oracles[msg.sender] && msg.sender != owner()) revert NotOracle();
        _;
    }

    modifier onlyValidPrediction(uint256 predictionId) {
        IPredictionRegistry.Prediction memory pred = registry.getPrediction(predictionId);
        if (pred.id == 0) revert PredictionNotFound();
        if (!registry.isLocked(predictionId)) revert PredictionNotLocked();
        _;
    }

    constructor(address initialOwner, address _registry, address _market, address _treasury) Ownable(initialOwner) {
        registry = IPredictionRegistry(_registry);
        market = IPredictionMarket(_market);
        treasury = _treasury;
    }

    /**
     * @notice Propose outcome for a prediction
     * @param predictionId The prediction ID
     * @param outcome FOR, AGAINST, or INVALID
     */
    function proposeOutcome(uint256 predictionId, Outcome outcome)
        external
        override
        onlyOracle
        onlyValidPrediction(predictionId)
    {
        if (_proposedOutcomes[predictionId] != Outcome.INVALID) revert OutcomeAlreadyProposed();
        if (outcome == Outcome.INVALID) revert InvalidOutcome();

        _proposedOutcomes[predictionId] = outcome;
        _proposalTime[predictionId] = block.timestamp;

        emit OutcomeProposed(predictionId, outcome);
    }

    /**
     * @notice Dispute a proposed outcome
     * @param predictionId The prediction ID
     * @param evidenceCID IPFS CID of evidence
     */
    function disputeOutcome(uint256 predictionId, string memory evidenceCID)
        external
        payable
        override
        nonReentrant
        onlyValidPrediction(predictionId)
    {
        if (_proposedOutcomes[predictionId] == Outcome.INVALID) revert InvalidOutcome();
        if (_finalized[predictionId]) revert AlreadyFinalized();
        if (block.timestamp > _proposalTime[predictionId] + disputeWindow) revert DisputeWindowExpired();
        if (msg.value < disputeBond) revert InsufficientBond();

        _disputes[predictionId] = Dispute({
            disputer: msg.sender, evidenceCID: evidenceCID, bond: msg.value, timestamp: block.timestamp, resolved: false
        });

        emit OutcomeDisputed(predictionId, msg.sender, evidenceCID);
    }

    /**
     * @notice Finalize outcome after dispute window
     * @param predictionId The prediction ID
     */
    function finalizeOutcome(uint256 predictionId) external override nonReentrant onlyValidPrediction(predictionId) {
        if (_finalized[predictionId]) revert AlreadyFinalized();
        if (_proposedOutcomes[predictionId] == Outcome.INVALID) revert InvalidOutcome();
        if (block.timestamp <= _proposalTime[predictionId] + disputeWindow) revert DisputeWindowActive();

        Outcome finalOutcome = _proposedOutcomes[predictionId];

        // If disputed, outcome needs manual review (for now, keep proposed outcome)
        // In production, you'd have a governance mechanism here

        _finalized[predictionId] = true;

        // Resolve in market contract
        market.resolvePrediction(
            predictionId, finalOutcome == Outcome.FOR ? IPredictionMarket.Side.FOR : IPredictionMarket.Side.AGAINST
        );

        emit OutcomeFinalized(predictionId, finalOutcome);
    }

    /**
     * @notice Get proposed outcome
     * @param predictionId The prediction ID
     * @return Outcome FOR, AGAINST, or INVALID
     */
    function getOutcome(uint256 predictionId) external view override returns (Outcome) {
        return _proposedOutcomes[predictionId];
    }

    /**
     * @notice Check if outcome is finalized
     * @param predictionId The prediction ID
     * @return bool True if finalized
     */
    function isFinalized(uint256 predictionId) external view returns (bool) {
        return _finalized[predictionId];
    }

    /**
     * @notice Get dispute info
     * @param predictionId The prediction ID
     * @return Dispute struct
     */
    function getDispute(uint256 predictionId) external view returns (Dispute memory) {
        return _disputes[predictionId];
    }

    // Admin functions
    function setOracle(address oracle, bool enabled) external onlyOwner {
        oracles[oracle] = enabled;
    }

    function setDisputeWindow(uint256 _window) external onlyOwner {
        disputeWindow = _window;
    }

    function setDisputeBond(uint256 _bond) external onlyOwner {
        disputeBond = _bond;
    }

    function setTreasury(address _treasury) external onlyOwner {
        treasury = _treasury;
    }

    /**
     * @notice Resolve dispute (manual override)
     * @param predictionId The prediction ID
     * @param outcome Final outcome
     */
    function resolveDispute(uint256 predictionId, Outcome outcome) external onlyOwner {
        if (!_finalized[predictionId]) revert AlreadyFinalized();

        Dispute storage dispute = _disputes[predictionId];
        if (dispute.resolved) revert AlreadyFinalized();

        dispute.resolved = true;
        _proposedOutcomes[predictionId] = outcome;

        // Resolve in market
        market.resolvePrediction(
            predictionId, outcome == Outcome.FOR ? IPredictionMarket.Side.FOR : IPredictionMarket.Side.AGAINST
        );

        emit OutcomeFinalized(predictionId, outcome);
    }
}

