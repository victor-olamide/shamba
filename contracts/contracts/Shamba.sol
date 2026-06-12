// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @notice Shamba — on-chain idle farming game on Celo.
/// Swahili: "shamba" = farm/garden.
contract Shamba is Ownable, ReentrancyGuard {
    IERC20 public immutable usdm;

    constructor(address _usdm) Ownable(msg.sender) {
        usdm = IERC20(_usdm);
    }
}
