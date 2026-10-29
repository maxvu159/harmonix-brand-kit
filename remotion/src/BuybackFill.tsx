import React, { useMemo, useRef } from "react";
import {
  AbsoluteFill,
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
import { FRONTS } from "./markFront";
import hmnLogo from "./logos/harmonix/hmn-logo-text-v5.png";

/**
 * $HAR buyback — 14 giay.
 *
 * TREN KIM LOAI KHONG CO CHUYEN "TO MAU". Co che la CLOISONNE: mark la mot khoi
 * kim loai chai, dai lime la mot RANH KHOET CHIM, va cai dang len trong ranh la
 * MEN (dien moi, metalness 0) — chenh lech voi vanh kim loai giu cho men luon
 * doc duoc khi vet sang quet qua.
 *
 * MARK LA MOT VONG KHEP KIN quanh cai lo; hai mat cat phang chi la hai khac.
 * Men bat dau o CA HAI khac va chay theo ca hai chieu -> bon mat dan dau, hai
 * thuy cung day mot luc, gap nhau o giua cung ngoai moi thuy. Toa do dong chay
 * la ban do `flow` (fast marching, can bang theo dien tich, 16-bit) — xem
 * scripts/make_mark_maps.py.
 *
 * MEP MEN: khu rang cua theo PIXEL MAN HINH (fwidth), khong theo don vi ban do;
 * lan song nhe theo thoi gian; co go meniscus phong len bat mot duong sang; mat
 * men moi co gon song chay doc dong, tat dan khi nguoi. Go va gon la BUMP tinh
 * tu dao ham man hinh (Mikkelsen) — khong can them ban do nao.
 *
 * KHONG BAN TRONG LUC. Men la KIM LOAI NONG CHAY DUOC BOM QUA RANH; dau nong
 * phat sang la thu xoa cach doc "chat long chay nguoc len" khi mark dang quay.
 *
 * TIA SANG thay dong xu. Dong xu nho o kho feed bi chay thanh dia mau kem roi
 * bien mat dot ngot. Con so 15M+ tren man hinh da noi "mua lai HAR", nen dau
 * vao chi can la NANG LUONG: moi tia bay cong vao dung mot mat dan dau, duoi
 * cua no bi hut het vao men — khong co khoanh khac "bien mat".
 *
 * SO DEM chay cung tien trinh men: logo day bao nhieu thi so len bay nhieu.
 */

const FPS = 60;
const LOOP = 14.0;

/* ------------------------------------------------------------------ nhip */

const T_FILL0 = 1.55;     // men bat dau chay
const T_FILL1 = 8.60;     // bon mat dan dau gap nhau + mark cham chinh dien
const T_COOL = 9.90;      // men nguoi han
const T_BODY = 9.20;      // cau than
const FLY = 0.9;          // thoi gian bay cua mot tia sang
const TAIL = 0.24;        // chieu dai duoi tia, theo tham so duong bay

/* -------------------------------------------------------------- hinh hoc */

// Nho hon ban truoc 19%: chu gio la nhan vat chinh, logo khong duoc chiem khung.
const MARK_SIZE = 4.4;
const K = MARK_SIZE / 250;
const mx = (x: number) => (x - 125) * K;
const my = (y: number) => (125 - y) * K;

const RIG: [number, number, number] = [2.3, -0.02, 0];
const YAW0 = -0.66;   // -38 do
const PITCH0 = 0.16;  // +9 do
const THICK = 0.23;
const ENV_TURNS = 1.25;
const CAM_Z = 14.23;

const N_STREAKS = 40;
const SEG = 22;           // so doan cua mot duoi tia
const TOTAL = 15;         // trieu $HAR — do user cung cap

/* ------------------------------------------------------------- tien ich */

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
const smoother = (v: number) => {
  const u = clamp01(v);
  return u * u * u * (u * (u * 6 - 15) + 10);
};

const rnd = (i: number) => {
  const s = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};

const springImpulse = (t: number, w: number, z: number) => {
  if (t <= 0) return 0;
  const wd = w * Math.sqrt(1 - z * z);
  return Math.exp(-z * w * t) * Math.sin(wd * t);
};

/**
 * Tien trinh men. Ban do da can bang theo DIEN TICH nen tuyen tinh = luu luong
 * khong doi; tron 30% cosine de dau va cuoi co mot nhip vao/ra, khong giat.
 */
const fillAt = (t: number) => {
  const u = clamp01((t - T_FILL0) / (T_FILL1 - T_FILL0));
  return 0.7 * u + 0.3 * (0.5 - 0.5 * Math.cos(Math.PI * u));
};

/* ------------------------------------------------------------- ban do */

const TEX: Record<string, THREE.Texture | null> = { flow: null, normal: null };
const SRC: Record<string, string> = {
  flow: "mark/mark-flow.png",
  normal: "mark/mark-normal.png",
};
{
  const loader = new THREE.TextureLoader();
  for (const key of Object.keys(SRC)) {
    const handle = delayRender(`Doi ban do: ${key}`);
    loader.load(
      staticFile(SRC[key]),
      (t) => {
        t.colorSpace = THREE.NoColorSpace;
        if (key === "flow") {
          // flow nam trong HAI byte (R cao, B thap). Loc tuyen tinh tren gia tri
          // da tach byte se tron byte thap qua ranh gioi byte cao -> vet gay. Nen
          // lay mau NEAREST roi tu noi suy song tuyen trong shader SAU khi giai ma.
          t.magFilter = THREE.NearestFilter;
          t.minFilter = THREE.NearestFilter;
          t.generateMipmaps = false;
        } else {
          t.anisotropy = 16;
        }
        TEX[key] = t;
        continueRender(handle);
      },
      undefined,
      (e) => {
        console.error(`Khong tai duoc ban do ${key}`, e);
        continueRender(handle);
      },
    );
  }
}

/** Dom sang tron cho dau tia va vet toe. */
const GLOW_TEX = (() => {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  const r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  r.addColorStop(0, "rgba(255,255,255,1)");
  r.addColorStop(0.25, "rgba(255,255,255,0.55)");
  r.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = r;
  g.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
})();

/* ------------------------------------------------------------- khoi mark */

const buildMarkShape = () => {
  const s = new THREE.Shape();
  s.moveTo(mx(183.3), my(66));
  s.bezierCurveTo(mx(150.3), my(46.8), mx(120.4), my(71.4), mx(98.2), my(109.7));
  s.lineTo(mx(62.2), my(88.2));
  s.bezierCurveTo(mx(40.0), my(126.5), mx(33.8), my(164.9), mx(66.8), my(183.3));
  s.bezierCurveTo(mx(99.8), my(201.7), mx(129.7), my(178.7), mx(151.9), my(140.4));
  s.lineTo(mx(187.9), my(161.1));
  s.bezierCurveTo(mx(210.1), my(122.7), mx(216.3), my(85.1), mx(183.3), my(66));

  const h = new THREE.Path();
  h.moveTo(mx(145.7), my(136.5));
  h.bezierCurveTo(mx(132.7), my(158.7), mx(117.3), my(174.1), mx(102.0), my(164.9));
  h.bezierCurveTo(mx(86.7), my(156.5), mx(92.8), my(135.0), mx(105.1), my(112.8));
  h.bezierCurveTo(mx(117.4), my(90.6), mx(133.5), my(75.2), mx(148.8), my(83.7));
  h.bezierCurveTo(mx(163.3), my(93.6), mx(158.0), my(114.3), mx(145.7), my(136.5));
  s.holes.push(h);
  return s;
};

/** UV chuan hoa 0..1 tren o vuong 250 goc — cung o vuong voi cac ban do. */
const uvGen = {
  generateTopUV(_g: unknown, v: number[], ia: number, ib: number, ic: number) {
    const f = (i: number) =>
      new THREE.Vector2(v[i * 3] / MARK_SIZE + 0.5, v[i * 3 + 1] / MARK_SIZE + 0.5);
    return [f(ia), f(ib), f(ic)];
  },
  generateSideWallUV(_g: unknown, v: number[], ia: number, ib: number, ic: number, id: number) {
    const f = (i: number) =>
      new THREE.Vector2(v[i * 3] / MARK_SIZE + 0.5, v[i * 3 + 1] / MARK_SIZE + 0.5);
    return [f(ia), f(ib), f(ic), f(id)];
  },
};

const MARK_GEO = (() => {
  const g = new THREE.ExtrudeGeometry(buildMarkShape(), {
    depth: THICK,
    curveSegments: 96,
    bevelEnabled: true,
    bevelThickness: 0.028,
    bevelSize: 0.028,
    bevelOffset: 0,
    bevelSegments: 4,
    UVGenerator: uvGen,
  } as THREE.ExtrudeGeometryOptions);
  // Goc toa do o giua be day. KHONG .center(): hinh doi xung xoay 180 do quanh
  // (125,125) nen da can san theo x/y, dich x/y se lech phep tra ban do.
  g.translate(0, 0, -THICK / 2);
  return g;
})();

/* -------------------------------------------------------------- tia sang */

type Streak = {
  t0: number;
  branch: number;
  idx: number;
  from: THREE.Vector3;
  bend: number;
};

const STREAKS: Streak[] = Array.from({ length: N_STREAKS }, (_, i) => {
  const land = T_FILL0 + 0.15 + (i / (N_STREAKS - 1)) * (T_FILL1 - T_FILL0 - 0.3);
  const branch = i % 4;
  const idx = Math.min(127, Math.round(fillAt(land) * 127));
  // Tia bay tu PHIA NGOAI cua nhanh no nham toi — khong bao gio cat ngang mark.
  const [fx, fy] = FRONTS[branch][idx];
  const a = Math.atan2(fy, fx) + (rnd(i * 2.7) - 0.5) * 1.1;
  const r = 5.2 + rnd(i * 3.3) * 1.8;
  return {
    t0: land - FLY,
    branch,
    idx,
    from: new THREE.Vector3(
      RIG[0] + Math.cos(a) * r * 1.2,
      RIG[1] + Math.sin(a) * r * 0.75,
      1.2 + rnd(i * 5.1) * 2.2,
    ),
    bend: (rnd(i * 7.7) - 0.5) * 2.2,
  };
});

/** Bezier bac hai. */
const quad = (a: THREE.Vector3, c: THREE.Vector3, b: THREE.Vector3, s: number, out: THREE.Vector3) => {
  const v = 1 - s;
  return out.set(
    v * v * a.x + 2 * v * s * c.x + s * s * b.x,
    v * v * a.y + 2 * v * s * c.y + s * s * b.y,
    v * v * a.z + 2 * v * s * c.z + s * s * b.z,
  );
};

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

const CAP_PARS = `
varying vec2 vFlowUv;
uniform sampler2D uFlow;
uniform float uFlowSize, uProg, uHot, uMen, uFlash, uBand, uTime;
uniform vec3 cMetal, cFloor, cEnam, cHot;
float gGroove, gGF, gBehind, gH;

float decFlow(vec4 t) {
  return (floor(t.r * 255.0 + 0.5) * 256.0 + floor(t.b * 255.0 + 0.5)) / 65535.0;
}
// Noi suy song tuyen SAU khi giai ma 16-bit (xem ghi chu o bo tai ban do).
vec2 flowAt(vec2 uv) {
  vec2 st = uv * uFlowSize - 0.5;
  vec2 i0 = floor(st);
  vec2 f = st - i0;
  float inv = 1.0 / uFlowSize;
  vec4 a = texture2D(uFlow, (i0 + vec2(0.5, 0.5)) * inv);
  vec4 b = texture2D(uFlow, (i0 + vec2(1.5, 0.5)) * inv);
  vec4 c = texture2D(uFlow, (i0 + vec2(0.5, 1.5)) * inv);
  vec4 d = texture2D(uFlow, (i0 + vec2(1.5, 1.5)) * inv);
  float fl = mix(mix(decFlow(a), decFlow(b), f.x), mix(decFlow(c), decFlow(d), f.x), f.y);
  float gr = mix(mix(a.g, b.g, f.x), mix(c.g, d.g, f.x), f.y);
  return vec2(fl, gr);
}
`;

const CAP_COLOR = `
{
  vec2 fg = flowAt(vFlowUv);
  float flow = fg.x;
  gGroove = fg.y;
  float running = step(0.0005, uProg) * (1.0 - step(0.9995, uProg));

  // Mep lan song nhe: hai song cheo nhau, chay theo thoi gian.
  float wob = 0.0032 * sin(vFlowUv.x * 88.0 + uTime * 2.6) * sin(vFlowUv.y * 71.0 - uTime * 2.1)
            + 0.0018 * sin((vFlowUv.x + vFlowUv.y) * 150.0 - uTime * 4.3);
  float p = uProg + wob * running;

  // Khu rang cua theo PIXEL MAN HINH: be rong mep = 1.5 pixel, bat ke ban do.
  float w = max(fwidth(flow) * 1.5, 0.0008);
  float filled = (1.0 - smoothstep(p - w, p + w, flow)) * step(0.0005, uProg);
  gGF = gGroove * filled;
  gBehind = max(0.0, p - flow);

  // Be mat men: go meniscus phong len ngay sau mep + gon song tren men moi.
  float lip = exp(-pow((flow - p + 0.006) / 0.010, 2.0));
  float rip = sin(gBehind * 95.0 - uTime * 6.0) * exp(-gBehind / 0.12) * filled;
  gH = gGroove * (0.010 * lip * running + 0.0030 * rip * uHot);

  diffuseColor.rgb *= mix(mix(cMetal, cFloor, gGroove), cEnam, gGF);
}
`;

const CAP_BUMP = `
{
  // Bump tu dao ham man hinh (Mikkelsen 2010) — go va gon khong can ban do.
  vec3 pos = -vViewPosition;
  vec3 dpx = dFdx(pos);
  vec3 dpy = dFdy(pos);
  float hx = dFdx(gH);
  float hy = dFdy(gH);
  vec3 r1 = cross(dpy, normal);
  vec3 r2 = cross(normal, dpx);
  float det = dot(dpx, r1);
  vec3 grad = sign(det) * (hx * r1 + hy * r2);
  normal = normalize(abs(det) * normal - grad);
}
`;

const CAP_EMIT = `
{
  float hotBand = exp(-pow(gBehind / uBand, 1.6));
  float menis = exp(-pow(gBehind / 0.008, 2.0));
  totalEmissiveRadiance += cHot * gGF * (hotBand * uHot * 1.15 + menis * uMen * 1.4)
                         + cEnam * gGF * uFlash * 0.45;
}
`;

/* ----------------------------------------------------------------- canh */

const Scene: React.FC<{ t: number }> = ({ t }) => {
  const env = usePmremEnv();

  const prog = fillAt(t);
  const cooled = clamp01((t - T_FILL1) / (T_COOL - T_FILL1));
  const hot = (1 - cooled) * clamp01((t - T_FILL0) / 0.25);
  const flash = Math.max(0, 1 - Math.abs(t - (T_FILL1 + 0.06)) / 0.34);

  /* --- tu the mark: co san tu khung dau, quay dan ve chinh dien --- */
  const turn = smoother(t / T_FILL1);
  const settle = springImpulse(t - T_FILL1, 15, 0.42) * 0.011;
  const breath = 0.0045 * Math.sin((2 * Math.PI * t) / 6.5);
  const yaw = lerp(YAW0, 0, turn) + settle + breath;
  const pitch = lerp(PITCH0, 0, turn) + 0.0035 * Math.sin((2 * Math.PI * t) / 5.1);
  const bob = 0.03 * Math.sin((2 * Math.PI * t) / 7.0);
  const envRot = (t / LOOP) * ENV_TURNS * Math.PI * 2;

  /* --- vat lieu mat mark --- */
  const uni = useRef({
    uFlow: { value: null as THREE.Texture | null },
    uFlowSize: { value: 2048 },
    uProg: { value: 0 },
    uHot: { value: 0 },
    uMen: { value: 0 },
    uFlash: { value: 0 },
    uTime: { value: 0 },
    uBand: { value: 0.07 },
    cMetal: { value: new THREE.Color("#C7D6C8") },
    cFloor: { value: new THREE.Color("#7C9082") },
    cEnam: { value: new THREE.Color("#E2F6A1") },
    cHot: { value: new THREE.Color("#F4FFCF") },
  });

  const cap = useMemo(() => {
    const m = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 1,
      roughness: 1,
      normalScale: new THREE.Vector2(3.0, 3.0),
      envMap: env,
      envMapIntensity: 0.58,
    });
    m.onBeforeCompile = (sh) => {
      Object.assign(sh.uniforms, uni.current);
      sh.vertexShader = sh.vertexShader
        .replace("#include <common>", "#include <common>\nvarying vec2 vFlowUv;")
        .replace(
          "#include <begin_vertex>",
          `#include <begin_vertex>\n  vFlowUv = position.xy / ${MARK_SIZE.toFixed(4)} + 0.5;`,
        );
      sh.fragmentShader = sh.fragmentShader
        .replace("#include <common>", `#include <common>\n${CAP_PARS}`)
        .replace("#include <color_fragment>", `#include <color_fragment>\n${CAP_COLOR}`)
        .replace(
          "#include <roughnessmap_fragment>",
          `#include <roughnessmap_fragment>
  roughnessFactor = mix(mix(0.16, 0.44, gGroove), 0.30, gGF);`,
        )
        .replace(
          "#include <metalnessmap_fragment>",
          `#include <metalnessmap_fragment>
  metalnessFactor = mix(mix(0.42, 0.34, gGroove), 0.02, gGF);`,
        )
        .replace("#include <normal_fragment_maps>", `#include <normal_fragment_maps>\n${CAP_BUMP}`)
        .replace("#include <emissivemap_fragment>", `#include <emissivemap_fragment>\n${CAP_EMIT}`);
    };
    return m;
  }, [env]);

  const side = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#CBD9CC",
        metalness: 0.88,
        roughness: 0.085,
        envMap: env,
        envMapIntensity: 0.95,
      }),
    [env],
  );

  uni.current.uProg.value = prog;
  uni.current.uHot.value = hot;
  uni.current.uMen.value = hot;
  uni.current.uFlash.value = flash;
  uni.current.uTime.value = t;
  if (TEX.flow) uni.current.uFlow.value = TEX.flow;
  // Gan normalMap theo lenh moi frame: material dung trong useMemo chup TEX o
  // lan chay dau, luc do texture co the chua tai xong (loi da vap o ban 1).
  if (TEX.normal && cap.normalMap !== TEX.normal) {
    cap.normalMap = TEX.normal;
    cap.needsUpdate = true;
  }
  cap.envMapRotation.set(0, envRot, 0);
  side.envMapRotation.set(0, envRot, 0);

  /* --- tia sang --- */
  const rotM = new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(pitch, yaw, 0));
  const rigNow = new THREE.Vector3(RIG[0], RIG[1] + bob, RIG[2]);

  const ribbons = useMemo(
    () =>
      STREAKS.map(() => {
        const g = new THREE.BufferGeometry();
        g.setAttribute("position", new THREE.BufferAttribute(new Float32Array((SEG + 1) * 2 * 3), 3));
        g.setAttribute("color", new THREE.BufferAttribute(new Float32Array((SEG + 1) * 2 * 3), 3));
        const idx: number[] = [];
        for (let k = 0; k < SEG; k++) {
          const a = k * 2;
          idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
        }
        g.setIndex(idx);
        return g;
      }),
    [],
  );

  const ribbonMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        vertexColors: true,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        toneMapped: false,
      }),
    [],
  );

  const HEAD = new THREE.Color("#F4FFCF");
  const TAILC = new THREE.Color("#B9E26A");
  const cam = new THREE.Vector3(0, 0, CAM_Z);
  const tmp = new THREE.Vector3();
  const prev = new THREE.Vector3();
  const tng = new THREE.Vector3();
  const sideV = new THREE.Vector3();
  const view = new THREE.Vector3();

  const heads: { p: THREE.Vector3; a: number; s: number; key: string }[] = [];

  const live = STREAKS.map((st, i) => {
    const u = (t - st.t0) / FLY;
    // song toi khi DUOI cung da bi hut het vao men
    if (u <= 0 || u >= 1 + TAIL * 1.25) return false;

    const [fx, fy] = FRONTS[st.branch][st.idx];
    const to = new THREE.Vector3(fx * MARK_SIZE, fy * MARK_SIZE, THICK / 2 + 0.03)
      .applyMatrix4(rotM)
      .add(rigNow);
    const d = to.clone().sub(st.from);
    const ctrl = st.from
      .clone()
      .lerp(to, 0.5)
      .add(new THREE.Vector3(-d.y, d.x, 0).normalize().multiplyScalar(st.bend));

    const ease = (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : Math.pow(x, 1.35));
    const sHead = ease(u);
    const sTail = ease(u - TAIL);
    const fadeIn = clamp01(u * 5);

    const pos = ribbons[i].getAttribute("position") as THREE.BufferAttribute;
    const col = ribbons[i].getAttribute("color") as THREE.BufferAttribute;
    for (let k = 0; k <= SEG; k++) {
      const q = k / SEG; // 0 = duoi, 1 = dau
      const s = lerp(sTail, sHead, q);
      quad(st.from, ctrl, to, s, tmp);
      quad(st.from, ctrl, to, Math.max(0, s - 0.01), prev);
      tng.subVectors(tmp, prev);
      if (tng.lengthSq() < 1e-12) tng.subVectors(to, st.from);
      tng.normalize();
      view.subVectors(cam, tmp).normalize();
      sideV.crossVectors(tng, view).normalize();
      const w = 0.028 * Math.pow(q, 0.8);
      pos.setXYZ(k * 2, tmp.x + sideV.x * w, tmp.y + sideV.y * w, tmp.z + sideV.z * w);
      pos.setXYZ(k * 2 + 1, tmp.x - sideV.x * w, tmp.y - sideV.y * w, tmp.z - sideV.z * w);
      const a = Math.pow(q, 1.6) * fadeIn * 0.9;
      const c = TAILC.clone().lerp(HEAD, q);
      col.setXYZ(k * 2, c.r * a, c.g * a, c.b * a);
      col.setXYZ(k * 2 + 1, c.r * a, c.g * a, c.b * a);
    }
    pos.needsUpdate = true;
    col.needsUpdate = true;
    ribbons[i].computeBoundingSphere();

    if (u < 1) {
      heads.push({ p: quad(st.from, ctrl, to, sHead, new THREE.Vector3()), a: fadeIn, s: 0.2, key: `h${i}` });
    } else {
      // Vet toe khi cham men: dom sang mem no ra roi tat.
      const k = clamp01((u - 1) / (TAIL * 1.25));
      heads.push({ p: to, a: (1 - k) * 0.85, s: lerp(0.22, 0.62, Math.sqrt(k)), key: `h${i}` });
    }
    return true;
  });

  /* --- bui lime hut VAO --- */
  const dust = useMemo(() => {
    const n = 80;
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(n * 3), 3));
    g.setAttribute("color", new THREE.BufferAttribute(new Float32Array(n * 3), 3));
    return g;
  }, []);

  useMemo(() => {
    const pos = dust.getAttribute("position") as THREE.BufferAttribute;
    const col = dust.getAttribute("color") as THREE.BufferAttribute;
    const liveF = clamp01((t - T_FILL0 + 0.6) / 1.2) * (1 - 0.55 * cooled);
    for (let i = 0; i < pos.count; i++) {
      const ph = (t / 3.6 + rnd(i)) % 1;
      const r = 0.8 + 2.5 * Math.pow(1 - ph, 1.7);
      const a = rnd(i * 7.3) * Math.PI * 2 + ph * 0.45;
      pos.setXYZ(i, RIG[0] + Math.cos(a) * r * 1.15, RIG[1] + Math.sin(a) * r * 0.8, -0.6 + rnd(i * 3.1) * 3.2);
      const fade = Math.min(ph * 4, (1 - ph) * 3, 1) * liveF * 0.45;
      const mint = i % 6 === 0;
      col.setXYZ(i, (mint ? 0.59 : 0.89) * fade, (mint ? 0.99 : 0.96) * fade, (mint ? 0.89 : 0.63) * fade);
    }
    pos.needsUpdate = true;
    col.needsUpdate = true;
  }, [dust, t, cooled]);

  return (
    <>
      <mesh
        geometry={MARK_GEO}
        material={[cap, side]}
        position={[RIG[0], RIG[1] + bob, RIG[2]]}
        rotation={[pitch, yaw, 0]}
        castShadow
        receiveShadow
      />

      {ribbons.map((g, i) => (live[i] ? <mesh key={i} geometry={g} material={ribbonMat} /> : null))}

      {heads.map((h) => (
        <sprite key={h.key} position={[h.p.x, h.p.y, h.p.z]} scale={[h.s, h.s, 1]}>
          <spriteMaterial
            map={GLOW_TEX}
            color="#F4FFCF"
            transparent
            opacity={h.a}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </sprite>
      ))}

      <points geometry={dust}>
        <pointsMaterial
          size={0.024}
          sizeAttenuation
          vertexColors
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </>
  );
};

/* ------------------------------------------------------------- cot chu */

const MUTE = "#93A79C";
const LIME = "#E2F6A1";

/** Hien dan: mo + truot len 22px. Cadence do tu clip Sky: 13 khung moi dong. */
const Reveal: React.FC<{ at: number; t: number; children: React.ReactNode; style?: React.CSSProperties }> = ({
  at,
  t,
  children,
  style,
}) => {
  const u = smoother((t - at) / 0.22);
  return <div style={{ ...style, opacity: u, transform: `translateY(${(1 - u) * 22}px)` }}>{children}</div>;
};

const TextColumn: React.FC<{ t: number }> = ({ t }) => {
  const p = fillAt(t);
  // So chay CUNG tien trinh men; chot "15M+" dung luc bon mat dan dau gap nhau.
  const value = t >= T_FILL1 ? `${TOTAL}M+` : `${(TOTAL * p).toFixed(1)}M`;

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {/* Cot chu xep theo DONG CHAY flexbox, khong dat toa do tung khoi. */}
      <div
        style={{
          position: "absolute",
          left: 158,
          top: 0,
          bottom: 0,
          width: 1180,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          fontFamily: "Aeonik, sans-serif",
        }}
      >
        <Reveal at={0.0} t={t} style={{ fontSize: 34, fontWeight: 500, letterSpacing: "0.18em", color: LIME }}>
          $HAR BUYBACK
        </Reveal>

        <div style={{ height: 26 }} />

        {["Protocol revenue,", "back into $HAR."].map((s, i) => (
          <Reveal
            key={s}
            at={0.08 + i * 0.1}
            t={t}
            style={{ fontSize: 104, fontWeight: 600, lineHeight: "116px", letterSpacing: "-0.028em", color: "#F2F8EE" }}
          >
            {s}
          </Reveal>
        ))}

        <div style={{ height: 70 }} />

        <Reveal at={T_FILL0 - 0.3} t={t}>
          <div
            style={{
              fontSize: 168,
              fontWeight: 600,
              lineHeight: "168px",
              letterSpacing: "-0.035em",
              color: LIME,
              fontVariantNumeric: "tabular-nums",
              minWidth: 520,
            }}
          >
            {value}
          </div>
          <div style={{ marginTop: 14, fontSize: 36, fontWeight: 500, color: MUTE, letterSpacing: "0.01em" }}>
            $HAR repurchased so far
          </div>
        </Reveal>

        <div style={{ height: 58 }} />

        {["The more Harmonix earns,", "the faster it buys."].map((s, i) => (
          <Reveal
            key={s}
            at={T_BODY + i * 0.1}
            t={t}
            style={{ fontSize: 46, fontWeight: 400, lineHeight: "60px", color: "#C9D6CB" }}
          >
            {s}
          </Reveal>
        ))}
      </div>
    </AbsoluteFill>
  );
};

/* ---------------------------------------------------------------- khung */

export const BuybackFill: React.FC = () => {
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
          camera={{ fov: 22, position: [0, 0, CAM_Z], near: 1, far: 40 }}
          style={{ background: "transparent" }}
          gl={{ toneMapping: THREE.NoToneMapping }}
        >
          <Aurora t={t} width={width} height={height} loopSeconds={LOOP} />
          <ambientLight intensity={0.18} />
          <directionalLight
            position={[-4, 6.5, 7]}
            intensity={3.2}
            castShadow
            shadow-mapSize={[2048, 2048]}
            shadow-bias={-0.0004}
            shadow-normalBias={0.015}
            shadow-camera-left={-7}
            shadow-camera-right={7}
            shadow-camera-top={7}
            shadow-camera-bottom={-7}
            shadow-camera-near={0.5}
            shadow-camera-far={44}
          />
          <directionalLight position={[6, -3, 3]} intensity={0.34} color="#eaf7dc" />
          <directionalLight position={[1, 1.5, -6]} intensity={0.22} color="#ffffff" />
          <Scene t={t} />
        </ThreeCanvas>
      </AbsoluteFill>

      <TextColumn t={t} />

      <img src={hmnLogo} style={{ position: "absolute", left: 158, top: 84, height: 58 }} />
    </AbsoluteFill>
  );
};
