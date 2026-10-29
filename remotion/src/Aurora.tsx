import React, { useMemo, useRef } from "react";
import * as THREE from "three";

/**
 * Nen MESH GRADIENT that — luoi diem dieu khien, khong phai blob.
 *
 * VI SAO PHAI LAM THE NAY (do 2026-09-10, so voi wallpaper Apple):
 *   Ban truoc dung cac radial-gradient xep chong. Do la cach CSS DI VONG vi CSS
 *   khong co nguyen thuy mesh — no dung hinh tron lam vien gach, nen mat luon
 *   nhin ra hinh tron du chinh tham so kieu gi.
 *   Mesh gradient THAT (Illustrator Gradient Mesh, SwiftUI MeshGradient tren
 *   iOS 18, mesh gradient trong SVG2) la mot LUOI DIEM DIEU KHIEN, moi diem co
 *   toa do va mau; mau o giua duoc noi suy bicubic tu 4 goc o luoi. Khong co
 *   tam, khong co ban kinh, khong co bien.
 *
 * CHUYEN DONG = KEO CAC DIEM BEN TRONG LUOI.
 *   Vanh ngoai GHIM CO DINH nen khung khong bao gio ho; chi cac diem ben trong
 *   di chuyen. Keo mot diem thi ca vung quanh no gian theo -> ca tam mau bien
 *   dang, mau bi keo le va meo di. Day la thu blob khong lam duoc: blob chi
 *   truot qua truot lai, khong co "tam mau" nao de bien dang.
 *   (Dung cach Apple mo ta cho MeshGradient: chi doi vai diem ben trong, ghim mep.)
 *
 * QUY DAO LISSAJOUS chu khong phai duong tron: x va y dao dong o hai tan so
 *   khac nhau nen toc do tu nhien luc nhanh luc cham. Duong tron cho toc do
 *   DEU — doc ra la chuyen dong co khi. (Apple ease-in-out moi thu, khong bao
 *   gio tuyen tinh.)
 *
 * LAP KIN: moi tan so la boi so NGUYEN cua chu ky. Cac boi so phai NGUYEN TO
 *   CUNG NHAU (2 va 3), neu khong nen se lap lai nguyen si o giua video.
 *
 * DUNG LAI CHO VIDEO KHAC: truyen `config`. Xem skill `harmonix-mesh-bg`.
 */

/** Mot diem ben trong: quy dao Lissajous + nhip dao mau. */
export type MeshPoint = {
  /** bien do keo NGANG (don vi NDC, khung rong 2). Xem canh bao o duoi. */
  ax: number;
  /** bien do keo DOC. */
  ay: number;
  /** so vong ngang moi chu ky — PHAI NGUYEN. */
  kx: number;
  /** so vong doc moi chu ky — PHAI NGUYEN, va khac kx de ra Lissajous. */
  ky: number;
  px: number;
  py: number;
  /** so vong dao mau moi chu ky — PHAI NGUYEN. */
  ck: number;
  cp: number;
  /** mau bien the; diem se dao qua lai giua `grid` va mau nay. */
  alt: string;
};

export type MeshConfig = {
  /** Luoi mau NY hang x NX cot, hang dau = tren cung. Toi thieu 3x3. */
  grid: string[][];
  /** Cac diem BEN TRONG, thu tu trai-phai roi tren-xuong. Do dai = (NX-2)*(NY-2). */
  points: MeshPoint[];
  /** Chia moi o luoi thanh sub x sub tam giac. 18 la du muot o kho 2K. */
  sub?: number;
  /** Bien do hat theo do sang (LSB). Phan mau luon co dinh 6 LSB. */
  grain?: number;
};

/**
 * Cau hinh Harmonix mac dinh — do va can tren video PT-haHYPE 2026-09-10.
 *
 * MAU: hai cot trai TOI (cot chu nam do) nhung phai NO MAU. Do duoc: nen blob cu
 * co do tuoi 43.5 con wallpaper Apple 110-221. Vung toi van co the rat no mau;
 * gan xam moi la thu lam nen chet. Hai cot phai sang va tuoi hon, nhung khong
 * qua ~140 do sang de dong xu bac con noi len duoc.
 *
 * BIEN DO NGANG DAT RIENG THEO COT. 0.26 NDC nghe nho nhung bang 13% be ngang
 * khung = 333px — du de loi mau sang cua cot phai vao han vung chu, keo tuong
 * phan xuong 3.08:1. Cot trai 0.06-0.07, cot giua 0.11-0.13, cot phai 0.22-0.25.
 * Bien do DOC de rong duoc, it nguy hiem hon.
 */
export const HARMONIX_MESH: MeshConfig = {
  grid: [
    ["#05203A", "#06364A", "#084C4C", "#0C7C72", "#15957E"],
    ["#041A30", "#052C3E", "#073E42", "#0A7A68", "#1FA184"],
    ["#04192C", "#052836", "#063C3C", "#108C70", "#2BB187"],
    ["#051C2E", "#062E3A", "#07423E", "#0E8468", "#23A87E"],
    ["#031428", "#042630", "#053836", "#0B7660", "#189A74"],
  ],
  points: [
    { ax: 0.07, ay: 0.16, kx: 2, ky: 3, px: 0.0, py: 1.3, ck: 2, cp: 0.4, alt: "#04243A" },
    { ax: 0.12, ay: 0.20, kx: 3, ky: 2, px: 1.7, py: 4.1, ck: 3, cp: 2.2, alt: "#06424A" },
    { ax: 0.24, ay: 0.17, kx: 2, ky: 3, px: 3.4, py: 0.6, ck: 2, cp: 4.0, alt: "#1C9E8E" },
    { ax: 0.06, ay: 0.22, kx: 3, ky: 2, px: 5.0, py: 2.9, ck: 3, cp: 1.1, alt: "#072A44" },
    { ax: 0.13, ay: 0.18, kx: 2, ky: 3, px: 0.9, py: 5.4, ck: 2, cp: 3.3, alt: "#064E4A" },
    { ax: 0.22, ay: 0.24, kx: 3, ky: 2, px: 2.6, py: 1.1, ck: 3, cp: 5.1, alt: "#22A882" },
    { ax: 0.07, ay: 0.19, kx: 2, ky: 3, px: 4.3, py: 3.7, ck: 2, cp: 2.7, alt: "#052E42" },
    { ax: 0.11, ay: 0.24, kx: 3, ky: 2, px: 6.0, py: 0.2, ck: 3, cp: 0.8, alt: "#075246" },
    { ax: 0.25, ay: 0.17, kx: 2, ky: 3, px: 1.2, py: 4.8, ck: 2, cp: 4.6, alt: "#0A7C84" },
  ],
  sub: 18,
  grain: 9.0,
};

const VERT = `
attribute vec3 mcolor;
varying vec3 vCol;
void main() {
  vCol = mcolor;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

const FRAG = `
precision highp float;
varying vec3 vCol;
uniform float uTime;
uniform float uGrain;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

vec3 toSRGB(vec3 c) {
  c = max(c, vec3(0.0));
  return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(vec3(0.0031308), c));
}

void main() {
  vec3 col = vCol;

  // Framebuffer cua pipeline nay GIAI MA sRGB mot lan tren gia tri shader ghi ra
  // (PNG = decode(written), do 2026-09-09). vCol da o he sRGB nen chi can encode
  // MOT lan la khop dung mau CSS cua cot chu.
  col = toSRGB(col);

  // GRAIN. Tach hai phan roi lieu khac nhau (do 2026-09-10):
  //   - do sang: mat rat nhay, lieu vua phai
  //   - mau thuan tuy: mat kem nhay hon nhieu, bom manh de pha bac thang chroma.
  // Cong CUNG mot gia tri vao R,G,B chi pha duoc bac thang do sang; chenh lech
  // giua cac kenh van luong tu hoa nguyen (do duoc Y 2.25px nhung V 8.80px).
  vec2 dp = gl_FragCoord.xy * 0.0173 + fract(uTime) * 7.1;
  vec3 d3 = vec3(hash(dp), hash(dp + 31.7), hash(dp + 71.3)) - 0.5;
  float dl = dot(d3, vec3(0.2126, 0.7152, 0.0722));
  vec3 dc = d3 - dl;
  col += (vec3(dl) * uGrain + dc * 6.0) / 255.0;

  gl_FragColor = vec4(col, 1.0);
}
`;

/** Catmull-Rom: tiep tuyen suy ra tu hai diem ke, khong can khai bao tay. */
const cr = (p0: number, p1: number, p2: number, p3: number, t: number) => {
  const t2 = t * t;
  const t3 = t2 * t;
  return (
    0.5 *
    (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3)
  );
};
const cl = (i: number, n: number) => (i < 0 ? 0 : i > n - 1 ? n - 1 : i);

/**
 * Mau giu o he sRGB, KHONG doi sang tuyen tinh.
 * Do 2026-09-10: noi suy trong khong gian tuyen tinh lam mau toi co gia tri
 * cuc nho (#052C3E -> 0.0015, 0.0265, 0.0508), nen overshoot cua Catmull-Rom
 * du nho cung day xuong AM roi bi chan ve 0 -> sinh vet toi den si giua nen.
 * Do duoc mot diem RGB(0,0,51) trong khi diem dieu khien toi nhat quanh do la
 * lum 30.8. Noi suy trong sRGB cung dung cach Illustrator/Figma lam.
 */
const srgbRGB = (hex: string) => {
  const c = new THREE.Color(hex);
  return [c.r, c.g, c.b] as [number, number, number];
};

export const AURORA_DEBUG = 0;

export const Aurora: React.FC<{
  t: number;
  width: number;
  height: number;
  loopSeconds?: number;
  config?: MeshConfig;
}> = ({ t, width, height, loopSeconds = 14, config = HARMONIX_MESH }) => {
  const geo = useRef<THREE.BufferGeometry>(null);

  const NY = config.grid.length;
  const NX = config.grid[0].length;
  const SUB = config.sub ?? 18;
  const VX = (NX - 1) * SUB + 1;
  const VY = (NY - 1) * SUB + 1;

  const BASE = useMemo(() => config.grid.map((row) => row.map(srgbRGB)), [config]);
  const ALT = useMemo(() => config.points.map((p) => srgbRGB(p.alt)), [config]);

  const { index, posArr, colArr } = useMemo(() => {
    const idx: number[] = [];
    for (let j = 0; j < VY - 1; j++) {
      for (let i = 0; i < VX - 1; i++) {
        const a = j * VX + i;
        idx.push(a, a + VX, a + 1, a + 1, a + VX, a + VX + 1);
      }
    }
    return {
      index: new Uint32Array(idx),
      posArr: new Float32Array(VX * VY * 3),
      colArr: new Float32Array(VX * VY * 3),
    };
  }, [VX, VY]);

  // vi tri + mau cua cac diem dieu khien tai thoi diem t
  const { px, py, COL } = useMemo(() => {
    const ph = (2 * Math.PI * t) / loopSeconds;
    const X: number[][] = [];
    const Y: number[][] = [];
    const C = BASE.map((row) => row.map((c) => [...c] as [number, number, number]));
    let m = 0;
    for (let j = 0; j < NY; j++) {
      X.push([]);
      Y.push([]);
      for (let i = 0; i < NX; i++) {
        const bx = -1 + (2 * i) / (NX - 1);
        const by = 1 - (2 * j) / (NY - 1);
        if (i > 0 && i < NX - 1 && j > 0 && j < NY - 1) {
          const k = config.points[m];
          X[j].push(bx + k.ax * Math.sin(ph * k.kx + k.px));
          Y[j].push(by + k.ay * Math.sin(ph * k.ky + k.py));
          const w = 0.5 + 0.5 * Math.sin(ph * k.ck + k.cp);
          const a = BASE[j][i];
          const b = ALT[m];
          C[j][i] = [a[0] + (b[0] - a[0]) * w, a[1] + (b[1] - a[1]) * w, a[2] + (b[2] - a[2]) * w];
          m++;
        } else {
          X[j].push(bx);
          Y[j].push(by);
        }
      }
    }
    return { px: X, py: Y, COL: C };
  }, [t, loopSeconds, config, BASE, ALT, NX, NY]);

  // dung mat bicubic tai moi dinh
  useMemo(() => {
    const at = (u: number, v: number) => {
      const fx = u * (NX - 1);
      const i = Math.min(NX - 2, Math.floor(fx));
      const fy = v * (NY - 1);
      const j = Math.min(NY - 2, Math.floor(fy));
      return { i, tu: fx - i, j, tv: fy - j };
    };
    const samp = (P: number[][], u: number, v: number) => {
      const { i, tu, j, tv } = at(u, v);
      const r: number[] = [];
      for (let d = -1; d <= 2; d++) {
        const row = P[cl(j + d, NY)];
        r.push(cr(row[cl(i - 1, NX)], row[cl(i, NX)], row[cl(i + 1, NX)], row[cl(i + 2, NX)], tu));
      }
      return cr(r[0], r[1], r[2], r[3], tv);
    };
    // Catmull-Rom KHONG bao dam nam trong bao loi cua cac diem dieu khien, nen
    // phai chan ket qua lai — neu khong se sinh vet toi/sang ngoai khoang mau.
    const sampC = (ch: 0 | 1 | 2, u: number, v: number) => {
      const { i, tu, j, tv } = at(u, v);
      const r: number[] = [];
      let lo = Infinity;
      let hi = -Infinity;
      for (let d = -1; d <= 2; d++) {
        const row = COL[cl(j + d, NY)];
        for (let e = -1; e <= 2; e++) {
          const val = row[cl(i + e, NX)][ch];
          if (val < lo) lo = val;
          if (val > hi) hi = val;
        }
        r.push(cr(row[cl(i - 1, NX)][ch], row[cl(i, NX)][ch], row[cl(i + 1, NX)][ch], row[cl(i + 2, NX)][ch], tu));
      }
      const out = cr(r[0], r[1], r[2], r[3], tv);
      return out < lo ? lo : out > hi ? hi : out;
    };
    let n = 0;
    for (let j = 0; j < VY; j++) {
      const v = j / (VY - 1);
      for (let i = 0; i < VX; i++) {
        const u = i / (VX - 1);
        posArr[n] = samp(px, u, v);
        posArr[n + 1] = samp(py, u, v);
        posArr[n + 2] = 0;
        colArr[n] = sampC(0, u, v);
        colArr[n + 1] = sampC(1, u, v);
        colArr[n + 2] = sampC(2, u, v);
        n += 3;
      }
    }
    if (geo.current) {
      geo.current.attributes.position.needsUpdate = true;
      geo.current.attributes.mcolor.needsUpdate = true;
    }
  }, [px, py, COL, posArr, colArr, NX, NY, VX, VY]);

  const uniforms = useMemo(
    () => ({ uTime: { value: 0 }, uGrain: { value: config.grain ?? 9.0 } }),
    [config],
  );
  uniforms.uTime.value = t;

  return (
    <mesh frustumCulled={false} renderOrder={-1000}>
      <bufferGeometry ref={geo}>
        <bufferAttribute attach="index" args={[index, 1]} />
        <bufferAttribute attach="attributes-position" args={[posArr, 3]} />
        <bufferAttribute attach="attributes-mcolor" args={[colArr, 3]} />
      </bufferGeometry>
      <shaderMaterial
        vertexShader={VERT}
        fragmentShader={FRAG}
        uniforms={uniforms}
        depthTest={false}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
};
