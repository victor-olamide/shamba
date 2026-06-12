# Shamba

On-chain idle farming game on Celo. Plant crops, water them, harvest for score.
"Shamba" means farm/garden in Swahili.

## What it is

A single-player blockchain idle game for MiniPay. No waiting for other players.
Plant crops in your 6 plots, water them for a 25% speed boost, harvest when ready.
Free to play — only the premium Golden Wheat seed costs USDM (0.05).

## Token

Uses USDM (0x765DE816845861e75A25fCA122bb6898B8B1282a) on Celo mainnet.

## Crops

| Crop | Growth | Score | Cost |
|---|---|---|---|
| Maize | 1h | 10 pts | Free |
| Tomato | 2h | 20 pts | Free |
| Cassava | 4h | 40 pts | Free |
| Sunflower | 6h | 60 pts | Free |
| Golden Wheat | 30min | 100 pts | 0.05 USDM |

Watering any crop reduces its growth time by 25%.

## Features

- 6 plots per farm
- Referral system — your referrer earns 10% of your harvest score
- Visit a friend's farm for +1 score each (on-chain social)
- On-chain leaderboard via getTopFarmers

## Stack

- Frontend: Next.js 14, TailwindCSS, wagmi v2, viem
- Contracts: Solidity 0.8.20, Hardhat, OpenZeppelin
- Chain: Celo mainnet (chainId 42220)

## Setup

```bash
cd contracts && npm install
npx hardhat run scripts/deploy.ts --network celo
# Set SHAMBA_ADDRESS in frontend/lib/contracts.ts
cd ../frontend && npm install && npm run dev
```

## MiniPay

Auto-connects wallet via window.ethereum injection. Mainnet only.
