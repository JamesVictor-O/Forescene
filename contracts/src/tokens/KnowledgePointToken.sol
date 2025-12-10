// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ERC20Burnable} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";


contract KnowledgePointToken is ERC20, ERC20Burnable, Ownable {
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10 ** 18;
    uint8 private constant DECIMALS = 18;
    
 

    constructor(address initialOwner) ERC20("Knowledge Point", "KP") Ownable(initialOwner) {
        _mint(initialOwner, MAX_SUPPLY);
    }

  
    function mint(address to, uint256 amount) external  onlyOwner {
        _mint(to, amount);
    }
}


