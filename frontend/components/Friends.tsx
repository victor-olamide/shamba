"use client";
import { useState } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { SHAMBA_ADDRESS, SHAMBA_ABI } from "@/lib/contracts";

const AVATAR_COLORS = ["#e0623e", "#4a9ed1", "#9a6ad1", "#5fa83f", "#d99417"];

export default function Friends() {
  const { address } = useAccount();
  const [visitAddr, setVisitAddr] = useState("");
  const [copied, setCopied]       = useState(false);

  const { data: myRefs } = useReadContract({
    address: SHAMBA_ADDRESS, abi: SHAMBA_ABI, functionName: "referralCount",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const { data: myFarm } = useReadContract({
    address: SHAMBA_ADDRESS, abi: SHAMBA_ABI, functionName: "farms",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const { writeContract, isPending } = useWriteContract();
  const [pendingTx, setPendingTx]   = useState<`0x${string}` | undefined>();
  const { isLoading: txLoading }    = useWaitForTransactionReceipt({ hash: pendingTx });
  const busy = isPending || txLoading;

  const myScore = myFarm ? Number((myFarm as readonly unknown[])[1] as bigint) : 0;
  const refCode = address ?? "";

  function copyRef() {
    try { navigator.clipboard.writeText(refCode); } catch (_) { /* ignore */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function doVisit() {
    const addr = visitAddr.trim();
    if (!addr.startsWith("0x") || addr.length < 42) return;
    if (addr.toLowerCase() === address?.toLowerCase()) return;
    writeContract({ address: SHAMBA_ADDRESS, abi: SHAMBA_ABI, functionName: "visitFriend", args: [addr as `0x${string}`] });
    setVisitAddr("");
  }

  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 18 }}>
        <h2 style={{ fontFamily: "'Baloo 2',cursive", fontWeight: 800, fontSize: 30, color: "#2f6b34", margin: 0 }}>🤝 Friends</h2>
        <p style={{ fontSize: 13, color: "#8a7256", margin: "4px 0 0" }}>Visit farms for free points · invite friends for passive score</p>
      </div>

      <div className="friends-grid" style={{ marginBottom: 16 }}>
        {/* Referral card */}
        <div style={{ background: "linear-gradient(150deg,#2f6b34,#1f5226)", borderRadius: 20, padding: 18, color: "#fff", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -20, right: -10, fontSize: 90, opacity: 0.12 }}>🌾</div>
          <div style={{ fontFamily: "'Baloo 2',cursive", fontWeight: 800, fontSize: 17 }}>Invite &amp; earn 10%</div>
          <p style={{ fontSize: 12.5, opacity: 0.85, margin: "6px 0 12px", lineHeight: 1.5 }}>Earn 10% of every harvest your invited friends make. Forever.</p>
          <div style={{ display: "flex", gap: 8, alignItems: "center", background: "rgba(255,255,255,.14)", border: "1px solid rgba(255,255,255,.22)", borderRadius: 12, padding: "9px 12px" }}>
            <span style={{ flex: 1, fontFamily: "ui-monospace,monospace", fontSize: 11, fontWeight: 600, letterSpacing: ".02em", wordBreak: "break-all" }}>{address ? address.slice(0,10) + "…" + address.slice(-6) : "connect wallet"}</span>
            <button onClick={copyRef} style={{ background: "#f0bf4a", color: "#5a3c08", border: "none", fontWeight: 800, fontSize: 12, padding: "6px 12px", borderRadius: 9, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>

        {/* Stats card */}
        <div style={{ background: "#fffaf2", border: "1px solid #ece0cc", borderRadius: 20, padding: 18, display: "flex", flexDirection: "column", justifyContent: "center", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: "#eaf5e2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>👥</div>
            <div>
              <div style={{ fontFamily: "'Baloo 2',cursive", fontWeight: 800, fontSize: 26, color: "#2f6b34" }}>{myRefs?.toString() ?? "0"}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#8a7256" }}>FRIENDS REFERRED</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: "#fdf3d4", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>💰</div>
            <div>
              <div style={{ fontFamily: "'Baloo 2',cursive", fontWeight: 800, fontSize: 26, color: "#9a6a14" }}>{myScore}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#8a7256" }}>YOUR SCORE</div>
            </div>
          </div>
        </div>
      </div>

      {/* Visit a friend */}
      <div style={{ background: "#fffaf2", border: "1px solid #ece0cc", borderRadius: 20, padding: 16, boxShadow: "0 12px 30px -20px rgba(122,82,52,.5)" }}>
        <div style={{ fontFamily: "'Baloo 2',cursive", fontWeight: 800, fontSize: 16, color: "#3a2e23", marginBottom: 12 }}>Visit a friend&apos;s farm</div>
        <p style={{ fontSize: 13, color: "#7a6448", margin: "0 0 12px", lineHeight: 1.5 }}>
          Enter a friend&apos;s wallet address to visit their farm and earn <b style={{ color: "#357f2f" }}>+1 score</b> per visit.
        </p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input
            value={visitAddr} onChange={e => setVisitAddr(e.target.value)}
            placeholder="0x… friend's address"
            style={{ flex: 1, minWidth: 200, background: "#f6efe2", border: "1px solid #e3d4ba", borderRadius: 11, padding: "11px 13px", fontSize: 14, color: "#3a2e23", fontFamily: "inherit", outline: "none", boxSizing: "border-box" }}
          />
          <button onClick={doVisit} disabled={busy || !visitAddr.startsWith("0x")}
            style={{ fontFamily: "'Baloo 2',cursive", fontWeight: 700, fontSize: 15, border: "none", padding: "11px 20px", borderRadius: 12, cursor: busy || !visitAddr.startsWith("0x") ? "not-allowed" : "pointer", background: busy || !visitAddr.startsWith("0x") ? "#efe3cd" : "linear-gradient(180deg,#5fa83f,#357f2f)", color: busy || !visitAddr.startsWith("0x") ? "#b89a6a" : "#fff", whiteSpace: "nowrap" }}>
            {busy ? "Visiting…" : "🤝 Visit +1"}
          </button>
        </div>

        {/* How it works */}
        <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {[
            ["🌾 Plant & harvest", "Earn score by harvesting crops"],
            ["💧 Water crops", "Speed up growth by 25%"],
            ["🤝 Visit friends", "+1 score per unique farm visit"],
            ["🔗 Refer friends", "Earn 10% of their harvest score"],
          ].map(([t, d]) => (
            <div key={t} style={{ background: "#f7f0e2", border: "1px solid #e8dac2", borderRadius: 12, padding: "10px 12px" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#3a2e23" }}>{t}</div>
              <div style={{ fontSize: 11.5, color: "#8a7256", marginTop: 3 }}>{d}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
