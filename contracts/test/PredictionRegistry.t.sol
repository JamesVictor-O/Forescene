// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {PredictionRegistry} from "../src/core/PredictionRegistry.sol";
import {IPredictionRegistry} from "../src/interfaces/IPredictionRegistry.sol";

contract PredictionRegistryTest is Test {
    PredictionRegistry public registry;

    address public owner = address(1);
    address public market = address(2);
    address public social = address(3);
    address public alice = address(4);

    function setUp() public {
        vm.prank(owner);
        registry = new PredictionRegistry(owner, owner);

        vm.prank(owner);
        registry.setMarket(market);

        vm.prank(owner);
        registry.setSocialMetrics(social);
    }

    function testCreatePredictionStoresMetadata() public {
        vm.prank(alice);
        uint256 predictionId = registry.createPrediction(
            "QmCID",
            IPredictionRegistry.Format.VIDEO,
            "crypto",
            block.timestamp + 7 days,
            750
        );

        assertEq(predictionId, 1);

        PredictionRegistry.Prediction memory pred = registry.getPrediction(predictionId);
        assertEq(pred.creator, alice);
        assertEq(pred.contentCID, "QmCID");
        assertEq(uint8(pred.format), uint8(IPredictionRegistry.Format.VIDEO));
        assertEq(pred.category, "crypto");
        assertEq(pred.creatorFeeBps, 750);
        assertTrue(pred.isActive);
    }

    function testLockPredictionAfterLockTime() public {
        vm.prank(alice);
        uint256 predictionId =
            registry.createPrediction("QmLock", IPredictionRegistry.Format.TEXT, "sports", block.timestamp + 3 days, 0);

        vm.expectRevert(PredictionRegistry.InvalidDeadline.selector);
        registry.lockPrediction(predictionId);

        PredictionRegistry.Prediction memory pred = registry.getPrediction(predictionId);
        vm.warp(pred.lockTime + 1);

        registry.lockPrediction(predictionId);
        assertTrue(registry.isLocked(predictionId));
    }

    function testSetPredictionActiveAndStatus() public {
        vm.prank(alice);
        uint256 predictionId =
            registry.createPrediction("QmStatus", IPredictionRegistry.Format.TEXT, "tech", block.timestamp + 2 days, 0);

        vm.prank(owner);
        registry.setPredictionActive(predictionId, false);
        PredictionRegistry.Prediction memory pred = registry.getPrediction(predictionId);
        assertFalse(pred.isActive);

        vm.prank(owner);
        registry.setPredictionStatus(predictionId, IPredictionRegistry.Status.CANCELLED);
        pred = registry.getPrediction(predictionId);
        assertEq(uint8(pred.status), uint8(IPredictionRegistry.Status.CANCELLED));
    }

    function testRecordCopyTracksUniqueCopiers() public {
        vm.prank(alice);
        uint256 predictionId = registry.createPrediction(
            "QmCopy",
            IPredictionRegistry.Format.VIDEO,
            "politics",
            block.timestamp + 5 days,
            0
        );

        address copier = address(5);

        vm.prank(market);
        registry.recordCopy(predictionId, copier);

        assertTrue(registry.hasCopied(predictionId, copier));
        assertEq(registry.getCopyCount(predictionId), 1);

        vm.prank(market);
        vm.expectRevert(PredictionRegistry.AlreadyCopied.selector);
        registry.recordCopy(predictionId, copier);

        address second = address(6);
        vm.prank(market);
        registry.recordCopy(predictionId, second);
        assertEq(registry.getCopyCount(predictionId), 2);
    }
}
