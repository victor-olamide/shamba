"use client";
import { useState } from "react";
import { useAccount, useConnect, useDisconnect, useReadContract } from "wagmi";
import CreateFarm from "@/components/CreateFarm";
import FarmView from "@/components/FarmView";
import Leaderboard from "@/components/Leaderboard";
import Friends from "@/components/Friends";
import { SHAMBA_ADDRESS, SHAMBA_ABI } from "@/lib/contracts";
import { RenderPlant } from "@/components/PlantArt";
import { isMiniPay } from "./providers";

type Tab = "farm" | "board" | "friends";

export default function Home() {
  const { isConnected, address } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const [tab, setTab] = useState<Tab>("farm");

  function switchTab(t: Tab) {
    setTab(t);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const { data: farmData, refetch: refetchFarm } = useReadContract({
    address: SHAMBA_ADDRESS, abi: SHAMBA_ABI, functionName: "farms",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const myScore   = farmData ? Number((farmData as readonly unknown[])[1] as bigint) : 0;
  const hasFarm   = farmData ? (farmData as readonly unknown[])[3] as boolean : false;
  const level     = Math.floor(myScore / 150) + 1;
  const xpPct     = Math.round(((myScore % 150) / 150) * 100);
  const walletShort = address ? address.slice(0, 6) + "…" + address.slice(-4) : "";

  if (!isConnected) {
    const inMiniPay = isMiniPay();
    return (
      <div style={{ position: "relative", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 20px", overflow: "hidden", background: "linear-gradient(180deg,#bfe6f2 0%,#dff0d6 40%,#e9d9b6 64%,#caa46e 100%)" }}>
        {/* Sun */}
        <div style={{ position: "absolute", top: "7%", right: "9%", width: 118, height: 118, borderRadius: "50%", background: "radial-gradient(circle,#fff3c2 0%,#ffd860 55%,#f6b929 100%)", boxShadow: "0 0 70px 24px rgba(255,210,90,.55)", animation: "sunpulse 5s ease-in-out infinite" }} />
        {/* Clouds */}
        <div style={{ position: "absolute", top: "16%", left: "8%", width: 120, height: 34, borderRadius: 30, background: "rgba(255,255,255,.85)", filter: "blur(1px)", animation: "drift 14s ease-in-out infinite alternate" }} />
        <div style={{ position: "absolute", top: "28%", left: "24%", width: 80, height: 26, borderRadius: 30, background: "rgba(255,255,255,.7)", filter: "blur(1px)", animation: "drift 18s ease-in-out infinite alternate-reverse" }} />
        {/* Floating particles */}
        <div style={{ position: "absolute", bottom: "30%", left: "18%", width: 7, height: 7, borderRadius: "50%", background: "#fff7d6", animation: "floaty 9s ease-in infinite" }} />
        <div style={{ position: "absolute", bottom: "34%", left: "62%", width: 6, height: 6, borderRadius: "50%", background: "#fff7d6", animation: "floaty 11s ease-in 1.5s infinite" }} />
        <div style={{ position: "absolute", bottom: "40%", left: "80%", width: 5, height: 5, borderRadius: "50%", background: "#fff7d6", animation: "floaty 8s ease-in 3s infinite" }} />

        <div style={{ position: "relative", zIndex: 3, textAlign: "center", maxWidth: 560 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,.55)", border: "1px solid rgba(255,255,255,.7)", padding: "6px 14px", borderRadius: 30, fontSize: 12, fontWeight: 700, color: "#357f2f", letterSpacing: ".03em", marginBottom: 18 }}>
            🌍 ON-CHAIN IDLE FARMING · CELO
          </div>
          <h1 style={{ fontFamily: "'Baloo 2',cursive", fontWeight: 800, fontSize: "clamp(56px,12vw,104px)", lineHeight: 0.92, margin: 0, color: "#2f6b34", textShadow: "0 4px 0 rgba(255,255,255,.5),0 16px 30px rgba(53,107,44,.25)" }}>
            Shamba
          </h1>
          <p style={{ fontSize: "clamp(17px,3.4vw,22px)", fontWeight: 600, color: "#5a4631", margin: "14px 0 0" }}>
            Plant. Water. Harvest. <span style={{ color: "#c8881a" }}>Climb the ranks.</span>
          </p>
          <p style={{ fontSize: 15, color: "#7a6448", margin: "10px 0 0", lineHeight: 1.5 }}>
            A cozy little farm that lives on the blockchain. Tend six plots, boost your crops, and out-grow every farmer on Celo.
          </p>

          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: "clamp(6px,2vw,16px)", margin: "34px auto 30px", height: 96, padding: "0 10px 14px", borderRadius: 20, background: "linear-gradient(180deg,transparent,rgba(122,82,52,.18))" }}>
            {[0, 1, 3, 2, 4].map((crop, i) => (
              <div key={i} style={{ position: "relative", width: 46, height: 90 }}>
                <RenderPlant cropIdx={crop} progress={1} ready={true} />
              </div>
            ))}
          </div>

          {inMiniPay ? (
            <p style={{ fontSize: 15, color: "#7a6448", margin: "14px 0 0", fontWeight: 600 }}>Connecting your MiniPay wallet…</p>
          ) : (
            <>
              <button
                onClick={() => connectors[0] && connect({ connector: connectors[0] })}
                style={{ fontFamily: "'Baloo 2',cursive", fontWeight: 700, fontSize: 19, color: "#fff", background: "linear-gradient(180deg,#5fa83f,#357f2f)", border: "none", padding: "16px 40px", borderRadius: 18, cursor: "pointer", boxShadow: "0 10px 24px -6px rgba(53,107,44,.6),inset 0 2px 0 rgba(255,255,255,.25)" }}>
                👛 Connect Wallet
              </button>
              <p style={{ fontSize: 13, color: "#7a6448", margin: "14px 0 0", fontWeight: 600 }}>Free to play · No gas needed · Built for MiniPay</p>
            </>
          )}

          <div style={{ display: "flex", justifyContent: "center", gap: 26, marginTop: 30, flexWrap: "wrap" }}>
            {[
              { n: "12,480", label: "FARMS PLANTED",    c: "#2f6b34" },
              { n: "3.2M",   label: "CROPS HARVESTED",  c: "#c8881a" },
              { n: "5",      label: "CROPS TO MASTER",  c: "#4a9ed1" },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "'Baloo 2',cursive", fontWeight: 800, fontSize: 24, color: s.c }}>{s.n}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#8a7256", letterSpacing: ".04em" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!hasFarm) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 18px", background: "radial-gradient(120% 80% at 50% -10%,#fef4de 0%,#f6e7cc 46%,#eedaba 100%)" }}>
        <CreateFarm onCreated={refetchFarm} />
      </div>
    );
  }

  const tabStyle = (t: Tab) => ({
    fontFamily: "'Plus Jakarta Sans',sans-serif",
    fontWeight: 700, fontSize: 13,
    border: "none", padding: "8px 15px", borderRadius: 11, cursor: "pointer", whiteSpace: "nowrap" as const,
    transition: "all .15s ease",
    background: tab === t ? "#fffaf2" : "transparent",
    color:      tab === t ? "#2f6b34" : "#8a7256",
    boxShadow:  tab === t ? "0 3px 8px -3px rgba(122,82,52,.45)" : "none",
  });

  return (
    <div style={{ minHeight: "100vh", background: "radial-gradient(120% 80% at 50% -10%,#fef4de 0%,#f6e7cc 46%,#eedaba 100%)", fontFamily: "'Plus Jakarta Sans',system-ui,sans-serif", color: "#3a2e23" }}>
      <div style={{ position: "sticky", top: 0, zIndex: 60, background: "rgba(255,250,242,.88)", backdropFilter: "blur(12px)", borderBottom: "1px solid #ece0cc" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "11px clamp(14px,3vw,26px)", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginRight: "auto", cursor: "pointer" }} onClick={() => setTab("farm")}>
            <div style={{ width: 40, height: 40, borderRadius: 13, background: "linear-gradient(145deg,#6db04e,#357f2f)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 14px -4px rgba(53,107,44,.5)", fontSize: 20 }}>🌾</div>
            <div>
              <div style={{ fontFamily: "'Baloo 2',cursive", fontWeight: 800, fontSize: 21, lineHeight: 1, color: "#357f2f" }}>Shamba</div>
              <div style={{ fontSize: 10, color: "#a08a6e", fontWeight: 700, letterSpacing: ".06em" }}>IDLE FARM · CELO</div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 3, background: "#f0e3cd", padding: 4, borderRadius: 14 }}>
            <button onClick={() => switchTab("farm")}    style={tabStyle("farm")}>🌾 Farm</button>
            <button onClick={() => switchTab("board")}   style={tabStyle("board")}>🏆 Rankings</button>
            <button onClick={() => switchTab("friends")} style={tabStyle("friends")}>🤝 Friends</button>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#eaf5e2", border: "1px solid #cfe7bf", padding: "5px 10px", borderRadius: 11 }}>
              <div style={{ fontFamily: "'Baloo 2',cursive", fontWeight: 800, fontSize: 13, color: "#357f2f", whiteSpace: "nowrap" }}>Lv {level}</div>
              <div style={{ width: 46, height: 6, background: "#cfe7bf", borderRadius: 4, overflow: "hidden" }}>
                <div style={{ height: "100%", width: xpPct + "%", background: "linear-gradient(90deg,#6db04e,#357f2f)", borderRadius: 4, transition: "width .5s ease" }} />
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4, background: "#f0e3cd", padding: "4px 10px 4px 6px", borderRadius: 11 }} title={address}>
              <div style={{ width: 24, height: 24, borderRadius: 8, background: "linear-gradient(135deg,#8a5e3b,#5e3d24)", flexShrink: 0 }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: "#7a6448", fontFamily: "ui-monospace,monospace" }}>{walletShort}</span>
            </div>
            <button
              onClick={() => disconnect()}
              style={{ fontSize: 11, fontWeight: 700, color: "#a08a6e", background: "none", border: "1px solid #e3d4ba", padding: "5px 10px", borderRadius: 9, cursor: "pointer", whiteSpace: "nowrap", transition: "color .15s,border-color .15s" }}
              onMouseEnter={e => { e.currentTarget.style.color = "#c0392b"; e.currentTarget.style.borderColor = "rgba(192,57,43,.4)"; }}
              onMouseLeave={e => { e.currentTarget.style.color = "#a08a6e"; e.currentTarget.style.borderColor = "#e3d4ba"; }}
            >
              Disconnect
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "18px clamp(14px,3vw,26px) 60px" }}>
        {tab === "farm"    && <FarmView />}
        {tab === "board"   && <Leaderboard />}
        {tab === "friends" && <Friends />}
      </div>
    </div>
  );
}
