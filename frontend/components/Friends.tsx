"use client";
import { useState, useEffect } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { SHAMBA_ADDRESS, SHAMBA_ABI, CROP_NAMES, CROP_YIELD } from "@/lib/contracts";
import { RenderPlant } from "./PlantArt";

const AVATAR_COLORS = ["#e0623e", "#4a9ed1", "#9a6ad1", "#5fa83f", "#d99417"];

function fmtAgo(ts: number) {
  const s = Math.floor(Date.now() / 1000) - ts;
  if (s < 120) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export default function Friends() {
  const { address } = useAccount();
  const [visitAddr, setVisitAddr]   = useState("");
  const [copied, setCopied]         = useState(false);
  const [visited, setVisited]       = useState(false);
  const [, setTick]                 = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTick(n => n + 1), 30000);
    return () => clearInterval(t);
  }, []);

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

  const validFriendAddr = visitAddr.trim().length >= 42 && visitAddr.trim().startsWith("0x")
    ? visitAddr.trim() as `0x${string}` : undefined;

  const { data: friendFarm, isLoading: friendLoading } = useReadContract({
    address: SHAMBA_ADDRESS, abi: SHAMBA_ABI, functionName: "getFarm",
    args: validFriendAddr ? [validFriendAddr] : undefined,
    query: { enabled: !!validFriendAddr },
  });
  const { data: friendBasic } = useReadContract({
    address: SHAMBA_ADDRESS, abi: SHAMBA_ABI, functionName: "farms",
    args: validFriendAddr ? [validFriendAddr] : undefined,
    query: { enabled: !!validFriendAddr },
  });

  const { writeContractAsync, isPending } = useWriteContract();
  const [pendingTx, setPendingTx]        = useState<`0x${string}` | undefined>();
  const { isLoading: txLoading, isSuccess: txSuccess } = useWaitForTransactionReceipt({ hash: pendingTx });
  const busy = isPending || txLoading;

  useEffect(() => {
    if (txSuccess) {
      setVisited(true);
      setPendingTx(undefined);
      setTimeout(() => setVisited(false), 4000);
    }
  }, [txSuccess]); // eslint-disable-line react-hooks/exhaustive-deps

  const myScore     = myFarm ? Number((myFarm as readonly unknown[])[1] as bigint) : 0;
  const myLastVisit = myFarm ? Number((myFarm as readonly unknown[])[2] as bigint) : 0;
  const refCount    = Number(myRefs ?? 0);
  const APP_URL     = "https://shamba-teal.vercel.app";
  const refLink     = address ? `${APP_URL}/?ref=${address}` : "";
  const refLinkShort = address ? `shamba-teal.vercel.app/?ref=${address.slice(0,8)}…` : "connect wallet";

  // Streak: how long since last on-chain activity
  const nowSec   = Math.floor(Date.now() / 1000);
  const idleSecs = myLastVisit > 0 ? nowSec - myLastVisit : 0;
  const activeToday = idleSecs > 0 && idleSecs < 86400;
  const streakWarning = idleSecs > 86400 * 2;

  // Friend's farm data
  const friendHasFarm = friendBasic ? (friendBasic as readonly unknown[])[3] as boolean : false;
  const friendScore   = friendBasic ? Number((friendBasic as readonly unknown[])[1] as bigint) : 0;
  const friendHarvests = friendBasic ? Number((friendBasic as readonly unknown[])[0] as number) : 0;
  const friendCropTypes = friendFarm ? (friendFarm as readonly unknown[])[0] as number[] : [];
  const friendStates    = friendFarm ? (friendFarm as readonly unknown[])[3] as number[] : [];
  const friendWatered   = friendFarm ? (friendFarm as readonly unknown[])[2] as boolean[] : [];
  const friendPlantedAts = friendFarm ? (friendFarm as readonly unknown[])[1] as number[] : [];
  const friendLastVisit  = friendBasic ? Number((friendBasic as readonly unknown[])[2] as bigint) : 0;

  function copyRef() {
    try { navigator.clipboard.writeText(refLink || address || ""); } catch (_) { /* ignore */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  async function doVisit() {
    const addr = validFriendAddr;
    if (!addr) return;
    if (addr.toLowerCase() === address?.toLowerCase()) return;
    try {
      const hash = await writeContractAsync({ address: SHAMBA_ADDRESS, abi: SHAMBA_ABI, functionName: "visitFriend", args: [addr] });
      setPendingTx(hash);
    } catch { /* user rejected */ }
  }

  const isSelf = validFriendAddr?.toLowerCase() === address?.toLowerCase();

  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 18 }}>
        <h2 style={{ fontFamily: "'Baloo 2',cursive", fontWeight: 800, fontSize: 30, color: "#2f6b34", margin: 0 }}>🤝 Friends</h2>
        <p style={{ fontSize: 13, color: "#8a7256", margin: "4px 0 0" }}>Visit farms for free points · invite friends for passive score</p>
      </div>

      {/* Daily streak hint */}
      {myLastVisit > 0 && (
        <div style={{ background: streakWarning ? "rgba(192,57,43,.08)" : "#eaf5e2", border: `1px solid ${streakWarning ? "rgba(192,57,43,.25)" : "#cfe7bf"}`, borderRadius: 14, padding: "10px 14px", marginBottom: 14, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 20 }}>{activeToday ? "🔥" : streakWarning ? "😴" : "🌱"}</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: streakWarning ? "#c0392b" : "#2f6b34" }}>
                {activeToday ? "Active today — keep your streak!" : streakWarning ? "Your farm needs attention!" : "Last active " + fmtAgo(myLastVisit)}
              </div>
              <div style={{ fontSize: 11, color: "#8a7256" }}>
                {activeToday ? `Last action ${fmtAgo(myLastVisit)}` : "Come back daily to stay ahead on the leaderboard"}
              </div>
            </div>
          </div>
          <div style={{ fontFamily: "'Baloo 2',cursive", fontWeight: 800, fontSize: 20, color: streakWarning ? "#c0392b" : "#357f2f" }}>
            {myScore} pts
          </div>
        </div>
      )}

      <div className="friends-grid" style={{ marginBottom: 16 }}>
        {/* Referral card */}
        <div style={{ background: "linear-gradient(150deg,#2f6b34,#1f5226)", borderRadius: 20, padding: 18, color: "#fff", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -20, right: -10, fontSize: 90, opacity: 0.12 }}>🌾</div>
          <div style={{ fontFamily: "'Baloo 2',cursive", fontWeight: 800, fontSize: 17 }}>Invite &amp; earn passively</div>
          <p style={{ fontSize: 12.5, opacity: 0.85, margin: "6px 0 8px", lineHeight: 1.5 }}>
            When a friend you referred harvests crops, <b>10% of their harvest score is added to yours</b> automatically — no extra action needed.
          </p>
          {/* Concrete example */}
          <div style={{ background: "rgba(255,255,255,.12)", borderRadius: 10, padding: "8px 11px", marginBottom: 12, fontSize: 11.5, lineHeight: 1.6 }}>
            <span style={{ opacity: 0.75 }}>Example: </span>
            Friend harvests 🌽 Maize → <b>+10 pts</b> for them, <b>+1 pt</b> for you. They harvest 🌾 Golden Wheat → <b>+100 pts</b> for them, <b>+10 pts</b> for you.
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", background: "rgba(255,255,255,.14)", border: "1px solid rgba(255,255,255,.22)", borderRadius: 12, padding: "9px 12px" }}>
            <span style={{ flex: 1, fontFamily: "ui-monospace,monospace", fontSize: 11, fontWeight: 600, letterSpacing: ".02em", wordBreak: "break-all", opacity: 0.9 }}>{refLinkShort}</span>
            <button onClick={copyRef} style={{ background: "#f0bf4a", color: "#5a3c08", border: "none", fontWeight: 800, fontSize: 12, padding: "6px 12px", borderRadius: 9, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>
              {copied ? "✓ Copied!" : "Copy link"}
            </button>
          </div>
          <div style={{ marginTop: 8, fontSize: 11, opacity: 0.7 }}>Score = your leaderboard rank. Higher score = higher up the rankings.</div>
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
            <div style={{ width: 42, height: 42, borderRadius: 12, background: "#fdf3d4", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🏆</div>
            <div>
              <div style={{ fontFamily: "'Baloo 2',cursive", fontWeight: 800, fontSize: 26, color: "#9a6a14" }}>{myScore.toLocaleString()}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#8a7256" }}>YOUR SCORE</div>
            </div>
          </div>
          {refCount > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 11, paddingTop: 8, borderTop: "1px dashed #e8dac2" }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: "#e8f3ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>📈</div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#357f2f", lineHeight: 1.35 }}>
                  Your {refCount} friend{refCount > 1 ? "s are" : " is"} farming — their harvests boost your score
                </div>
                <div style={{ fontSize: 11, color: "#8a7256" }}>passive · no action needed</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Visit a friend */}
      <div style={{ background: "#fffaf2", border: "1px solid #ece0cc", borderRadius: 20, padding: 16, boxShadow: "0 12px 30px -20px rgba(122,82,52,.5)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <div style={{ fontFamily: "'Baloo 2',cursive", fontWeight: 800, fontSize: 16, color: "#3a2e23" }}>Visit a friend&apos;s farm</div>
          {visited && <div style={{ fontSize: 12, fontWeight: 700, color: "#357f2f", background: "#eaf5e2", padding: "4px 10px", borderRadius: 8 }}>✓ Visited! +1 pt each</div>}
        </div>
        <p style={{ fontSize: 13, color: "#7a6448", margin: "0 0 12px", lineHeight: 1.5 }}>
          Paste a friend&apos;s wallet address to <b>see their farm</b> and earn <b style={{ color: "#357f2f" }}>+1 score</b> for each visit (both of you get +1).
        </p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input
            value={visitAddr} onChange={e => setVisitAddr(e.target.value)}
            placeholder="0x… paste your friend's wallet address"
            style={{ flex: 1, minWidth: 200, background: "#f6efe2", border: "1px solid #e3d4ba", borderRadius: 11, padding: "11px 13px", fontSize: 14, color: "#3a2e23", fontFamily: "inherit", outline: "none", boxSizing: "border-box" }}
          />
          {validFriendAddr && friendHasFarm && !isSelf && (
            <button onClick={doVisit} disabled={busy}
              style={{ fontFamily: "'Baloo 2',cursive", fontWeight: 700, fontSize: 15, border: "none", padding: "11px 20px", borderRadius: 12, cursor: busy ? "not-allowed" : "pointer", background: busy ? "#efe3cd" : "linear-gradient(180deg,#5fa83f,#357f2f)", color: busy ? "#b89a6a" : "#fff", whiteSpace: "nowrap" }}>
              {busy ? "Visiting…" : "Visit +1 pt"}
            </button>
          )}
        </div>

        {/* Friend farm preview */}
        {validFriendAddr && !isSelf && (
          <div style={{ marginTop: 16 }}>
            {friendLoading && (
              <div style={{ textAlign: "center", padding: "20px 0", color: "#a08a6e", fontSize: 13 }}>Loading farm…</div>
            )}
            {!friendLoading && !friendHasFarm && (
              <div style={{ textAlign: "center", padding: "18px 0", color: "#a08a6e", fontSize: 13 }}>
                <div style={{ fontSize: 28, marginBottom: 6 }}>🌱</div>
                This address hasn&apos;t started a farm yet.
              </div>
            )}
            {!friendLoading && friendHasFarm && (
              <div style={{ background: "#f7f0e2", border: "1px solid #e8dac2", borderRadius: 16, padding: 14 }}>
                {/* Friend header */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: AVATAR_COLORS[0], display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 14, fontWeight: 800 }}>{validFriendAddr[2].toUpperCase()}</div>
                    <div>
                      <div style={{ fontFamily: "ui-monospace,monospace", fontSize: 12, fontWeight: 700, color: "#3a2e23" }}>{validFriendAddr.slice(0,8)}…{validFriendAddr.slice(-6)}</div>
                      {friendLastVisit > 0 && <div style={{ fontSize: 10, color: "#8a7256" }}>Active {fmtAgo(friendLastVisit)}</div>}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 10 }}>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontFamily: "'Baloo 2',cursive", fontWeight: 800, fontSize: 18, color: "#2f6b34" }}>{friendScore.toLocaleString()}</div>
                      <div style={{ fontSize: 10, color: "#8a7256", fontWeight: 700 }}>SCORE</div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontFamily: "'Baloo 2',cursive", fontWeight: 800, fontSize: 18, color: "#9a6a14" }}>{friendHarvests}</div>
                      <div style={{ fontSize: 10, color: "#8a7256", fontWeight: 700 }}>HARVESTS</div>
                    </div>
                  </div>
                </div>

                {/* Friend's 6 plots mini grid */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 6 }}>
                  {Array.from({ length: 6 }, (_, i) => {
                    const st  = friendStates[i] ?? 0;
                    const ct  = friendCropTypes[i] ?? 0;
                    const wat = friendWatered[i] ?? false;
                    const pat = friendPlantedAts[i] ?? 0;
                    const isEmpty  = st === 0;
                    const isReady  = st === 2;
                    const nowSec2  = Math.floor(Date.now() / 1000);
                    const progress = isEmpty ? 0 : Math.min(1, (nowSec2 - pat) / Math.max(1, 3600));
                    return (
                      <div key={i} style={{ aspectRatio: "1/1", borderRadius: 10, background: "linear-gradient(#7a5234,#5a3a23)", border: `2px solid ${isReady ? "#e0a92e" : "#4d3019"}`, overflow: "hidden", position: "relative" }}>
                        {!isEmpty && <RenderPlant cropIdx={ct} progress={isReady ? 1 : progress} ready={isReady} />}
                        {isEmpty && <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "rgba(255,255,255,.4)", fontWeight: 700 }}>—</div>}
                        {wat && !isEmpty && !isReady && <div style={{ position: "absolute", bottom: 2, left: "50%", transform: "translateX(-50%)", fontSize: 8 }}>💧</div>}
                        {isReady && <div style={{ position: "absolute", inset: 0, background: "rgba(224,169,46,.18)" }} />}
                        <div style={{ position: "absolute", top: 2, left: 2, fontSize: 7, fontWeight: 800, color: "rgba(255,255,255,.5)" }}>{i + 1}</div>
                      </div>
                    );
                  })}
                </div>

                {/* Plot legend */}
                <div style={{ marginTop: 10, display: "flex", gap: 12, flexWrap: "wrap", fontSize: 11, color: "#8a7256" }}>
                  {friendStates.map((s, i) => s !== 0 && (
                    <span key={i}>
                      Plot {i + 1}: {s === 2 ? "✅ Ready" : "🌱"} {CROP_NAMES[friendCropTypes[i] ?? 0]}
                      {s === 2 && <span style={{ color: "#9a6a14", fontWeight: 700 }}> +{CROP_YIELD[friendCropTypes[i] ?? 0]} pts</span>}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {isSelf && (
          <div style={{ marginTop: 12, fontSize: 12, color: "#c0392b", fontWeight: 600 }}>You can&apos;t visit your own farm.</div>
        )}
      </div>
    </div>
  );
}
