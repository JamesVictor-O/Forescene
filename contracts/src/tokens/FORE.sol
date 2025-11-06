// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Burnable} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title FORE Token
 * @notice ERC20 token for Forescene prediction market
 * @dev Used for staking, rewards, and platform transactions
 */
contract FORE is ERC20, ERC20Burnable, Ownable {
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10 ** 18; // 1 billion tokens

    constructor(address initialOwner) ERC20("Forescene", "FORE") Ownable(initialOwner) {
        // Mint initial supply to owner for distribution
        _mint(initialOwner, MAX_SUPPLY);
    }

    /**
     * @notice Mint tokens (only owner, for rewards/distribution)
     * @param to Address to mint to
     * @param amount Amount to mint
     */
    function mint(address to, uint256 amount) external onlyOwner {
        require(totalSupply() + amount <= MAX_SUPPLY, "FORE: Max supply exceeded");
        _mint(to, amount);
    }
}

