// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {ProphetPortfolio} from "../src/core/ProphetPortfolio.sol";
import {PredictionMarket} from "../src/core/PredictionMarket.sol";
import {PredictionRegistry} from "../src/core/PredictionRegistry.sol";
import {FORE} from "../src/tokens/FORE.sol";

contract ProphetPortfolioTest is Test {
    ProphetPortfolio public portfolio;
    PredictionMarket public market;
    PredictionRegistry public registry;
    FORE public token;

    address public owner = address(1);
    address public user = address(2);

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
        portfolio.setMinter(address(market), true);
    }

    function testMintPortfolioOnlyOnce() public {
        vm.prank(address(market));
        uint256 tokenId = portfolio.mintPortfolio(user);
        assertEq(tokenId, 1);

        vm.prank(address(market));
        vm.expectRevert(ProphetPortfolio.AlreadyMinted.selector);
        portfolio.mintPortfolio(user);
    }

    function testRecordResultUpdatesStats() public {
        vm.prank(address(market));
        uint256 tokenId = portfolio.mintPortfolio(user);
        assertEq(tokenId, 1);

        vm.prank(address(market));
        portfolio.recordResult(user, 10, true, 100 * 1e18, 2e18);

        ProphetPortfolio.Portfolio memory profile = portfolio.getPortfolio(user);

        assertEq(profile.totalPredictions, 1);
        assertEq(profile.correctPredictions, 1);
        assertEq(profile.totalEarnings, 100 * 1e18);
        assertEq(profile.copiedPredictions, 0);
        assertGt(portfolio.getScore(user), 0);
    }

    function testRecordCopyMintsIfNeeded() public {
        vm.prank(address(market));
        portfolio.recordCopy(user, 11, 25 * 1e18);

        assertEq(portfolio.getCopiedCount(user), 1);
        assertGt(portfolio.getScore(user), 0);
    }
}
