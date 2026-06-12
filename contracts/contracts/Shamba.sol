// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @notice Shamba — on-chain idle farming game on Celo. Plant, water, harvest.
/// Free to play; optional USDM to buy premium seeds (GoldenWheat).
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
        farms[msg.sender].initialized = true; farms[msg.sender].lastVisit = block.timestamp;
        farmers.push(msg.sender);
        if (referrer != address(0) && referrer != msg.sender && farms[referrer].initialized) {
            referredBy[msg.sender] = referrer; referralCount[referrer]++;
        }
        emit FarmCreated(msg.sender);
    }

    function plant(uint8 plotIdx, uint8 cropType) external nonReentrant {
        require(farms[msg.sender].initialized, "No farm");
        require(plotIdx < MAX_PLOTS, "Invalid plot"); require(cropType < CROP_COUNT, "Invalid crop");
        Plot storage plot = farms[msg.sender].plots[plotIdx];
        require(plot.state == CropState.EMPTY, "Plot not empty");
        if (seedCost[cropType] > 0) {
            require(usdm.transferFrom(msg.sender, address(this), seedCost[cropType]), "Payment failed");
            platformFeeBalance += seedCost[cropType];
        }
        plot.cropType = cropType; plot.plantedAt = uint32(block.timestamp);
        plot.watered = false; plot.state = CropState.PLANTED;
        emit CropPlanted(msg.sender, plotIdx, cropType);
    }

    function water(uint8 plotIdx) external {
        require(farms[msg.sender].initialized, "No farm");
        Plot storage plot = farms[msg.sender].plots[plotIdx];
        require(plot.state == CropState.PLANTED, "Not planted");
        require(!plot.watered, "Already watered");
        plot.watered = true;
        emit CropWatered(msg.sender, plotIdx);
    }

    function harvest(uint8 plotIdx) external nonReentrant {
        require(farms[msg.sender].initialized, "No farm");
        Farm storage farm = farms[msg.sender];
        Plot storage plot = farm.plots[plotIdx];
        require(plot.state == CropState.PLANTED, "Not planted");
        uint32 gt = growthTime[plot.cropType];
        if (plot.watered) gt = (gt * 3) / 4;
        require(block.timestamp >= plot.plantedAt + gt, "Not ready");
        uint256 earned = harvestYield[plot.cropType]; uint8 ct = plot.cropType;
        plot.state = CropState.EMPTY; plot.watered = false; plot.plantedAt = 0;
        farm.totalHarvests++; farm.score += earned; farm.lastVisit = block.timestamp;
        address ref = referredBy[msg.sender];
        if (ref != address(0)) farms[ref].score += earned / 10;
        emit CropHarvested(msg.sender, plotIdx, ct, earned);
    }

    /// @notice Visit a friend's farm — both earn +1 score point.
    function visitFriend(address friend) external {
        require(farms[msg.sender].initialized, "No farm");
        require(farms[friend].initialized, "Friend has no farm");
        require(friend != msg.sender, "Can't visit yourself");
        farms[msg.sender].score += 1;
        farms[friend].score += 1;
        farms[friend].lastVisit = block.timestamp;
        emit FriendVisited(msg.sender, friend);
    }

    function getFarm(address farmer) external view returns (
        uint8[6] memory cropTypes, uint32[6] memory plantedAts,
        bool[6] memory watered, uint8[6] memory states,
        uint32 totalHarvests, uint256 score, uint256 lastVisit
    ) {
        Farm storage farm = farms[farmer];
        for (uint8 i = 0; i < MAX_PLOTS; i++) {
            Plot storage p = farm.plots[i];
            cropTypes[i] = p.cropType; plantedAts[i] = p.plantedAt; watered[i] = p.watered;
            if (p.state == CropState.EMPTY) { states[i] = 0; }
            else {
                uint32 gt = growthTime[p.cropType];
                if (p.watered) gt = (gt * 3) / 4;
                states[i] = block.timestamp >= p.plantedAt + gt ? 2 : 1;
            }
        }
        return (cropTypes, plantedAts, watered, states, farm.totalHarvests, farm.score, farm.lastVisit);
    }
}
