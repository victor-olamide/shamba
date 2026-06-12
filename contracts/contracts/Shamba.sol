// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @notice Shamba — on-chain idle farming game on Celo.
contract Shamba is Ownable, ReentrancyGuard {
    IERC20 public immutable usdm;

    // Crop types: 0=Maize, 1=Tomato, 2=Cassava, 3=Sunflower, 4=GoldenWheat(premium)
    uint8 public constant CROP_COUNT = 5;
    uint8 public constant MAX_PLOTS  = 6;

    // Growth times in seconds
    uint32[5] public growthTime = [1 hours, 2 hours, 4 hours, 6 hours, 30 minutes];
    // Harvest yield in score points
    uint256[5] public harvestYield = [10, 20, 40, 60, 100];
    // Seed cost in USDM (0 = free)
    uint256[5] public seedCost = [0, 0, 0, 0, 0.05 ether];

    constructor(address _usdm) Ownable(msg.sender) {
        usdm = IERC20(_usdm);
    }
}
