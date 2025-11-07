// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IProphetPortfolio {
    function recordCopy(address user, uint256 predictionId, uint256 amount) external;

    function getCopiedCount(address user) external view returns (uint256);
}
