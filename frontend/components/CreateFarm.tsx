"use client";
import { useState, useEffect } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { SHAMBA_ADDRESS, SHAMBA_ABI } from "@/lib/contracts";
import { RenderPlant } from "./PlantArt";

export default function CreateFarm({ onCreated }: { onCreated?: () => void }) {
  const [referrer, setReferrer] = useState("");
  const { writeContract, isPending, data: txHash } = useWriteContract();
  const { isSuccess: txConfirmed } = useWaitForTransactionReceipt({ hash: txHash });

  useEffect(() => {
    if (!txConfirmed || !onCreated) return;
    // RPC nodes can lag behind the chain — retry refetch at 2 s and 5 s
    // so hasFarm flips to true even on a slow node
    onCreated();
    const t1 = setTimeout(onCreated, 2000);
    const t2 = setTimeout(onCreated, 5000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [txConfirmed]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleCreate() {
    writeContract({
      address: SHAMBA_ADDRESS, abi: SHAMBA_ABI, functionName: "createFarm",
      args: [referrer && referrer.startsWith("0x") ? referrer as `0x${string}` : "0x0000000000000000000000000000000000000000"],
    });
  }

  return (
    <div style={{ width: "100%", maxWidth: 760, display: "grid", gridTemplateColumns: "1fr", gap: 18 }}>
      <style>{`@media(min-width:660px){.create-inner{grid-template-columns:1fr 1fr!important;}}`}</style>
      <div className="create-inner" style={{ display: "grid", gridTemplateColumns: "1fr", gap: 18 }}>
        {/* Landscape card */}
        <div style={{ background: "linear-gradient(180deg,#bfe6f2,#dff0d6 45%,#caa46e)", borderRadius: 26, padding: 26, position: "relative", overflow: "hidden", minHeight: 280, display: "flex", flexDirection: "column", justifyContent: "flex-end", boxShadow: "0 18px 40px -16px rgba(122,82,52,.45)" }}>
          <div style={{ position: "absolute", top: 20, right: 22, width: 64, height: 64, borderRadius: "50%", background: "radial-gradient(circle,#fff3c2,#ffd860 60%,#f6b929)", boxShadow: "0 0 40px 12px rgba(255,210,90,.5)", animation: "sunpulse 5s ease-in-out infinite" }} />
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-around", height: 88, marginBottom: 8 }}>
            {[0, 2, 3].map((crop, i) => (
              <div key={i} style={{ position: "relative", width: 40, height: 84 }}>
                <RenderPlant cropIdx={crop} progress={1} ready={true} />
              </div>
            ))}
          </div>
          <div style={{ background: "rgba(58,46,35,.55)", backdropFilter: "blur(4px)", borderRadius: 14, padding: "12px 14px", color: "#fff" }}>
            <div style={{ fontFamily: "'Baloo 2',cursive", fontWeight: 800, fontSize: 18 }}>Your plot of land is waiting</div>
            <div style={{ fontSize: 12.5, opacity: 0.85, marginTop: 2 }}>6 plots · 5 crops · 100% yours, on-chain.</div>
          </div>
        </div>

        {/* Form */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#eaf5e2", color: "#357f2f", fontSize: 12, fontWeight: 700, padding: "5px 12px", borderRadius: 20 }}>🌾 START FOR FREE</div>
            <h2 style={{ fontFamily: "'Baloo 2',cursive", fontWeight: 800, fontSize: 30, color: "#2f6b34", margin: "12px 0 4px" }}>Start your Shamba</h2>
            <p style={{ fontSize: 14, color: "#7a6448", margin: 0, lineHeight: 1.5 }}>Claim your farm to begin. It&apos;s free — plant your first crop in seconds.</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {[
              ["🌽", "6 free plots"],
              ["💧", "Water = +25% speed"],
              ["🏆", "Live leaderboard"],
              ["🤝", "Earn from friends"],
            ].map(([icon, text]) => (
              <div key={text} style={{ background: "#fffaf2", border: "1px solid #ece0cc", borderRadius: 14, padding: "11px 13px", fontSize: 13, fontWeight: 600, color: "#5a4631", display: "flex", alignItems: "center", gap: 7 }}>
                <span style={{ fontSize: 16 }}>{icon}</span>{text}
              </div>
            ))}
          </div>

          <div style={{ background: "#fffaf2", border: "1px solid #ece0cc", borderRadius: 16, padding: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#8a7256", marginBottom: 7 }}>REFERRAL CODE (OPTIONAL)</div>
            <input
              value={referrer} onChange={e => setReferrer(e.target.value)}
              placeholder="0x… friend's address"
              style={{ width: "100%", background: "#f6efe2", border: "1px solid #e3d4ba", borderRadius: 11, padding: "11px 13px", fontSize: 14, color: "#3a2e23", fontFamily: "inherit", outline: "none", boxSizing: "border-box" }}
            />
            <div style={{ fontSize: 12, color: "#a08a6e", marginTop: 7 }}>Your friend earns <b style={{ color: "#357f2f" }}>10%</b> of your harvest score.</div>
          </div>

          <button onClick={handleCreate} disabled={isPending || !!txHash}
            style={{ fontFamily: "'Baloo 2',cursive", fontWeight: 700, fontSize: 18, color: "#fff", background: (isPending || txHash) ? "#efe3cd" : "linear-gradient(180deg,#5fa83f,#357f2f)", border: "none", padding: 15, borderRadius: 16, cursor: (isPending || txHash) ? "not-allowed" : "pointer", boxShadow: (isPending || txHash) ? "none" : "0 10px 22px -6px rgba(53,107,44,.55)" }}>
            {isPending ? "Confirm in wallet…" : txHash ? "Confirming on-chain…" : "🌱 Claim my farm"}
          </button>
        </div>
      </div>
    </div>
  );
}
