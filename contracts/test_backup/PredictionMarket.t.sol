// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test, console} from "forge-std/Test.sol";
import {FORE} from "../src/tokens/FORE.sol";
import {PredictionRegistry} from "../src/core/PredictionRegistry.sol";
import {PredictionMarket} from "../src/core/PredictionMarket.sol";
import {ResolutionOracle} from "../src/core/ResolutionOracle.sol";
import {ProphetPortfolio} from "../src/core/ProphetPortfolio.sol";
import {SocialMetrics} from "../src/core/SocialMetrics.sol";
import {FSPausable} from "../src/core/Pausable.sol";
import {IPredictionMarket} from "../src/interfaces/IPredictionMarket.sol";
import {IPredictionRegistry} from "../src/interfaces/IPredictionRegistry.sol";
import {IResolutionOracle} from "../src/interfaces/IResolutionOracle.sol";

contract PredictionMarketTest is Test {
    FORE public token;
    PredictionRegistry public registry;
    PredictionMarket public market;
    ResolutionOracle public oracle;
    ProphetPortfolio public portfolio;
    SocialMetrics public social;

    address public owner = address(1);
    address public user1 = address(2);
    address public user2 = address(3);
    address public oracleAddress = address(4);
    address public user3 = address(5);

    function setUp() public {
        vm.startPrank(owner);

        // Deploy contracts
        token = new FORE(owner);
        registry = new PredictionRegistry(owner, owner);
        market = new PredictionMarket(owner, address(token), address(registry));
        oracle = new ResolutionOracle(owner, address(registry), address(market), owner);
        portfolio = new ProphetPortfolio(owner, address(market), "https://api.forescene.app/portfolio/");
        social = new SocialMetrics(owner, address(token), owner);

        // Set up permissions
        market.setOracle(address(oracle));
        portfolio.setMinter(address(market), true);
        market.setProphetPortfolio(address(portfolio));
        market.setSocialMetrics(address(social));
        registry.setMarket(address(market));
        registry.setSocialMetrics(address(social));
        social.setMarket(address(market));
        oracle.setOracle(oracleAddress, true);

        // Distribute tokens
        token.transfer(user1, 10000 * 1e18);
        token.transfer(user2, 10000 * 1e18);
        token.transfer(user3, 10000 * 1e18);

        vm.stopPrank();
    }

    function testCreatePrediction() public {
        vm.startPrank(user1);
        token.approve(address(market), 100 * 1e18);
        uint256 predictionId = registry.createPrediction(
            "QmTest123",
            IPredictionRegistry.Format.VIDEO,
            "crypto",
            block.timestamp + 7 days,
            500, // 5% creator fee
            100 * 1e18 // creator stake
        );
        vm.stopPrank();

        assertEq(predictionId, 1);

        PredictionRegistry.Prediction memory pred = registry.getPrediction(predictionId);
        assertEq(pred.creator, user1);
        assertEq(pred.contentCID, "QmTest123");
    }

    function testStakeFor() public {
        // Create prediction
        vm.startPrank(user1);
        token.approve(address(market), 100 * 1e18);
        uint256 predictionId = registry.createPrediction(
            "QmTest123", IPredictionRegistry.Format.VIDEO, "crypto", block.timestamp + 7 days, 500, 100 * 1e18
        );
        vm.stopPrank();

        // Stake FOR
        vm.startPrank(user2);
        token.approve(address(market), 100 * 1e18);
        market.stakeFor(predictionId, 100 * 1e18);
        vm.stopPrank();

        PredictionMarket.Position memory pos = market.getPosition(predictionId, user2);
        assertEq(pos.forAmount, 100 * 1e18);
    }

    function testQuoteOdds() public {
        vm.startPrank(user1);
        token.approve(address(market), 100 * 1e18);
        uint256 predictionId = registry.createPrediction(
            "QmTest123", IPredictionRegistry.Format.VIDEO, "crypto", block.timestamp + 7 days, 500, 100 * 1e18
        );
        vm.stopPrank();

        uint256 odds = market.quoteOdds(predictionId, IPredictionMarket.Side.FOR, 100 * 1e18);
        assertGt(odds, 1e18); // Should be > 1x
    }

    function testQuickStakeUsesPreset() public {
        vm.startPrank(user1);
        token.approve(address(market), 50 * 1e18);
        uint256 predictionId = registry.createPrediction(
            "QmQuick", IPredictionRegistry.Format.TEXT, "macro", block.timestamp + 5 days, 400, 50 * 1e18
        );
        vm.stopPrank();

        vm.startPrank(user2);
        token.approve(address(market), 200 * 1e18);
        market.quickStake(predictionId, IPredictionMarket.Side.FOR, 0);
        vm.stopPrank();

        PredictionMarket.Position memory pos = market.getPosition(predictionId, user2);
        assertEq(pos.forAmount, market.presetAmounts(0));
    }

    function testResolveAndClaim() public {
        // Create and stake
        vm.startPrank(user1);
        token.approve(address(market), 100 * 1e18);
        uint256 predictionId = registry.createPrediction(
            "QmTest123", IPredictionRegistry.Format.VIDEO, "crypto", block.timestamp + 1 days, 500, 100 * 1e18
        );
        vm.stopPrank();

        vm.startPrank(user2);
        token.approve(address(market), 100 * 1e18);
        market.stakeFor(predictionId, 100 * 1e18);
        vm.stopPrank();

        vm.startPrank(user3);
        token.approve(address(market), 50 * 1e18);
        market.stakeAgainst(predictionId, 50 * 1e18);
        vm.stopPrank();

        IPredictionRegistry.Prediction memory pred = registry.getPrediction(predictionId);
        vm.warp(pred.lockTime + 1);
        registry.lockPrediction(predictionId);

        // Resolve
        vm.warp(pred.deadline + 1);
        vm.prank(oracleAddress);
        oracle.proposeOutcome(predictionId, IResolutionOracle.Outcome.FOR);

        vm.warp(block.timestamp + oracle.disputeWindow() + 1);
        oracle.finalizeOutcome(predictionId);

        // Claim payout
        uint256 balanceBefore = token.balanceOf(user2);
        vm.prank(user2);
        market.claimPayout(predictionId);
        uint256 balanceAfter = token.balanceOf(user2);

        assertGt(balanceAfter, balanceBefore);

        PredictionMarket.Position memory posAfter = market.getPosition(predictionId, user2);
        assertEq(posAfter.forAmount, 0);
        assertEq(posAfter.againstAmount, 0);
    }

    function testPausePreventsStaking() public {
        vm.prank(owner);
        market.pause();

        vm.startPrank(user1);
        token.approve(address(market), 50 * 1e18);
        uint256 predictionId = registry.createPrediction(
            "QmPause", IPredictionRegistry.Format.VIDEO, "culture", block.timestamp + 3 days, 0, 50 * 1e18
        );
        vm.stopPrank();

        vm.startPrank(user2);
        token.approve(address(market), 50 * 1e18);
        vm.expectRevert(FSPausable.ContractPaused.selector);
        market.stakeFor(predictionId, 50 * 1e18);
        vm.stopPrank();

        vm.prank(owner);
        market.unpause();
    }

    function testCopyPredictionRequiresIntegrations() public {
        vm.prank(owner);
        PredictionMarket isolated = new PredictionMarket(owner, address(token), address(registry));

        vm.prank(owner);
        isolated.setOracle(address(oracle));

        vm.startPrank(user1);
        token.approve(address(market), 25 * 1e18);
        uint256 predictionId = registry.createPrediction(
            "QmCopyFail", IPredictionRegistry.Format.VIDEO, "crypto", block.timestamp + 4 days, 500, 25 * 1e18
        );
        vm.stopPrank();

        vm.startPrank(user2);
        token.approve(address(isolated), 25 * 1e18);
        vm.expectRevert(PredictionMarket.IntegrationNotConfigured.selector);
        isolated.copyPrediction(predictionId, 25 * 1e18);
        vm.stopPrank();
    }

    function testCopyPrediction() public {
        vm.startPrank(user1);
        token.approve(address(market), 50 * 1e18);
        uint256 predictionId = registry.createPrediction(
            "QmCopy123", IPredictionRegistry.Format.VIDEO, "crypto", block.timestamp + 7 days, 500, 50 * 1e18
        );
        vm.stopPrank();

        vm.startPrank(user2);
        token.approve(address(market), 50 * 1e18);
        market.copyPrediction(predictionId, 50 * 1e18);
        vm.stopPrank();

        PredictionMarket.Position memory pos = market.getPosition(predictionId, user2);
        assertEq(pos.forAmount, 50 * 1e18);

        assertTrue(registry.hasCopied(predictionId, user2));
        assertEq(registry.getCopyCount(predictionId), 1);
        assertEq(social.getPredictionCopyCount(predictionId), 1);
        assertGt(social.getCreatorInfluence(user1), 0);
        assertEq(portfolio.getCopiedCount(user2), 1);
    }
}

