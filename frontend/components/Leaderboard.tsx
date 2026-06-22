"use client";
import { useAccount, useReadContract } from "wagmi";
import { SHAMBA_ADDRESS, SHAMBA_ABI, CROP_NAMES, CROP_EMOJI, CROP_GROWTH_SECS, CROP_YIELD, CROP_COST_USDM } from "@/lib/contracts";

const AVATAR_COLORS = ["#e0623e", "#4a9ed1", "#9a6ad1", "#5fa83f", "#d99417", "#3fa3a3", "#c85a8a"];
const BAR_BG = ["linear-gradient(180deg,#f0bf4a,#d99417)", "linear-gradient(180deg,#c9cdd6,#9aa0ad)", "linear-gradient(180deg,#d6a06a,#b07840)"];
const BAR_H  = [96, 72, 56];
const MEDALS = ["🥇", "🥈", "🥉"];

export default function Leaderboard() {
  const { address } = useAccount();

  const { data: topData, refetch } = useReadContract({
    address: SHAMBA_ADDRESS, abi: SHAMBA_ABI, functionName: "getTopFarmers",
    args: [50n], query: { refetchInterval: 30000 },
  });
  const { data: myFarm } = useReadContract({
    address: SHAMBA_ADDRESS, abi: SHAMBA_ABI, functionName: "farms",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });
  const { data: myRefs } = useReadContract({
    address: SHAMBA_ADDRESS, abi: SHAMBA_ABI, functionName: "referralCount",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const topAddrs  = topData ? (topData as readonly unknown[])[0] as string[] : [];
  const topScores = topData ? (topData as readonly unknown[])[1] as bigint[] : [];
  const myScore    = myFarm  ? (myFarm  as readonly unknown[])[1] as bigint : 0n;
  const myHarvests = myFarm  ? Number((myFarm as readonly unknown[])[0]) : 0;

  const myRank = address ? topAddrs.findIndex(a => a.toLowerCase() === address.toLowerCase()) : -1;
  // myRank is 0-indexed; -1 means outside top 50
  const displayAddrs  = topAddrs.slice(0, 10);
  const displayScores = topScores.slice(0, 10);

  const top3 = topAddrs.slice(0, 3);
  const podiumOrder = top3.length >= 2 ? [1, 0, 2].map(i => top3[i]).filter(Boolean) : top3;
  const podiumRanks = top3.length >= 2 ? [1, 0, 2].filter(i => i < top3.length) : [0, 1, 2].filter(i => i < top3.length);

  return (
    <div className="lb-grid">
      <div style={{ textAlign: "center", marginBottom: 8 }}>
        <h2 style={{ fontFamily: "'Baloo 2',cursive", fontWeight: 800, fontSize: 30, color: "#2f6b34", margin: 0 }}>🏆 Leaderboard</h2>
        <p style={{ fontSize: 13, color: "#8a7256", margin: "4px 0 0" }}>Compete for the highest farm score on Celo</p>
      </div>

      {/* My stats */}
      {address && (
        <div style={{ background: "#fffaf2", border: "1px solid #ece0cc", borderRadius: 20, padding: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "'Baloo 2',cursive", fontWeight: 800, fontSize: 22, color: "#4a9ed1" }}>
                {myRank >= 0 ? `#${myRank + 1}` : "—"}
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#8a7256", letterSpacing: ".04em" }}>RANK</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "'Baloo 2',cursive", fontWeight: 800, fontSize: 22, color: "#2f6b34" }}>{Number(myScore).toLocaleString()}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#8a7256", letterSpacing: ".04em" }}>SCORE</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "'Baloo 2',cursive", fontWeight: 800, fontSize: 22, color: "#9a6a14" }}>{myHarvests}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#8a7256", letterSpacing: ".04em" }}>HARVESTS</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "'Baloo 2',cursive", fontWeight: 800, fontSize: 22, color: "#c8881a" }}>{myRefs?.toString() ?? "0"}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#8a7256", letterSpacing: ".04em" }}>REFERRALS</div>
            </div>
          </div>
        </div>
      )}

      {/* Podium */}
      {top3.length > 0 && (
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 10, margin: "8px 0" }}>
          {podiumOrder.map((addr, idx) => {
            const rank = podiumRanks[idx];
            const isMe = addr?.toLowerCase() === address?.toLowerCase();
            const color = AVATAR_COLORS[rank % AVATAR_COLORS.length];
            return (
              <div key={addr ?? idx} style={{ flex: 1, maxWidth: 150, textAlign: "center" }}>
                <div style={{ width: 52, height: 52, borderRadius: 15, margin: "0 auto 8px", background: isMe ? "#2f6b34" : color, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontFamily: "'Baloo 2',cursive", fontWeight: 800, fontSize: 20, boxShadow: "0 8px 18px -6px rgba(0,0,0,.3)", position: "relative" }}>
                  {addr ? addr[2].toUpperCase() : "?"}
                  <div style={{ position: "absolute", top: -14, fontSize: 22 }}>{MEDALS[rank]}</div>
                </div>
                <div style={{ fontSize: 12, fontWeight: 800, color: "#3a2e23", fontFamily: "ui-monospace,monospace" }}>{addr ? addr.slice(0,6) + "…" + addr.slice(-4) : ""}</div>
                <div style={{ fontFamily: "'Baloo 2',cursive", fontWeight: 800, fontSize: 15, color: "#2f6b34" }}>{topScores[rank]?.toString() ?? "0"}</div>
                <div style={{ marginTop: 8, borderRadius: "14px 14px 0 0", background: BAR_BG[rank] ?? BAR_BG[2], height: BAR_H[rank] ?? 48, display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: 8, fontFamily: "'Baloo 2',cursive", fontWeight: 800, fontSize: 22, color: "#fff" }}>
                  {rank + 1}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full table */}
      <div style={{ background: "#fffaf2", border: "1px solid #ece0cc", borderRadius: 20, overflow: "hidden", boxShadow: "0 12px 30px -20px rgba(122,82,52,.5)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderBottom: "1px solid #ece0cc" }}>
          <div style={{ fontFamily: "'Baloo 2',cursive", fontWeight: 800, fontSize: 16, color: "#3a2e23" }}>All farmers</div>
          <button onClick={() => refetch()} style={{ background: "none", border: "none", fontSize: 12, fontWeight: 700, color: "#357f2f", cursor: "pointer" }} title="Refresh leaderboard">Refresh ↻</button>
        </div>
        {topAddrs.length === 0 ? (
          <div style={{ padding: "40px 20px", textAlign: "center" }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>🌱</div>
            <div style={{ fontSize: 14, color: "#5a4631", fontWeight: 700 }}>No farmers yet</div>
            <div style={{ fontSize: 12, color: "#8a7256", marginTop: 4 }}>Be the first to create a farm and top the board!</div>
          </div>
        ) : (
          <>
            {displayAddrs.map((addr, i) => {
              const isMe = addr.toLowerCase() === address?.toLowerCase();
              return (
                <div key={addr} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderBottom: "1px solid #f1e7d6", background: isMe ? "#eef8e6" : "transparent" }}>
                  <div style={{ width: 26, textAlign: "center", fontFamily: "'Baloo 2',cursive", fontWeight: 800, fontSize: 15, color: "#8a7256" }}>{i < 3 ? MEDALS[i] : i + 1}</div>
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: AVATAR_COLORS[i % AVATAR_COLORS.length], display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 13, fontWeight: 800 }}>{addr[2].toUpperCase()}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: isMe ? "#2f6b34" : "#3a2e23", fontFamily: "ui-monospace,monospace" }}>{addr.slice(0,6)}…{addr.slice(-4)}</div>
                    {isMe && <div style={{ fontSize: 10, fontWeight: 700, color: "#357f2f", letterSpacing: ".04em" }}>YOU</div>}
                  </div>
                  <div style={{ fontFamily: "'Baloo 2',cursive", fontWeight: 800, fontSize: 16, color: "#2f6b34" }}>{displayScores[i]?.toString() ?? "0"} <span style={{ fontSize: 11, color: "#8a7256" }}>pts</span></div>
                </div>
              );
            })}
            {/* Show user's row when outside top 10 */}
            {address && myRank >= 10 && (
              <>
                <div style={{ padding: "6px 16px", textAlign: "center", fontSize: 16, color: "#c8b89a", letterSpacing: 4 }}>· · ·</div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: "#eef8e6", borderTop: "1px solid #cfe7bf" }}>
                  <div style={{ width: 26, textAlign: "center", fontFamily: "'Baloo 2',cursive", fontWeight: 800, fontSize: 15, color: "#2f6b34" }}>{myRank + 1}</div>
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: "#2f6b34", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 13, fontWeight: 800 }}>{address[2].toUpperCase()}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#2f6b34", fontFamily: "ui-monospace,monospace" }}>{address.slice(0,6)}…{address.slice(-4)}</div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "#357f2f", letterSpacing: ".04em" }}>YOU</div>
                  </div>
                  <div style={{ fontFamily: "'Baloo 2',cursive", fontWeight: 800, fontSize: 16, color: "#2f6b34" }}>{Number(myScore).toLocaleString()} <span style={{ fontSize: 11, color: "#8a7256" }}>pts</span></div>
                </div>
              </>
            )}
            {/* Outside top 50 */}
            {address && myRank === -1 && Number(myScore) > 0 && (
              <>
                <div style={{ padding: "6px 16px", textAlign: "center", fontSize: 16, color: "#c8b89a", letterSpacing: 4 }}>· · ·</div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: "#eef8e6", borderTop: "1px solid #cfe7bf" }}>
                  <div style={{ width: 26, textAlign: "center", fontFamily: "'Baloo 2',cursive", fontWeight: 800, fontSize: 15, color: "#8a7256" }}>—</div>
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: "#2f6b34", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 13, fontWeight: 800 }}>{address[2].toUpperCase()}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#2f6b34", fontFamily: "ui-monospace,monospace" }}>{address.slice(0,6)}…{address.slice(-4)}</div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "#357f2f", letterSpacing: ".04em" }}>YOU</div>
                  </div>
                  <div style={{ fontFamily: "'Baloo 2',cursive", fontWeight: 800, fontSize: 16, color: "#2f6b34" }}>{Number(myScore).toLocaleString()} <span style={{ fontSize: 11, color: "#8a7256" }}>pts</span></div>
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* Crop yields */}
      <div style={{ background: "#fffaf2", border: "1px solid #ece0cc", borderRadius: 20, padding: 16 }}>
        <div style={{ fontFamily: "'Baloo 2',cursive", fontWeight: 800, fontSize: 16, color: "#3a2e23", marginBottom: 10 }}>🌱 Crop yields</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))", gap: 8 }}>
          {CROP_NAMES.map((name, i) => {
            const mins = CROP_GROWTH_SECS[i] >= 3600
              ? `${Math.floor(CROP_GROWTH_SECS[i] / 3600)}h`
              : `${Math.floor(CROP_GROWTH_SECS[i] / 60)}m`;
            return (
              <div key={name} style={{ display: "flex", alignItems: "center", gap: 9, background: "#f7f0e2", border: "1px solid #e8dac2", borderRadius: 12, padding: "9px 11px" }}>
                <div style={{ fontSize: 18, flexShrink: 0 }}>{CROP_EMOJI[i]}</div>
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: "#3a2e23" }}>{name}</div>
                  <div style={{ fontSize: 11, color: "#357f2f", fontWeight: 700 }}>+{CROP_YIELD[i]} pts · {mins}{CROP_COST_USDM[i] > 0 ? ` · ${CROP_COST_USDM[i]} USDM` : " · Free"}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
