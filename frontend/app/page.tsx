"use client";
import { useState } from "react";
import { useAccount, useConnect, useDisconnect, useReadContract, useChainId, useSwitchChain } from "wagmi";
import { celo } from "wagmi/chains";
import CreateFarm from "@/components/CreateFarm";
import FarmView from "@/components/FarmView";
import Leaderboard from "@/components/Leaderboard";
import Friends from "@/components/Friends";
import { SHAMBA_ADDRESS, SHAMBA_ABI, CROP_NAMES, CROP_EMOJI, CROP_GROWTH_SECS, CROP_YIELD, CROP_COST_USDM } from "@/lib/contracts";
import { RenderPlant, CropEmblem } from "@/components/PlantArt";
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
    const growthFmt = (secs: number) => {
      const h = Math.floor(secs / 3600), m = Math.floor((secs % 3600) / 60);
      return h > 0 ? `${h}h${m > 0 ? ` ${m}m` : ""}` : `${m}m`;
    };
    const ctaBtns = (
      <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
        <button onClick={() => connectors[0] && connect({ connector: connectors[0] })}
          style={{ fontFamily: "'Baloo 2',cursive", fontWeight: 700, fontSize: 18, color: "#fff", background: "linear-gradient(180deg,#5fa83f,#357f2f)", border: "none", padding: "15px 38px", borderRadius: 18, cursor: "pointer", boxShadow: "0 10px 24px -6px rgba(53,107,44,.6),inset 0 2px 0 rgba(255,255,255,.25)" }}>
          👛 Connect Wallet
        </button>
        <button onClick={() => setGuestMode(true)}
          style={{ fontFamily: "'Baloo 2',cursive", fontWeight: 700, fontSize: 17, color: "#2f6b34", background: "rgba(255,255,255,.7)", border: "2px solid rgba(53,107,44,.35)", padding: "13px 28px", borderRadius: 18, cursor: "pointer", backdropFilter: "blur(4px)" }}>
          Try Demo
        </button>
      </div>
    );

    return (
      <div style={{ fontFamily: "'Plus Jakarta Sans',system-ui,sans-serif", color: "#3a2e23" }}>

        {/* ══ HERO ═══════════════════════════════════════════════════════════ */}
        <section style={{ position: "relative", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "70px 24px 90px", overflow: "hidden", background: "linear-gradient(180deg,#87ceeb 0%,#c8edaa 32%,#e9d9b6 60%,#caa46e 100%)" }}>
          <div style={{ position: "absolute", top: "6%", right: "8%", width: 110, height: 110, borderRadius: "50%", background: "radial-gradient(circle,#fffde0 0%,#ffe066 50%,#f6b929 100%)", boxShadow: "0 0 70px 24px rgba(255,210,90,.55)", animation: "sunpulse 5s ease-in-out infinite" }} />
          <div style={{ position: "absolute", top: "14%", left: "7%", width: 130, height: 36, borderRadius: 30, background: "rgba(255,255,255,.88)", filter: "blur(1px)", animation: "drift 14s ease-in-out infinite alternate" }} />
          <div style={{ position: "absolute", top: "22%", left: "22%", width: 86, height: 26, borderRadius: 28, background: "rgba(255,255,255,.72)", filter: "blur(1px)", animation: "drift 18s ease-in-out infinite alternate-reverse" }} />
          <div style={{ position: "absolute", top: "18%", right: "22%", width: 60, height: 20, borderRadius: 24, background: "rgba(255,255,255,.65)", filter: "blur(.8px)", animation: "drift 22s ease-in-out 3s infinite alternate" }} />
          {/* Grass horizon */}
          <div style={{ position: "absolute", bottom: "26%", left: 0, right: 0, height: 24, background: "linear-gradient(180deg,#4a9a28,#3c7c20)", borderTop: "3px solid #5ab030", borderBottom: "2px solid #2e5e18" }} />
          <div style={{ position: "absolute", bottom: "30%", left: 0, right: 0, height: 6, background: "#5ab030", opacity: 0.4 }} />
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "26%", background: "linear-gradient(180deg,#6b4a28,#4a2f12)" }} />
          {/* Floating pollen dots */}
          <div style={{ position: "absolute", bottom: "36%", left: "16%", width: 7, height: 7, borderRadius: "50%", background: "#fff7d6", animation: "floaty 9s ease-in infinite" }} />
          <div style={{ position: "absolute", bottom: "40%", left: "64%", width: 5, height: 5, borderRadius: "50%", background: "#fff7d6", animation: "floaty 11s ease-in 1.5s infinite" }} />
          <div style={{ position: "absolute", bottom: "38%", left: "82%", width: 6, height: 6, borderRadius: "50%", background: "#fff7d6", animation: "floaty 8s ease-in 3s infinite" }} />

          <div style={{ position: "relative", zIndex: 3, textAlign: "center", maxWidth: 620 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,.55)", border: "1px solid rgba(255,255,255,.75)", padding: "6px 16px", borderRadius: 30, fontSize: 12, fontWeight: 700, color: "#357f2f", letterSpacing: ".04em", marginBottom: 20 }}>
              🌍 ON-CHAIN IDLE FARMING · CELO
            </div>
            <h1 style={{ fontFamily: "'Baloo 2',cursive", fontWeight: 800, fontSize: "clamp(56px,12vw,108px)", lineHeight: 0.9, margin: 0, color: "#1e5228", textShadow: "0 4px 0 rgba(255,255,255,.5),0 14px 28px rgba(30,82,40,.3)" }}>
              Shamba
            </h1>
            <p style={{ fontSize: "clamp(17px,3.5vw,23px)", fontWeight: 600, color: "#5a4631", margin: "16px 0 0" }}>
              Plant. Water. Harvest. <span style={{ color: "#c8881a" }}>Climb the ranks.</span>
            </p>
            <p style={{ fontSize: 15, color: "#6a5640", margin: "12px 0 0", lineHeight: 1.7, maxWidth: 520, marginLeft: "auto", marginRight: "auto" }}>
              An on-chain idle farming game on Celo. Grow 5 different crops, water them for faster harvests, and compete on a global leaderboard — all for less than a cent in gas fees.
            </p>

            {/* Crop showcase */}
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: "clamp(8px,2.5vw,20px)", margin: "32px auto 30px", height: 100, padding: "0 12px 14px", borderRadius: 24, background: "linear-gradient(180deg,transparent,rgba(122,82,52,.2)" }}>
              {[4, 0, 3, 1, 2].map((crop, i) => (
                <div key={i} style={{ position: "relative", width: 52, height: 96 }}>
                  <RenderPlant cropIdx={crop} progress={1} ready={true} />
                </div>
              ))}
            </div>

            {inMiniPay ? (
              <p style={{ fontSize: 15, color: "#6a5640", fontWeight: 600 }}>Connecting your MiniPay wallet…</p>
            ) : ctaBtns}
            <p style={{ fontSize: 13, color: "#8a7458", margin: "14px 0 0", fontWeight: 600 }}>Free to play · Gas under $0.01 · Works in MiniPay</p>
          </div>

          <div style={{ position: "absolute", bottom: 22, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 5, animation: "floaty 3s ease-in-out infinite" }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: "rgba(90,70,49,.55)", letterSpacing: ".08em" }}>SCROLL TO LEARN MORE</span>
            <svg width="14" height="8" viewBox="0 0 14 8" fill="none"><path d="M1 1l6 6 6-6" stroke="rgba(90,70,49,.5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
        </section>

        {/* ══ WHAT IS SHAMBA ════════════════════════════════════════════════ */}
        <section style={{ background: "#fffaf2", padding: "clamp(52px,8vw,80px) clamp(20px,4vw,32px)" }}>
          <div style={{ maxWidth: 980, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 44 }}>
              <div style={{ display: "inline-block", fontSize: 11, fontWeight: 800, letterSpacing: ".1em", color: "#357f2f", background: "#eaf5e2", padding: "4px 12px", borderRadius: 99, marginBottom: 14 }}>ABOUT THE GAME</div>
              <h2 style={{ fontFamily: "'Baloo 2',cursive", fontWeight: 800, fontSize: "clamp(26px,5vw,38px)", color: "#1e5228", margin: "0 0 14px" }}>What is Shamba?</h2>
              <p style={{ fontSize: 16, color: "#7a6448", maxWidth: 600, margin: "0 auto", lineHeight: 1.75 }}>
                Shamba (Swahili for &ldquo;farm&rdquo;) is an idle farming game where every action — planting, watering, harvesting — is a real on-chain transaction on Celo. Your farm is yours forever, stored permanently on the blockchain. No servers, no logins, no middlemen.
              </p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", gap: 16 }}>
              {[
                { icon: "🌾", title: "Idle Farming", desc: "Plant crops and come back later to harvest. Your crops grow on-chain while you're away — no need to stay online." },
                { icon: "⛓️", title: "100% On-Chain", desc: "Every plot, every harvest, every score is stored on Celo. No central servers that can shut down or delete your progress." },
                { icon: "🏆", title: "Global Leaderboard", desc: "Every harvest earns score points. Compete with real farmers worldwide — rankings update live on-chain." },
                { icon: "🤝", title: "Refer & Earn", desc: "Share your referral link. When friends you invite harvest crops, you automatically earn 10% of their points — forever." },
              ].map(({ icon, title, desc }) => (
                <div key={title} style={{ background: "#f7f0e2", border: "1px solid #ece0cc", borderRadius: 20, padding: "22px 18px" }}>
                  <div style={{ fontSize: 32, marginBottom: 10 }}>{icon}</div>
                  <div style={{ fontFamily: "'Baloo 2',cursive", fontWeight: 800, fontSize: 17, color: "#1e5228", marginBottom: 8 }}>{title}</div>
                  <div style={{ fontSize: 13.5, color: "#7a6448", lineHeight: 1.65 }}>{desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ HOW TO PLAY ════════════════════════════════════════════════════ */}
        <section style={{ background: "#f2e9d4", padding: "clamp(52px,8vw,80px) clamp(20px,4vw,32px)" }}>
          <div style={{ maxWidth: 980, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 44 }}>
              <div style={{ display: "inline-block", fontSize: 11, fontWeight: 800, letterSpacing: ".1em", color: "#9a6a14", background: "#fdf0d0", padding: "4px 12px", borderRadius: 99, marginBottom: 14 }}>HOW TO PLAY</div>
              <h2 style={{ fontFamily: "'Baloo 2',cursive", fontWeight: 800, fontSize: "clamp(26px,5vw,38px)", color: "#1e5228", margin: 0 }}>Four simple steps</h2>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 720, margin: "0 auto" }}>
              {[
                {
                  n: "01", icon: "🌾", title: "Create your farm",
                  desc: "Connect your Celo wallet and tap Create Farm — one free transaction mints your personal 6-plot field on-chain. You only do this once, and your farm is yours forever.",
                  badge: "One-time setup · Gas under $0.001",
                },
                {
                  n: "02", icon: "🌱", title: "Choose a crop and plant",
                  desc: "Tap any empty plot to open the crop picker. Choose from 5 different crops — each has a different grow time and score yield. Four crops are completely free to plant.",
                  badge: "4 free crops · 1 premium crop (0.05 cUSD)",
                },
                {
                  n: "03", icon: "💧", title: "Water your crops",
                  desc: "After planting, water your crops to grow them 25% faster. Use Water All to water every growing plot with a single wallet signature instead of one per plot.",
                  badge: "Water = 25% speed boost · Batch with one signature",
                },
                {
                  n: "04", icon: "🏆", title: "Harvest and climb the leaderboard",
                  desc: "When crops are ready, tap Harvest (or Harvest All). Each harvest earns score points that go live on the global leaderboard instantly. The more you harvest, the higher you rank.",
                  badge: "Points scale with crop difficulty",
                },
              ].map(({ n, icon, title, desc, badge }) => (
                <div key={n} style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                  <div style={{ width: 54, height: 54, borderRadius: 18, background: "linear-gradient(145deg,#6db04e,#2f6b34)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0, boxShadow: "0 6px 14px -4px rgba(53,107,44,.45)" }}>{icon}</div>
                  <div style={{ background: "rgba(255,255,255,.62)", border: "1px solid rgba(255,255,255,.85)", borderRadius: 18, padding: "16px 20px", flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 8 }}>
                      <span style={{ fontFamily: "ui-monospace,monospace", fontSize: 11, fontWeight: 800, color: "#b8a080" }}>{n}</span>
                      <span style={{ fontFamily: "'Baloo 2',cursive", fontWeight: 800, fontSize: 18, color: "#1e5228" }}>{title}</span>
                    </div>
                    <p style={{ fontSize: 14, color: "#7a6448", margin: "0 0 10px", lineHeight: 1.7 }}>{desc}</p>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#3f7a28", background: "#eaf5e2", padding: "4px 10px", borderRadius: 99, display: "inline-block" }}>✓ {badge}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ CROPS ═════════════════════════════════════════════════════════ */}
        <section style={{ background: "#edf6e5", padding: "clamp(52px,8vw,80px) clamp(20px,4vw,32px)" }}>
          <div style={{ maxWidth: 980, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 44 }}>
              <div style={{ display: "inline-block", fontSize: 11, fontWeight: 800, letterSpacing: ".1em", color: "#357f2f", background: "rgba(255,255,255,.7)", padding: "4px 12px", borderRadius: 99, marginBottom: 14 }}>CROPS</div>
              <h2 style={{ fontFamily: "'Baloo 2',cursive", fontWeight: 800, fontSize: "clamp(26px,5vw,38px)", color: "#1e5228", margin: "0 0 12px" }}>5 crops to grow</h2>
              <p style={{ fontSize: 15, color: "#7a6448", maxWidth: 480, margin: "0 auto" }}>Each crop has a different grow time and point yield. Water any crop to cut its grow time by 25%.</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(155px,1fr))", gap: 14 }}>
              {CROP_NAMES.map((name, i) => (
                <div key={i} style={{ background: "#fffaf2", border: `2px solid ${i === 4 ? "#d4a832" : "#d4eac4"}`, borderRadius: 20, padding: "20px 14px", textAlign: "center", position: "relative" }}>
                  {i === 4 && (
                    <div style={{ position: "absolute", top: -11, left: "50%", transform: "translateX(-50%)", background: "linear-gradient(90deg,#c8a020,#f0c040)", color: "#5a3c08", fontSize: 10, fontWeight: 800, padding: "3px 10px", borderRadius: 99, whiteSpace: "nowrap" }}>✦ PREMIUM</div>
                  )}
                  <div style={{ fontSize: 44, marginBottom: 6, filter: "drop-shadow(0 2px 4px rgba(0,0,0,.15))" }}>{CROP_EMOJI[i]}</div>
                  <div style={{ fontFamily: "'Baloo 2',cursive", fontWeight: 800, fontSize: 17, color: "#1e5228", marginBottom: 10 }}>{name}</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#7a6448", background: "#f2e9d4", borderRadius: 8, padding: "4px 9px" }}>
                      <span>⏱ Grow</span><span style={{ fontWeight: 700 }}>{growthFmt(CROP_GROWTH_SECS[i])}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#4a7a9a", background: "#e8f4fc", borderRadius: 8, padding: "4px 9px" }}>
                      <span>💧 Watered</span><span style={{ fontWeight: 700 }}>{growthFmt(Math.round(CROP_GROWTH_SECS[i] * 0.75))}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#3a7a28", background: "#eaf5e2", borderRadius: 8, padding: "4px 9px", fontWeight: 700 }}>
                      <span>🏆 Score</span><span>+{CROP_YIELD[i]} pts</span>
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: CROP_COST_USDM[i] > 0 ? "#9a6a14" : "#3a7a28", marginTop: 2 }}>
                      {CROP_COST_USDM[i] > 0 ? `${CROP_COST_USDM[i]} cUSD to plant` : "Free to plant"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <p style={{ textAlign: "center", fontSize: 13, color: "#6a9a60", marginTop: 22, fontWeight: 600 }}>
              💡 Longer grow time = bigger score reward. Water all plots to save time.
            </p>
          </div>
        </section>

        {/* ══ EARN & REFER ══════════════════════════════════════════════════ */}
        <section style={{ background: "linear-gradient(135deg,#1e5228 0%,#2f6b34 50%,#1a4d22 100%)", padding: "clamp(52px,8vw,80px) clamp(20px,4vw,32px)" }}>
          <div style={{ maxWidth: 980, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 44 }}>
              <div style={{ display: "inline-block", fontSize: 11, fontWeight: 800, letterSpacing: ".1em", color: "#a8d88a", background: "rgba(255,255,255,.12)", padding: "4px 12px", borderRadius: 99, marginBottom: 14 }}>EARN MORE</div>
              <h2 style={{ fontFamily: "'Baloo 2',cursive", fontWeight: 800, fontSize: "clamp(26px,5vw,38px)", color: "#fff", margin: "0 0 14px" }}>Grow your score, grow your network</h2>
              <p style={{ fontSize: 15, color: "rgba(255,255,255,.75)", maxWidth: 520, margin: "0 auto", lineHeight: 1.7 }}>
                Every harvest adds to your score. Invite friends and earn passive points every time they harvest — no extra effort needed.
              </p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 20 }}>
              <div style={{ background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.16)", borderRadius: 22, padding: "26px 22px" }}>
                <div style={{ fontSize: 38, marginBottom: 12 }}>🌾</div>
                <div style={{ fontFamily: "'Baloo 2',cursive", fontWeight: 800, fontSize: 20, color: "#fff", marginBottom: 10 }}>Harvest to earn points</div>
                <p style={{ fontSize: 14, color: "rgba(255,255,255,.75)", lineHeight: 1.7, margin: "0 0 16px" }}>
                  Every crop you harvest earns score points that appear live on the global leaderboard. The more you harvest, the higher you rank.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                  {CROP_NAMES.map((n, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13, color: "rgba(255,255,255,.85)", background: "rgba(255,255,255,.06)", padding: "5px 10px", borderRadius: 8 }}>
                      <span>{CROP_EMOJI[i]} {n}</span>
                      <span style={{ fontWeight: 700, color: "#f0d070" }}>+{CROP_YIELD[i]} pts</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.16)", borderRadius: 22, padding: "26px 22px" }}>
                <div style={{ fontSize: 38, marginBottom: 12 }}>🤝</div>
                <div style={{ fontFamily: "'Baloo 2',cursive", fontWeight: 800, fontSize: 20, color: "#fff", marginBottom: 10 }}>Invite friends, earn passively</div>
                <p style={{ fontSize: 14, color: "rgba(255,255,255,.75)", lineHeight: 1.7, margin: "0 0 16px" }}>
                  Every farmer gets a unique referral link. Share it with friends. When they harvest, you automatically earn 10% of their score — forever, with no extra steps.
                </p>
                <div style={{ background: "rgba(255,255,255,.1)", border: "1px solid rgba(255,255,255,.15)", borderRadius: 14, padding: "14px 16px", fontSize: 13, color: "rgba(255,255,255,.9)", lineHeight: 1.7 }}>
                  <div style={{ fontWeight: 700, marginBottom: 6, color: "#f0d070" }}>Example:</div>
                  Friend you invited harvests Cassava<br/>
                  → They earn <span style={{ fontWeight: 700 }}>+40 pts</span><br/>
                  → You earn <span style={{ fontWeight: 700, color: "#a8d88a" }}>+4 pts automatically 🎉</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══ WHY CELO ══════════════════════════════════════════════════════ */}
        <section style={{ background: "#fffaf2", padding: "clamp(52px,8vw,80px) clamp(20px,4vw,32px)" }}>
          <div style={{ maxWidth: 980, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 44 }}>
              <div style={{ display: "inline-block", fontSize: 11, fontWeight: 800, letterSpacing: ".1em", color: "#357f2f", background: "#eaf5e2", padding: "4px 12px", borderRadius: 99, marginBottom: 14 }}>WHY CELO</div>
              <h2 style={{ fontFamily: "'Baloo 2',cursive", fontWeight: 800, fontSize: "clamp(26px,5vw,38px)", color: "#1e5228", margin: "0 0 14px" }}>Built for mobile. Built for real people.</h2>
              <p style={{ fontSize: 15, color: "#7a6448", maxWidth: 540, margin: "0 auto", lineHeight: 1.7 }}>
                Most blockchain games are clunky and expensive. Shamba runs on Celo — a mobile-first blockchain where every transaction costs a fraction of a cent.
              </p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 16, marginBottom: 44 }}>
              {[
                { icon: "⚡", title: "Gas under $0.01", desc: "Every action on Shamba costs a fraction of a cent. Plant 6 crops, water them, harvest them — total gas well under $0.10." },
                { icon: "📱", title: "Works in MiniPay", desc: "Shamba is built for MiniPay — Celo's mobile-first wallet. Connect, tap, farm. No complex bridging or network switching." },
                { icon: "🔒", title: "Yours forever", desc: "Your farm lives on Celo's blockchain permanently. No servers to go down, no company that can delete your account or progress." },
                { icon: "🌍", title: "Carbon-negative", desc: "Celo is one of the most eco-friendly blockchains. Your farming hobby doesn't cost the earth — literally." },
              ].map(({ icon, title, desc }) => (
                <div key={title} style={{ background: "#f7f0e2", border: "1px solid #ece0cc", borderRadius: 20, padding: "20px 18px" }}>
                  <div style={{ width: 46, height: 46, borderRadius: 14, background: "#eaf5e2", border: "1px solid #cfe7bf", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, marginBottom: 12 }}>{icon}</div>
                  <div style={{ fontFamily: "'Baloo 2',cursive", fontWeight: 800, fontSize: 16, color: "#1e5228", marginBottom: 8 }}>{title}</div>
                  <div style={{ fontSize: 13.5, color: "#7a6448", lineHeight: 1.65 }}>{desc}</div>
                </div>
              ))}
            </div>

            {/* FAQ */}
            <div style={{ maxWidth: 720, margin: "0 auto" }}>
              <h3 style={{ fontFamily: "'Baloo 2',cursive", fontWeight: 800, fontSize: 24, color: "#1e5228", textAlign: "center", marginBottom: 20 }}>Common questions</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { q: "Do I need CELO tokens to play?", a: "Four of the five crops are completely free to plant. You only need 0.05 cUSD to plant Golden Wheat — the highest-yield crop. You will need a small CELO balance for gas (under $0.01 per action)." },
                  { q: "What wallet do I need?", a: "Any Celo-compatible wallet works — MiniPay, MetaMask (with Celo network added), or Valora. MiniPay users get the smoothest experience since the game is optimized for it." },
                  { q: "Will my farm disappear if the game shuts down?", a: "No. Your farm data lives on the Celo blockchain permanently. The game is just a UI on top — your plots, score, and harvests exist independently and forever." },
                  { q: "Can I play from a desktop browser?", a: "Yes. Connect with MetaMask on the Celo network (chainId 42220) from any desktop browser. The game is mobile-optimized but fully functional on desktop." },
                  { q: "What is an idle game?", a: "Idle games are games where progress happens over time while you're away. You plant crops, close the app, and come back later to harvest. No real-time action required." },
                ].map(({ q, a }) => (
                  <div key={q} style={{ background: "#f7f0e2", border: "1px solid #ece0cc", borderRadius: 16, padding: "16px 18px" }}>
                    <div style={{ fontFamily: "'Baloo 2',cursive", fontWeight: 700, fontSize: 15, color: "#1e5228", marginBottom: 7 }}>Q: {q}</div>
                    <div style={{ fontSize: 14, color: "#7a6448", lineHeight: 1.7 }}>{a}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ══ FINAL CTA ══════════════════════════════════════════════════════ */}
        <section style={{ position: "relative", padding: "clamp(60px,10vw,96px) 24px", textAlign: "center", overflow: "hidden", background: "linear-gradient(180deg,#87ceeb 0%,#c8edaa 32%,#e9d9b6 60%,#caa46e 100%)" }}>
          <div style={{ position: "absolute", top: "14%", right: "10%", width: 80, height: 80, borderRadius: "50%", background: "radial-gradient(circle,#fffde0,#ffe066 55%,#f6b929)", boxShadow: "0 0 40px 12px rgba(255,210,90,.45)", animation: "sunpulse 5s ease-in-out infinite" }} />
          <div style={{ position: "absolute", bottom: "28%", left: 0, right: 0, height: 20, background: "linear-gradient(180deg,#4a9a28,#3c7c20)" }} />
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "28%", background: "linear-gradient(180deg,#6b4a28,#4a2f12)" }} />
          <div style={{ position: "relative", zIndex: 3, maxWidth: 580, margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "center", gap: "clamp(8px,2.5vw,18px)", marginBottom: 30, height: 88 }}>
              {[2, 0, 3, 1, 4].map((crop, i) => (
                <div key={i} style={{ position: "relative", width: 50, height: 86 }}>
                  <RenderPlant cropIdx={crop} progress={1} ready={true} />
                </div>
              ))}
            </div>
            <h2 style={{ fontFamily: "'Baloo 2',cursive", fontWeight: 800, fontSize: "clamp(28px,6vw,46px)", color: "#1e5228", margin: "0 0 14px", textShadow: "0 3px 0 rgba(255,255,255,.45)" }}>Ready to start farming?</h2>
            <p style={{ fontSize: 16, color: "#6a5640", margin: "0 0 28px", lineHeight: 1.65 }}>
              Connect your wallet to claim your farm and start competing — or try the demo first, no wallet needed.
            </p>
            {inMiniPay ? (
              <p style={{ fontSize: 15, color: "#6a5640", fontWeight: 600 }}>Connecting your MiniPay wallet…</p>
            ) : ctaBtns}
            <p style={{ fontSize: 13, color: "#8a7458", marginTop: 16, fontWeight: 600 }}>Free to play · Gas under $0.01 · Works in MiniPay</p>
          </div>
        </section>

      </div>
    );
  }

  const guestTabStyle = (t: Tab) => ({
    fontFamily: "'Plus Jakarta Sans',sans-serif",
    fontWeight: 700, fontSize: 13,
    border: "none", padding: "8px 15px", borderRadius: 11, cursor: "pointer", whiteSpace: "nowrap" as const,
    transition: "all .15s ease",
    background: tab === t ? "#fffaf2" : "transparent",
    color:      tab === t ? "#2f6b34" : "#8a7256",
    boxShadow:  tab === t ? "0 3px 8px -3px rgba(122,82,52,.45)" : "none",
  });

  if (guestMode && !isConnected) {
    return (
      <div style={{ minHeight: "100vh", background: "radial-gradient(120% 80% at 50% -10%,#fef4de 0%,#f6e7cc 46%,#eedaba 100%)", fontFamily: "'Plus Jakarta Sans',system-ui,sans-serif", color: "#3a2e23" }}>
        {/* Sticky header — same layout, demo badge instead of wallet */}
        <div style={{ position: "sticky", top: 0, zIndex: 60, background: "rgba(255,250,242,.88)", backdropFilter: "blur(12px)", borderBottom: "1px solid #ece0cc" }}>
          <div style={{ maxWidth: 1180, margin: "0 auto", padding: "11px clamp(14px,3vw,26px)", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginRight: "auto" }}>
              <div style={{ width: 40, height: 40, borderRadius: 13, background: "linear-gradient(145deg,#6db04e,#357f2f)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 14px -4px rgba(53,107,44,.5)", fontSize: 20 }}>🌾</div>
              <div>
                <div style={{ fontFamily: "'Baloo 2',cursive", fontWeight: 800, fontSize: 21, lineHeight: 1, color: "#357f2f" }}>Shamba</div>
                <div style={{ fontSize: 10, color: "#a08a6e", fontWeight: 700, letterSpacing: ".06em" }}>IDLE FARM · CELO</div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 3, background: "#f0e3cd", padding: 4, borderRadius: 14 }}>
              <button onClick={() => switchTab("farm")}    style={guestTabStyle("farm")}>🌾 Farm</button>
              <button onClick={() => switchTab("board")}   style={guestTabStyle("board")}>🏆 Rankings</button>
              <button onClick={() => switchTab("friends")} style={guestTabStyle("friends")}>🤝 Friends</button>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <button onClick={() => connectors[0] && connect({ connector: connectors[0] })}
                style={{ fontFamily: "'Baloo 2',cursive", fontWeight: 800, fontSize: 13, padding: "6px 16px", borderRadius: 10, border: "none", background: "linear-gradient(180deg,#5fa83f,#357f2f)", color: "#fff", cursor: "pointer" }}>
                👛 Connect Wallet
              </button>
            </div>
          </div>
        </div>

        <div className="has-mobile-nav" style={{ maxWidth: 1180, margin: "0 auto", padding: "18px clamp(14px,3vw,26px) 60px" }}>
          {tab === "farm"    && <FarmView demo />}
          {tab === "board"   && <Leaderboard />}
          {tab === "friends" && <Friends />}
        </div>

        <nav className="mobile-nav">
          {([["farm","🌾","Farm"],["board","🏆","Rankings"],["friends","🤝","Friends"]] as [Tab,string,string][]).map(([t,icon,label]) => (
            <button key={t} className={tab === t ? "active" : ""} onClick={() => switchTab(t)}>
              <span className="icon">{icon}</span>
              {label}
            </button>
          ))}
        </nav>
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
