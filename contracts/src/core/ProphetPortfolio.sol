// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IPredictionMarket} from "../interfaces/IPredictionMarket.sol";

/**
 * @title ProphetPortfolio
 * @notice NFT representing a user's prediction portfolio/reputation
 * @dev Tracks prediction history and reputation on-chain
 */
contract ProphetPortfolio is ERC721URIStorage, Ownable {
    // Storage
    IPredictionMarket public immutable market;

    struct Portfolio {
        uint256 tokenId;
        address owner;
        uint256 prophetScore;
        uint256 totalPredictions;
        uint256 correctPredictions;
        uint256 totalEarnings;
        uint256 createdAt;
    }

    mapping(address => uint256) private _ownerToTokenId; // User address to token ID
    mapping(uint256 => Portfolio) private _portfolios; // Token ID to portfolio
    mapping(address => bool) private _minters; // Authorized minters (market contract)

    uint256 private _nextTokenId = 1;
    string private _baseTokenURI;

    // Events
    event PortfolioMinted(address indexed to, uint256 indexed tokenId);
    event ReputationUpdated(
        address indexed user, uint256 indexed predictionId, bool wasCorrect, uint256 stake, uint256 odds
    );
    event ScoreUpdated(address indexed user, uint256 newScore);

    // Errors
    error AlreadyMinted();
    error NotMinter();
    error TokenNotFound();
    error InvalidAddress();

    modifier onlyMinter() {
        if (!_minters[msg.sender] && msg.sender != owner()) revert NotMinter();
        _;
    }

    constructor(address initialOwner, address _market, string memory baseURI)
        ERC721("Prophet Portfolio", "PROPHET")
        Ownable(initialOwner)
    {
        market = IPredictionMarket(_market);
        _baseTokenURI = baseURI;
    }

    /**
     * @notice Mint portfolio NFT for a user
     * @param to Address to mint to
     * @return tokenId The minted token ID
     */
    function mintPortfolio(address to) external onlyMinter returns (uint256) {
        if (to == address(0)) revert InvalidAddress();
        if (_ownerToTokenId[to] != 0) revert AlreadyMinted();

        uint256 tokenId = _nextTokenId++;
        _ownerToTokenId[to] = tokenId;

        _portfolios[tokenId] = Portfolio({
            tokenId: tokenId,
            owner: to,
            prophetScore: 0,
            totalPredictions: 0,
            correctPredictions: 0,
            totalEarnings: 0,
            createdAt: block.timestamp
        });

        _mint(to, tokenId);
        _setTokenURI(tokenId, string(abi.encodePacked(_baseTokenURI, _toString(tokenId))));

        emit PortfolioMinted(to, tokenId);

        return tokenId;
    }

    /**
     * @notice Record prediction result (called by market on resolution)
     * @param user User address
     * @param predictionId Prediction ID
     * @param wasCorrect Whether prediction was correct
     * @param stake Stake amount
     * @param odds Odds multiplier (in 1e18 format, e.g., 2.3x = 2.3e18)
     */
    function recordResult(address user, uint256 predictionId, bool wasCorrect, uint256 stake, uint256 odds)
        external
        onlyMinter
    {
        uint256 tokenId = _ownerToTokenId[user];
        if (tokenId == 0) revert TokenNotFound();

        Portfolio storage portfolio = _portfolios[tokenId];

        portfolio.totalPredictions++;
        if (wasCorrect) {
            portfolio.correctPredictions++;
            // Calculate earnings: stake * (odds - 1)
            uint256 earnings = stake * (odds - 1e18) / 1e18;
            portfolio.totalEarnings += earnings;

            // Update prophet score: base score + accuracy bonus + earnings bonus
            uint256 accuracyBonus = (portfolio.correctPredictions * 1e18) / portfolio.totalPredictions * 100;
            uint256 earningsBonus = earnings / 1e18; // Scale down
            portfolio.prophetScore += 10 + accuracyBonus + earningsBonus;
        }

        emit ReputationUpdated(user, predictionId, wasCorrect, stake, odds);
    }

    /**
     * @notice Set prophet score (for off-chain calculation)
     * @param user User address
     * @param newScore New score
     */
    function setScore(address user, uint256 newScore) external onlyOwner {
        uint256 tokenId = _ownerToTokenId[user];
        if (tokenId == 0) revert TokenNotFound();

        _portfolios[tokenId].prophetScore = newScore;
        emit ScoreUpdated(user, newScore);
    }

    /**
     * @notice Get portfolio for a user
     * @param user User address
     * @return Portfolio struct
     */
    function getPortfolio(address user) external view returns (Portfolio memory) {
        uint256 tokenId = _ownerToTokenId[user];
        if (tokenId == 0) revert TokenNotFound();
        return _portfolios[tokenId];
    }

    /**
     * @notice Get prophet score
     * @param user User address
     * @return score Prophet score
     */
    function getScore(address user) external view returns (uint256 score) {
        uint256 tokenId = _ownerToTokenId[user];
        if (tokenId == 0) return 0;
        return _portfolios[tokenId].prophetScore;
    }

    /**
     * @notice Get token ID for user
     * @param user User address
     * @return tokenId Token ID (0 if not minted)
     */
    function tokenIdOf(address user) external view returns (uint256) {
        return _ownerToTokenId[user];
    }

    /**
     * @notice Override tokenURI to return dynamic metadata
     * @param tokenId Token ID
     * @return string Token URI
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        return super.tokenURI(tokenId);
    }

    // Admin functions
    function setMinter(address minter, bool enabled) external onlyOwner {
        _minters[minter] = enabled;
    }

    function setBaseURI(string memory baseURI) external onlyOwner {
        _baseTokenURI = baseURI;
    }

    // Helper function
    function _toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) return "0";
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }
}

