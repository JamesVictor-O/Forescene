// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title IPredictionMarket
 * @notice Interface for prediction market staking
 */
interface IPredictionMarket {
    enum Side {
        FOR,
        AGAINST
    }

    struct Pool {
        uint256 forPool; // Total staked FOR
        uint256 againstPool; // Total staked AGAINST
        uint256 totalStaked;
        uint16 feeBps; // Platform fee in basis points
    }

    struct Position {
        uint256 forAmount;
        uint256 againstAmount;
    }

    event StakePlaced(uint256 indexed predictionId, address indexed user, Side side, uint256 amount, uint256 odds);

    event LiquidityAdded(uint256 indexed predictionId, address indexed provider, uint256 amount, Side side);

    event LiquidityRemoved(uint256 indexed predictionId, address indexed provider, uint256 shares, uint256 amount);

    event PayoutClaimed(uint256 indexed predictionId, address indexed user, uint256 amount);

    function stakeFor(uint256 predictionId, uint256 amount) external;

    function stakeAgainst(uint256 predictionId, uint256 amount) external;

    function quickStake(uint256 predictionId, Side side, uint256 presetAmount) external;

    function quoteOdds(uint256 predictionId, Side side, uint256 amount) external view returns (uint256 odds);

    function claimPayout(uint256 predictionId) external;

    function getPosition(uint256 predictionId, address user) external view returns (Position memory);

    function getPool(uint256 predictionId) external view returns (Pool memory);
}

