"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, useConnect, useAccount, useChainId, useSwitchChain } from "wagmi";
import { celo } from "wagmi/chains";
import { wagmiConfig } from "@/lib/wagmi";
import { useEffect } from "react";

const queryClient = new QueryClient();

function AutoConnect() {
  const { connect, connectors } = useConnect();
  const { isConnected } = useAccount();
  useEffect(() => {
    if (isConnected) return;
    const eth = (window as unknown as { ethereum?: { isMiniPay?: boolean } }).ethereum;
    if (eth?.isMiniPay && connectors[0]) connect({ connector: connectors[0] });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}

function ChainEnforcer() {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  useEffect(() => {
    if (isConnected && chainId !== celo.id) switchChain({ chainId: celo.id });
  }, [isConnected, chainId]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}

export function isMiniPay(): boolean {
  if (typeof window === "undefined") return false;
  return !!(window as unknown as Record<string, unknown>).ethereum &&
    !!((window as unknown as Record<string, unknown>).ethereum as Record<string, unknown>).isMiniPay;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}><AutoConnect /><ChainEnforcer />{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
