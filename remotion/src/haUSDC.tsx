import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Easing, Img, staticFile } from "remotion";

import hmnLogo from "./logos/harmonix/hmn-logo-text-v5.png";
import tradexyz from "./logos/partners/tradexyz.jpg";
import marketsxyz from "./logos/partners/marketsxyz.jpg";
import felix from "./logos/partners/felix.jpg";

// ---------------------------------------------------------------- cau hinh
// Tile ticker: tai tu assets.parqet.com, moi file da co san nen mau thuong hieu.
// Doi bo khac chi can sua mang nay va thay file trong logos/tickers/.
const TICKERS = [
  "AAPL.svg","NVDA.svg","TSLA.svg","MSFT.svg","AMZN.svg","META.svg","GOOGL.svg",
  "NFLX.svg","AMD.svg","AVGO.svg","COIN.svg","MSTR.svg","HOOD.png","PLTR.svg",
  "SPY.svg","QQQ.svg","IWM.svg","GLD.svg","GS.svg","JPM.svg",
  "V.svg","MA.svg","DIS.svg","UBER.svg","XOM.svg","WMT.svg","KO.svg","JNJ.svg",
  "PG.svg","BAC.svg","CRM.svg","INTC.svg","QCOM.svg","PEP.svg","MCD.svg",
];

const VENUES = [
  { src: tradexyz, name: "trade.xyz" },
  { src: marketsxyz, name: "markets.xyz" },
  { src: felix, name: "Felix" },
];

const APR = 8.16;
const DECIMALS = 2;   // 8.16 co hai chu so thap phan
const AS_OF = "Live APR · 4 Sep 2026";

// ---------------------------------------------------------------- chuyen dong
const EASE_TEXT = Easing.bezier(0.16, 1, 0.3, 1);      // brand --ease-out: dung cho chu
const EASE_DATA = Easing.bezier(0.45, 0.5, 0.0, 0.8);  // do duoc tu clip mau: dung cho so lieu

const SCROLL = 164;   // px/giay, do duoc tu clip GRVT
const GAP = 156;
const TILE = 128;

const useSec = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return frame / fps;
};

const Reveal: React.FC<{ at: number; children: React.ReactNode; rise?: number }> = ({
  at, children, rise = 28,
}) => {
  const t = useSec();
  const p = interpolate(t, [at, at + 0.5], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_TEXT,
  });
  return <div style={{ opacity: p, transform: `translateY(${(1 - p) * rise}px)` }}>{children}</div>;
};

// Tron tat dinh theo seed: 20 ticker tren 6 cot thi trung lap la khong tranh khoi,
// nhung tron rieng tung cot se khong con hai logo giong nhau nam ngang tam nhau.
const shuffle = <T,>(a: T[], seed: number) => {
  const out = [...a];
  let r = seed * 9301 + 49297;
  for (let i = out.length - 1; i > 0; i--) {
    r = (r * 9301 + 49297) % 233280;
    const j = Math.floor((r / 233280) * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
};

const Column: React.FC<{ x: number; dir: 1 | -1; offset: number; seed: number }> = ({
  x, dir, offset, seed,
}) => {
  const t = useSec();
  const base = shuffle(TICKERS, seed);
  const items = [...base, ...base];
  const loop = TICKERS.length * GAP;
  const shift = (((t * SCROLL * dir + offset) % loop) + loop) % loop;

  return (
    <div style={{ position: "absolute", left: x - TILE / 2, top: -loop + shift, width: TILE }}>
      {items.map((f, i) => (
        <div
          key={`${f}-${i}`}
          style={{
            width: TILE, height: TILE, marginBottom: GAP - TILE,
            borderRadius: "50%", overflow: "hidden", backgroundColor: "var(--hmn-cream)",
          }}
        >
          <Img src={staticFile(`tickers/${f}`)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
      ))}
    </div>
  );
};

const Wall: React.FC = () => (
  <div
    style={{
      position: "absolute", left: 1000, top: 0, right: 0, bottom: 0, overflow: "hidden",
      maskImage: "linear-gradient(to bottom, transparent 0%, black 13%, black 87%, transparent 100%)",
      WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 13%, black 87%, transparent 100%)",
    }}
  >
    <Column x={88} dir={-1} offset={0} seed={1} />
    <Column x={244} dir={1} offset={78} seed={17} />
    <Column x={400} dir={-1} offset={40} seed={42} />
    <Column x={556} dir={1} offset={110} seed={73} />
    <Column x={712} dir={-1} offset={20} seed={128} />
    <Column x={868} dir={1} offset={95} seed={205} />
  </div>
);

export const HaUsdc: React.FC = () => {
  const t = useSec();
  const p = interpolate(t, [3.5, 5.0], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_DATA,
  });
  const shown = (APR * p).toFixed(DECIMALS);
  const Sp: React.FC<{ h: number }> = ({ h }) => <div style={{ height: h, flexShrink: 0 }} />;

  return (
    <AbsoluteFill style={{ backgroundColor: "#0F2122", fontFamily: "Aeonik, sans-serif" }}>
      <Wall />

      {/* Cot chu xep theo dong chay — them hay bot khoi thi cac khoi tu day nhau,
          khong the de len nhau. */}
      <div style={{
        position: "absolute", left: 96, top: 72, bottom: 72, width: 830,
        display: "flex", flexDirection: "column",
      }}>
        <Reveal at={0.4} rise={16}><Img src={hmnLogo} style={{ height: 46 }} /></Reveal>
        <Sp h={78} />

        <Reveal at={1.3}>
          <div style={{ fontSize: 100, fontWeight: 500, lineHeight: 1, color: "var(--hmn-yellow)", letterSpacing: "-0.03em" }}>
            haUSDC
          </div>
        </Reveal>
        <Sp h={26} />

        <Reveal at={1.6}>
          <div style={{ fontSize: 56, fontWeight: 500, lineHeight: 1.18, color: "#FAFAFA", letterSpacing: "-0.02em", whiteSpace: "nowrap" }}>
            Stablecoin yield from<br />RWA and equities.
          </div>
        </Reveal>
        <Sp h={30} />

        <Reveal at={2.3}>
          <div style={{ fontSize: 30, lineHeight: 1.5, color: "#A1A1AA", maxWidth: 740 }}>
            USDC and USDe deposits. Yield from cross-funding arbitrage.
          </div>
        </Reveal>

        <div style={{ flex: 1, minHeight: 34 }} />

        <Reveal at={3.5} rise={18}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 24 }}>
            <span style={{
              fontSize: 148, fontWeight: 500, color: "var(--hmn-yellow)",
              letterSpacing: "-0.03em", lineHeight: 1, fontVariantNumeric: "tabular-nums",
            }}>{shown}%</span>
            <span style={{ fontSize: 32, fontWeight: 500, color: "#A1A1AA", letterSpacing: "0.08em" }}>APR</span>
          </div>
        </Reveal>
        <Sp h={18} />

        <Reveal at={5.5} rise={14}>
          <div style={{ fontSize: 26, color: "#8A8A93" }}>{AS_OF}</div>
        </Reveal>
        <Sp h={50} />

        <Reveal at={7.0}>
          <div style={{ fontSize: 23, color: "#8A8A93", letterSpacing: "0.1em", marginBottom: 18 }}>
            EXPOSURE TO
          </div>
          <div style={{ display: "flex", gap: 20 }}>
            {VENUES.map((v) => (
              <Img key={v.name} src={v.src} style={{ width: 78, height: 78, borderRadius: "50%" }} />
            ))}
          </div>
        </Reveal>
      </div>
    </AbsoluteFill>
  );
};
