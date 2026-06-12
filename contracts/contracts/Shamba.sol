// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @notice Shamba — on-chain idle farming game on Celo.
contract Shamba is Ownable, ReentrancyGuard {
    IERC20 public immutable usdm;

    uint8 public constant CROP_COUNT = 5;
    uint8 public constant MAX_PLOTS  = 6;

    uint32[5] public growthTime    = [1 hours, 2 hours, 4 hours, 6 hours, 30 minutes];
    uint256[5] public harvestYield = [10, 20, 40, 60, 100];
    uint256[5] public seedCost     = [0, 0, 0, 0, 0.05 ether];

    enum CropState { EMPTY, PLANTED, READY }
    struct Plot { uint8 cropType; uint32 plantedAt; bool watered; CropState state; }
    struct Farm { Plot[6] plots; uint32 totalHarvests; uint256 score; uint256 lastVisit; bool initialized; }

    mapping(address => Farm) public farms;
    address[] public farmers;
    mapping(address => address) public referredBy;
    mapping(address => uint32)  public referralCount;
    uint256 public platformFeeBalance;

    event FarmCreated(address indexed farmer);
    event CropPlanted(address indexed farmer, uint8 plotIdx, uint8 cropType);
    event CropWatered(address indexed farmer, uint8 plotIdx);
    event CropHarvested(address indexed farmer, uint8 plotIdx, uint8 cropType, uint256 score);
    event FriendVisited(address indexed visitor, address indexed host);

    constructor(address _usdm) Ownable(msg.sender) {
        usdm = IERC20(_usdm);
    }
}
