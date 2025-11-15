// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol";
import {FORE} from "../src/tokens/FORE.sol";

/**
 * @title DistributeTokens
 * @notice Script to distribute FORE tokens to test addresses
 * @dev Run this after deployment to give test tokens to users
 */
contract DistributeTokens is Script {
    // Deployed FORE token address on BSC Testnet
    address constant FORE_TOKEN = 0x5DE0b93d59D4AFd803649f5D333030b33CfddFC6;

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        vm.startBroadcast(deployerPrivateKey);

        FORE token = FORE(FORE_TOKEN);

        // List of addresses to receive test tokens
        address[] memory recipients = new address[](1);
        recipients[0] = 0x8904fA6Ec30CA11c16898D15f7d1278336824500; // Add your address here

        // Amount to send to each address (100,000 FORE tokens)
        uint256 amount = 100_000 * 10 ** 18;

        for (uint256 i = 0; i < recipients.length; i++) {
            token.transfer(recipients[i], amount);
            console.log("Transferred", amount / 10 ** 18, "FORE to", recipients[i]);
        }

        vm.stopBroadcast();

        console.log("\n=== Token Distribution Complete ===");
        console.log("FORE Token:", FORE_TOKEN);
    }
}

