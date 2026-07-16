"use client";
import { useState } from "react";
import { useAccount, useConnect, useDisconnect, useReadContract, useChainId, useSwitchChain } from "wagmi";
import { celo } from "wagmi/chains";
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
  const chainId = useChainId();
  const { switchChain, isPending: switching } = useSwitchChain();
  const isWrongChain = isConnected && chainId !== celo.id;
  const [tab, setTab] = useState<Tab>("farm");
  const [guestMode, setGuestMode] = useState(false);
  const [showConnectPrompt, setShowConnectPrompt] = useState(false);

  function switchTab(t: Tab) {
    setTab(t);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleConnectRequest() {
    setShowConnectPrompt(true);
  }

  function doConnect() {
    setShowConnectPrompt(false);
    if (connectors[0]) connect({ connector: connectors[0] });
  }

  const { data: farmData, refetch: refetchFarm } = useReadContract({
    address: SHAMBA_ADDRESS, abi: SHAMBA_ABI, functionName: "farms",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const myScore   = farmData ? Number((farmData as readonly unknown[])[1] as bigint) : 0;
  const hasFarm   = farmData ? (farmData as readonly unknown[])[3] as boolean : false;

  const { data: getFarmData } = useReadContract({
    address: SHAMBA_ADDRESS, abi: SHAMBA_ABI, functionName: "getFarm",
    args: address ? [address] : undefined,
    query: { enabled: !!address && hasFarm, refetchInterval: 15000 },
  });
  const readyCount = getFarmData
    ? ((getFarmData as readonly unknown[])[3] as readonly number[]).filter(s => s === 2).length
    : 0;
  const level     = Math.floor(myScore / 150) + 1;
  const xpPct     = Math.round(((myScore % 150) / 150) * 100);
  const walletShort = address ? address.slice(0, 6) + "…" + address.slice(-4) : "";

  if (!isConnected && !guestMode) {
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
              <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
                <button
                  onClick={() => connectors[0] && connect({ connector: connectors[0] })}
                  style={{ fontFamily: "'Baloo 2',cursive", fontWeight: 700, fontSize: 19, color: "#fff", background: "linear-gradient(180deg,#5fa83f,#357f2f)", border: "none", padding: "16px 40px", borderRadius: 18, cursor: "pointer", boxShadow: "0 10px 24px -6px rgba(53,107,44,.6),inset 0 2px 0 rgba(255,255,255,.25)" }}>
                  👛 Connect Wallet
                </button>
                <button
                  onClick={() => setGuestMode(true)}
                  style={{ fontFamily: "'Baloo 2',cursive", fontWeight: 700, fontSize: 17, color: "#2f6b34", background: "rgba(255,255,255,.65)", border: "2px solid rgba(53,107,44,.3)", padding: "14px 28px", borderRadius: 18, cursor: "pointer", backdropFilter: "blur(4px)" }}>
                  👀 Try Demo
                </button>
              </div>
              <p style={{ fontSize: 13, color: "#7a6448", margin: "14px 0 0", fontWeight: 600 }}>Free to play · Gas fees under $0.01 · Built for MiniPay</p>
            </>
          )}

          {/* How to play */}
          <div style={{ marginTop: 32, display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, textAlign: "left" }}>
            {[
              { step: "1", icon: "🌱", title: "Claim your farm", desc: "One free transaction on Celo to mint your 6 plots." },
              { step: "2", icon: "💧", title: "Plant & water", desc: "Pick a crop, plant it, water it to grow 25% faster." },
              { step: "3", icon: "🏆", title: "Harvest & rank", desc: "Harvest to earn score points and climb the leaderboard." },
            ].map(({ step, icon, title, desc }) => (
              <div key={step} style={{ background: "rgba(255,255,255,.55)", border: "1px solid rgba(255,255,255,.7)", borderRadius: 16, padding: "12px 13px" }}>
                <div style={{ fontSize: 22, marginBottom: 5 }}>{icon}</div>
                <div style={{ fontSize: 12, fontWeight: 800, color: "#2f6b34", marginBottom: 3 }}>{title}</div>
                <div style={{ fontSize: 11, color: "#7a6448", lineHeight: 1.4 }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (guestMode && !isConnected) {
    return (
      <div style={{ minHeight: "100vh", background: "radial-gradient(120% 80% at 50% -10%,#fef4de 0%,#f6e7cc 46%,#eedaba 100%)", fontFamily: "'Plus Jakarta Sans',system-ui,sans-serif", color: "#3a2e23" }}>
        {/* Connect prompt modal */}
        {showConnectPrompt && (
          <div style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(0,0,0,.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={() => setShowConnectPrompt(false)}>
            <div style={{ background: "#fffaf2", borderRadius: 24, padding: 28, maxWidth: 360, width: "100%", textAlign: "center", boxShadow: "0 24px 60px -12px rgba(0,0,0,.45)" }} onClick={e => e.stopPropagation()}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🌾</div>
              <div style={{ fontFamily: "'Baloo 2',cursive", fontWeight: 800, fontSize: 22, color: "#2f6b34", marginBottom: 8 }}>Ready to farm for real?</div>
              <p style={{ fontSize: 14, color: "#7a6448", margin: "0 0 20px", lineHeight: 1.5 }}>Connect your wallet to claim your own farm, earn real score on Celo, and appear on the leaderboard.</p>
              <button onClick={doConnect} style={{ width: "100%", fontFamily: "'Baloo 2',cursive", fontWeight: 700, fontSize: 17, color: "#fff", background: "linear-gradient(180deg,#5fa83f,#357f2f)", border: "none", padding: "14px 24px", borderRadius: 14, cursor: "pointer", boxShadow: "0 8px 20px -6px rgba(53,107,44,.5)", marginBottom: 10 }}>
                👛 Connect Wallet
              </button>
              <button onClick={() => setShowConnectPrompt(false)} style={{ background: "none", border: "none", fontSize: 13, color: "#a08a6e", cursor: "pointer", fontWeight: 600 }}>Continue in demo</button>
            </div>
          </div>
        )}

        {/* Guest banner */}
        <div style={{ background: "linear-gradient(90deg,rgba(53,107,44,.12),rgba(53,107,44,.06))", borderBottom: "1px solid rgba(53,107,44,.2)", padding: "10px clamp(14px,3vw,26px)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 18 }}>👀</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#2f6b34" }}>Demo mode — actions won&apos;t save. Connect to play for real.</span>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => connectors[0] && connect({ connector: connectors[0] })} style={{ fontFamily: "'Baloo 2',cursive", fontWeight: 800, fontSize: 13, padding: "7px 18px", borderRadius: 10, border: "none", background: "#357f2f", color: "#fff", cursor: "pointer" }}>
              👛 Connect
            </button>
            <button onClick={() => setGuestMode(false)} style={{ background: "none", border: "1px solid rgba(53,107,44,.3)", fontSize: 12, fontWeight: 700, color: "#7a6448", padding: "7px 12px", borderRadius: 10, cursor: "pointer" }}>← Back</button>
          </div>
        </div>

        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "18px clamp(14px,3vw,26px) 60px" }}>
          <FarmView demo onConnectRequest={handleConnectRequest} />
        </div>
      </div>
    );
  }

  if (!isConnected || !hasFarm) {
    if (!isConnected) return null; // shouldn't reach; safety net
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
            <button onClick={() => switchTab("farm")} style={{ ...tabStyle("farm"), position: "relative" as const }}>
              🌾 Farm
              {readyCount > 0 && (
                <span style={{ position: "absolute", top: -5, right: -5, background: "#c8881a", color: "#fff", fontSize: 10, fontWeight: 800, lineHeight: 1, padding: "2px 5px", borderRadius: 99, minWidth: 16, textAlign: "center", animation: "pulseGlow .9s ease-in-out infinite" }}>
                  {readyCount}
                </span>
              )}
            </button>
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

      {isWrongChain && (
        <div style={{ background: "linear-gradient(90deg,rgba(192,57,43,.13),rgba(192,57,43,.07))", borderBottom: "2px solid rgba(192,57,43,.25)", padding: "12px clamp(14px,3vw,26px)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 22 }}>⛓️</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#c0392b" }}>You&apos;re on the wrong network</div>
              <div style={{ fontSize: 12, color: "#a03020" }}>Shamba lives on Celo. Switch to start farming.</div>
            </div>
          </div>
          <button
            onClick={() => switchChain({ chainId: celo.id })}
            disabled={switching}
            style={{ fontFamily: "'Baloo 2',cursive", fontWeight: 800, fontSize: 13, padding: "8px 20px", borderRadius: 12, border: "2px solid rgba(192,57,43,.4)", background: switching ? "rgba(192,57,43,.15)" : "#c0392b", color: switching ? "#c0392b" : "#fff", cursor: switching ? "wait" : "pointer", transition: "all .15s" }}
          >
            {switching ? "Switching…" : "⚡ Switch to Celo"}
          </button>
        </div>
      )}

      <div className="has-mobile-nav" style={{ maxWidth: 1180, margin: "0 auto", padding: "18px clamp(14px,3vw,26px) 60px", opacity: isWrongChain ? 0.4 : 1, pointerEvents: isWrongChain ? "none" : "auto", transition: "opacity .2s" }}>
        {tab === "farm"    && <FarmView />}
        {tab === "board"   && <Leaderboard />}
        {tab === "friends" && <Friends />}
      </div>

      {/* Mobile bottom nav */}
      <nav className="mobile-nav">
        {([["farm","🌾","Farm"],["board","🏆","Rankings"],["friends","🤝","Friends"]] as [Tab,string,string][]).map(([t,icon,label]) => (
          <button key={t} className={tab === t ? "active" : ""} onClick={() => switchTab(t)} style={{ position: "relative" }}>
            <span className="icon">{icon}</span>
            {label}
            {t === "farm" && readyCount > 0 && (
              <span style={{ position: "absolute", top: 2, right: 6, background: "#c8881a", color: "#fff", fontSize: 9, fontWeight: 800, padding: "1px 4px", borderRadius: 99 }}>{readyCount}</span>
            )}
          </button>
        ))}
      </nav>
    </div>
  );
}
