import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import * as THREE from "three";
import { Aurora } from "./Aurora";
import hmnLogo from "./logos/harmonix/hmn-logo-text-v5.png";

/**
 * APR hom nay vs benchmark — 15 giay, KHUNG B cua scene-grammar: SO VOI BENCHMARK.
 * Moi cum tu dung canh cua no: benchmark moc TRUOC, cot Harmonix vuot qua sau,
 * roi moi toi callout chenh lech. Khoang cach tro thanh cu CHOT chu khong co san
 * tu dau. Ban truoc cho ca 8 cot moc cung luc trong 1,1 giay dau roi chi doi
 * sang/toi theo cum — xem het bai ngay giay thu hai, va vong loop khong co nhip.
 *
 * Tat ca tam cot nam san tren man hinh tu khi moc len; moi pha chi LAM SANG mot
 * cum, hai cum kia mo con 25%. Khong cot nao moc lai, khong gi truot ra truot
 * vao — day la huong lien tuc nhat, va nguoi xem luon thay buc tranh tong.
 *
 * MOT TRUC DUY NHAT, CO DINH -3%..8%. Doi truc theo tung pha se lam cot cua pha
 * 2 va 3 cao bang pha 1 du so nho hon mot nua — doc ra la noi doi.
 *
 * VACH 0 la nhan vat o pha 3: vkHYPE la cot DUY NHAT dam xuong duoi vach, nen
 * cho no roi cham hon cac cot khac mot nhip.
 *
 * SO KHONG DUNG LO XO (luat cua skill): so nay vot len roi tut ve la bia so.
 * Chi ease-out 1.5s, va dem DUNG MOT LAN luc cot moc — pha sau khong dem lai.
 *
 * CHENH LECH so voi benchmark TOT NHAT cua tung cum, khong phai thap nhat:
 * haUSDC ghi +3.0 (vs Ethena 4%) chu khong phai +4.0 (vs Aave 3%).
 */

const LOOP = 15;

const V_MIN = -3;
const V_MAX = 8;

// Vung ve chiem het be ngang: huong B co tam cot nen khong con cho cho cot chu
// ben trai; tieu de chuyen len tren.
// PX chua du cho nhan truc: nhan % cua cot trai cung tung dam vao vach 8%.
const PX = 370, PW = 2030, PTOP = 440, PBOT = 1075;
const yOf = (v: number) => PBOT - ((v - V_MIN) / (V_MAX - V_MIN)) * (PBOT - PTOP);
const Y0 = yOf(0);

const LIME = "#E2F6A1";
const MINT = "#97FCE4";
const ROSE = "#E88B7D";
const BENCH = "#8FA394";
const FG = "#F2F8EE";
const MUTE = "#93A79C";
const DIM = "#6B8279";
// Cum chua toi: doi MAU chu khong ha do trong. Ha do trong thi ca cum nhat di
// nhu bi tat den — do la thu trong xau. Doi mau thi cot van dac, van doc duoc
// so, chi khong con la nhan vat chinh.
const INACT = "#43564F";
const INACT_TXT = "#6E8279";

const hex2rgb = (h: string): [number, number, number] => [
  parseInt(h.slice(1, 3), 16),
  parseInt(h.slice(3, 5), 16),
  parseInt(h.slice(5, 7), 16),
];
const mixHex = (a: string, b: string, u: number) => {
  const A = hex2rgb(a);
  const B = hex2rgb(b);
  const c = A.map((v, i) => Math.round(v + (B[i] - v) * Math.max(0, Math.min(1, u))));
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
};

type Bar = { k: string; v: number; vault?: boolean; note?: string; logo: string };
type Group = { t0: number; t1: number; title: string; bars: Bar[] };

// APR cua Harmonix va chenh lech deu TINH TU `bars`, khong go tay. Go tay thi
// doi mot con so benchmark la delta thanh sai ma khong ai phat hien.
const vaultApr = (g: Group) => g.bars.find((b) => b.vault)!.v;
const bestBench = (g: Group) => Math.max(...g.bars.filter((b) => !b.vault).map((b) => b.v));
const aprLabel = (g: Group) => `${vaultApr(g).toFixed(1)}%`;
const deltaLabel = (g: Group) => {
  const d = vaultApr(g) - bestBench(g);
  const unit = Math.abs(d) === 1 ? "pt" : "pts";
  return `${d >= 0 ? "+" : "\u2212"}${Math.abs(d).toFixed(1)} ${unit}`;
};

const GROUPS: Group[] = [
  {
    t0: 1.6, t1: 5.5, title: "haUSDC",
    bars: [
      { k: "haUSDC", v: 7, vault: true, logo: "tokens/har-circle.png" },
      { k: "Ethena sUSDe", v: 4.8, logo: "partners/ethena.jpg" },
      { k: "Aave USDC", v: 4.4, logo: "partners/aave.jpg" },
    ],
  },
  {
    t0: 5.5, t1: 9.0, title: "PT-haHYPE",
    bars: [
      { k: "PT-haHYPE", v: 3.4, vault: true, logo: "tokens/har-circle.png" },
      { k: "PT-stHYPE", v: 2.3, logo: "partners/stHYPE.svg" },
      { k: "PT-kHYPE", v: 2.2, logo: "partners/kinetiq.jpg" },
    ],
  },
  {
    t0: 9.0, t1: 12.4, title: "haKHYPE",
    bars: [
      { k: "haKHYPE", v: 3, vault: true, logo: "tokens/har-circle.png" },
      { k: "vkHYPE", v: -2.5, logo: "partners/vkHYPE.svg" },
    ],
  },
];

const SUM_T0 = 12.4;

const BW = 168;          // be ngang mot cot
const GAP = 52;          // cach nhau trong cum
const GRP_GAP = 190;     // cach nhau giua hai cum

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const smooth = (v: number) => { const u = clamp01(v); return u * u * (3 - 2 * u); };
const easeOut = (v: number) => 1 - Math.pow(1 - clamp01(v), 3);
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;

/** Toa do x cua tung cot, tinh mot lan roi dung lai. */
const LAYOUT = (() => {
  const nBars = GROUPS.reduce((a, g) => a + g.bars.length, 0);
  const nInner = GROUPS.reduce((a, g) => a + g.bars.length - 1, 0);
  const span = nBars * BW + nInner * GAP + (GROUPS.length - 1) * GRP_GAP;
  let x = PX + (PW - span) / 2;
  const groups = GROUPS.map((g) => {
    const xs = g.bars.map((_, i) => x + i * (BW + GAP));
    const left = xs[0];
    const right = xs[xs.length - 1] + BW;
    x = right + GRP_GAP;
    return { xs, left, right, mid: (left + right) / 2 };
  });
  return { groups, span };
})();

/* ------------------------------------------------------------------ truc */

const Axis: React.FC<{ t: number }> = ({ t }) => {
  const u = smooth((t - 0.15) / 0.35);
  const grow = smooth((t - 0.15) / 0.55);
  const ticks: number[] = [];
  // CHI vach duong. Vach -2% cham vao dai logo duoi cot nen bo han; thang 0 da co
  // duong dam rieng ben duoi, de vong lap sinh them la ve chong hai lan.
  // Thang do van giu V_MIN = -3 de cot am (vkHYPE -2,5) ve dung do sau.
  for (let v = 2; v <= V_MAX; v += 2) ticks.push(v);
  return (
    <div style={{ opacity: u }}>
      {ticks.map((v) => (
        <React.Fragment key={v}>
          <div style={{ position: "absolute", left: PX, top: yOf(v), width: PW * grow, height: 2, background: "rgba(147,167,156,0.15)" }} />
          <div style={{ position: "absolute", left: PX - 200, top: yOf(v) - 22, width: 140, textAlign: "right", fontSize: 32, color: DIM }}>{v}%</div>
        </React.Fragment>
      ))}
      <div style={{ position: "absolute", left: PX, top: Y0, width: PW, height: 3, background: "rgba(234,243,231,0.5)" }} />
      <div style={{ position: "absolute", left: PX - 200, top: Y0 - 22, width: 140, textAlign: "right", fontSize: 32, color: MUTE }}>0%</div>
    </div>
  );
};

/* ------------------------------------------------------------------- cot */

const CHIP = 74;

const BarCol: React.FC<{
  b: Bar; x: number; grow: number; count: number; on: number; appear: number;
}> = ({ b, x, grow, count, on, appear }) => {
  const v = b.v * grow;
  // Lam tron ve pixel nguyen: mep cot phai trung KHIT vach 0. Lech nua pixel la
  // nhin ra ngay o kho 2K.
  const yv = Math.round(yOf(v));
  const zero = Math.round(Y0);
  const neg = b.v < 0;
  const top = neg ? zero : yv;
  const h = Math.abs(yv - zero);

  const full = b.vault ? LIME : neg ? ROSE : BENCH;
  const col = mixHex(INACT, full, on);
  const colTop = mixHex(INACT, b.vault ? "#F2FFC6" : neg ? "#F2A497" : "#A6B7AC", on);
  const numCol = mixHex(INACT_TXT, b.vault ? LIME : neg ? ROSE : "#C9D6CB", on);

  // COT DI XUONG THI NHAN DI LEN. Nhet chip vao trong long cot am thi chat cung
  // (cot chi cao 154px) va cai dia toi nam tren nen hong doc ra rat gon. Vung
  // tren vach 0 o cot am thi trong hoan toan, nen dat nhan o do — doi xung
  // guong voi cac cot khac, va van la mot hang thang hang theo vach 0.
  const NAME_H = 36;
  const chipTop = neg ? zero - 22 - NAME_H - 14 - CHIP : zero + 22;
  const nameTop = neg ? zero - 22 - NAME_H : chipTop + CHIP + 14;

  return (
    // `appear` boc CA cum: cot cao 0 thi tu vo hinh, nhung chip logo, ten va so
    // thi khong — de nguyen se thay mot hang logo tro tro truoc khi cot moc len.
    <div style={{ opacity: appear }}>
      <div
        style={{
          position: "absolute", left: x, top, width: BW, height: h,
          background: `linear-gradient(180deg, ${colTop} 0%, ${col} 62%)`,
          borderRadius: neg ? "0 0 14px 14px" : "14px 14px 0 0",
          boxShadow: on > 0.5 ? `0 0 ${Math.round(38 * on)}px rgba(226,246,161,${0.12 * on})` : undefined,
        }}
      />
      {/* So: cot duong thi dat tren dinh, cot am dat TRONG long cot (duoi vach 0
          khong con cho — chip logo va ten da chiem). */}
      <div
        style={{
          position: "absolute", left: x - 70, top: neg ? yv + 18 : yv - 74, width: BW + 140,
          textAlign: "center", fontWeight: b.vault ? 600 : 500, fontSize: b.vault ? 58 : 46,
          letterSpacing: "-0.02em", color: numCol,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {count.toFixed(1)}%
      </div>

      <div
        style={{
          position: "absolute", left: x + BW / 2 - CHIP / 2, top: chipTop,
          width: CHIP, height: CHIP, borderRadius: CHIP,
          background: "#0E1F20", border: "2px solid rgba(234,243,231,0.14)",
          overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center",
          filter: `saturate(${0.25 + 0.75 * on}) brightness(${0.62 + 0.38 * on})`,
        }}
      >
        <Img src={staticFile(b.logo)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>

      <div
        style={{
          position: "absolute", left: x - 70, top: nameTop, width: BW + 140,
          textAlign: "center", fontWeight: 500, fontSize: 30,
          color: mixHex(INACT_TXT, b.vault ? FG : MUTE, on),
        }}
      >
        {b.k}
      </div>
      {b.note ? (
        <div
          style={{
            position: "absolute", left: x - 70, top: nameTop + 40, width: BW + 140,
            textAlign: "center", fontSize: 25, color: mixHex(INACT_TXT, MUTE, on),
          }}
        >
          {b.note}
        </div>
      ) : null}
    </div>
  );
};

/* ---------------------------------------------------------------- khung */

export const AprBars: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;

  const active = GROUPS.findIndex((g) => t >= g.t0 && t < g.t1);
  const isSum = t >= SUM_T0;

  // KHONG luot khung. Ban truoc co, va `translateX` tao mot lop ve rieng voi
  // toa do le nen cot bi lay mau lai nua pixel trong khi truc thi khong —
  // mep cot khong con trung vach 0.

  const cur = active >= 0 ? GROUPS[active] : null;
  const title = isSum ? "Three vaults, one engine" : cur ? cur.title : "Harmonix vs the market";
  const titleAt = isSum ? SUM_T0 : cur ? cur.t0 : 0.35;
  const titleU = smooth((t - titleAt) / 0.4);
  // Callout la cu CHOT nen phai roi SAU khi cot Harmonix da vuot qua benchmark.
  // Ra cung luc voi tieu de thi khan gia doc so truoc khi thay chuyen gi xay ra.
  const calloutU = smooth((t - (titleAt + 1.15)) / 0.4);

  return (
    <AbsoluteFill style={{ backgroundColor: "#04192C", fontFamily: "Aeonik, sans-serif" }}>
      <AbsoluteFill>
        <ThreeCanvas width={width} height={height} camera={{ fov: 40, position: [0, 0, 7.6] }} style={{ background: "transparent" }} gl={{ toneMapping: THREE.NoToneMapping }}>
          <Aurora t={t} width={width} height={height} loopSeconds={LOOP} />
        </ThreeCanvas>
      </AbsoluteFill>

      <AbsoluteFill>
        <div style={{ position: "absolute", left: 158, top: 214, fontWeight: 500, fontSize: 32, letterSpacing: "0.17em", color: LIME }}>
          APR TODAY vs BENCHMARK
        </div>
        <div
          style={{
            position: "absolute", left: 158, top: 262, fontWeight: 600, fontSize: 96,
            letterSpacing: "-0.03em", color: FG, opacity: titleU,
            transform: `translateY(${(1 - titleU) * 18}px)`,
          }}
        >
          {title}
        </div>
        {cur ? (
          <div style={{ position: "absolute", right: 158, top: 268, textAlign: "right", opacity: calloutU, transform: `translateY(${(1 - calloutU) * 18}px)` }}>
            <div style={{ fontWeight: 600, fontSize: 86, letterSpacing: "-0.03em", color: LIME }}>{aprLabel(cur)}</div>
            <div style={{ marginTop: 6, fontSize: 32, fontWeight: 500, color: FG }}>
              {deltaLabel(cur)} vs best benchmark
            </div>
          </div>
        ) : null}

        <Axis t={t} />

        <div>
          {GROUPS.map((g, gi) => {
            // He so sang cua cum, chuyen mau trong 0.45s chu khong bat/tat.
            const on = isSum
              ? smooth((t - SUM_T0) / 0.45)
              : gi === active
                ? smooth((t - g.t0) / 0.45)
                : t >= g.t1 && t < SUM_T0
                  ? 1 - smooth((t - g.t1) / 0.45)
                  : 0;
            const L = LAYOUT.groups[gi];
            const nBench = g.bars.filter((x) => !x.vault).length;
            return (
              <React.Fragment key={g.title}>
                {g.bars.map((b, bi) => {
                  // KHUNG B: benchmark moc truoc, Harmonix vuot qua sau mot nhip.
                  // So le 80ms giua cac cot benchmark (luat chart), cong 250ms truoc
                  // cot Harmonix de nguoi xem kip thay no vuot len.
                  // Cot am cham them mot nhip — no la cot duy nhat di xuong.
                  const benchIdx = g.bars.filter((x) => !x.vault).indexOf(b);
                  const delay =
                    g.t0 +
                    0.15 +
                    (b.vault ? nBench * 0.08 + 0.25 : benchIdx * 0.08) +
                    (b.v < 0 ? 0.25 : 0);
                  return (
                    <BarCol
                      key={b.k}
                      b={b}
                      x={L.xs[bi]}
                      grow={easeOut((t - delay) / 0.8)}
                      count={b.v * easeOut((t - (delay + 0.05)) / 1.5)}
                      on={on}
                      appear={smooth((t - delay) / 0.3)}
                    />
                  );
                })}
                {/* gach chan cum: chi hien khi cum dang duoc noi toi */}
              </React.Fragment>
            );
          })}
        </div>

        <div style={{ position: "absolute", left: 158, top: 1330, fontSize: 28, color: DIM }}>
          APR as of 24 Sep 2026 · net of fees · 7d · source: Harmonix, Aave, Ethena, Pendle, Kinetiq
        </div>
      </AbsoluteFill>

      <img src={hmnLogo} style={{ position: "absolute", left: 158, top: 84, height: 58 }} />
    </AbsoluteFill>
  );
};
