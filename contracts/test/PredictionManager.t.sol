// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {PredictionManager} from "../src/core/PredictionManager.sol";
import {KnowledgePointToken} from "../src/tokens/KnowledgePointToken.sol"; 
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";


contract PredictionManagerTest is Test {
    // Use SafeERC20 for IERC20 functions like balanceOf
    using SafeERC20 for IERC20;

    PredictionManager manager;
    KnowledgePointToken kpToken;

    // --- Actors & Constants ---
    address constant OWNER = address(0xAA);
    address constant ORACLE = address(0xBB);
    address constant ALICE = address(0xCAFE); // Early YES staker (Winner)
    address constant BOB = address(0xB0B);     // Late YES staker (Winner)
    address constant CHARLIE = address(0xC4);  // NO staker (Loser)
    address constant TREASURY = address(0xDEAD);

    uint256 constant STAKE_AMOUNT = 100 ether; // 100 tokens (using 18 decimals)
    uint256 constant PLATFORM_FEE_BPS = 500; // 5.00% fee
    uint256 constant DEADLINE = 3 days;
    uint256 constant EARLY_STAKE_TIME = 1 hours;
    uint256 constant LATE_STAKE_TIME = 2 days;
    
    // Constants matching PredictionManager
    uint256 constant BASIS_POINTS = 10000;
    uint256 constant MAX_BONUS = 2000;
    
    // Helper to scale values (1e18)
    uint256 constant WAD = 1e18; 

    function setUp() public {
        vm.startPrank(OWNER); 
        kpToken = new KnowledgePointToken(OWNER); 
        manager = new PredictionManager(OWNER, address(kpToken), TREASURY); 
        vm.stopPrank(); 
        
      
        address[] memory stakers = new address[](3);
        stakers[0] = ALICE;
        stakers[1] = BOB;
        stakers[2] = CHARLIE;

        // Give all stakers 1000 tokens and make them approve the Manager
        for (uint256 i = 0; i < stakers.length; i++) {
            vm.prank(OWNER);
            kpToken.mint(stakers[i], 1000 ether); 
            
            vm.prank(stakers[i]);
            kpToken.approve(address(manager), type(uint256).max);
            assertEq(kpToken.balanceOf(stakers[i]), 1000 ether, "Initial balance incorrect");
        }
    }

    /// @notice Tests the full market lifecycle where ALICE and BOB win and CHARLIE loses.
    function testEndToEndWinningPrediction() public {
     
        uint256 marketStartTime = block.timestamp;
        uint256 marketDeadline = marketStartTime + DEADLINE;
        
        vm.startPrank(OWNER);
        uint256 marketId = manager.createMarket(
            "QmContentCID",
            "Crypto",
            ORACLE,
            marketDeadline,
            PLATFORM_FEE_BPS
        );
        vm.stopPrank();

        // --- 2. Alice stakes Early (Gets max bonus) ---
        vm.warp(block.timestamp + EARLY_STAKE_TIME); // Advance time
        
        vm.startPrank(ALICE);
        manager.placePrediction(marketId, PredictionManager.Outcome.YES, STAKE_AMOUNT);
        vm.stopPrank();
        
        // Alice's weighted stake should be max bonus (1.2x) - verified through payout
        assertEq(kpToken.balanceOf(ALICE), 1000 ether - STAKE_AMOUNT, "Alice balance incorrect after stake");

        vm.warp(block.timestamp + 1 hours); // Advance time slightly
        
        vm.startPrank(CHARLIE);
        manager.placePrediction(marketId, PredictionManager.Outcome.NO, STAKE_AMOUNT);
        vm.stopPrank();
        
        // --- 4. Bob stakes Late (Gets lower bonus) ---
        vm.warp(block.timestamp + LATE_STAKE_TIME); // Advance time close to deadline
        
        vm.startPrank(BOB);
        manager.placePrediction(marketId, PredictionManager.Outcome.YES, STAKE_AMOUNT);
        vm.stopPrank();
        
        // --- 5. Resolve Market (YES wins) ---
        vm.warp(marketDeadline); // Warp to/past deadline
        
        vm.prank(ORACLE);
        manager.resolveMarket(marketId, PredictionManager.Outcome.YES);
    
        uint256 aliceBalanceBefore = kpToken.balanceOf(ALICE);
        uint256 treasuryBalanceBefore = kpToken.balanceOf(TREASURY);

        vm.startPrank(ALICE);
        manager.claimWinnings(marketId);
        vm.stopPrank();

        assertGt(kpToken.balanceOf(ALICE), aliceBalanceBefore + STAKE_AMOUNT, "Alice should receive stake + winnings");
        
        // Treasury should receive platform fee
        assertGt(kpToken.balanceOf(TREASURY), treasuryBalanceBefore, "Treasury should receive fee");
        vm.startPrank(BOB);
        manager.claimWinnings(marketId);
        vm.stopPrank();

        // --- 8. Charlie Tries to Claim (Loser) ---
        vm.prank(CHARLIE);
        vm.expectRevert(PredictionManager.NoWinnings.selector);
        manager.claimWinnings(marketId);
        
        // --- 9. Alice Tries to Claim Again ---
        vm.prank(ALICE);
        vm.expectRevert(PredictionManager.AlreadyClaimed.selector);
        manager.claimWinnings(marketId);
    }
}