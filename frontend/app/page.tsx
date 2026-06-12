"use client";
import { useState } from "react";
import { useAccount, useReadContract } from "wagmi";
import CreateFarm from "@/components/CreateFarm";
import FarmView from "@/components/FarmView";
import Leaderboard from "@/components/Leaderboard";
import { SHAMBA_ADDRESS, SHAMBA_ABI } from "@/lib/contracts";

type View = "farm" | "leaderboard";

export default function Home() {
  const { isConnected, isConnecting, address } = useAccount();
  const [view, setView] = useState<View>("farm");

  const { data: farmData } = useReadContract({
    address: SHAMBA_ADDRESS, abi: SHAMBA_ABI, functionName: "farms",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });
  const hasFarm = farmData ? (farmData as readonly unknown[])[3] as boolean : false;

  if (isConnecting) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3">
      <div className="text-5xl animate-pulse">🌾</div>
      <p className="text-gray-400 text-sm">Connecting wallet...</p>
    </div>
  );

  if (!isConnected) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3">
      <div className="text-5xl">🌾</div>
      <h1 className="text-2xl font-bold text-green-400">Shamba</h1>
      <p className="text-gray-400 text-sm">Opening in MiniPay...</p>
    </div>
  );

  return (
    <div className="min-h-screen max-w-md mx-auto px-4 pb-8">
      <header className="pt-5 pb-3 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-green-400">🌾 Shamba</h1>
          <p className="text-xs text-gray-500">Idle farm · Celo</p>
        </div>
        <div className="flex items-center gap-2">
          {address && <span className="text-[10px] text-gray-600 font-mono">{address.slice(0,6)}...{address.slice(-4)}</span>}
          <button onClick={() => setView(v => v === "leaderboard" ? "farm" : "leaderboard")}
            className="text-xs text-gray-400 border border-gray-700 px-3 py-1.5 rounded-lg">
            {view === "leaderboard" ? "Back" : "Rankings"}
          </button>
        </div>
      </header>
      {view === "farm" && (hasFarm ? <FarmView /> : <CreateFarm />)}
      {view === "leaderboard" && <Leaderboard />}
    </div>
  );
}
