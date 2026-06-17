export const USDM_ADDRESS = "0x765DE816845861e75A25fCA122bb6898B8B1282a" as const;
export const SHAMBA_ADDRESS = "0x485DcF3e778605EB43a232ea1d53CDb56D0B8bC1" as `0x${string}`;

export const CROP_NAMES  = ["Maize", "Tomato", "Cassava", "Sunflower", "Golden Wheat"];
export const CROP_EMOJI  = ["🌽", "🍅", "🥔", "🌻", "🌾"];
export const CROP_GROWTH_SECS = [3600, 7200, 14400, 21600, 1800];
export const CROP_YIELD = [10, 20, 40, 60, 100];
export const CROP_COST_USDM = [0, 0, 0, 0, 0.05];

export const SHAMBA_ABI = [
  { name: "createFarm", type: "function", stateMutability: "nonpayable", inputs: [{ name: "referrer", type: "address" }], outputs: [] },
  { name: "plant", type: "function", stateMutability: "nonpayable", inputs: [{ name: "plotIdx", type: "uint8" }, { name: "cropType", type: "uint8" }], outputs: [] },
  { name: "water", type: "function", stateMutability: "nonpayable", inputs: [{ name: "plotIdx", type: "uint8" }], outputs: [] },
  { name: "harvest", type: "function", stateMutability: "nonpayable", inputs: [{ name: "plotIdx", type: "uint8" }], outputs: [] },
  { name: "visitFriend", type: "function", stateMutability: "nonpayable", inputs: [{ name: "friend", type: "address" }], outputs: [] },
  {
    name: "getFarm", type: "function", stateMutability: "view",
    inputs: [{ name: "farmer", type: "address" }],
    outputs: [
      { name: "cropTypes", type: "uint8[6]" }, { name: "plantedAts", type: "uint32[6]" },
      { name: "watered", type: "bool[6]" }, { name: "states", type: "uint8[6]" },
      { name: "totalHarvests", type: "uint32" }, { name: "score", type: "uint256" },
      { name: "lastVisit", type: "uint256" },
    ],
  },
  {
    name: "getTopFarmers", type: "function", stateMutability: "view",
    inputs: [{ name: "limit", type: "uint256" }],
    outputs: [{ name: "top", type: "address[]" }, { name: "scores", type: "uint256[]" }],
  },
  { name: "farms", type: "function", stateMutability: "view", inputs: [{ name: "", type: "address" }], outputs: [{ name: "totalHarvests", type: "uint32" }, { name: "score", type: "uint256" }, { name: "lastVisit", type: "uint256" }, { name: "initialized", type: "bool" }] },
  { name: "referralCount", type: "function", stateMutability: "view", inputs: [{ name: "", type: "address" }], outputs: [{ name: "", type: "uint32" }] },
  { name: "CropPlanted", type: "event", inputs: [{ name: "farmer", type: "address", indexed: true }, { name: "plotIdx", type: "uint8", indexed: false }, { name: "cropType", type: "uint8", indexed: false }] },
  { name: "CropHarvested", type: "event", inputs: [{ name: "farmer", type: "address", indexed: true }, { name: "plotIdx", type: "uint8", indexed: false }, { name: "cropType", type: "uint8", indexed: false }, { name: "score", type: "uint256", indexed: false }] },
  { name: "FarmCreated", type: "event", inputs: [{ name: "farmer", type: "address", indexed: true }] },
] as const;

export const ERC20_ABI = [
  { name: "approve", type: "function", stateMutability: "nonpayable", inputs: [{ name: "spender", type: "address" }, { name: "amount", type: "uint256" }], outputs: [{ name: "", type: "bool" }] },
] as const;
