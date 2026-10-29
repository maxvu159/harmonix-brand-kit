import React from "react";
import { AbsoluteFill } from "remotion";

const SAMPLE = "Harmonix 10.50% APR";

export const FontProbe: React.FC = () => {
  const checks = [300, 400, 500, 700, 900].map(
    (w) => `${w}: ${document.fonts.check(`${w} 100px Aeonik`)}`
  );
  const loaded: string[] = [];
  document.fonts.forEach((f) => {
    if (f.family === "Aeonik" && f.status === "loaded") loaded.push(String(f.weight));
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#F1F1EB", padding: 60, gap: 26 }}>
      <div style={{ fontFamily: "monospace", fontSize: 30, color: "#173132" }}>
        fonts.check(Aeonik) → {checks.join("  ")}
      </div>
      <div style={{ fontFamily: "monospace", fontSize: 30, color: "#173132" }}>
        đã tải: [{loaded.sort().join(", ")}]
      </div>
      <div style={{ fontSize: 62, fontWeight: 500, fontFamily: "Aeonik" }}>A · {SAMPLE}</div>
      <div style={{ fontSize: 62, fontWeight: 500, fontFamily: "KhongTonTaiFont" }}>B · {SAMPLE}</div>
      <div style={{ fontSize: 62, fontWeight: 700, fontFamily: "Aeonik" }}>C · {SAMPLE}</div>
      <div style={{ fontSize: 26, fontFamily: "monospace", color: "#71717A", marginTop: 10 }}>
        A và B giống hệt nhau = Aeonik KHÔNG nạp được
      </div>
    </AbsoluteFill>
  );
};
