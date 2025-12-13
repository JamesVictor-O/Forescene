// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";


abstract contract FSPausable is Ownable {
    bool private _paused;

    event Paused(address account);
    event Unpaused(address account);

    constructor(address initialOwner) Ownable(initialOwner) {
        _paused = false;
    }

    modifier whenNotPaused() {
        require(!_paused, "FSPausable: paused");
        _;
    }

    modifier whenPaused() {
        require(_paused, "FSPausable: not paused");
        _;
    }

    function paused() public view returns (bool) {
        return _paused;
    }

    function pause() public onlyOwner whenNotPaused {
        _paused = true;
        emit Paused(msg.sender);
    }

    function unpause() public onlyOwner whenPaused {
        _paused = false;
        emit Unpaused(msg.sender);
    }
}

