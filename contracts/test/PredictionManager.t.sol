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
    address constant ALICE = address(0xCAFE); 
    address constant BOB = address(0xB0B);    
    address constant CHARLIE = address(0xC4);  
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
        vm.prank(OWNER);
        kpToken.mint(OWNER, 1000 ether);
        vm.prank(OWNER);
        kpToken.approve(address(manager), type(uint256).max);
      
        address[] memory stakers = new address[](3);
        stakers[0] = ALICE;
        stakers[1] = BOB;
        stakers[2] = CHARLIE;

       
        for (uint256 i = 0; i < stakers.length; i++) {
            vm.prank(OWNER);
            kpToken.mint(stakers[i], 1000 ether); 
            
            vm.prank(stakers[i]);
            kpToken.approve(address(manager), type(uint256).max);
            assertEq(kpToken.balanceOf(stakers[i]), 1000 ether, "Initial balance incorrect");
        }
    }


    function testEndToEndWinningPrediction() public {
     
        uint256 marketStartTime = block.timestamp;
        uint256 marketDeadline = marketStartTime + DEADLINE;
        
        vm.startPrank(OWNER);
        uint256 marketId = manager.createMarket(
            PredictionManager.MarketType.Binary, 
            "Will Bitcoin reach $100k by end of 2025?", 
            "Crypto", 
            marketDeadline, 
            10 ether, 
            0,
            "" 
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
        
        // Oracle is now the creator (OWNER) by default
        vm.prank(OWNER);
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

    function testCrowdWisdomMarketCreation() public {
        uint256 marketStartTime = block.timestamp;
        uint256 marketDeadline = marketStartTime + DEADLINE;
        
        vm.startPrank(OWNER);
        uint256 marketId = manager.createMarket(
            PredictionManager.MarketType.CrowdWisdom,
            "Who will win the 2024 Headies Award for Artist of the Year?",
            "Music",
            marketDeadline,
            10 ether,
            0, // initialSide not used for CrowdWisdom
            "Asake" // initialOutcomeLabel
        );
        vm.stopPrank();
        (
            PredictionManager.MarketType marketType,
            ,
            ,
            ,
            ,
            ,
            ,
            ,
            ,
            ,
            ,
            string memory question,
            ,
            string memory initialOutcomeLabel,
            
        ) = manager.markets(marketId);
        assertEq(keccak256(bytes(question)), keccak256(bytes("Who will win the 2024 Headies Award for Artist of the Year?")), "Question mismatch");
        assertEq(uint256(marketType), uint256(PredictionManager.MarketType.CrowdWisdom), "Should be CrowdWisdom market");
        assertEq(keccak256(bytes(initialOutcomeLabel)), keccak256(bytes("Asake")), "Initial outcome label should match");

        // Check that initial outcome was created
        (string[] memory outcomes, uint256[] memory pools) = manager.getMarketOutcomes(marketId);
        assertEq(outcomes.length, 1, "Should have 1 initial outcome");
        assertEq(keccak256(bytes(outcomes[0])), keccak256(bytes("asake")), "Initial outcome should be normalized to lowercase");
        assertEq(pools[0], 10 ether, "Initial pool should be 10 ether");
    }

    function testCrowdWisdomCommentAndStake() public {
        uint256 marketStartTime = block.timestamp;
        uint256 marketDeadline = marketStartTime + DEADLINE;
        
        vm.startPrank(OWNER);
        uint256 marketId = manager.createMarket(
            PredictionManager.MarketType.CrowdWisdom,
            "Who will win the 2024 Headies Award?",
            "Music",
            marketDeadline,
            10 ether,
            0,
            "Asake"
        );
        vm.stopPrank();

        // Alice creates a new outcome and stakes
        vm.warp(block.timestamp + EARLY_STAKE_TIME);
        vm.startPrank(ALICE);
        uint256 outcomeIndex = manager.commentAndStake(marketId, "Burna Boy", STAKE_AMOUNT);
        vm.stopPrank();

        assertEq(outcomeIndex, 1, "New outcome should be at index 1");
        
        // Check outcomes
        (string[] memory outcomes, uint256[] memory pools) = manager.getMarketOutcomes(marketId);
        assertEq(outcomes.length, 2, "Should have 2 outcomes");
        assertEq(keccak256(bytes(outcomes[1])), keccak256(bytes("burna boy")), "Second outcome should be normalized");
        assertEq(pools[1], STAKE_AMOUNT, "Alice's stake should be in pool");

        // Bob stakes on existing outcome (Asake)
        vm.warp(block.timestamp + 1 hours);
        vm.startPrank(BOB);
        manager.stakeOnOutcome(marketId, 0, STAKE_AMOUNT);
        vm.stopPrank();

        // Check that Bob's stake was added to outcome 0
        uint256 bobStake = manager.getUserOutcomeStake(marketId, BOB, 0);
        assertEq(bobStake, STAKE_AMOUNT, "Bob should have staked on outcome 0");
        
        // Check pool amounts
        (outcomes, pools) = manager.getMarketOutcomes(marketId);
        assertEq(pools[0], 10 ether + STAKE_AMOUNT, "Outcome 0 pool should include initial + Bob's stake");
    }

    function testCrowdWisdomDuplicateOutcome() public {
        uint256 marketStartTime = block.timestamp;
        uint256 marketDeadline = marketStartTime + DEADLINE;
        
        vm.startPrank(OWNER);
        uint256 marketId = manager.createMarket(
            PredictionManager.MarketType.CrowdWisdom,
            "Test Market",
            "Music",
            marketDeadline,
            10 ether,
            0,
            "Asake"
        );
        vm.stopPrank();

        // Alice stakes on "Asake" (should match existing outcome, case-insensitive)
        vm.startPrank(ALICE);
        uint256 outcomeIndex = manager.commentAndStake(marketId, "ASAKE", STAKE_AMOUNT);
        vm.stopPrank();

        assertEq(outcomeIndex, 0, "Should match existing outcome at index 0");
        
        // Check that there's still only 1 outcome
        (string[] memory outcomes, ) = manager.getMarketOutcomes(marketId);
        assertEq(outcomes.length, 1, "Should still have only 1 outcome (duplicate matched)");
    }
}