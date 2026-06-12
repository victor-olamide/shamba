import { createConfig, http } from "wagmi";
import { celo } from "wagmi/chains";
import { injected } from "wagmi/connectors";

// Celo mainnet only — Shamba is mainnet-only
export const wagmiConfig = createConfig({
  chains: [celo],
  connectors: [injected()],
  transports: { [celo.id]: http("https://forno.celo.org") },
  ssr: false,
});
