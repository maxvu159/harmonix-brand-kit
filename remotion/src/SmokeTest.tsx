import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Easing } from "remotion";

// Duong cong do duoc tu clip mau (RMS 0.012), KHONG phai --ease-out cua brand
// (--ease-out sai lech RMS 0.21 — qua gat cho chart).
const EASE_BAR = Easing.bezier(0.45, 0.5, 0.0, 0.8);
const BAR_MS = 350;
const STAGGER_MS = 150;

const BARS = [
  { label: "A", h: 0.42, color: "var(--hmn-green)" },
  { label: "B", h: 0.62, color: "var(--hmn-green)" },
  { label: "C", h: 0.88, color: "var(--hmn-yellow)" },
];

export const SmokeTest: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, height } = useVideoConfig();
  const ms = (n: number) => (n / 1000) * fps;
  const plot = height * 0.34;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "var(--hmn-cream)",
        fontFamily: "Aeonik, sans-serif",
        padding: "var(--space-16, 64px)",
        justifyContent: "space-between",
      }}
    >
      <div>
        <div style={{ fontSize: 34, fontWeight: 400, color: "var(--hmn-muted, #71717A)" }}>
          Harmonix motion — smoke test
        </div>
        <div style={{ fontSize: 92, fontWeight: 500, color: "var(--hmn-ink)", letterSpacing: "-0.02em" }}>
          Aeonik 500
        </div>
        <div style={{ fontSize: 92, fontWeight: 700, color: "var(--hmn-green)", letterSpacing: "-0.02em" }}>
          Aeonik 700
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "flex-end", gap: 48, height: plot }}>
        {BARS.map((b, i) => {
          const start = ms(i * STAGGER_MS);
          const p = interpolate(frame, [start, start + ms(BAR_MS)], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: EASE_BAR,
          });
          return (
            <div
              key={b.label}
              style={{
                width: 220,
                height: plot * b.h * p,
                backgroundColor: b.color,
                borderRadius: "var(--radius-md, 12px) var(--radius-md, 12px) 0 0",
              }}
            />
          );
        })}
      </div>

      <div style={{ display: "flex", gap: 20 }}>
        {["--hmn-green", "--hmn-yellow", "--hmn-mint", "--hmn-cream", "--hmn-ink"].map((t) => (
          <div key={t} style={{ flex: 1 }}>
            <div
              style={{
                height: 90,
                backgroundColor: `var(${t})`,
                border: "1px solid #D8D8D0",
                borderRadius: 12,
              }}
            />
            <div style={{ fontSize: 20, marginTop: 10, color: "var(--hmn-ink)" }}>{t}</div>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
