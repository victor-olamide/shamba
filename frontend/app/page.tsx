"use client";
import { useState } from "react";
import { useAccount } from "wagmi";
import CreateFarm from "@/components/CreateFarm";
import FarmView from "@/components/FarmView";
import Leaderboard from "@/components/Leaderboard";

type View = "create" | "farm" | "leaderboard";

export default function Home() {
  const { isConnected, isConnecting, address } = useAccount();
  const [view, setView] = useState<View>("create");

  if (isConnecting) return (
    <div className="min-h-screen flex items-center justify-center">
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
      <header className="pt-5 pb-3">
        <h1 className="text-xl font-bold text-green-400">🌾 Shamba</h1>
        <p className="text-xs text-gray-500">Idle farm · Celo</p>
      </header>
      {view === "create" && <CreateFarm />}
      {view === "farm" && <FarmView />}
      {view === "leaderboard" && <Leaderboard />}
    </div>
  );
}
