// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface ISocialMetrics {
    function influenceFeeBps() external view returns (uint16);

    function registerCopy(uint256 predictionId, address creator, address copier, uint256 amount, uint256 influenceGain)
        external;

    function getPredictionCopyCount(uint256 predictionId) external view returns (uint256);

    function getCreatorInfluence(address creator) external view returns (uint256);
}
