"use client";
import { useAccount, useReadContract } from "wagmi";
import { SHAMBA_ADDRESS, SHAMBA_ABI } from "@/lib/contracts";

export default function Leaderboard() {
  const { address } = useAccount();
  const contract = SHAMBA_ADDRESS;

  const { data: topData, refetch } = useReadContract({
    address: contract, abi: SHAMBA_ABI, functionName: "getTopFarmers",
    args: [10n],
    query: { refetchInterval: 30000 },
  });
  const { data: myFarm } = useReadContract({
    address: contract, abi: SHAMBA_ABI, functionName: "farms",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });
  const { data: myRefs } = useReadContract({
    address: contract, abi: SHAMBA_ABI, functionName: "referralCount",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const topAddrs  = topData ? (topData as readonly unknown[])[0] as string[] : [];
  const topScores = topData ? (topData as readonly unknown[])[1] as bigint[] : [];
  const myScore   = myFarm  ? (myFarm  as readonly unknown[])[1] as bigint : 0n;
  const medals    = ["🥇", "🥈", "🥉"];

  return (
    <div className="space-y-4">
      <div className="bg-green-900/20 border border-green-700 rounded-2xl p-4 text-center">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-green-500 uppercase tracking-wide">Top Farmers</span>
          <button onClick={() => refetch()} className="text-xs text-gray-500 hover:text-gray-300">Refresh</button>
        </div>
        <p className="text-xs text-gray-400">Compete for the highest farm score</p>
      </div>

      {address && (
        <div className="bg-gray-900 rounded-2xl p-4 grid grid-cols-2 gap-3">
          <div className="text-center"><p className="text-xs text-gray-500">Your Score</p><p className="text-xl font-bold text-green-400">{myScore.toString()} pts</p></div>
          <div className="text-center"><p className="text-xs text-gray-500">Referrals</p><p className="text-xl font-bold text-gray-300">{myRefs?.toString() ?? "0"}</p></div>
        </div>
      )}

      <div className="bg-gray-900 rounded-2xl overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-800"><p className="text-sm font-semibold text-white">Leaderboard</p></div>
        {topAddrs.length === 0 ? (
          <div className="px-4 py-8 text-center text-gray-500 text-sm">No farmers yet — be the first!</div>
        ) : (
          <div className="divide-y divide-gray-800">
            {topAddrs.map((addr, i) => (
              <div key={addr} className={"flex items-center gap-3 px-4 py-3 " + (addr.toLowerCase() === address?.toLowerCase() ? "bg-gray-800/50" : "")}>
                <span className="text-lg">{medals[i] ?? (i + 1)}</span>
                <p className="flex-1 text-sm font-mono text-gray-300">{addr.slice(0,6)}...{addr.slice(-4)}{addr.toLowerCase() === address?.toLowerCase() && " (you)"}</p>
                <p className="text-white font-bold">{topScores[i]?.toString() ?? "0"} pts</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-gray-900 rounded-2xl p-4 text-xs text-gray-400 space-y-1">
        <p className="font-semibold text-white text-sm">Crop Yields</p>
        <div className="grid grid-cols-2 gap-1">
          {[["🌽 Maize","10 pts · 1h"],["🍅 Tomato","20 pts · 2h"],["🥔 Cassava","40 pts · 4h"],["🌻 Sunflower","60 pts · 6h"],["🌾 Golden Wheat","100 pts · 30m (0.05 USDM)"]].map(([name, info]) => (
            <div key={name} className="bg-gray-800 rounded-lg p-2"><p>{name}</p><p className="text-green-400">{info}</p></div>
          ))}
        </div>
      </div>
    </div>
  );
}
