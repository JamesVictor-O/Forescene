// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol";
import {PredictionManager} from "../src/core/PredictionManager.sol";

/**
 * @title DeployPredictionManagerOnly
 * @notice Deployment script for PredictionManager only
 * @dev Requires KnowledgePointToken to be deployed first
 * @dev Set KP_TOKEN_ADDRESS in .env or pass as argument
 */
contract DeployPredictionManagerOnly is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        // Get KP Token address from env or use default
        address kpTokenAddress;
        try vm.envAddress("KP_TOKEN_ADDRESS") returns (address addr) {
            kpTokenAddress = addr;
        } catch {
            revert("KP_TOKEN_ADDRESS not set in .env. Deploy KnowledgePointToken first!");
        }
        
        // Get treasury address from env or use deployer as default
        address treasury = deployer;
        try vm.envAddress("TREASURY_ADDRESS") returns (address envTreasury) {
            treasury = envTreasury;
        } catch {
            console.log("Warning: TREASURY_ADDRESS not set, using deployer as treasury");
        }

        console.log("Deployer:", deployer);
        console.log("KP Token Address:", kpTokenAddress);
        console.log("Treasury:", treasury);
        console.log("Network: BlockDag");
        console.log("\n=== Deploying PredictionManager ===");

        vm.startBroadcast(deployerPrivateKey);

        PredictionManager manager = new PredictionManager(
            deployer,           // initialOwner
            kpTokenAddress,      // _kpTokenAddress
            treasury            // _treasuryAddress
        );
        
        console.log("PredictionManager deployed at:", address(manager));
        // console.log("KP Token Address:", manager.kpToken());
        console.log("Treasury Address:", manager.treasuryAddress());
        console.log("Owner:", manager.owner());

        vm.stopBroadcast();

        console.log("\n=== Deployment Summary ===");
        console.log("PredictionManager Address:", address(manager));
        console.log("KP Token Address:", kpTokenAddress);
        console.log("Treasury Address:", treasury);
        console.log("\n=== Next Steps ===");
        console.log("1. Verify contracts on BlockDag explorer");
        console.log("2. Update frontend with contract addresses");
        console.log("3. Create initial markets via createMarket function");
    }
}

