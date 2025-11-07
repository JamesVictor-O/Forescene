// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {PredictionRegistry} from "../src/core/PredictionRegistry.sol";
import {PredictionMarket} from "../src/core/PredictionMarket.sol";
import {ResolutionOracle} from "../src/core/ResolutionOracle.sol";
import {IPredictionRegistry} from "../src/interfaces/IPredictionRegistry.sol";
import {IResolutionOracle} from "../src/interfaces/IResolutionOracle.sol";
import {ProphetPortfolio} from "../src/core/ProphetPortfolio.sol";
import {SocialMetrics} from "../src/core/SocialMetrics.sol";
import {FORE} from "../src/tokens/FORE.sol";

contract ResolutionOracleTest is Test {
    PredictionRegistry public registry;
    PredictionMarket public market;
    ResolutionOracle public oracle;
    ProphetPortfolio public portfolio;
    SocialMetrics public social;
    FORE public token;

    address public owner = address(1);
    address public reporter = address(2);
    address public user = address(3);

    function setUp() public {
        vm.prank(owner);
        token = new FORE(owner);

        vm.prank(owner);
        registry = new PredictionRegistry(owner, owner);

        vm.prank(owner);
        market = new PredictionMarket(owner, address(token), address(registry));

        vm.prank(owner);
        portfolio = new ProphetPortfolio(owner, address(market), "https://api.forescene.app/portfolio/");

        vm.prank(owner);
        social = new SocialMetrics(owner, address(token), owner);

        vm.prank(owner);
        oracle = new ResolutionOracle(owner, address(registry), address(market), owner);

        vm.prank(owner);
        registry.setMarket(address(market));
        vm.prank(owner);
        registry.setSocialMetrics(address(social));
        vm.prank(owner);
        market.setOracle(address(oracle));
        vm.prank(owner);
        market.setProphetPortfolio(address(portfolio));
        vm.prank(owner);
        market.setSocialMetrics(address(social));
        vm.prank(owner);
        social.setMarket(address(market));
        vm.prank(owner);
        portfolio.setMinter(address(market), true);
        vm.prank(owner);
        oracle.setOracle(reporter, true);

        vm.prank(owner);
        token.transfer(user, 1_000 * 1e18);
        vm.prank(owner);
        token.transfer(reporter, 1_000 * 1e18);
    }

    function _createAndLock()
        internal
        returns (uint256 predictionId, IPredictionRegistry.Prediction memory pred)
    {
        vm.prank(user);
        token.approve(address(market), 200 * 1e18);
        vm.prank(user);
        predictionId = registry.createPrediction(
            "QmOracle", IPredictionRegistry.Format.TEXT, "macro", block.timestamp + 3 days, 0
        );

        vm.prank(user);
        market.stakeFor(predictionId, 200 * 1e18);

        pred = registry.getPrediction(predictionId);
        vm.warp(pred.lockTime + 1);
        registry.lockPrediction(predictionId);
    }

    function testProposeAndFinalizeOutcome() public {
        (uint256 predictionId, IPredictionRegistry.Prediction memory pred) = _createAndLock();

        vm.prank(reporter);
        oracle.proposeOutcome(predictionId, IResolutionOracle.Outcome.FOR);

        vm.warp(pred.deadline + 1);
        vm.warp(block.timestamp + oracle.disputeWindow() + 1);
        oracle.finalizeOutcome(predictionId);

        assertTrue(oracle.isFinalized(predictionId));
        assertEq(uint8(oracle.getOutcome(predictionId)), uint8(IResolutionOracle.Outcome.FOR));
    }

    function testDisputeRequiresBond() public {
        (uint256 predictionId, IPredictionRegistry.Prediction memory pred) = _createAndLock();

        vm.prank(reporter);
        oracle.proposeOutcome(predictionId, IResolutionOracle.Outcome.FOR);

        vm.warp(pred.deadline + 1);
        vm.expectRevert(ResolutionOracle.InsufficientBond.selector);
        oracle.disputeOutcome(predictionId, "evidence");
    }
}
