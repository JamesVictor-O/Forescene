// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title TokenRescuer
 * @notice Utility for rescuing stuck tokens
 * @dev Can be inherited by contracts that need rescue functionality
 */
abstract contract TokenRescuer is Ownable {
    using SafeERC20 for IERC20;

    event TokensRescued(address indexed token, address indexed to, uint256 amount);

    /**
     * @notice Rescue tokens stuck in contract
     * @param token Token address (address(0) for native)
     * @param to Recipient address
     * @param amount Amount to rescue
     */
    function rescueTokens(address token, address to, uint256 amount) external onlyOwner {
        if (to == address(0)) revert();

        if (token == address(0)) {
            (bool success,) = to.call{value: amount}("");
            require(success, "TokenRescuer: Native transfer failed");
        } else {
            IERC20(token).safeTransfer(to, amount);
        }

        emit TokensRescued(token, to, amount);
    }
}

