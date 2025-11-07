// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol";
import {FORE} from "../src/tokens/FORE.sol";
import {PredictionRegistry} from "../src/core/PredictionRegistry.sol";
import {PredictionMarket} from "../src/core/PredictionMarket.sol";
import {ResolutionOracle} from "../src/core/ResolutionOracle.sol";
import {ProphetPortfolio} from "../src/core/ProphetPortfolio.sol";
import {SocialMetrics} from "../src/core/SocialMetrics.sol";

/**
 * @title Deploy
 * @notice Deployment script for Forescene contracts
 * @dev Deploys all contracts in correct order with proper initialization
 */
contract Deploy is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy FORE token
        FORE token = new FORE(deployer);
        console.log("FORE Token deployed at:", address(token));

        // 2. Deploy PredictionRegistry
        PredictionRegistry registry = new PredictionRegistry(deployer, deployer); // treasury = deployer for now
        console.log("PredictionRegistry deployed at:", address(registry));

        // 3. Deploy PredictionMarket
        PredictionMarket market = new PredictionMarket(deployer, address(token), address(registry));
        console.log("PredictionMarket deployed at:", address(market));

        // 4. Deploy ResolutionOracle
        ResolutionOracle oracle = new ResolutionOracle(deployer, address(registry), address(market), deployer);
        console.log("ResolutionOracle deployed at:", address(oracle));

        // 5. Deploy ProphetPortfolio
        ProphetPortfolio portfolio = new ProphetPortfolio(
            deployer,
            address(market),
            "https://api.forescene.app/portfolio/" // Base URI
        );
        console.log("ProphetPortfolio deployed at:", address(portfolio));

        // 6. Deploy SocialMetrics
        SocialMetrics social = new SocialMetrics(deployer, address(token), deployer);
        console.log("SocialMetrics deployed at:", address(social));

        // 7. Set up permissions and integrations
        market.setOracle(address(oracle));
        portfolio.setMinter(address(market), true);
        market.setProphetPortfolio(address(portfolio));
        market.setSocialMetrics(address(social));
        registry.setMarket(address(market));
        registry.setSocialMetrics(address(social));
        social.setMarket(address(market));

        vm.stopBroadcast();

        // Output addresses for frontend
        console.log("\n=== Deployment Summary ===");
        console.log("FORE Token:", address(token));
        console.log("PredictionRegistry:", address(registry));
        console.log("PredictionMarket:", address(market));
        console.log("ResolutionOracle:", address(oracle));
        console.log("ProphetPortfolio:", address(portfolio));
        console.log("SocialMetrics:", address(social));
    }
}

