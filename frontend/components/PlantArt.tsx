"use client";
import type { CSSProperties } from "react";

const CROP_COLORS = ["#e8b53a", "#e0623e", "#caa46e", "#f2c33d", "#d9a425"] as const;

function hexA(hex: string, a: number) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

function Leaf({ side, w }: { side: "left" | "right"; w: number }) {
  return (
    <div style={{
      position: "absolute", bottom: "34%",
      [side]: "6%",
      width: w, height: w * 0.52,
      background: `linear-gradient(${side === "left" ? 120 : 60}deg,#7cc05a,#4e9440)`,
      borderRadius: side === "left" ? "80% 10% 80% 10%" : "10% 80% 10% 80%",
      transform: `rotate(${side === "left" ? -32 : 32}deg)`,
      transformOrigin: "bottom center",
    } as CSSProperties} />
  );
}

function Topper({ cropIdx, scale, ready }: { cropIdx: number; scale: number; ready: boolean }) {
  const s = (n: number) => Math.round(n * (0.55 + scale * 0.45));
  const bob: CSSProperties = ready ? { animation: "bob 1.9s ease-in-out infinite" } : {};

  if (scale <= 0.02) {
    return <div style={{ width: 7 * Math.max(0.4, scale + 0.4), height: 7, borderRadius: "50% 50% 50% 50%/60% 60% 40% 40%", background: "#5fa83f" }} />;
  }

  if (cropIdx === 0) {
    return (
      <div style={{
        width: s(15), height: s(26),
        borderRadius: "50% 50% 46% 46%/26% 26% 64% 64%",
        background: "linear-gradient(135deg,#f4cf57,#d99a2b)",
        backgroundImage: "repeating-linear-gradient(0deg,rgba(0,0,0,.12) 0 3px,transparent 3px 6px),repeating-linear-gradient(90deg,rgba(255,255,255,.22) 0 3px,transparent 3px 6px)",
        boxShadow: "inset -2px -2px 3px rgba(0,0,0,.3)",
        ...bob,
      }} />
    );
  }
  if (cropIdx === 1) {
    const dot = (k: string) => (
      <div key={k} style={{ width: s(15), height: s(15), borderRadius: "50%", background: "radial-gradient(circle at 34% 28%,#ff8a5c,#d2401f 72%)", boxShadow: "inset -2px -2px 3px rgba(0,0,0,.28)" }} />
    );
    return <div style={{ display: "flex", gap: 2, ...bob }}>{scale > 0.7 ? [dot("a"), dot("b")] : [dot("a")]}</div>;
  }
  if (cropIdx === 2) {
    return (
      <div style={{ position: "relative", width: s(24), height: s(20), ...bob }}>
        <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "radial-gradient(circle at 40% 30%,#8fce64,#3f7a31)", boxShadow: "inset -2px -2px 3px rgba(0,0,0,.2)" }} />
        <div style={{ position: "absolute", top: -4, left: "30%", width: s(7), height: s(13), background: "#5fa83f", borderRadius: "60% 60% 0 0", transform: "rotate(-18deg)" }} />
        <div style={{ position: "absolute", top: -4, right: "30%", width: s(7), height: s(13), background: "#4e9440", borderRadius: "60% 60% 0 0", transform: "rotate(18deg)" }} />
      </div>
    );
  }
  if (cropIdx === 3) {
    const d = s(30);
    return (
      <div style={{ position: "relative", width: d, height: d, borderRadius: "50%", background: "repeating-conic-gradient(#f6cf52 0deg 15deg,#e6ad2f 15deg 30deg)", boxShadow: "0 2px 5px rgba(0,0,0,.2)", ...bob }}>
        <div style={{ position: "absolute", inset: "27%", borderRadius: "50%", background: "radial-gradient(circle,#3a2614,#5e3d24)", backgroundImage: "radial-gradient(circle,rgba(0,0,0,.3) 1px,transparent 1.6px)", backgroundSize: "5px 5px" }} />
      </div>
    );
  }
  const ear = (rot: number, k: string) => (
    <div key={k} style={{ width: s(6), height: s(20), borderRadius: "50%", background: "linear-gradient(180deg,#f6db6b,#c98f1c)", backgroundImage: "repeating-linear-gradient(20deg,rgba(0,0,0,.12) 0 2px,transparent 2px 5px)", transform: `rotate(${rot}deg)`, transformOrigin: "bottom center", boxShadow: "0 0 6px rgba(240,191,74,.6)" }} />
  );
  return (
    <div style={{ position: "relative", display: "flex", alignItems: "flex-end", justifyContent: "center", ...bob }}>
      {ear(-20, "a")}{ear(0, "b")}{ear(20, "c")}
      <div style={{ position: "absolute", top: -3, right: -4, width: 7, height: 7, borderRadius: "50%", background: "radial-gradient(circle,#fff,#ffd860)", animation: "sparkle 1.4s ease-in-out infinite" }} />
    </div>
  );
}

export function RenderPlant({ cropIdx, progress, ready }: { cropIdx: number; progress: number; ready: boolean }) {
  const color = CROP_COLORS[cropIdx];
  const p = Math.min(1, Math.max(0, progress));

  if (p < 0.12) {
    return (
      <div style={{ position: "absolute", left: "50%", bottom: "22%", transform: "translateX(-50%)", width: 9, height: 9, borderRadius: "50% 50% 50% 50%/60% 60% 40% 40%", background: "#3a2614", boxShadow: "0 2px 3px rgba(0,0,0,.45)", animation: "popIn .4s ease" }} />
    );
  }

  const stemH = 12 + p * 46;
  const fruitScale = ready ? 1 : p < 0.45 ? 0 : Math.min(1, (p - 0.45) / 0.55);
  const leafW = 12 + p * 8;
  const stemW = Math.max(20, 20 + p * 8);

  return (
    <div style={{ position: "absolute", left: "50%", bottom: "15%", transformOrigin: "bottom center", animation: `sway ${2.8 + cropIdx * 0.25}s ease-in-out infinite`, display: "flex", flexDirection: "column", alignItems: "center", zIndex: 3, transform: "translateX(-50%)" }}>
      {ready && (
        <div style={{ width: 54, height: 54, borderRadius: "50%", background: `radial-gradient(circle,${hexA(color, 0.5)} 0%,transparent 70%)`, position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)", filter: "blur(2px)", animation: "sunpulse 2.2s ease-in-out infinite" }} />
      )}
      <Topper cropIdx={cropIdx} scale={fruitScale} ready={ready} />
      <div style={{ position: "relative", width: stemW, height: stemH, display: "flex", justifyContent: "center" }}>
        <div style={{ width: Math.max(4, 4 + p * 2), height: "100%", borderRadius: 6, background: "linear-gradient(#6db04e,#3f7a31)" }} />
        <Leaf side="left" w={leafW} />
        <Leaf side="right" w={leafW} />
      </div>
    </div>
  );
}

export function CropEmblem({ cropIdx, size = 40 }: { cropIdx: number; size?: number }) {
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <RenderPlant cropIdx={cropIdx} progress={1} ready={true} />
    </div>
  );
}
