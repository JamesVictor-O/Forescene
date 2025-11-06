// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title IResolutionOracle
 * @notice Interface for resolution oracle
 */
interface IResolutionOracle {
    enum Outcome {
        FOR,
        AGAINST,
        INVALID
    }

    struct Dispute {
        address disputer;
        string evidenceCID;
        uint256 bond;
        uint256 timestamp;
        bool resolved;
    }

    event OutcomeProposed(uint256 indexed predictionId, Outcome outcome);
    event OutcomeDisputed(uint256 indexed predictionId, address indexed disputer, string evidenceCID);
    event OutcomeFinalized(uint256 indexed predictionId, Outcome outcome);

    function proposeOutcome(uint256 predictionId, Outcome outcome) external;

    function disputeOutcome(uint256 predictionId, string memory evidenceCID) external payable;

    function finalizeOutcome(uint256 predictionId) external;

    function getOutcome(uint256 predictionId) external view returns (Outcome);
}

