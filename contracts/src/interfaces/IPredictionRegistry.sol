// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title IPredictionRegistry
 * @notice Interface for prediction registry
 */
interface IPredictionRegistry {
    enum Format {
        VIDEO,
        TEXT
    }

    enum Status {
        ACTIVE,
        LOCKED,
        RESOLVED,
        CANCELLED
    }

    struct Prediction {
        uint256 id;
        address creator;
        string contentCID; // IPFS CID for video/text content
        Format format;
        string category;
        uint256 deadline;
        uint256 lockTime; // Time after which no edits/stakes allowed
        Status status;
        bool isActive;
        uint16 creatorFeeBps; // Creator fee in basis points (0-10000)
    }

    event PredictionCreated(
        uint256 indexed predictionId,
        address indexed creator,
        string contentCID,
        Format format,
        string category,
        uint256 deadline
    );

    event PredictionLocked(uint256 indexed predictionId);
    event PredictionStatusChanged(uint256 indexed predictionId, Status status);
    event PredictionActiveChanged(uint256 indexed predictionId, bool isActive);

    function createPrediction(
        string memory contentCID,
        Format format,
        string memory category,
        uint256 deadline,
        uint16 creatorFeeBps,
        uint256 creatorStake
    ) external returns (uint256);

    function lockPrediction(uint256 predictionId) external;

    function setPredictionActive(uint256 predictionId, bool isActive) external;

    function setPredictionStatus(uint256 predictionId, Status newStatus) external;

    function setMarket(address market) external;

    function setSocialMetrics(address social) external;

    function recordCopy(uint256 predictionId, address copier) external;

    function hasCopied(uint256 predictionId, address user) external view returns (bool);

    function getCopyCount(uint256 predictionId) external view returns (uint256);

    function getPrediction(uint256 predictionId) external view returns (Prediction memory);

    function isLocked(uint256 predictionId) external view returns (bool);
}

