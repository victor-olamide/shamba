"use client";
import { useState } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseUnits } from "viem";
import { SHAMBA_ADDRESS, SHAMBA_ABI, ERC20_ABI, USDM_ADDRESS, CROP_NAMES, CROP_EMOJI, CROP_GROWTH_SECS, CROP_YIELD, CROP_COST_USDM } from "@/lib/contracts";

function timeLeft(plantedAt: number, cropType: number, watered: boolean): string {
  const gt = watered ? CROP_GROWTH_SECS[cropType] * 0.75 : CROP_GROWTH_SECS[cropType];
  const remaining = Math.max(0, (plantedAt + gt) - Date.now() / 1000);
  if (remaining === 0) return "Ready!";
  const h = Math.floor(remaining / 3600);
  const m = Math.floor((remaining % 3600) / 60);
  return h > 0 ? h + "h " + m + "m" : m + "m";
}

export default function FarmView() {
  const { address } = useAccount();
  const contract = SHAMBA_ADDRESS;
  const [selected, setSelected] = useState<number | null>(null);
  const [cropChoice, setCropChoice] = useState(0);
  const [friendAddr, setFriendAddr] = useState("");

  const { data: farm, refetch } = useReadContract({
    address: contract, abi: SHAMBA_ABI, functionName: "getFarm",
    args: address ? [address] : undefined,
    query: { enabled: !!address, refetchInterval: 15000 },
  });

  const { writeContract, isPending } = useWriteContract();
  const [pendingTx, setPendingTx] = useState<`0x${string}` | undefined>();
  const { isLoading: txLoading } = useWaitForTransactionReceipt({ hash: pendingTx });

  if (!farm) return <div className="text-center py-12 text-gray-500 text-sm">Loading farm...</div>;

  const [cropTypes, plantedAts, watered, states, totalHarvests, score] = farm as unknown as [
    number[], number[], boolean[], number[], number, bigint, bigint
  ];

  function doPlant() {
    if (selected === null) return;
    if (CROP_COST_USDM[cropChoice] > 0) {
      const amt = parseUnits(CROP_COST_USDM[cropChoice].toFixed(18), 18);
      writeContract({ address: USDM_ADDRESS as `0x${string}`, abi: ERC20_ABI, functionName: "approve", args: [contract, amt] });
    }
    writeContract({ address: contract, abi: SHAMBA_ABI, functionName: "plant", args: [selected as unknown as number, cropChoice as unknown as number] });
    setSelected(null);
  }

  function doWater(idx: number) {
    writeContract({ address: contract, abi: SHAMBA_ABI, functionName: "water", args: [idx as unknown as number] });
  }

  function doHarvest(idx: number) {
    writeContract({ address: contract, abi: SHAMBA_ABI, functionName: "harvest", args: [idx as unknown as number] });
  }

  function doVisit() {
    if (!friendAddr || !friendAddr.startsWith("0x")) return;
    writeContract({ address: contract, abi: SHAMBA_ABI, functionName: "visitFriend", args: [friendAddr as `0x${string}`] });
  }

  const busy = isPending || txLoading;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500">Score</p>
          <p className="text-2xl font-bold text-green-400">{score.toString()} pts</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">Harvests</p>
          <p className="text-2xl font-bold text-gray-300">{totalHarvests}</p>
        </div>
        <button onClick={() => refetch()} className="text-xs text-gray-500 border border-gray-700 px-3 py-1.5 rounded-lg">Refresh</button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {Array.from({ length: 6 }, (_, i) => {
          const isEmpty = states[i] === 0;
          const isReady = states[i] === 2;
          return (
            <div key={i} onClick={() => isEmpty && setSelected(i)}
              className={"bg-gray-900 rounded-2xl p-3 text-center cursor-pointer border transition-all " + (selected === i ? "border-green-500" : isEmpty ? "border-gray-800 hover:border-gray-600" : "border-gray-800")}>
              <p className="text-3xl">{isEmpty ? "🟫" : isReady ? CROP_EMOJI[cropTypes[i]] : "🌱"}</p>
              <p className="text-xs text-gray-500 mt-1">{isEmpty ? "Tap to plant" : CROP_NAMES[cropTypes[i]]}</p>
              {!isEmpty && <p className="text-[10px] text-gray-600 mt-0.5">{isReady ? "Ready!" : timeLeft(plantedAts[i], cropTypes[i], watered[i])}</p>}
              {!isEmpty && !watered[i] && states[i] === 1 && (
                <button onClick={e => { e.stopPropagation(); doWater(i); }} disabled={busy}
                  className="mt-1 text-[10px] text-blue-400 disabled:opacity-50">Water</button>
              )}
              {isReady && (
                <button onClick={e => { e.stopPropagation(); doHarvest(i); }} disabled={busy}
                  className="mt-1 w-full py-1 bg-green-700 hover:bg-green-600 text-white rounded-lg text-[10px] font-bold disabled:opacity-50">
                  Harvest +{CROP_YIELD[cropTypes[i]]}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {selected !== null && (
        <div className="bg-gray-900 rounded-2xl p-4 space-y-3">
          <p className="text-sm font-semibold text-white">Plant in plot {selected + 1}</p>
          <div className="grid grid-cols-5 gap-1">
            {CROP_NAMES.map((name, i) => (
              <button key={i} onClick={() => setCropChoice(i)}
                className={"p-2 rounded-xl text-center border text-xs " + (cropChoice === i ? "border-green-500 bg-green-900/30" : "border-gray-700 bg-gray-800")}>
                <p className="text-lg">{CROP_EMOJI[i]}</p>
                <p className="text-gray-400">{name.split(" ")[0]}</p>
                {CROP_COST_USDM[i] > 0 && <p className="text-yellow-400">{CROP_COST_USDM[i]} USDM</p>}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={doPlant} disabled={busy}
              className="flex-1 py-2.5 bg-green-700 hover:bg-green-600 text-white rounded-xl font-bold text-sm disabled:opacity-50">
              Plant {CROP_EMOJI[cropChoice]}
            </button>
            <button onClick={() => setSelected(null)} className="px-4 py-2.5 text-gray-400 border border-gray-700 rounded-xl text-sm">Cancel</button>
          </div>
        </div>
      )}

      <div className="bg-gray-900 rounded-2xl p-4 space-y-2">
        <p className="text-xs text-gray-400">Visit a friend&apos;s farm (+1 score each)</p>
        <div className="flex gap-2">
          <input value={friendAddr} onChange={e => setFriendAddr(e.target.value)} placeholder="0x... friend address"
            className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-green-600"
          />
          <button onClick={doVisit} disabled={busy || !friendAddr}
            className="px-4 py-2 bg-green-800 hover:bg-green-700 text-white rounded-xl text-sm disabled:opacity-50">Visit</button>
        </div>
      </div>
    </div>
  );
}
