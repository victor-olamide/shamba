"use client";

// Growth emoji stages per crop: [seedling, growing, mature]
const GROWTH_STAGES: [string, string, string][] = [
  ["🌱", "🌿", "🌽"],   // 0 Maize
  ["🌱", "🍃", "🍅"],   // 1 Tomato
  ["🌱", "🌿", "🥔"],   // 2 Cassava
  ["🌱", "🌼", "🌻"],   // 3 Sunflower
  ["🌱", "🌿", "🌾"],   // 4 Golden Wheat
];

export function RenderPlant({ cropIdx, progress, ready }: { cropIdx: number; progress: number; ready: boolean }) {
  const p = Math.min(1, Math.max(0, progress));
  const idx = Math.min(cropIdx, GROWTH_STAGES.length - 1);
  const stages = GROWTH_STAGES[idx];

  let emoji: string;
  if (p < 0.06) emoji = "🌰";
  else if (p < 0.45) emoji = stages[0];
  else if (p < 0.82) emoji = stages[1];
  else emoji = stages[2];

  const rawSize = p < 0.06 ? 14 : Math.round(16 + p * 30);
  const fontSize = ready ? 50 : Math.min(42, rawSize);
  // small green stem connects emoji to soil
  const stemH = p > 0.1 && p < 0.92 ? Math.round(4 + p * 10) : 0;

  return (
    <div style={{
      position: "absolute", left: "50%", bottom: "10%",
      transform: "translateX(-50%)",
      display: "flex", flexDirection: "column", alignItems: "center",
      zIndex: 3, pointerEvents: "none",
    }}>
      {ready && (
        <div style={{
          position: "absolute",
          top: -12, left: "50%", transform: "translateX(-50%)",
          width: fontSize + 28, height: fontSize + 28, borderRadius: "50%",
          background: "radial-gradient(circle,rgba(255,228,80,.5),transparent 70%)",
          filter: "blur(6px)",
          animation: "sunpulse 2.2s ease-in-out infinite",
        }} />
      )}
      <div style={{
        fontSize,
        lineHeight: 1,
        userSelect: "none",
        filter: ready
          ? "drop-shadow(0 0 10px rgba(255,210,50,.9)) drop-shadow(0 3px 6px rgba(0,0,0,.3))"
          : "drop-shadow(0 2px 5px rgba(0,0,0,.35))",
        animation: ready
          ? "bob 1.9s ease-in-out infinite"
          : p > 0.08 ? `sway ${2.8 + idx * 0.28}s ease-in-out infinite` : undefined,
      }}>
        {emoji}
      </div>
      {stemH > 0 && (
        <div style={{
          width: 4, height: stemH,
          background: "linear-gradient(180deg,#4ea832,#2f6b1c)",
          borderRadius: "0 0 2px 2px",
          marginTop: -4,
          boxShadow: "1px 0 2px rgba(0,0,0,.2)",
        }} />
      )}
    </div>
  );
}

export function CropEmblem({ cropIdx, size = 40 }: { cropIdx: number; size?: number }) {
  const idx = Math.min(cropIdx, GROWTH_STAGES.length - 1);
  return (
    <div style={{
      width: size, height: size,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: Math.round(size * 0.8),
      lineHeight: 1,
      filter: "drop-shadow(0 2px 4px rgba(0,0,0,.2))",
    }}>
      {GROWTH_STAGES[idx][2]}
    </div>
  );
}
