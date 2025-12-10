// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol";
import {PredictionManager} from "../src/core/PredictionManager.sol";
import {KnowledgePointToken} from "../src/tokens/KnowledgePointToken.sol";

/**
 * @title DeployPredictionManager
 * @notice Deployment script for PredictionManager on BlockDag
 * @dev Can deploy both contracts OR use existing KP Token address
 */
contract DeployPredictionManager is Script {
    function run() external returns (PredictionManager, KnowledgePointToken) {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        // Get treasury address from env or use deployer as default
        address treasury;
        try vm.envAddress("TREASURY_ADDRESS") returns (address envTreasury) {
            treasury = envTreasury;
        } catch {
            treasury = deployer; // Default to deployer if not set
            console.log("Warning: TREASURY_ADDRESS not set, using deployer as treasury");
        }

        console.log("Deployer:", deployer);
        console.log("Treasury:", treasury);
        console.log("Network: BlockDag");

        vm.startBroadcast(deployerPrivateKey);

        // Check if KP Token already exists
        KnowledgePointToken kpToken;
        address existingKpToken;
        
        try vm.envAddress("KP_TOKEN_ADDRESS") returns (address envKpToken) {
            existingKpToken = envKpToken;
            kpToken = KnowledgePointToken(existingKpToken);
            console.log("\n=== Using Existing KnowledgePointToken ===");
            console.log("KnowledgePointToken address:", existingKpToken);
            console.log("Total Supply:", kpToken.totalSupply() / 1e18, "KP");
        } catch {
            // Deploy new KP Token
            console.log("\n=== Deploying New KnowledgePointToken ===");
            kpToken = new KnowledgePointToken(deployer);
            console.log("KnowledgePointToken deployed at:", address(kpToken));
            console.log("Total Supply:", kpToken.totalSupply() / 1e18, "KP");
            console.log("Owner:", kpToken.owner());
        }

        // Deploy PredictionManager
        console.log("\n=== Deploying PredictionManager ===");
        PredictionManager manager = new PredictionManager(
            deployer,           // initialOwner
            address(kpToken),   // _kpTokenAddress
            treasury            // _treasuryAddress
        );
        console.log("PredictionManager deployed at:", address(manager));
        console.log("KP Token Address:", address(kpToken));
        console.log("Treasury Address:", manager.treasuryAddress());
        console.log("Owner:", manager.owner());

        vm.stopBroadcast();

        // Output deployment summary
        console.log("\n=== Deployment Summary ===");
        console.log("Network: BlockDag");
        console.log("Deployer:", deployer);
        console.log("KnowledgePointToken:", address(kpToken));
        console.log("PredictionManager:", address(manager));
        console.log("Treasury Address:", treasury);
        
        console.log("\n=== Contract Addresses (Save These) ===");
        console.log("export KP_TOKEN_ADDRESS=", address(kpToken));
        console.log("export PREDICTION_MANAGER_ADDRESS=", address(manager));
        
        console.log("\n=== Next Steps ===");
        console.log("1. Verify contracts on BlockDag explorer");
        console.log("2. Update frontend with contract addresses");
        console.log("3. Grant PredictionManager minting rights (if needed):");
        console.log("   kpToken.grantRole(MINTER_ROLE, ", address(manager), ")");
        console.log("4. Create initial markets via createMarket function");

        return (manager, kpToken);
    }
}