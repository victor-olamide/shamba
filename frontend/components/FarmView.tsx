"use client";
import { useAccount, useReadContract } from "wagmi";
import { SHAMBA_ADDRESS, SHAMBA_ABI, CROP_NAMES, CROP_EMOJI } from "@/lib/contracts";

export default function FarmView() {
  const { address } = useAccount();
  const contract = SHAMBA_ADDRESS;

  const { data: farm, refetch } = useReadContract({
    address: contract, abi: SHAMBA_ABI, functionName: "getFarm",
    args: address ? [address] : undefined,
    query: { enabled: !!address, refetchInterval: 15000 },
  });

  if (!farm) return <div className="text-center py-12 text-gray-500 text-sm">Loading farm...</div>;

  const [cropTypes, plantedAts, watered, states, totalHarvests, score] = farm as [
    number[], number[], boolean[], number[], number, bigint, bigint
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500">Total Score</p>
          <p className="text-2xl font-bold text-green-400">{score.toString()} pts</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">Harvests</p>
          <p className="text-2xl font-bold text-gray-300">{totalHarvests}</p>
        </div>
        <button onClick={() => refetch()} className="text-xs text-gray-500 border border-gray-700 px-3 py-1.5 rounded-lg">Refresh</button>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="bg-gray-900 rounded-2xl p-3 text-center">
            <p className="text-2xl">{states[i] === 0 ? "🟫" : states[i] === 2 ? CROP_EMOJI[cropTypes[i]] : "🌱"}</p>
            <p className="text-xs text-gray-500 mt-1">{states[i] === 0 ? "Empty" : CROP_NAMES[cropTypes[i]]}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
