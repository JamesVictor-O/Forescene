// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {SocialMetrics} from "../src/core/SocialMetrics.sol";
import {FORE} from "../src/tokens/FORE.sol";

contract SocialMetricsTest is Test {
    SocialMetrics public social;
    FORE public token;

    address public owner = address(1);
    address public market = address(2);
    address public creator = address(3);
    address public copier = address(4);

    function setUp() public {
        vm.prank(owner);
        token = new FORE(owner);

        vm.prank(owner);
        social = new SocialMetrics(owner, address(token), owner);

        vm.prank(owner);
        social.setMarket(market);

        vm.prank(owner);
        social.setCreator(1, creator);
    }

    function testTipCreatorForwardsValue() public {
        uint256 beforeBalance = creator.balance;

        vm.deal(copier, 1 ether);
        vm.prank(copier);
        social.tipCreator{value: 0.25 ether}(1);

        assertEq(creator.balance, beforeBalance + 0.25 ether);
        assertEq(social.getTips(1), 0.25 ether);
    }

    function testRegisterCopyUpdatesInfluence() public {
        vm.prank(market);
        social.registerCopy(1, creator, copier, 200 * 1e18, 10);

        assertEq(social.getPredictionCopyCount(1), 1);
        assertEq(social.getCopiesBy(copier), 1);
        assertEq(social.getCreatorInfluence(creator), 10);

        vm.expectRevert(SocialMetrics.Unauthorized.selector);
        social.registerCopy(1, creator, copier, 100, 5);
    }
}
