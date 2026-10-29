import React, { useMemo } from "react";
import {
  AbsoluteFill,
  Img,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  delayRender,
  continueRender,
} from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Aurora } from "./Aurora";
import { useMetalEnv } from "./metalEnv";
import hmnLogo from "./logos/harmonix/hmn-logo-text-v5.png";

/**
 * Vong lap ba the yield Harmonix — 16 giay, BON PHA CHU nhung chi BA lan the bay.
 *
 * Bon cum chu ma chi ba the: neu moi cum di kem mot lan bay thi sau bon lan
 * chong the lech di mot bac va vong lap KHONG khep. Nen pha thu tu (tong ket)
 * khong co the bay — chong the dung yen tren haHYPE, chi con lo lung va vet
 * sang chay. Sau ba lan bay chong the ve dung cho cu.
 *
 * Va cu bay nam o CUOI pha, khong phai dau pha. The phai dung yen cung cum chu
 * cua chinh no gan het pha roi moi di; neu bay ngay tu dau thi tu giay thu hai
 * tro di chu se mo ta sai cai the dang nam tren cung.
 *
 * Chuyen dong the: quy dao dung smootherstep tren khoang thoi gian co dinh, lo
 * xo chi lo cu nhun luc cham. Chuyen dong chu: guong quay (slot machine), ba
 * guong lech pha nhau.
 */

const FPS = 60;

/**
 * Bon pha, dai khong deu — chia theo luong chu chu khong chia deu may moc.
 * Thoi gian the dung yen tren cung = dai pha - 1.633s (tru lay da va chang bay).
 *   haHYPE 4.4s -> 2.77s |  haUSDC 4.0 -> 2.37s |  haKHYPE 4.0 -> 2.37s
 * Pha tong ket khong co bay nen the dung suot.
 */
const PHASES = [4.4, 4.0, 4.0, 3.6];
const LOOP = PHASES.reduce((a, b) => a + b, 0); // 16.0s = 960 khung
const STARTS = PHASES.reduce<number[]>((a, d, i) => [...a, (a[i] ?? 0) + d], [0]);

const T_ANTIC = 14 / FPS;          // lay da truoc khi bat len
const T_TRAVEL = 1.40;             // chang bay
/**
 * Khoang lang sau khi the dap xuong, truoc khi pha het. Phai du dai cho cu nhun
 * tat han: sang pha sau the do thanh the DUNG YEN o khe 2, nen cu nhun con du
 * bao nhieu se bi cat cut ngay tai ranh gioi pha. Voi lo xo [11, 0.35], 1.0s
 * con lai 2% bien do = 0.33px o kho cuoi — khong thay duoc.
 */
const T_TAIL = 1.00;
const T_OUT = T_ANTIC + T_TRAVEL + T_TAIL;

const SPR_BOUNCE: [number, number] = [11.0, 0.35]; // cu nhun luc the dap xuong
const SPR_SLOT: [number, number] = [13.416, 0.82]; // the doi khe, yen sau 0.36s
/**
 * Lo xo cua guong chu. Giam chan THAP hon lo xo doi khe (0.58 so voi 0.82) la
 * co y: no vuot qua vi tri ~11% roi lac ve — dung cam giac o khoa so nay lai
 * khi khop. Guong chay bang lo xo giam chan cao thi ra "chuyen slide", khong ra
 * "o khoa so".
 */
const SPR_REEL: [number, number] = [15.0, 0.58];
const SPR_CHIP: [number, number] = [18.0, 0.5];
/**
 * Guong chu chay TRE hon luc the nhac len 0.70s. Khong tre thi chu doi ngay
 * khoanh khac the cu bat len, trong khi the moi con 1.4s nua moi dap xuong —
 * suot 1.4s do chu da noi ve the moi ma thu dang bay giua khung hinh van la
 * the cu. Tre 0.70s thi chu lang xong khoang cung luc the cham khe.
 */
const REEL_LAG = 0.70;

const LIFT = 2.40;
const BOW = 0.26;
const Z_RISE = 0.68;
const Z_BACK_FROM = 0.50;
const Z_BACK_TO = 0.70;
const RO_BASE = 100;
const ENV_TURNS = 1;

/**
 * CO THE VA VI TRI CHONG THE.
 *
 * Truoc day co mot dieu kien thu ba — "the bay khong duoc tho ra mep tren khung"
 * — va chinh no ep chong the phai tut xuong thap, dong thoi tao ra mot tran cung
 * cho co the (3.62 don vi). Dieu kien do LA DO TOI TU AP, khong ai yeu cau. The
 * bay VUOT RA NGOAI KHUNG o dinh cung la binh thuong trong dung dan chuyen dong,
 * va con doc ra la dut khoat hon.
 *
 * Bo no di thi chi con hai dieu kien, va ca hai deu de tho:
 *   (a) LIFT > 2.036 h2   — vuot han qua chong the o luc doi thu tu ve, de cu
 *                           doi do vo hinh
 *   (b) RIG_Y > -2.548 + h2 — chong the khong roi khoi mep duoi
 *
 * Gio dat RIG_Y theo BO CUC chu khong theo rang buoc: -0.72 dua tam chong the
 * len chi con thap hon tam khung 70px, thay vi 211px nhu truoc.
 * O dinh cung the bay tho ra ngoai mep tren ~33% chieu cao cua no trong vai
 * khung — phan bi cat la mep TREN cua the, tuc ticker, ma ticker cua the do thi
 * nguoi xem vua doc xong ca mot pha roi.
 */
const CARD_W = 3.60;
const CARD_H = CARD_W / 1.586;
const BEV = 0.0349;
const THICK = 0.1146;
const RADIUS = 0.1200;
const FACE_W = CARD_W - 2 * BEV;
const FACE_H = CARD_H - 2 * BEV;

/**
 * Do duoc tren ban 16s truoc: le trai 158px, le phai 444px — gan gap ba lan,
 * ca bo cuc doc ra la lech han sang trai. 1.92 keo le phai ve ~190.
 */
const RIG_X = 1.72;
const RIG_Y = -0.72;

const NAMES = ["hahype", "hausdc", "hakhype"] as const;
type CardName = (typeof NAMES)[number];

/* ------------------------------------------------------------- noi dung */

type Slide = {
  head: string[];
  stat: string[];      // [nhan, gia tri] hoac [dong 1, dong 2] cho pha tong ket
  statIsCopy?: boolean;
  note?: string;
  logoLabel: string;
  logos: string[];
};

const SLIDES: Slide[] = [
  {
    head: ["haHYPE"],
    stat: ["Average APR", "2.7% – 3.19%"],
    note: "PT yield",
    logoLabel: "Exposure to",
    logos: ["morpho.jpg", "euler.jpg", "felix.jpg", "nest-exchange.jpg",
            "pendle.jpg", "projectx.jpg", "valantis.jpg"],
  },
  {
    head: ["haUSDC"],
    stat: ["Average APR", "8.1%"],
    logoLabel: "Exposure to",
    logos: ["tradexyz.jpg", "felix.jpg", "marketsxyz.jpg", "ondo-finance.jpg"],
  },
  {
    head: ["haKHYPE"],
    stat: ["Average APR", "3.28%"],
    logoLabel: "Exposure to",
    logos: ["marketsxyz.jpg", "kinetiq.jpg"],
  },
  {
    head: ["Three assets.", "One yield engine."],
    stat: ["haHYPE, haUSDC and haKHYPE.", "Live on Hyperliquid."],
    statIsCopy: true,
    // Pha tong ket TRUOC DAY de trong o khe logo, va khoi chu vi the doc ra
    // lech han len tren so voi ba pha kia — khoi cao co dinh ma noi dung chi
    // lap day hai phan ba tren. Cho no toan bo mat tiep xuc cua ca ba vault
    // vua lap day khoi, vua la mot nhip tong ket dung nghia.
    logoLabel: "Integrated with",
    logos: ["morpho.jpg", "euler.jpg", "felix.jpg", "nest-exchange.jpg",
            "pendle.jpg", "projectx.jpg", "valantis.jpg", "tradexyz.jpg",
            "marketsxyz.jpg", "ondo-finance.jpg", "kinetiq.jpg"],
  },
];

/* --------------------------------------------------------------- ket cau */

type TexSet = { normal: THREE.Texture | null; orm: THREE.Texture | null; base: THREE.Texture | null };
const TEX: Record<string, TexSet> = {};
{
  const loader = new THREE.TextureLoader();
  for (const name of NAMES) {
    TEX[name] = { normal: null, orm: null, base: null };
    for (const key of ["normal", "orm", "base"] as const) {
      const handle = delayRender(`Doi ban do the: ${name}/${key}`);
      loader.load(
        staticFile(`cards/card-${name}-${key}.png`),
        (t) => {
          t.colorSpace = key === "base" ? THREE.SRGBColorSpace : THREE.NoColorSpace;
          t.anisotropy = 16;
          TEX[name][key] = t;
          continueRender(handle);
        },
        undefined,
        (e) => {
          console.error(`Khong tai duoc ban do the ${name}/${key}`, e);
          continueRender(handle);
        },
      );
    }
  }
}

/* ------------------------------------------------------------------ lo xo */

/** Dap ung buoc nhay: 0 -> 1, vuot dich roi lang. Bat dau dung yen. */
const springStep = (t: number, [w, z]: [number, number]) => {
  if (t <= 0) return 0;
  const wd = w * Math.sqrt(1 - z * z);
  return 1 - Math.exp(-z * w * t) * (Math.cos(wd * t) + ((z * w) / wd) * Math.sin(wd * t));
};

/** Dap ung xung: 0 -> dao qua dao lai -> 0. */
const springImpulse = (t: number, [w, z]: [number, number]) => {
  if (t <= 0) return 0;
  const wd = w * Math.sqrt(1 - z * z);
  return Math.exp(-z * w * t) * Math.sin(wd * t);
};

const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);

/** Pha nao, con bao lau, va pha nay co the bay khong. */
const phaseAt = (t: number) => {
  const u = ((t % LOOP) + LOOP) % LOOP;
  let k = PHASES.length - 1;
  for (let i = 0; i < PHASES.length; i++) {
    if (u < STARTS[i + 1]) {
      k = i;
      break;
    }
  }
  return { k, tl: u - STARTS[k], dur: PHASES[k], fly: k < 3 };
};

/* ------------------------------------------------------------- hinh hoc */

const roundedRect = (w: number, h: number, r: number) => {
  const s = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
};

const bodyGeo = (() => {
  const g = new THREE.ExtrudeGeometry(roundedRect(CARD_W, CARD_H, RADIUS), {
    depth: THICK - 2 * BEV,
    bevelEnabled: true,
    bevelThickness: BEV,
    bevelSize: BEV,
    bevelSegments: 5,
    curveSegments: 64,
  });
  g.center();
  return g;
})();

const faceGeo = (() => {
  const g = new THREE.ShapeGeometry(roundedRect(FACE_W, FACE_H, RADIUS - BEV), 64);
  // ShapeGeometry dat uv = toa do x,y cua shape. Phai chuan hoa ve [0,1], neu
  // khong texture chi hien mot goc ti hon.
  const uv = g.attributes.uv;
  for (let i = 0; i < uv.count; i++) {
    uv.setXY(i, (uv.getX(i) + FACE_W / 2) / FACE_W, (uv.getY(i) + FACE_H / 2) / FACE_H);
  }
  uv.needsUpdate = true;
  return g;
})();

/**
 * Ba khe trong chong the. Lech CHEO len-phai, bi rang buoc boi hai dieu kien
 * nguoc nhau: thay ticker cua the sau thi phai tho ra phia TREN (>= 0.38 vi chu
 * tieu de nam o 0.14..0.38 tinh tu mep tren); thay bong giua cac the thi phai
 * tho ra ben PHAI (den chinh o [-4, 6.5, 7] hat bong xuong duoi-phai).
 */
const SLOTS: { p: [number, number, number]; rz: number }[] = [
  { p: [0.00, 0.00, 0.60], rz: 0.012 },
  { p: [0.26, 0.56, 0.30], rz: -0.007 },
  { p: [0.52, 1.12, 0.00], rz: 0.020 },
];

/** Tu the cua mot the trong pha hien tai. */
const pose = (slot: number, tl: number, dur: number, fly: boolean) => {
  const tf = dur - T_OUT; // luc bat dau lay da

  if (slot === 0) {
    if (!fly) {
      const s0 = SLOTS[0];
      return { x: s0.p[0], y: s0.p[1], z: s0.p[2], rx: 0, rz: s0.rz };
    }
    const u = clamp01((tl - tf - T_ANTIC) / T_TRAVEL);
    const p = u * u * u * (u * (u * 6 - 15) + 10); // smootherstep
    const arc = Math.sin(Math.PI * p);
    const bounce = springImpulse(tl - tf - T_ANTIC - T_TRAVEL, SPR_BOUNCE);
    // Lay da: lun nguoc huong truoc khi bat len — cu lun nay lam cai vuot sau
    // do manh gap doi ma khong phai tang toc do.
    const dip =
      tl > tf && tl < tf + T_ANTIC ? Math.sin(Math.PI * ((tl - tf) / T_ANTIC)) : 0;
    const s0 = SLOTS[0];
    const s2 = SLOTS[2];
    const b = clamp01((p - Z_BACK_FROM) / (Z_BACK_TO - Z_BACK_FROM));
    const bs = b * b * b * (b * (b * 6 - 15) + 10);
    return {
      x: lerp(s0.p[0], s2.p[0], p) + BOW * arc,
      y: lerp(s0.p[1], s2.p[1], p) + LIFT * arc - 0.055 * dip + 0.045 * bounce,
      // Nhinh ra truoc theo VONG CUNG khi bay len, roi lui ra sau sau khi qua
      // dinh. Phai bam theo `arc`: dat thang Z_RISE thi o dau pha the nhay mot
      // cai dung tai cho noi vong lap (do duoc: lech dau<->cuoi vot len 1.049
      // trong khi hai khung ke nhau chi 0.767).
      z: lerp(s0.p[2] + (Z_RISE - s0.p[2]) * arc, s2.p[2], bs),
      rx: -0.30 * arc,
      rz: lerp(s0.rz, s2.rz, p) + 0.06 * Math.sin(2 * Math.PI * p) + 0.014 * bounce,
    };
  }

  // Hai the con lai tien len mot khe, lech pha nhau (overlapping action).
  const from = SLOTS[slot];
  const to = SLOTS[slot - 1];
  if (!fly) {
    return { x: from.p[0], y: from.p[1], z: from.p[2], rx: 0, rz: from.rz };
  }
  const p = springStep(tl - tf - T_ANTIC - (slot - 1) * (4 / FPS), SPR_SLOT);
  return {
    x: lerp(from.p[0], to.p[0], p),
    y: lerp(from.p[1], to.p[1], p),
    z: lerp(from.p[2], to.p[2], p),
    rx: 0,
    rz: lerp(from.rz, to.rz, p),
  };
};

type Pose = ReturnType<typeof pose>;

/* ------------------------------------------------------------- vat lieu */

const usePmremEnv = () => {
  const raw = useMetalEnv({ top: "#7f93a8", bottom: "#3f7f74", amount: 0.5 }, true);
  const gl = useThree((s) => s.gl);
  return useMemo(() => {
    const gen = new THREE.PMREMGenerator(gl);
    const t = gen.fromEquirectangular(raw).texture;
    gen.dispose();
    return t;
  }, [gl, raw]);
};

const Card: React.FC<{
  name: CardName;
  env: THREE.Texture;
  q: Pose;
  ro: number;
  envRot: number;
}> = ({ name, env, q, ro, envRot }) => {
  const shell = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#D8E8D0",
        metalness: 0.86,
        roughness: 0.09, // canh vat DANH BONG
        envMap: env,
        envMapIntensity: 1.30,
        // Thuat toan hoa si: thu tu ve do renderOrder quyet dinh, khong phai bo
        // dem chieu sau. An toan vi the la khoi LOI — loai bo mat sau la du de
        // no tu che chinh no dung.
        depthTest: false,
        depthWrite: false,
      }),
    [env],
  );

  const face = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#ffffff", // mau kim loai nam trong base map, khong o material:
                          // nhan mau o day se nhan ca len men -> lime hoa mau bun
        map: TEX[name].base ?? undefined,
        roughnessMap: TEX[name].orm ?? undefined,
        metalnessMap: TEX[name].orm ?? undefined,
        normalMap: TEX[name].normal ?? undefined,
        normalScale: new THREE.Vector2(1.15, 1.15),
        metalness: 1,
        roughness: 1, // bi ORM map nhan de, de 1 keo bi nhan doi
        envMap: env,
        // Mat the lay it phan chieu hon canh vat: no la mat PHANG rong gan vuong
        // goc may quay nen hung tron ca moi truong, con canh vat thi cong.
        envMapIntensity: 0.80,
        depthTest: false,
        depthWrite: false,
      }),
    [env, name],
  );

  // Doc lai moi frame: three lay thang material.envMapRotation lam uniform.
  shell.envMapRotation.set(0, envRot, 0);
  face.envMapRotation.set(0, envRot, 0);

  return (
    <group position={[q.x, q.y, q.z]} rotation={[q.rx, 0, q.rz]}>
      <mesh geometry={bodyGeo} material={shell} renderOrder={ro} castShadow receiveShadow />
      {/* Mat the phai ve SAU than the: khong con bo dem chieu sau de tach hai
          cai nay ra, nen thu tu ve la thu duy nhat con lai. */}
      <mesh
        geometry={faceGeo}
        material={face}
        renderOrder={ro + 1}
        position={[0, 0, THICK / 2 + 0.0012]}
        receiveShadow
      />
    </group>
  );
};

const Stack: React.FC<{ t: number }> = ({ t }) => {
  const env = usePmremEnv();
  const { k, tl, dur, fly } = phaseAt(t);

  /**
   * THU TU VE SUY RA TU Z, KHONG DAT TAY.
   *
   * Cac the tat kiem tra chieu sau va ve tu sau ra truoc. Nhung thu tu do PHAI
   * suy ra tu chinh z: bong do van tinh tu vi tri 3D that, nen neu dat tay mot
   * moc doi trong khi z da lui ra sau tu truoc do, hai the kia — thuc su dang o
   * truoc — se do bong len the bay dung vat ly, ma mat lai thay the bay o phia
   * truoc. Ket qua la mot vet den hinh chu nhat dan len mat the (do duoc o
   * khung 216, bien mat khi tat castShadow).
   */
  const poses = NAMES.map((_, c) => pose((c - k + 3) % 3, tl, dur, fly));
  const rank: number[] = [];
  poses
    .map((q, i) => ({ i, z: q.z }))
    .sort((m, n) => m.z - n.z) // xa nhat ve truoc
    .forEach((e, r) => {
      rank[e.i] = r;
    });

  // Lo lung: 1 va 2 chu ky moi vong lap — deu chia het vong lap nen dong khung.
  const a = (t / LOOP) * Math.PI * 2;

  return (
    <group
      position={[RIG_X, RIG_Y + 0.045 * Math.sin(a), 0]}
      rotation={[0.014 * Math.sin(a), 0.018 * Math.sin(a * 2 + 1.1), 0.010 * Math.sin(a * 2 + 0.4)]}
    >
      {NAMES.map((name, c) => (
        <Card
          key={name}
          name={name}
          env={env}
          q={poses[c]}
          ro={RO_BASE + rank[c] * 10}
          envRot={(t / LOOP) * ENV_TURNS * Math.PI * 2}
        />
      ))}
    </group>
  );
};

/* ------------------------------------------------------------- cot chu */

const H_HEAD = 312;
const H_STAT = 208;
const H_LOGO = 172;
const GAP_1 = 46;
const GAP_2 = 39;
const CHIP = 78;
const CHIP_SM = 64;               // hang 11 logo cua pha tong ket
/**
 * Chong the da duoc nang len gan tam khung nen khoi chu tro lai ngang hang voi
 * no: 50px dua tam khoi chu ve dung tam chong the.
 */
const COL_DROP = 50;

/**
 * Vi tri guong: chi so pha dang hien, cong tien do chuyen sang pha ke tiep.
 * Dai bang ghi co SAU muc [0,1,2,3,0,1] chu khong phai bon: khi guong chay tu
 * muc 3 sang muc 4 (= ban sao cua 0) thi no truot TOI, khong nhay nguoc — do la
 * ca cai lam ra "guong quay". Muc 5 (= ban sao cua 1) de cho cu vuot dich cua
 * lo xo co cho ma vuot vao.
 */
const reelPos = (k: number, tl: number, dur: number, delayFrames: number) =>
  k + springStep(tl - (dur - T_OUT + T_ANTIC + REEL_LAG) - delayFrames / FPS, SPR_REEL);

/**
 * Chi cat cung o mep khung guong thi chu dang truot bi XEN NGANG THAN — doc ra
 * la loi hien thi chu khong ra guong quay, va o moi lan chuyen deu thay mot muc
 * cu bi cat doi nam duoi muc moi.
 *
 * Cach chua la lam MO va NHAT theo khoang cach toi vi tri dung: muc dang o dung
 * cho thi ro net, muc dang troi qua thi mo dan va nhat dan roi bien mat truoc
 * khi cham mep. Do cung la cach mat nguoi nhin mot guong quay that — vat chuyen
 * dong nhanh thi nhoe, khong phai bi cat.
 */
const Reel: React.FC<{ pos: number; h: number; children: React.ReactNode[] }> = ({
  pos,
  h,
  children,
}) => (
  <div style={{ height: h, overflow: "hidden", position: "relative" }}>
    <div style={{ transform: `translateY(${-pos * h}px)` }}>
      {children.map((c, i) => {
        const d = Math.abs(i - pos);
        return (
          <div
            key={i}
            style={{
              height: h,
              opacity: clamp01(1 - d * 1.7),
              filter: d > 0.02 ? `blur(${Math.min(d * 7, 6)}px)` : undefined,
            }}
          >
            {c}
          </div>
        );
      })}
    </div>
  </div>
);

const LABEL: React.CSSProperties = {
  fontSize: 35,
  fontWeight: 500,
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  color: "#93A79C",
};

const Chips: React.FC<{ files: string[]; wobble: (i: number) => number }> = ({ files, wobble }) => {
  const sz = files.length > 8 ? CHIP_SM : CHIP;
  return (
  <div style={{ display: "flex", gap: files.length > 8 ? 14 : 20, marginTop: 20 }}>
    {files.map((f, i) => (
      <div
        key={f + i}
        style={{
          width: sz,
          height: sz,
          borderRadius: sz / 2,
          overflow: "hidden",
          flex: "0 0 auto",
          // Vien va nen chip THONG NHAT cho moi logo. Can thiet vi kho logo tron
          // lan: projectx.jpg va pendle.jpg co nen TRANG, so con lai nen toi —
          // de tran thi hai cai do nhay han ra khoi hang.
          border: "1px solid rgba(255,255,255,0.26)",
          background: "#0E1A1C",
          transform: `translateY(${wobble(i)}px)`,
        }}
      >
        <Img
          src={staticFile(`partners/${f}`)}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>
    ))}
  </div>
  );
};

const TextColumn: React.FC<{ t: number }> = ({ t }) => {
  const { k, tl, dur } = phaseAt(t);
  const t0 = dur - T_OUT + T_ANTIC + REEL_LAG;
  // Moi chip lech nhau 2 khung — xung tat dan nen ve 0 truoc ranh gioi pha,
  // khong de lai buoc nhay o cho noi.
  const wobble = (i: number) => springImpulse(tl - t0 - (12 + i * 2) / FPS, SPR_CHIP) * 16;

  const order = [0, 1, 2, 3, 0, 1];

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        justifyContent: "center",
        paddingLeft: 158,
        paddingRight: 1400,
      }}
    >
      <div style={{ marginTop: COL_DROP }}>
        <Reel pos={reelPos(k, tl, dur, 0)} h={H_HEAD}>
          {order.map((s) => (
            <div
              style={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
                fontSize: 130,
                fontWeight: 500,
                lineHeight: 1.06,
                letterSpacing: "-0.02em",
                color: "#FFFFFF",
              }}
            >
              {SLIDES[s].head.map((l) => (
                <div key={l}>{l}</div>
              ))}
            </div>
          ))}
        </Reel>

        <div style={{ height: GAP_1 }} />
        <Reel pos={reelPos(k, tl, dur, 6)} h={H_STAT}>
          {order.map((s) =>
            SLIDES[s].statIsCopy ? (
              <div style={{ fontSize: 48, lineHeight: 1.45, color: "#C8D2CB", paddingTop: 6 }}>
                {SLIDES[s].stat.map((l) => (
                  <div key={l}>{l}</div>
                ))}
              </div>
            ) : (
              <div>
                <div style={LABEL}>{SLIDES[s].stat[0]}</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 18, marginTop: 12 }}>
                  <div
                    style={{
                      fontSize: 97,
                      fontWeight: 500,
                      color: "#E2F6A1",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {SLIDES[s].stat[1]}
                  </div>
                  {SLIDES[s].note ? (
                    <div style={{ fontSize: 35, color: "#93A79C" }}>{SLIDES[s].note}</div>
                  ) : null}
                </div>
              </div>
            ),
          )}
        </Reel>

        <div style={{ height: GAP_2 }} />
        <Reel pos={reelPos(k, tl, dur, 12)} h={H_LOGO}>
          {order.map((s) =>
            SLIDES[s].logos.length ? (
              <div>
                <div style={LABEL}>{SLIDES[s].logoLabel}</div>
                <Chips files={SLIDES[s].logos} wobble={wobble} />
              </div>
            ) : (
              <div />
            ),
          )}
        </Reel>
      </div>
    </AbsoluteFill>
  );
};

/* ---------------------------------------------------------------- khung */

export const CardsLoop: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;

  return (
    <AbsoluteFill style={{ backgroundColor: "#04192C", fontFamily: "Aeonik, sans-serif" }}>
      <AbsoluteFill>
        <ThreeCanvas
          shadows="soft"
          width={width}
          height={height}
          camera={{ fov: 40, position: [0, 0, 7.6], near: 1, far: 26 }}
          style={{ background: "transparent" }}
          gl={{ toneMapping: THREE.NoToneMapping }}
        >
          <Aurora t={t} width={width} height={height} loopSeconds={LOOP} />
          {/* Anh sang moi truong PHAI thap. De cao (1.25) thi no dap mot lop
              phang len toan canh va moi num khac deu mat tac dung: do duoc, ha
              1.25 -> 0.30 va nang den chinh 2.4 -> 6.5 keo tuong phan chu tren
              the tu 6.04 len 8.42:1 va chenh sang-toi mat the tu 1.55 len 2.04. */}
          <ambientLight intensity={0.30} />
          {/* Den chinh, va la den DUY NHAT do bong: nhieu nguon do bong cung luc
              thi bong chong cheo, doc ra ban chu khong ra chieu sau. */}
          <directionalLight
            position={[-4, 6.5, 7]}
            intensity={6.5}
            castShadow
            shadow-mapSize={[2048, 2048]}
            shadow-bias={-0.0004}
            shadow-normalBias={0.015}
            shadow-camera-left={-7}
            shadow-camera-right={7}
            shadow-camera-top={7}
            shadow-camera-bottom={-7}
            shadow-camera-near={0.5}
            shadow-camera-far={26}
          />
          <directionalLight position={[6, -3, 3]} intensity={0.5} color="#eaf7dc" />
          <directionalLight position={[1, 1.5, -6]} intensity={0.35} color="#ffffff" />
          <Stack t={t} />
        </ThreeCanvas>
      </AbsoluteFill>

      <TextColumn t={t} />

      {/* Dau Harmonix goc tren trai — cung vi tri va co nhu cac video truoc. */}
      <img src={hmnLogo} style={{ position: "absolute", left: 158, top: 84, height: 58 }} />
    </AbsoluteFill>
  );
};
