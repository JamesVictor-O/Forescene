// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test, console} from "forge-std/Test.sol";
import {FORE} from "../src/tokens/FORE.sol";
import {PredictionRegistry} from "../src/core/PredictionRegistry.sol";
import {PredictionMarket} from "../src/core/PredictionMarket.sol";
import {ResolutionOracle} from "../src/core/ResolutionOracle.sol";
import {ProphetPortfolio} from "../src/core/ProphetPortfolio.sol";

contract PredictionMarketTest is Test {
    FORE public token;
    PredictionRegistry public registry;
    PredictionMarket public market;
    ResolutionOracle public oracle;
    ProphetPortfolio public portfolio;

    address public owner = address(1);
    address public user1 = address(2);
    address public user2 = address(3);
    address public oracleAddress = address(4);

    function setUp() public {
        vm.startPrank(owner);

        // Deploy contracts
        token = new FORE(owner);
        registry = new PredictionRegistry(owner, owner);
        market = new PredictionMarket(owner, address(token), address(registry));
        oracle = new ResolutionOracle(owner, address(registry), address(market), owner);
        portfolio = new ProphetPortfolio(owner, address(market), "https://api.forescene.app/portfolio/");

        // Set up permissions
        market.setOracle(address(oracle));
        portfolio.setMinter(address(market), true);
        oracle.setOracle(oracleAddress, true);

        // Distribute tokens
        token.transfer(user1, 10000 * 1e18);
        token.transfer(user2, 10000 * 1e18);

        vm.stopPrank();
    }

    function testCreatePrediction() public {
        vm.prank(user1);
        uint256 predictionId = registry.createPrediction(
            "QmTest123",
            PredictionRegistry.Format.VIDEO,
            "crypto",
            block.timestamp + 7 days,
            500 // 5% creator fee
        );

        assertEq(predictionId, 1);

        PredictionRegistry.Prediction memory pred = registry.getPrediction(predictionId);
        assertEq(pred.creator, user1);
        assertEq(pred.contentCID, "QmTest123");
    }

    function testStakeFor() public {
        // Create prediction
        vm.prank(user1);
        uint256 predictionId = registry.createPrediction(
            "QmTest123", PredictionRegistry.Format.VIDEO, "crypto", block.timestamp + 7 days, 500
        );

        // Stake FOR
        vm.startPrank(user2);
        token.approve(address(market), 100 * 1e18);
        market.stakeFor(predictionId, 100 * 1e18);
        vm.stopPrank();

        PredictionMarket.Position memory pos = market.getPosition(predictionId, user2);
        assertEq(pos.forAmount, 100 * 1e18);
    }

    function testQuoteOdds() public {
        vm.prank(user1);
        uint256 predictionId = registry.createPrediction(
            "QmTest123", PredictionRegistry.Format.VIDEO, "crypto", block.timestamp + 7 days, 500
        );

        uint256 odds = market.quoteOdds(predictionId, PredictionMarket.Side.FOR, 100 * 1e18);
        assertGt(odds, 1e18); // Should be > 1x
    }

    function testResolveAndClaim() public {
        // Create and stake
        vm.prank(user1);
        uint256 predictionId = registry.createPrediction(
            "QmTest123", PredictionRegistry.Format.VIDEO, "crypto", block.timestamp + 1 days, 500
        );

        vm.startPrank(user2);
        token.approve(address(market), 100 * 1e18);
        market.stakeFor(predictionId, 100 * 1e18);
        vm.stopPrank();

        // Lock prediction
        vm.warp(block.timestamp + 1 days - 1 hours);
        registry.lockPrediction(predictionId);

        // Resolve
        vm.warp(block.timestamp + 2 days);
        vm.prank(oracleAddress);
        oracle.proposeOutcome(predictionId, ResolutionOracle.Outcome.FOR);

        vm.warp(block.timestamp + 8 days);
        oracle.finalizeOutcome(predictionId);

        // Claim payout
        uint256 balanceBefore = token.balanceOf(user2);
        vm.prank(user2);
        market.claimPayout(predictionId);
        uint256 balanceAfter = token.balanceOf(user2);

        assertGt(balanceAfter, balanceBefore);
    }
}

