import React, { useMemo } from "react";
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
import { Aurora, HARMONIX_MESH } from "./Aurora";
import { useMetalEnv } from "./metalEnv";

/**
 * Chong the kim loai Harmonix — ban tinh de duyet chat lieu va bo cuc.
 *
 * Cung nguyen ly voi dong xu: mot khoi kim loai duy nhat, chu KHAC CHIM roi do
 * men, khong dan anh len be mat. Khac o bon cho:
 *
 *  - Hinh hoc la khoi extrude bo goc co vat cheo, khong phai lathe.
 *  - Mat the NHAM (anod hoa, roughness 0.22), chi CANH VAT la bong (0.09).
 *    Day la co y: mot mat phang rong ma bong nhu guong se hat nguyen ca moi
 *    truong vao may quay va lam trang xoa het chu. Mat nham thi chu doc duoc,
 *    con chat kim loai do canh vat ganh — vet sang chay doc mep khi the xoay
 *    moi la thu ban duoc chat lieu, khong phai mat the.
 *  - Kim loai co MAU, va mau do nam trong base map chu khong o material.color:
 *    nhan mau o material se nhan ca len men, ra lime nhan xanh reu = mau bun.
 *  - Moi truong phai qua PMREM. Xem chu thich cho ky o duoi.
 */

const CARD_W = 3.30;
const CARD_H = CARD_W / 1.586;      // ti le the tin dung that
const BEV = 0.032;                   // be rong canh vat
const THICK = 0.105;                 // ~3.2% be ngang — day hon the that nhieu, vi o kho
                                     // feed mot vanh 1% be ngang chi con 4px va bien mat
const RADIUS = 0.11;

const FACE_W = CARD_W - 2 * BEV;
const FACE_H = CARD_H - 2 * BEV;

const NAMES = ["hahype", "hausdc", "hakhype"] as const;
type CardName = (typeof NAMES)[number];

/**
 * Nen giam sang. Nen mesh nguyen ban duoc chinh cho video CHU TRANG, nen no
 * sang ngang voi the kim loai va the bi chim vao nen. Kim loai chi doc ra la
 * kim loai khi no sang hon nen — nen phai ha nen xuong, khong phai nang the len.
 */
const DIM = 0.52;
const dim = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  const f = (sh: number) => Math.round(((n >> sh) & 255) * DIM).toString(16).padStart(2, "0");
  return `#${f(16)}${f(8)}${f(0)}`;
};
const DIM_MESH = {
  ...HARMONIX_MESH,
  grid: HARMONIX_MESH.grid.map((row) => row.map(dim)),
  points: HARMONIX_MESH.points.map((pt) => ({ ...pt, alt: dim(pt.alt) })),
};

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
  // ShapeGeometry dat uv = toa do x,y cua shape. Phai chuan hoa ve [0,1] thi ban
  // do moi phu dung khung; neu khong texture chi hien mot goc ti hon.
  const uv = g.attributes.uv;
  for (let i = 0; i < uv.count; i++) {
    uv.setXY(i, (uv.getX(i) + FACE_W / 2) / FACE_W, (uv.getY(i) + FACE_H / 2) / FACE_H);
  }
  uv.needsUpdate = true;
  return g;
})();

/**
 * Moi truong sau PMREM. Bat buoc o day, khac hoan toan voi dong xu: dong xu co
 * roughness 0.07 (gan nhu guong) nen no chi lay mau envMap o dung mot huong,
 * khong loc truoc cung khong sao. Mat the co roughness 0.22 — no phai lay
 * TRUNG BINH ca mot chom huong. Khong loc truoc thi three.js chi doi mip mot
 * cach tho, do nham gan nhu mat tac dung, va mat the ra mot mang mau chet.
 */
const usePmremEnv = () => {
  const raw = useMetalEnv({ top: "#7f93a8", bottom: "#3f7f74", amount: 0.5 });
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
  position: [number, number, number];
  rotZ: number;
}> = ({ name, env, position, rotZ }) => {
  const shell = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#4E7A74",
        metalness: 0.86,
        roughness: 0.09,   // canh vat DANH BONG
        envMap: env,
        envMapIntensity: 1.0,
      }),
    [env],
  );

  const face = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#ffffff",  // mau nam trong base map, xem chu thich dau file
        map: TEX[name].base ?? undefined,
        roughnessMap: TEX[name].orm ?? undefined,
        metalnessMap: TEX[name].orm ?? undefined,
        normalMap: TEX[name].normal ?? undefined,
        normalScale: new THREE.Vector2(1.15, 1.15),
        metalness: 1,
        roughness: 1,      // bi ORM map nhan de, phai de 1 keo khong bi nhan doi
        envMap: env,
        envMapIntensity: 1.0,
      }),
    [env, name],
  );

  return (
    <group position={position} rotation={[0, 0, rotZ]}>
      <mesh geometry={bodyGeo} material={shell} castShadow receiveShadow />
      <mesh geometry={faceGeo} material={face} position={[0, 0, THICK / 2 + 0.0012]} receiveShadow />
    </group>
  );
};

/**
 * Vi tri ba khe trong chong the. Khe 0 = tren cung, gan may quay nhat.
 *
 * Do lech phai CHEO, va huong cheo bi rang buoc boi hai dieu kien nguoc nhau:
 *
 *  - THAY DUOC TICKER cua the sau: the sau phai tho ra o phia TREN, vi ticker
 *    nam o goc tren-trai moi the.
 *  - THAY DUOC BONG giua cac the: den chinh o [-4, 6.5, 7] hat bong xuong
 *    duoi-phai, nen bong chi roi trung the sau neu the sau tho ra ben PHAI.
 *
 * Lech thuan doc thi duoc mot mat mot: xoe len thi mat bong (ba the phang liet),
 * xoe xuong thi mat ticker. Lech cheo len-phai thoa ca hai: dai tren ho ra sach
 * de doc ticker, dai phai ho ra dinh dung vet bong tiep xuc.
 *
 * Do lech DOC bi chan duoi boi chieu cao cua chinh ticker: tren ban do 2557px,
 * chu tieu de nam o hang 175..475, tuc 0.14..0.38 don tinh tu mep tren the.
 * Lech doc 0.23 chi ho ra toi 0.23 — cat ngang than chu, doc khong ra. Phai
 * >= 0.38; lay 0.46 cho du khoang tho.
 */
const SLOTS: { position: [number, number, number]; rotZ: number }[] = [
  { position: [0.00, 0.00, 0.30], rotZ: 0.012 },
  { position: [0.20, 0.46, 0.15], rotZ: -0.007 },
  { position: [0.40, 0.92, 0.00], rotZ: 0.020 },
];

const Stack: React.FC<{ t: number }> = ({ t }) => {
  const env = usePmremEnv();
  // Lo lung: hai song hai va ba chu ky moi vong — nguyen to cung nhau nen
  // mat khong bat duoc quy luat.
  const a = (t / 8) * Math.PI * 2;
  return (
    <group
      rotation={[
        0.10 + 0.012 * Math.sin(a * 2),
        -0.20 + 0.016 * Math.sin(a * 3 + 1.1),
        0.01 * Math.sin(a * 2 + 0.4),
      ]}
      position={[0, 0.05 * Math.sin(a * 3), 0]}
    >
      {SLOTS.map((s, i) => (
        <Card key={NAMES[i]} name={NAMES[i]} env={env} position={s.position} rotZ={s.rotZ} />
      ))}
    </group>
  );
};

export const CardTest: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;

  return (
    <AbsoluteFill style={{ backgroundColor: "#04192C" }}>
      <ThreeCanvas
        shadows="soft"
        width={width}
        height={height}
        camera={{ fov: 40, position: [0, 0, 7.4], near: 1, far: 24 }}
        style={{ background: "transparent" }}
        gl={{ toneMapping: THREE.NoToneMapping }}
      >
        <Aurora t={t} width={width} height={height} loopSeconds={8} config={DIM_MESH} />
        <ambientLight intensity={0.22} />
        {/* Den chinh, va la den DUY NHAT do bong: nhieu nguon do bong cung luc
            thi bong chong cheo, doc ra ban chu khong ra chieu sau. */}
        <directionalLight
          position={[-4, 6.5, 7]}
          intensity={4.2}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-bias={-0.0004}
          shadow-normalBias={0.015}
          shadow-camera-left={-6}
          shadow-camera-right={6}
          shadow-camera-top={6}
          shadow-camera-bottom={-6}
          shadow-camera-near={0.5}
          shadow-camera-far={24}
        />
        <directionalLight position={[6, -3, 3]} intensity={0.5} color="#eaf7dc" />
        <directionalLight position={[1, 1.5, -6]} intensity={0.55} color="#ffffff" />
        <directionalLight position={[0.3, 0.6, 9]} intensity={0.7} color="#ffffff" />
        <Stack t={t} />
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
