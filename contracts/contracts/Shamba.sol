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

    constructor(address _usdm) Ownable(msg.sender) { usdm = IERC20(_usdm); }

    function createFarm(address referrer) external {
        require(!farms[msg.sender].initialized, "Farm exists");
        farms[msg.sender].initialized = true;
        farms[msg.sender].lastVisit = block.timestamp;
        farmers.push(msg.sender);
        if (referrer != address(0) && referrer != msg.sender && farms[referrer].initialized) {
            referredBy[msg.sender] = referrer;
            referralCount[referrer]++;
        }
        emit FarmCreated(msg.sender);
    }

    function plant(uint8 plotIdx, uint8 cropType) external nonReentrant {
        require(farms[msg.sender].initialized, "No farm");
        require(plotIdx < MAX_PLOTS, "Invalid plot");
        require(cropType < CROP_COUNT, "Invalid crop");
        Farm storage farm = farms[msg.sender];
        Plot storage plot = farm.plots[plotIdx];
        require(plot.state == CropState.EMPTY, "Plot not empty");
        if (seedCost[cropType] > 0) {
            require(usdm.transferFrom(msg.sender, address(this), seedCost[cropType]), "Payment failed");
            platformFeeBalance += seedCost[cropType];
        }
        plot.cropType = cropType; plot.plantedAt = uint32(block.timestamp);
        plot.watered = false; plot.state = CropState.PLANTED;
        emit CropPlanted(msg.sender, plotIdx, cropType);
    }

    /// @notice Water a planted crop — reduces remaining growth time by 25%.
    function water(uint8 plotIdx) external {
        require(farms[msg.sender].initialized, "No farm");
        Plot storage plot = farms[msg.sender].plots[plotIdx];
        require(plot.state == CropState.PLANTED, "Not planted");
        require(!plot.watered, "Already watered");
        plot.watered = true;
        emit CropWatered(msg.sender, plotIdx);
    }
}
