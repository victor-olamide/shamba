"use client";

import { useState } from "react";
import { useWriteContract } from "wagmi";
import { SHAMBA_ADDRESS, SHAMBA_ABI } from "@/lib/contracts";

export default function CreateFarm() {
  const [referrer, setReferrer] = useState("");
  const { writeContract, isPending } = useWriteContract();

  function handleCreate() {
    writeContract({
      address: SHAMBA_ADDRESS, abi: SHAMBA_ABI, functionName: "createFarm",
      args: [referrer && referrer.startsWith("0x") ? referrer as `0x${string}` : "0x0000000000000000000000000000000000000000"],
    });
  }

  return (
    <div className="space-y-4">
      <div className="bg-green-900/20 border border-green-700 rounded-2xl p-5 text-center space-y-2">
        <p className="text-4xl">🌱</p>
        <p className="text-xl font-bold text-green-400">Start Your Shamba</p>
        <p className="text-sm text-gray-400">Plant crops, water them, harvest for score. Free to start — no USDM needed.</p>
      </div>

      <div className="bg-gray-900 rounded-2xl p-4 space-y-3">
        <p className="text-xs text-gray-400">Referral code (optional)</p>
        <input value={referrer} onChange={e => setReferrer(e.target.value)} placeholder="0x... friend's address"
          className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-green-600" />
        <p className="text-xs text-gray-600">Your friend earns 10% bonus on your harvests</p>
      </div>

      <div className="bg-gray-900 rounded-2xl p-4 space-y-2 text-sm">
        <p className="font-semibold text-white">What you get</p>
        <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
          <div className="bg-gray-800 rounded-xl p-3">🌽 6 free plots</div>
          <div className="bg-gray-800 rounded-xl p-3">🍅 4 free crop types</div>
          <div className="bg-gray-800 rounded-xl p-3">💧 Watering bonus</div>
          <div className="bg-gray-800 rounded-xl p-3">🤝 Visit friends</div>
        </div>
      </div>

      <button onClick={handleCreate} disabled={isPending}
        className={`w-full py-3.5 rounded-xl font-bold transition-colors ${isPending ? "bg-gray-700 text-gray-500" : "bg-green-700 hover:bg-green-600 text-white"}`}>
        {isPending ? "Creating farm..." : "🌾 Create My Farm"}
      </button>
    </div>
  );
}
