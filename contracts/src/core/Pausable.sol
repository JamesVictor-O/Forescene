// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Pausable
 * @notice Simple pausable functionality
 * @dev Can be inherited by contracts that need pause functionality
 */
abstract contract Pausable is Ownable {
    bool private _paused;

    event Paused(address account);
    event Unpaused(address account);

    error ContractPaused();
    error ContractNotPaused();

    modifier whenNotPaused() {
        if (_paused) revert ContractPaused();
        _;
    }

    modifier whenPaused() {
        if (!_paused) revert ContractNotPaused();
        _;
    }

    function paused() public view returns (bool) {
        return _paused;
    }

    function pause() external onlyOwner whenNotPaused {
        _paused = true;
        emit Paused(msg.sender);
    }

    function unpause() external onlyOwner whenPaused {
        _paused = false;
        emit Unpaused(msg.sender);
    }
}

