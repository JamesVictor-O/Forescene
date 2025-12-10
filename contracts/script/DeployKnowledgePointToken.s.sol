// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol";
import {KnowledgePointToken} from "../src/tokens/KnowledgePointToken.sol";

/**
 * @title DeployKnowledgePointToken
 * @notice Deployment script for KnowledgePointToken only
 * @dev Deploy this first, then use the address in PredictionManager deployment
 */
contract DeployKnowledgePointToken is Script {
    function run() external returns (KnowledgePointToken) {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        console.log("Deployer:", deployer);
        console.log("Network: BlockDag");
        console.log("\n=== Deploying KnowledgePointToken ===");

        vm.startBroadcast(deployerPrivateKey);

        KnowledgePointToken kpToken = new KnowledgePointToken(deployer);
        
        vm.stopBroadcast();

        console.log("KnowledgePointToken deployed at:", address(kpToken));
        console.log("Total Supply:", kpToken.totalSupply() / 1e18, "KP");
        console.log("Owner:", kpToken.owner());

        console.log("\n=== Deployment Summary ===");
        console.log("KnowledgePointToken Address:", address(kpToken));
        console.log("\n=== Next Step ===");
        console.log("Save this address and use it when deploying PredictionManager:");
        console.log("KP_TOKEN_ADDRESS=", address(kpToken));

        return kpToken;
    }
}