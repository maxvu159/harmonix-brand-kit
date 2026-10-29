import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { CoinLayer } from "./CoinTest";
import scene from "./scenes/scene-pt-hahype.json";
import hmnLogo from "./logos/harmonix/hmn-logo-text-v5.png";
import pendleLogo from "./logos/partners/pendle.jpg";

/**
 * PT-haHYPE — lai suat co dinh den dao han.
 *
 * Bo cuc va nhip lo dan lay nguyen tu video haUSDC (`haUSDC.tsx`), nhan 1.333 cho
 * kho 2560x1440. Mot canh duy nhat: chu lo dan roi GIU nguyen den het, vong xu chay
 * lien tuc — khong pan, khong doi canh.
 *
 * MOI CON SO den tu `scenes/scene-pt-hahype.json`, khong hardcode.
 */

const EASE_TEXT = Easing.bezier(0.16, 1, 0.3, 1); // --ease-out cua brand: cho chu vao
const EASE_DATA = Easing.bezier(0.45, 0.5, 0.0, 0.8); // do tu clip that: cho so lieu

const S = 1.45; // 1920 -> 2560, roi phong them cho can voi vong xu
// Do bo cuc 2026-09-10: trong tam noi dung o 65.7% chieu ngang, khoang trong
// giua chu va xu 479px trong khi le trai chi 128px (3.7:1), dai giua khung chi
// chua 1.2% noi dung. Xu nang gap 3.5 lan chu — voi bo cuc "chu trai, hinh
// phai" thi hinh nang hon la binh thuong, nen sua bang cach lam KHOI CHU TO
// hon chu khong thu vong xu. Cot chu da cao kin 85% khung nen phai giam
// padding doc tu 72 xuong 58 moi co cho phong to.

// Nhip lo dan, lay tu video haUSDC
const AT = { logo: 0.4, name: 1.3, head: 1.6, para: 2.3, num: 3.5, src: 6.0, venue: 7.2 };

/**
 * Duong dem so: nhanh toi 3.00 roi bo cham toi 3.19.
 * Chia hai doan chu khong dung mot duong luy thua: mot duong luy thua du manh de
 * cham 3.00 som thi duoi hoi tu qua nhanh — so nhay 18 buoc trong 0.6s roi dung han,
 * mat han cam giac "bo cham". Hai doan cho phep dat rieng do dai cua duoi.
 */
const COUNT = { start: AT.num, fast: 0.7, slow: 1.5, knee: 3.0 };

const Reveal: React.FC<{ at: number; rise?: number; t: number; children: React.ReactNode }> = ({
  at,
  rise = 22,
  t,
  children,
}) => {
  const p = interpolate(t, [at, at + 1.0], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE_TEXT,
  });
  return <div style={{ opacity: p, transform: `translateY(${(1 - p) * rise}px)` }}>{children}</div>;
};

const Sp: React.FC<{ h: number }> = ({ h }) => <div style={{ height: h, flexShrink: 0 }} />;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const fmt = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
};

export const PTHaHype: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;

  const value = interpolate(
    t,
    [COUNT.start, COUNT.start + COUNT.fast, COUNT.start + COUNT.fast + COUNT.slow],
    [0, COUNT.knee, scene.metric.value],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_DATA },
  );

  return (
    <AbsoluteFill
      style={{ backgroundColor: "var(--hmn-green)", fontFamily: "Aeonik, sans-serif" }}
    >
      {/* Vong xu chay lien tuc tu dau den cuoi */}
      <CoinLayer t={t} width={width} height={height} bg loopSeconds={14} />

      {/* Cot chu xep theo DONG CHAY — them hay bot mot khoi thi cac khoi tu day nhau,
          khong the de len nhau. Xu bat dau o x=1493 nen cot rong toi 1235 la an toan. */}
      <div
        style={{
          position: "absolute",
          left: 96 * S,
          top: 58 * S,
          bottom: 58 * S,
          width: 860 * S,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Reveal at={AT.logo} rise={16} t={t}>
          <img src={hmnLogo} style={{ height: 46 * S }} />
        </Reveal>
        <Sp h={52 * S} />

        <Reveal at={AT.name} t={t}>
          <div
            style={{
              fontSize: 100 * S,
              fontWeight: 500,
              lineHeight: 1,
              color: "var(--hmn-yellow)",
              letterSpacing: "-0.03em",
            }}
          >
            {scene.asset}
          </div>
        </Reveal>
        <Sp h={26 * S} />

        <Reveal at={AT.head} t={t}>
          <div
            style={{
              fontSize: 56 * S,
              fontWeight: 500,
              lineHeight: 1.18,
              color: "#FAFAFA",
              letterSpacing: "-0.02em",
              whiteSpace: "nowrap",
            }}
          >
            Fixed HYPE yield,
            <br />
            locked to maturity.
          </div>
        </Reveal>
        <Sp h={30 * S} />

        <Reveal at={AT.para} t={t}>
          <div style={{ fontSize: 30 * S, lineHeight: 1.5, color: "#BEBEC6", maxWidth: 780 * S }}>
            Principal token on Pendle. Buy at a discount today, redeem 1:1 in{" "}
            {scene.metric.denomination} at maturity.
          </div>
        </Reveal>

        <div style={{ flex: 1, minHeight: 34 * S }} />

        <Reveal at={AT.num} rise={18} t={t}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 24 * S }}>
            <span
              style={{
                fontSize: 148 * S,
                fontWeight: 500,
                color: "var(--hmn-yellow)",
                letterSpacing: "-0.03em",
                lineHeight: 1,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {value.toFixed(scene.metric.decimals)}
              {scene.metric.unit}
            </span>
            <span
              style={{
                fontSize: 32 * S,
                fontWeight: 500,
                color: "#BEBEC6",
                letterSpacing: "0.08em",
              }}
            >
              APY
            </span>
          </div>
        </Reveal>
        <Sp h={18 * S} />

        {/* Dong nay giu hai thong tin khong duoc thieu: lai suat tinh bang gi,
            va co dinh den bao gio. */}
        <Reveal at={AT.src} rise={14} t={t}>
          <div style={{ fontSize: 26 * S, color: "#A8A8B1" }}>
            Fixed APY in {scene.metric.denomination} · Matures {fmt(scene.maturity.date)}, in{" "}
            {scene.maturity.days} days
          </div>
        </Reveal>
        <Sp h={24 * S} />

        <Reveal at={AT.venue} t={t}>
          <div
            style={{
              fontSize: 23 * S,
              color: "#A8A8B1",
              letterSpacing: "0.1em",
              marginBottom: 18 * S,
            }}
          >
            POWERED BY
          </div>
          <img
            src={pendleLogo}
            style={{ width: 78 * S, height: 78 * S, borderRadius: "50%" }}
          />
        </Reveal>
      </div>
    </AbsoluteFill>
  );
};
