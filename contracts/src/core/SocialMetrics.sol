// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title SocialMetrics
 * @notice Lightweight on-chain social metrics for predictions
 * @dev Handles evidence submission, flagging, and tipping
 */
contract SocialMetrics is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // Storage
    IERC20 public immutable token;

    struct Evidence {
        address submitter;
        string evidenceCID;
        uint256 timestamp;
    }

    struct Flag {
        address flagger;
        string reasonCID;
        uint256 timestamp;
    }

    mapping(uint256 => Evidence[]) private _evidence; // predictionId => evidence array
    mapping(uint256 => Flag[]) private _flags; // predictionId => flags array
    mapping(uint256 => uint256) private _tips; // predictionId => total tips
    mapping(uint256 => address) private _creators; // predictionId => creator address
    mapping(uint256 => uint256) private _copyCounts; // predictionId => copy count
    mapping(address => uint256) private _influenceScores; // creator => influence score
    mapping(address => uint256) private _copiedByUser; // copier => number of copies

    // Config
    uint16 public influenceFeeBps = 500; // 5% creator share from stakes
    address public treasury;
    address public market;

    // Events
    event EvidenceSubmitted(uint256 indexed predictionId, address indexed submitter, string evidenceCID);
    event PredictionFlagged(uint256 indexed predictionId, address indexed flagger, string reasonCID);
    event TipReceived(uint256 indexed predictionId, address indexed tipper, uint256 amount);
    event CopyRegistered(
        uint256 indexed predictionId,
        address indexed creator,
        address indexed copier,
        uint256 amount,
        uint256 influenceGain
    );

    // Errors
    error InvalidAmount();
    error InvalidAddress();
    error Unauthorized();

    modifier onlyMarket() {
        if (msg.sender != market) revert Unauthorized();
        _;
    }

    constructor(address initialOwner, address _token, address _treasury) Ownable(initialOwner) {
        token = IERC20(_token);
        treasury = _treasury;
    }

    /**
     * @notice Submit evidence for a prediction
     * @param predictionId The prediction ID
     * @param evidenceCID IPFS CID of evidence
     */
    function submitEvidence(uint256 predictionId, string memory evidenceCID) external {
        _evidence[predictionId]
        .push(Evidence({submitter: msg.sender, evidenceCID: evidenceCID, timestamp: block.timestamp}));

        emit EvidenceSubmitted(predictionId, msg.sender, evidenceCID);
    }

    /**
     * @notice Flag a prediction
     * @param predictionId The prediction ID
     * @param reasonCID IPFS CID of reason
     */
    function flagPrediction(uint256 predictionId, string memory reasonCID) external {
        _flags[predictionId].push(Flag({flagger: msg.sender, reasonCID: reasonCID, timestamp: block.timestamp}));

        emit PredictionFlagged(predictionId, msg.sender, reasonCID);
    }

    /**
     * @notice Tip a prediction creator
     * @param predictionId The prediction ID
     */
    function tipCreator(uint256 predictionId) external payable nonReentrant {
        if (msg.value == 0) revert InvalidAmount();
        if (_creators[predictionId] == address(0)) revert InvalidAddress();

        _tips[predictionId] += msg.value;

        // Transfer tip to creator
        (bool success,) = _creators[predictionId].call{value: msg.value}("");
        require(success, "SocialMetrics: Transfer failed");

        emit TipReceived(predictionId, msg.sender, msg.value);
    }

    /**
     * @notice Set creator for a prediction (called by registry)
     * @param predictionId The prediction ID
     * @param creator Creator address
     */
    function setCreator(uint256 predictionId, address creator) external onlyOwner {
        _creators[predictionId] = creator;
    }

    function setMarket(address _market) external onlyOwner {
        market = _market;
    }

    /**
     * @notice Get evidence for a prediction
     * @param predictionId The prediction ID
     * @return Evidence array
     */
    function getEvidence(uint256 predictionId) external view returns (Evidence[] memory) {
        return _evidence[predictionId];
    }

    /**
     * @notice Get flags for a prediction
     * @param predictionId The prediction ID
     * @return Flag array
     */
    function getFlags(uint256 predictionId) external view returns (Flag[] memory) {
        return _flags[predictionId];
    }

    /**
     * @notice Get total tips for a prediction
     * @param predictionId The prediction ID
     * @return uint256 Total tips
     */
    function getTips(uint256 predictionId) external view returns (uint256) {
        return _tips[predictionId];
    }

    function getPredictionCopyCount(uint256 predictionId) external view returns (uint256) {
        return _copyCounts[predictionId];
    }

    function getCreatorInfluence(address creator) external view returns (uint256) {
        return _influenceScores[creator];
    }

    function getCopiesBy(address copier) external view returns (uint256) {
        return _copiedByUser[copier];
    }

    function registerCopy(uint256 predictionId, address creator, address copier, uint256 amount, uint256 influenceGain)
        external
        onlyMarket
    {
        _copyCounts[predictionId] += 1;
        _copiedByUser[copier] += 1;

        if (_creators[predictionId] == address(0) && creator != address(0)) {
            _creators[predictionId] = creator;
        }

        if (creator != address(0)) {
            _influenceScores[creator] += influenceGain;
        }

        emit CopyRegistered(predictionId, creator, copier, amount, influenceGain);
    }

    // Admin functions
    function setInfluenceFeeBps(uint16 _feeBps) external onlyOwner {
        if (_feeBps > 10000) revert InvalidAmount();
        influenceFeeBps = _feeBps;
    }

    function setTreasury(address _treasury) external onlyOwner {
        treasury = _treasury;
    }
}

