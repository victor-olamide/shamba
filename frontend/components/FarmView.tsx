"use client";
import { useState, useEffect, useRef } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useBlock } from "wagmi";
import { waitForTransactionReceipt } from "wagmi/actions";
import { parseUnits } from "viem";
import { wagmiConfig } from "@/lib/wagmi";
import { SHAMBA_ADDRESS, SHAMBA_ABI, ERC20_ABI, USDM_ADDRESS, CROP_NAMES, CROP_GROWTH_SECS, CROP_YIELD, CROP_COST_USDM } from "@/lib/contracts";
import { RenderPlant, CropEmblem } from "./PlantArt";

type ActivityItem = { key: number; icon: string; bg: string; text: string };
const AVATAR_COLORS = ["#e0623e", "#4a9ed1", "#9a6ad1", "#5fa83f", "#d99417", "#3fa3a3"];

function fmtRemain(secs: number) {
  if (secs <= 0) return "Ready!";
  const h = Math.floor(secs / 3600), m = Math.floor((secs % 3600) / 60), s = secs % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${String(s).padStart(2, "0")}s`;
  return `${s}s`;
}

export default function FarmView() {
  const { address } = useAccount();
  const [selected, setSelected]   = useState<number | null>(null);
  const [cropChoice, setCropChoice] = useState(0);
  const [floats, setFloats]       = useState<Record<number, string>>({});
  const [activity, setActivity]   = useState<ActivityItem[]>([{ key: 0, icon: "🌾", bg: "#fbf0d4", text: "Welcome to your Shamba!" }]);
  const actKey = useRef(1);
  const [, setTick] = useState(0);
  const chainAnchor = useRef({ ts: 0, at: 0 });

  // Anchor timers to chain time — machine clock can drift from blockchain time
  const { data: latestBlock } = useBlock({ watch: true });
  useEffect(() => {
    if (latestBlock) chainAnchor.current = { ts: Number(latestBlock.timestamp), at: Date.now() };
  }, [latestBlock]);

  useEffect(() => {
    const t = setInterval(() => setTick(n => n + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const { data: farm, refetch } = useReadContract({
    address: SHAMBA_ADDRESS, abi: SHAMBA_ABI, functionName: "getFarm",
    args: address ? [address] : undefined,
    query: { enabled: !!address, refetchInterval: 15000 },
  });

  const { data: farmBasic } = useReadContract({
    address: SHAMBA_ADDRESS, abi: SHAMBA_ABI, functionName: "farms",
    args: address ? [address] : undefined,
    query: { enabled: !!address, refetchInterval: 15000 },
  });

  const { data: topData } = useReadContract({
    address: SHAMBA_ADDRESS, abi: SHAMBA_ABI, functionName: "getTopFarmers",
    args: [10n], query: { refetchInterval: 60000 },
  });

  const { writeContractAsync, isPending } = useWriteContract();
  const [pendingTx, setPendingTx]        = useState<`0x${string}` | undefined>();
  const { isLoading: txLoading, isSuccess: txSuccess } = useWaitForTransactionReceipt({ hash: pendingTx });
  const busy = isPending || txLoading;

  useEffect(() => {
    if (txSuccess) { refetch(); setPendingTx(undefined); }
  }, [txSuccess]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!farm) return (
    <div style={{ textAlign: "center", padding: "80px 20px", color: "#8a7256" }}>
      <div style={{ fontSize: 48, marginBottom: 12, display: "inline-block", animation: "bob 2s ease-in-out infinite" }}>🌱</div>
      <p style={{ fontFamily: "'Baloo 2',cursive", fontWeight: 700, fontSize: 16 }}>Loading your farm…</p>
      <p style={{ fontSize: 13, color: "#a08a6e", marginTop: 6 }}>Fetching on-chain data from Celo</p>
    </div>
  );

  const [cropTypes, plantedAts, watered, states, totalHarvests, score] = farm as unknown as [
    number[], number[], boolean[], number[], number, bigint, bigint
  ];
  const myScore = farmBasic ? Number((farmBasic as readonly unknown[])[1] as bigint) : Number(score);
  const level   = Math.floor(myScore / 150) + 1;
  const xpInto  = myScore % 150;
  const xpPct   = Math.round((xpInto / 150) * 100);
  const now = chainAnchor.current.ts > 0
    ? chainAnchor.current.ts + Math.floor((Date.now() - chainAnchor.current.at) / 1000)
    : Math.floor(Date.now() / 1000);

  const topAddrs   = topData ? (topData as readonly unknown[])[0] as string[] : [];
  const topScores  = topData ? (topData as readonly unknown[])[1] as bigint[] : [];
  const myMiniRank = address ? topAddrs.findIndex(a => a.toLowerCase() === address.toLowerCase()) : -1;

  const fmtScore = (v: bigint) => Number(v).toLocaleString();

  const growingCount = states.filter(s => s === 1).length;
  const readyCount   = states.filter(s => s === 2).length;
  const emptyCount   = states.filter(s => s === 0).length;

  function addActivity(icon: string, bg: string, text: string) {
    const k = actKey.current++;
    setActivity(prev => [{ key: k, icon, bg, text }, ...prev].slice(0, 6));
  }

  async function doPlant() {
    if (selected === null) return;
    try {
      if (CROP_COST_USDM[cropChoice] > 0) {
        const amt = parseUnits(CROP_COST_USDM[cropChoice].toFixed(18), 18);
        const approveHash = await writeContractAsync({ address: USDM_ADDRESS as `0x${string}`, abi: ERC20_ABI, functionName: "approve", args: [SHAMBA_ADDRESS, amt] });
        await waitForTransactionReceipt(wagmiConfig, { hash: approveHash });
      }
      const hash = await writeContractAsync({ address: SHAMBA_ADDRESS, abi: SHAMBA_ABI, functionName: "plant", args: [selected as unknown as number, cropChoice as unknown as number] });
      setPendingTx(hash);
      addActivity("🌱", "#eaf5e2", `Planted ${CROP_NAMES[cropChoice]} in plot ${selected + 1}`);
      setSelected(null);
    } catch { /* user rejected or tx failed */ }
  }

  async function doWater(i: number) {
    try {
      const hash = await writeContractAsync({ address: SHAMBA_ADDRESS, abi: SHAMBA_ABI, functionName: "water", args: [i as unknown as number] });
      setPendingTx(hash);
      addActivity("💧", "#e3f1fa", `Watered ${CROP_NAMES[cropTypes[i]]}`);
    } catch { /* user rejected */ }
  }

  async function doHarvest(i: number) {
    const yld = CROP_YIELD[cropTypes[i]];
    setFloats(f => ({ ...f, [i]: "+" + yld }));
    setTimeout(() => setFloats(f => { const n = { ...f }; delete n[i]; return n; }), 1100);
    try {
      const hash = await writeContractAsync({ address: SHAMBA_ADDRESS, abi: SHAMBA_ABI, functionName: "harvest", args: [i as unknown as number] });
      setPendingTx(hash);
      addActivity("🌾", "#fbf0d4", `Harvested ${CROP_NAMES[cropTypes[i]]} +${yld} pts`);
    } catch { /* user rejected */ }
  }

  const medals = ["🥇", "🥈", "🥉", "4th", "5th"];

  return (
    <div className="farm-grid">
      {/* LEFT: stats */}
      <div className="farm-left" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ background: "#fffaf2", border: "1px solid #ece0cc", borderRadius: 20, padding: 16, boxShadow: "0 10px 28px -18px rgba(122,82,52,.5)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <div style={{ width: 46, height: 46, borderRadius: 13, background: "linear-gradient(135deg,#8a5e3b,#5e3d24)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>🧑‍🌾</div>
            <div>
              <div style={{ fontFamily: "'Baloo 2',cursive", fontWeight: 800, fontSize: 17, color: "#3a2e23" }}>Your Shamba</div>
              <div style={{ fontSize: 11, color: "#a08a6e", fontWeight: 700, fontFamily: "ui-monospace,monospace" }}>{address ? address.slice(0,6) + "…" + address.slice(-4) : ""}</div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 14 }}>
            <div style={{ background: "#f3fbee", border: "1px solid #d9eecb", borderRadius: 13, padding: 10, textAlign: "center" }}>
              <div style={{ fontFamily: "'Baloo 2',cursive", fontWeight: 800, fontSize: 22, color: "#2f6b34" }}>{myScore.toLocaleString()}</div>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#7fa06b", letterSpacing: ".04em" }}>SCORE</div>
            </div>
            <div style={{ background: "#f7f0e2", border: "1px solid #e8dac2", borderRadius: 13, padding: 10, textAlign: "center" }}>
              <div style={{ fontFamily: "'Baloo 2',cursive", fontWeight: 800, fontSize: 22, color: "#9a6a14" }}>{totalHarvests.toString()}</div>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#b29768", letterSpacing: ".04em" }}>HARVESTS</div>
            </div>
          </div>
          <div style={{ marginTop: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontWeight: 700, color: "#8a7256", marginBottom: 5 }}>
              <span>Level {level}</span><span>{xpInto} / 150 XP</span>
            </div>
            <div style={{ height: 9, background: "#ece0cc", borderRadius: 5, overflow: "hidden" }}>
              <div style={{ height: "100%", width: xpPct + "%", background: "linear-gradient(90deg,#6db04e,#357f2f)", borderRadius: 5, transition: "width .5s ease" }} />
            </div>
            <div style={{ fontSize: 11, color: "#a08a6e", marginTop: 6 }}>Reach <b style={{ color: "#357f2f" }}>Level {level + 1}</b> to grow stronger 🌱</div>
          </div>
        </div>
      </div>

      {/* CENTER: farm grid + plant panel */}
      <div className="farm-center" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
          <div>
            <h2 style={{ fontFamily: "'Baloo 2',cursive", fontWeight: 800, fontSize: 24, color: "#2f6b34", margin: 0 }}>Your field</h2>
            <p style={{ fontSize: 13, color: "#8a7256", margin: "2px 0 0" }}>
              {readyCount > 0 ? `${readyCount} plot${readyCount > 1 ? "s" : ""} ready to harvest!` : emptyCount > 0 ? `Tap an empty plot to plant · ${emptyCount} open` : "All plots growing — check back soon!"}
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 7, background: "#fffaf2", border: "1px solid #ece0cc", padding: "7px 12px", borderRadius: 12, fontSize: 12, fontWeight: 700, color: "#7a6448", whiteSpace: "nowrap" }}>
            🌱 {growingCount} growing · ✅ {readyCount} ready
          </div>
        </div>

        {/* Farm grid */}
        <div style={{ position: "relative", borderRadius: 26, overflow: "hidden", boxShadow: "0 22px 50px -22px rgba(122,82,52,.6),inset 0 0 0 1px rgba(255,255,255,.3)", background: "linear-gradient(180deg,#bfe6f2 0%,#d9eecb 34%,#caa46e 52%,#8a5e3b 100%)", padding: "clamp(16px,3vw,28px)" }}>
          <div style={{ position: "absolute", top: 18, right: 24, width: 58, height: 58, borderRadius: "50%", background: "radial-gradient(circle,#fff3c2,#ffd860 60%,#f6b929)", boxShadow: "0 0 38px 12px rgba(255,210,90,.45)", animation: "sunpulse 6s ease-in-out infinite" }} />
          <div style={{ position: "absolute", top: 26, left: 30, width: 74, height: 22, borderRadius: 24, background: "rgba(255,255,255,.7)", filter: "blur(.5px)", animation: "drift 16s ease-in-out infinite alternate" }} />
          <div style={{ position: "relative", display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "clamp(9px,1.8vw,18px)" }}>
            {Array.from({ length: 6 }, (_, i) => {
              const isEmpty   = states[i] === 0;
              const isReady   = states[i] === 2;
              const isGrowing = states[i] === 1;
              const growthSecs = isEmpty ? 1 : CROP_GROWTH_SECS[cropTypes[i]] * (watered[i] ? 0.75 : 1);
              const progress  = isEmpty ? 0 : Math.min(1, (now - plantedAts[i]) / growthSecs);
              const remain    = isEmpty ? 0 : Math.max(0, Math.ceil(growthSecs - (now - plantedAts[i])));
              const isSelected = selected === i;

              return (
                <div key={i} className="plot-card"
                  onClick={() => { if (isEmpty) setSelected(i); else if (isReady) doHarvest(i); }}
                  style={{ position: "relative", aspectRatio: "1/1", borderRadius: 18, cursor: "pointer", background: "linear-gradient(#7a5234,#5a3a23)", border: `3px solid ${isSelected ? "#5fa83f" : isReady ? "#e0a92e" : "#4d3019"}`, boxShadow: "inset 0 -6px 14px rgba(0,0,0,.32),inset 0 6px 10px rgba(255,255,255,.08),0 4px 10px -4px rgba(0,0,0,.4)", overflow: "hidden", transition: "transform .15s ease" }}>
                  <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(95deg,rgba(0,0,0,.14) 0 2px,transparent 2px 16px)", opacity: 0.5 }} />
                  {watered[i] && !isEmpty && <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,transparent,rgba(20,40,80,.28))", pointerEvents: "none" }} />}
                  {!isEmpty && <RenderPlant cropIdx={cropTypes[i]} progress={progress} ready={isReady} />}
                  {isEmpty && (
                    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 5, color: "rgba(255,255,255,.82)" }}>
                      <div style={{ width: 30, height: 30, borderRadius: "50%", border: "2px dashed rgba(255,255,255,.6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700 }}>+</div>
                      <div style={{ fontSize: 11, fontWeight: 700, textShadow: "0 1px 2px rgba(0,0,0,.4)" }}>Tap to plant</div>
                    </div>
                  )}
                  {!isEmpty && (
                    <div style={{ position: "absolute", top: 7, left: 7, background: "rgba(58,46,35,.62)", color: "#fff", fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 7, backdropFilter: "blur(2px)", display: "flex", alignItems: "center", gap: 3 }}>
                      {watered[i] && !isReady && <span title="Watered">💧</span>}
                      {CROP_NAMES[cropTypes[i]]}
                    </div>
                  )}
                  {!isEmpty && <div style={{ position: "absolute", top: 7, right: 7, background: "rgba(58,46,35,.62)", color: "#ffe8b0", fontSize: 10, fontWeight: 800, padding: "2px 7px", borderRadius: 7, backdropFilter: "blur(2px)", fontFamily: "ui-monospace,monospace" }}>{isReady ? "Ready!" : fmtRemain(remain)}</div>}
                  {isGrowing && !watered[i] && (
                    <button onClick={e => { e.stopPropagation(); doWater(i); }} disabled={busy}
                      style={{ position: "absolute", bottom: 7, left: "50%", transform: "translateX(-50%)", background: "rgba(74,158,209,.92)", color: "#fff", border: "none", fontSize: 11, fontWeight: 800, padding: "4px 12px", borderRadius: 9, cursor: "pointer", boxShadow: "0 3px 8px -2px rgba(31,110,160,.7)", whiteSpace: "nowrap" }}>
                      💧 Water
                    </button>
                  )}
                  {isReady && (
                    <button onClick={e => { e.stopPropagation(); doHarvest(i); }} disabled={busy}
                      style={{ position: "absolute", bottom: 7, left: "50%", transform: "translateX(-50%)", background: "linear-gradient(180deg,#f0bf4a,#d99417)", color: "#5a3c08", border: "none", fontFamily: "'Baloo 2',cursive", fontSize: 12, fontWeight: 800, padding: "5px 14px", borderRadius: 10, cursor: "pointer", whiteSpace: "nowrap", animation: "pulseGlow 1.6s ease-in-out infinite" }}>
                      Harvest +{CROP_YIELD[cropTypes[i]]}
                    </button>
                  )}
                  {floats[i] && (
                    <div style={{ position: "absolute", top: "40%", left: "50%", fontFamily: "'Baloo 2',cursive", fontWeight: 800, fontSize: 22, color: "#2f6b34", textShadow: "0 2px 0 #fff,0 0 8px rgba(255,255,255,.6)", animation: "floatUp 1.1s ease-out forwards", pointerEvents: "none", zIndex: 20 }}>
                      {floats[i]}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Plant panel */}
        {selected !== null && (
          <div style={{ background: "#fffaf2", border: "1px solid #ece0cc", borderRadius: 20, padding: 16, boxShadow: "0 14px 32px -18px rgba(122,82,52,.55)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ fontFamily: "'Baloo 2',cursive", fontWeight: 800, fontSize: 17, color: "#3a2e23" }}>Plant in plot {selected + 1}</div>
              <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", fontSize: 13, fontWeight: 700, color: "#a08a6e", cursor: "pointer" }}>✕ Cancel</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(100px,1fr))", gap: 9 }}>
              {CROP_NAMES.map((name, i) => (
                <div key={i} className="crop-card" onClick={() => setCropChoice(i)}
                  style={{ borderRadius: 15, padding: "12px 10px", cursor: "pointer", textAlign: "center", background: cropChoice === i ? "#eef8e6" : "#f7f0e2", border: `2px solid ${cropChoice === i ? "#5fa83f" : "transparent"}`, transition: "transform .12s ease" }}>
                  <div style={{ position: "relative", height: 44, display: "flex", alignItems: "flex-end", justifyContent: "center", marginBottom: 6 }}>
                    <CropEmblem cropIdx={i} size={44} />
                  </div>
                  <div style={{ fontFamily: "'Baloo 2',cursive", fontWeight: 700, fontSize: 13, color: "#3a2e23" }}>{name}</div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#357f2f", marginTop: 1 }}>+{CROP_YIELD[i]} pts</div>
                  <div style={{ fontSize: 10, color: "#a08a6e", marginTop: 2 }}>⏱ {Math.floor(CROP_GROWTH_SECS[i] / 60)}m</div>
                  {CROP_COST_USDM[i] > 0 && <div style={{ fontSize: 10, fontWeight: 700, color: "#9a6a14", marginTop: 3 }}>{CROP_COST_USDM[i]} USDM</div>}
                </div>
              ))}
            </div>
            <button onClick={doPlant} disabled={busy}
              style={{ width: "100%", marginTop: 12, fontFamily: "'Baloo 2',cursive", fontWeight: 700, fontSize: 16, border: "none", padding: 13, borderRadius: 14, background: busy ? "#efe3cd" : "linear-gradient(180deg,#5fa83f,#357f2f)", color: busy ? "#b89a6a" : "#fff", cursor: busy ? "not-allowed" : "pointer", boxShadow: busy ? "none" : "0 8px 18px -6px rgba(53,107,44,.5)" }}>
              {busy ? "Confirming…" : CROP_COST_USDM[cropChoice] > 0 ? `🌱 Plant ${CROP_NAMES[cropChoice]} — ${CROP_COST_USDM[cropChoice]} USDM` : `🌱 Plant ${CROP_NAMES[cropChoice]}`}
            </button>
          </div>
        )}
      </div>

      {/* RIGHT: mini leaderboard + activity */}
      <div className="farm-right" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {topAddrs.length === 0 && (
          <div style={{ background: "#fffaf2", border: "1px solid #ece0cc", borderRadius: 20, padding: 20, textAlign: "center" }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🏆</div>
            <div style={{ fontFamily: "'Baloo 2',cursive", fontWeight: 700, fontSize: 15, color: "#8a7256" }}>No farmers yet</div>
            <div style={{ fontSize: 12, color: "#a08a6e", marginTop: 4 }}>Be the first on the leaderboard!</div>
          </div>
        )}
        {topAddrs.length > 0 && (
          <div style={{ background: "#fffaf2", border: "1px solid #ece0cc", borderRadius: 20, padding: 16, boxShadow: "0 10px 28px -18px rgba(122,82,52,.5)" }}>
            <div style={{ fontFamily: "'Baloo 2',cursive", fontWeight: 800, fontSize: 16, color: "#3a2e23", marginBottom: 11 }}>🏆 Top farmers</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {topAddrs.slice(0, 4).map((addr, i) => {
                const isMe = addr.toLowerCase() === address?.toLowerCase();
                return (
                  <div key={addr} style={{ display: "flex", alignItems: "center", gap: 9, padding: "7px 9px", borderRadius: 11, background: isMe ? "#eef8e6" : "transparent" }}>
                    <div style={{ width: 22, textAlign: "center", fontWeight: 800, fontSize: 13 }}>{medals[i]}</div>
                    <div style={{ width: 26, height: 26, borderRadius: 8, background: isMe ? "#2f6b34" : AVATAR_COLORS[i % AVATAR_COLORS.length], display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 11, fontWeight: 800 }}>{addr[2].toUpperCase()}</div>
                    <div style={{ flex: 1, fontSize: 12, fontWeight: 700, color: isMe ? "#2f6b34" : "#3a2e23", fontFamily: "ui-monospace,monospace" }}>{addr.slice(0,6)}…{addr.slice(-4)}{isMe ? " (you)" : ""}</div>
                    <div style={{ fontFamily: "'Baloo 2',cursive", fontWeight: 800, fontSize: 13, color: "#2f6b34" }}>{topScores[i] != null ? fmtScore(topScores[i]) : "0"}</div>
                  </div>
                );
              })}
              {/* Show user's rank when outside top 4 */}
              {address && myMiniRank >= 4 && (
                <>
                  <div style={{ textAlign: "center", fontSize: 13, color: "#c8b89a", letterSpacing: 3 }}>· · ·</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "7px 9px", borderRadius: 11, background: "#eef8e6" }}>
                    <div style={{ width: 22, textAlign: "center", fontWeight: 800, fontSize: 12, color: "#2f6b34" }}>#{myMiniRank + 1}</div>
                    <div style={{ width: 26, height: 26, borderRadius: 8, background: "#2f6b34", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 11, fontWeight: 800 }}>{address[2].toUpperCase()}</div>
                    <div style={{ flex: 1, fontSize: 12, fontWeight: 700, color: "#2f6b34", fontFamily: "ui-monospace,monospace" }}>{address.slice(0,6)}…{address.slice(-4)} (you)</div>
                    <div style={{ fontFamily: "'Baloo 2',cursive", fontWeight: 800, fontSize: 13, color: "#2f6b34" }}>{fmtScore(topScores[myMiniRank] ?? 0n)}</div>
                  </div>
                </>
              )}
              {/* User outside top 10 */}
              {address && myMiniRank === -1 && myScore > 0 && (
                <>
                  <div style={{ textAlign: "center", fontSize: 13, color: "#c8b89a", letterSpacing: 3 }}>· · ·</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "7px 9px", borderRadius: 11, background: "#eef8e6" }}>
                    <div style={{ width: 22, textAlign: "center", fontWeight: 800, fontSize: 12, color: "#8a7256" }}>—</div>
                    <div style={{ width: 26, height: 26, borderRadius: 8, background: "#2f6b34", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 11, fontWeight: 800 }}>{address[2].toUpperCase()}</div>
                    <div style={{ flex: 1, fontSize: 12, fontWeight: 700, color: "#2f6b34", fontFamily: "ui-monospace,monospace" }}>{address.slice(0,6)}…{address.slice(-4)} (you)</div>
                    <div style={{ fontFamily: "'Baloo 2',cursive", fontWeight: 800, fontSize: 13, color: "#2f6b34" }}>{myScore.toLocaleString()}</div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        <div style={{ background: "#fffaf2", border: "1px solid #ece0cc", borderRadius: 20, padding: 16, boxShadow: "0 10px 28px -18px rgba(122,82,52,.5)" }}>
          <div style={{ fontFamily: "'Baloo 2',cursive", fontWeight: 800, fontSize: 16, color: "#3a2e23", marginBottom: 11 }}>🌿 Activity</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {activity.length === 0 ? (
              <div style={{ fontSize: 12.5, color: "#a08a6e", textAlign: "center", padding: "12px 0" }}>No activity yet — start planting!</div>
            ) : activity.map(a => (
              <div key={a.key} style={{ display: "flex", alignItems: "center", gap: 9 }}>
                <div style={{ width: 28, height: 28, borderRadius: 9, background: a.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>{a.icon}</div>
                <div style={{ flex: 1, fontSize: 12.5, color: "#5a4631", lineHeight: 1.3 }}>{a.text}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
