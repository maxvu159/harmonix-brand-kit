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
import { Aurora } from "./Aurora";
import * as THREE from "three";

/**
 * Bay dong xu PT-haHYPE — "cuon xu be cong thanh vong kin".
 * Ky thuat goc: Cloner in Object mode along a Spline (C4D) /
 * Array + Curve modifier (Blender).
 *
 * MO HINH DUNG (sua lai sau khi do truong van toc, xem clip-02-zksync.md):
 * Dong xu KHONG tu xoay. No xoay vi mat xu luon vuong goc voi TIEP TUYEN
 * cua duong cong. Con so "3 do/giay" do duoc truoc day chinh la do cong cua
 * quy dao, khong phai mot chuyen dong rieng. Cho no tu quay la sai mo hinh.
 *
 * So do duoc tu clip ZKsync:
 *   - Vong kin, chieu kim dong ho: trai di LEN, phai di XUONG, day chay sang TRAI.
 *   - Oval cao: ~370 x 840 px tren khung 1920x1080.
 *   - Toc do tiep tuyen ~30 px/giay -> mot vong ~66 giay -> ~1.5% vong moi giay.
 *   - Do day dong xu ~8% duong kinh.
 */
/**
 * Bo ban do khac dang dung.
 *   "metal" — logo cung la kim loai, chi khac chim, khong trang men
 *   "green" — long khac trang men xanh dam cua brand (--hmn-green #173132)
 *   "lime"  — long khac trang men vang-chanh (--hmn-yellow #E2F6A1)
 */
const ENGRAVE: "metal" | "green" | "lime" = "green";
const ENGRAVE_FILE = {
  metal: "tokens/eng-metal-",
  green: "tokens/eng-green-",
  lime: "tokens/hahype-engrave-",
}[ENGRAVE];

const LAPS_PER_SEC = 0.015; // do duoc: ~1.5% vong moi giay
const COIN_R = 0.85;   // do duoc tu ZKsync: duong kinh 170-324px, trung binh ~250   // MOT co duy nhat: xu that thi bang nhau
const COIN_COUNT = 26;   // ~15 cai nhin thay khi chi lay cung tren
/**
 * Don cum. Rai DEU theo do dai cung thi khong bao gio ra duoc cum "vua to vua xum
 * lai" nhu clip goc, vi trong cach dung nay diem GAN camera nhat cung chinh la diem
 * cac dong xu DAN RA xa nhau nhat (dat tangent_z = 0 va dP.z/dθ = 0 thi ra cung mot
 * tham so). Nen clip goc chac chan khong rai deu.
 * CLUSTER_AT: don cum quanh pha nao (0..1). CLUSTER: don manh bao nhieu (0 = deu).
 */
// Dich ca bay xu trong khong gian the gioi. KHONG dich canvas bang CSS:
// ngoai vung canvas khong co gi ve nen dong xu bi cat phang thanh duong ngang.
const RIG_OFFSET: [number, number, number] = [0, 0, 0];
const CLUSTER_AT = 0.06;
const CLUSTER = 0.0;   // rai deu tuyet doi   // dem duoc tu clip goc: ~12-14 nhin thay, ca vong ~18 // clip goc co ~15-20 cai nhin thay; day hon mot chut
const THICKNESS_RATIO = 0.13; // day hon goc (0.08) — vanh phai doc duoc o kho feed

// Hinh dang vong: oval cao, nghieng trong khong gian nen nua gan camera to hon.
const RX = 3.20;
const RY = 4.50;   // vong cao: chi cung TREN nam trong khung, day bi cat
const YAW = THREE.MathUtils.degToRad(-58); // am: nhanh PHAI la nhanh gan, nhu clip goc
const PITCH = THREE.MathUtils.degToRad(0);   // 0 = vong dung thang, khong bi xien

/**
 * Ban do KHAC logo vao kim loai (sinh san bang scripts, xem research/clip-02-zksync.md).
 * Khong dan ANH logo len mat xu nua: dan anh thi mat xu la mot mang mau phang nam
 * TREN vat the kim loai, mai mai khong hoa vao duoc. Khac chim thi ca dong xu la
 * kim loai — dung nhu ZKsync, chi khac la co dau Harmonix dap vao.
 */
const engraveTex: {
  normal: THREE.Texture | null;
  orm: THREE.Texture | null;
  base: THREE.Texture | null;
} = { normal: null, orm: null, base: null };
{
  const loader = new THREE.TextureLoader();
  for (const [key, file] of [
    ["normal", `${ENGRAVE_FILE}normal.png`],
    ["orm", `${ENGRAVE_FILE}orm.png`],
    ["base", `${ENGRAVE_FILE}base.png`],
  ] as const) {
    const handle = delayRender(`Doi ban do khac: ${key}`);
    loader.load(
      staticFile(file),
      (tex) => {
        tex.colorSpace = key === "base" ? THREE.SRGBColorSpace : THREE.NoColorSpace;
        tex.anisotropy = 16;
        engraveTex[key] = tex;
        continueRender(handle);
      },
      undefined,
      (err) => {
        console.error(`Khong tai duoc ban do khac ${key}`, err);
        continueRender(handle);
      },
    );
  }
}

/**
 * Moi truong phan chieu. Vat lieu metalness=1 phan chieu MOI TRUONG chu khong phai
 * mau vat lieu cua no, nen toan bo ve dep cua kim loai nam o day. Nen cream phang
 * khong cho no gi de phan chieu -> moi truong phai tu tao ra tuong phan.
 * Phai TRUNG TINH: env am xanh la thi kim loai ra xanh la, khong ra bac.
 */
const useEnvMap = () =>
  useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 2048;
    c.height = 1024;
    const g = c.getContext("2d")!;
    const grad = g.createLinearGradient(0, 0, 0, 1024);
    grad.addColorStop(0.0, "#eef0ef"); // tran studio
    grad.addColorStop(0.34, "#d6dbda");
    grad.addColorStop(0.638, "#fafbfa"); // dai sang ngay tren duong chan troi
    grad.addColorStop(0.645, "#333a3b"); // duong chan troi: buoc nhay CANG SAC CANG RA KIM LOAI
    grad.addColorStop(0.74, "#6b7372");
    grad.addColorStop(1.0, "#22282a"); // san toi
    g.fillStyle = grad;
    g.fillRect(0, 0, 2048, 1024);
    // TAM HAT SANG canh cung. Day moi la thu lam kim loai trong SAC: phan chieu
    // cua mot canh cung tren mat bong la mot ranh gioi sac, con phan chieu cua
    // mot vet sang mo thi mai mai mem.
    g.fillStyle = "#ffffff";
    for (const [x, y, w, h] of [
      [150, 90, 620, 210],
      [980, 40, 430, 150],
      [1560, 130, 330, 190],
      [640, 560, 520, 90],
    ] as const) {
      g.fillRect(x, y, w, h);
    }
    // vai dai toi canh cung xen giua -> tuong phan sac tren vanh xu
    g.fillStyle = "#202627";
    for (const [x, y, w, h] of [
      [0, 330, 2048, 34],
      [820, 250, 90, 300],
    ] as const) {
      g.fillRect(x, y, w, h);
    }
    // vai nguon sang mem -> nhieu vet highlight chay tren vanh khi xu xoay
    for (const [x, y, r, a] of [
      [420, 220, 300, 0.7],
      [1150, 150, 190, 0.5],
      [1700, 300, 240, 0.45],
      [900, 760, 300, 0.3],
      [1024, 430, 560, 0.55], // softbox lon sau may quay
    ] as const) {
      const spot = g.createRadialGradient(x, y, 0, x, y, r);
      spot.addColorStop(0, `rgba(255,255,255,${a})`);
      spot.addColorStop(1, "rgba(255,255,255,0)");
      g.fillStyle = spot;
      g.fillRect(0, 0, 2048, 1024);
    }
    const tex = new THREE.CanvasTexture(c);
    tex.mapping = THREE.EquirectangularReflectionMapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);

/** Duong cong kin: oval trong mat phang XY, roi nghieng bang yaw + pitch. */
const ringBasis = () => {
  const m = new THREE.Matrix4()
    .makeRotationY(YAW)
    .multiply(new THREE.Matrix4().makeRotationX(PITCH));
  const u = new THREE.Vector3(1, 0, 0).applyMatrix4(m); // truc ngang cua oval
  const v = new THREE.Vector3(0, 1, 0).applyMatrix4(m); // truc doc cua oval
  return { u, v };
};

/**
 * Bien dang dong xu, quay quanh truc Y.
 *
 * Do lat cat do sang qua dong xu ZKsync (tu mep vao trong):
 *   161 -> 247 (vanh bat sang) -> 177 -> 125 (RANH TOI) -> 249 (go noi) -> 209 -> 251..227 (mat)
 * No KHONG phai hinh tru tron. Cai RANH TOI ngan giua vanh va mat — chenh 125 muc
 * do sang so voi hai ben — la tin hieu chieu sau manh nhat tren ca dong xu.
 * Ranh do phai la HINH HOC that, khong the gia bang texture: co hinh hoc that thi
 * no dung duoi moi goc chieu sang va moi goc nhin.
 */
const coinProfile = (R: number, t: number) => {
  const p: [number, number][] = [
    [0, t],
    [0.785 * R, t],
    [0.815 * R, t - 0.3 * t], // thanh ranh
    [0.858 * R, t - 0.3 * t], // day ranh
    [0.888 * R, t], // go noi
    [0.945 * R, t],
    [R, 0.5 * t], // vat cheo xuong vanh
    [R, -0.5 * t],
    [0.945 * R, -t],
    [0.888 * R, -t],
    [0.858 * R, -t + 0.3 * t],
    [0.815 * R, -t + 0.3 * t],
    [0.785 * R, -t],
    [0, -t],
  ];
  // DAO CHIEU. LatheGeometry sinh phap tuyen theo huong chay cua bien dang.
  // Bien dang di tu TREN xuong DUOI lam phap tuyen quay VAO TRONG -> mat gan bi cull,
  // ta nhin XUYEN QUA dong xu toi mat phia xa. Do chinh la cai "lech" thay duoc:
  // dia logo phia xa lech di dung bang do day dong xu, va ca dong xu trong nhu nap chai.
  return p.reverse().map(([x, y]) => new THREE.Vector2(x, y));
};

/**
 * Bang tra do dai cung. Chia deu theo tham so t la KHONG deu tren ellipse:
 * |dP/dt| = sqrt(RX^2 sin^2 t + RY^2 cos^2 t), lon nhat o dau truc lon.
 * Muon xu cach deu nhau that thi phai chia deu theo DO DAI CUNG roi noi suy nguoc.
 */
const ARC_STEPS = 2048;
const arcTable = (() => {
  const cum = new Float64Array(ARC_STEPS + 1);
  for (let i = 1; i <= ARC_STEPS; i++) {
    const a = ((i - 0.5) / ARC_STEPS) * Math.PI * 2;
    const speed = Math.hypot(RX * Math.sin(a), RY * Math.cos(a));
    cum[i] = cum[i - 1] + speed * ((Math.PI * 2) / ARC_STEPS);
  }
  return { cum, total: cum[ARC_STEPS] };
})();

/** Doi "di duoc bao nhieu phan cua chu vi" -> tham so t tuong ung. */
const byArc = (frac: number) => {
  const target = (((frac % 1) + 1) % 1) * arcTable.total;
  let lo = 0;
  let hi = ARC_STEPS;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (arcTable.cum[mid] < target) lo = mid;
    else hi = mid;
  }
  const span = arcTable.cum[hi] - arcTable.cum[lo] || 1;
  return (lo + (target - arcTable.cum[lo]) / span) / ARC_STEPS;
};

const pointAt = (s: number, u: THREE.Vector3, v: THREE.Vector3) => {
  const a = s * Math.PI * 2;
  return new THREE.Vector3()
    .addScaledVector(u, RX * Math.cos(a))
    .addScaledVector(v, RY * Math.sin(a));
};

/** Tiep tuyen = dao ham cua duong cong. Mat dong xu se vuong goc voi no. */
const tangentAt = (s: number, u: THREE.Vector3, v: THREE.Vector3) => {
  const a = s * Math.PI * 2;
  return new THREE.Vector3()
    .addScaledVector(u, -RX * Math.sin(a))
    .addScaledVector(v, RY * Math.cos(a))
    .normalize();
};

/** Xao tron tat dinh: moi dong xu lech mot chut cho do may moc, nhung khong doi giua cac frame. */
const jitter = (i: number, salt: number) => {
  const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
  return x - Math.floor(x); // [0,1)
};

/**
 * Dich anh len/xuong/trai/phai MA KHONG doi phoi canh.
 * Khong dung CSS left/top: ngoai vung canvas khong co gi ve nen dong xu bi cat
 * phang thanh mot duong ngang cung giua khung.
 * Cung khong dich vat the trong khong gian 3D: lam vay la doi GOC NHIN,
 * ca bo cuc bien dang theo.
 * `setViewOffset` ve mot cua so con cua mot khung ao lon hon — dung phep tinh tien
 * anh that su.
 */
const Pan: React.FC<{ dx: number; dy: number }> = ({ dx, dy }) => {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const size = useThree((s) => s.size);
  camera.setViewOffset(size.width, size.height, dx, dy, size.width, size.height);
  camera.updateProjectionMatrix();
  return null;
};

const HALF_T = COIN_R * THICKNESS_RATIO;
const COIN_PROFILE = coinProfile(COIN_R, HALF_T);

const Coins: React.FC<{ t: number }> = ({ t }) => {
  const env = useEnvMap();
  const { u, v } = useMemo(ringBasis, []);

  const metal = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#f4f5f3",
        metalness: 0.88,
        roughness: 0.07,
        envMap: env,
        envMapIntensity: 0.72,
        polygonOffset: true,
        polygonOffsetFactor: 1,
        polygonOffsetUnits: 1,
      }),
    [env],
  );

  // Cung chat kim loai, chi khac la co dau khac. Cung mot vat lieu goc nen duong
  // noi giua mat va go kim loai khong nhin thay.
  const engraved = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#f4f5f3",
        metalness: 0.88,
        roughness: 0.07,
        // Long khac trang MEN mau brand, ben ngoai la kim loai — dung nhu huy chuong
        // that. Nho vay dong xu vua co ve kim loai cua ZKsync vua co mau Harmonix.
        map: engraveTex.base ?? undefined,
        // Mot texture gop hai kenh: G = do nham, B = do kim loai.
        // Men co metalness 0 (khong phai kim loai), kim loai ben ngoai co 1.
        roughnessMap: engraveTex.orm ?? undefined,
        metalnessMap: engraveTex.orm ?? undefined,
        normalMap: engraveTex.normal ?? undefined,
        normalScale: new THREE.Vector2(1.25, 1.25),
        envMap: env,
        envMapIntensity: 0.72,
      }),
    [env],
  );

  const coins = useMemo(() => {
    const out: { s0: number; wobble: number }[] = [];
    for (let i = 0; i < COIN_COUNT; i++) {
      out.push({
        // Bien dang phan bo: keo cac dong xu ve phia CLUSTER_AT.
        // f(x) = x - CLUSTER*sin(2pi*(x - CLUSTER_AT))/(2pi) — dao ham nho quanh
        // CLUSTER_AT nen xu don lai o do, va lon o phia doi dien nen xu thua ra.
        s0:
          i / COIN_COUNT -
          (CLUSTER * Math.sin(2 * Math.PI * (i / COIN_COUNT - CLUSTER_AT))) / (2 * Math.PI),
        wobble: (jitter(i, 3) - 0.5) * 0.52, // ~15 do: nhanh trai bot bi quay dung canh thanh thanh det
      });
    }
    return out;
  }, []);

  // Phap tuyen mat phang vong: hang so, va luon vuong goc voi moi tiep tuyen.
  const ringNormal = useMemo(() => new THREE.Vector3().crossVectors(u, v).normalize(), [u, v]);

  return (
    <>
      <Pan dx={-560} dy={-440} />
      <ambientLight intensity={0.22} />
      {/* Den chinh, va la den DUY NHAT do bong: nhieu nguon do bong cung luc thi
          bong chong cheo, doc ra ban chu khong ra chieu sau. */}
      <directionalLight
        position={[-4, 6.5, 7]}
        intensity={4.2}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.015}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
        shadow-camera-near={0.5}
        shadow-camera-far={28}
      />
      <directionalLight position={[6, -3, 3]} intensity={0.5} color="#eaf7dc" />
      <directionalLight position={[1, 1.5, -6]} intensity={0.55} color="#ffffff" />
      {/* den phu tu huong may quay: nang mat xu ve dung do sang cua file goc */}
      <directionalLight position={[0.3, 0.6, 9]} intensity={0.7} color="#ffffff" />
      <group position={RIG_OFFSET}>
      {coins.map((c, i) => {
        // Dau TRU: chay theo chieu kim dong ho cho khop clip goc
        // (trai di LEN, phai di XUONG). Do lai bang truong van toc de xac nhan.
        const s = byArc(c.s0 - t * LAPS_PER_SEC);
        const p = pointAt(s, u, v);
        const tan = tangentAt(s, u, v);

        // Truc cua cylinder la Y -> quay Y ve huong tiep tuyen.
        // KHONG lay cross(world-up, tiep tuyen) lam truc X: voi PITCH=0 thi tai vi tri
        // 3 gio tiep tuyen TRUNG voi world-up, tich co huong bang 0 -> diem ky di,
        // goc lan bi lat dot ngot. Do chinh la cu nhay do duoc o t=4.17s va 8.33s.
        // Tiep tuyen luon nam TRONG mat phang vong, nen PHAP TUYEN cua mat phang do
        // luon vuong goc voi tiep tuyen -> khong bao gio ky di.
        const q = new THREE.Quaternion().setFromRotationMatrix(
          new THREE.Matrix4().makeBasis(
            ringNormal,
            tan,
            new THREE.Vector3().crossVectors(ringNormal, tan).normalize(),
          ),
        );
        // Lech nhe khoi tiep tuyen cho do may moc — chi nghieng, khong lan.
        q.multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(c.wobble, 0, c.wobble * 0.5)));

        return (
          <group key={i} position={p} quaternion={q}>
            {/* Than xu: kim loai dac, co ranh va go noi */}
            <mesh material={metal} castShadow receiveShadow>
              <latheGeometry args={[COIN_PROFILE, 128]} />
            </mesh>
            {/* Hai mat: cung chat kim loai, dau Harmonix KHAC CHIM vao */}
            <mesh
              material={engraved}
              castShadow
              receiveShadow
              position={[0, HALF_T, 0]}
              rotation={[-Math.PI / 2, 0, 0]}
            >
              <circleGeometry args={[COIN_R * 0.79, 128]} />
            </mesh>
            <mesh
              material={engraved}
              castShadow
              receiveShadow
              position={[0, -HALF_T, 0]}
              rotation={[Math.PI / 2, 0, 0]}
            >
              <circleGeometry args={[COIN_R * 0.79, 128]} />
            </mesh>
          </group>
        );
      })}
      </group>
    </>
  );
};

/** Lop dong xu, khong co nen — de composition khac dung lai. */
export const CoinLayer: React.FC<{
  t: number;
  width: number;
  height: number;
  bg?: boolean;
  loopSeconds?: number;
}> = ({ t, width, height, bg = false, loopSeconds = 14 }) => (
  <AbsoluteFill>
    <ThreeCanvas
      shadows="soft"
      width={width}
      height={height}
      camera={{ fov: 52, position: [0.3, 0.18, 7.8], near: 3, far: 16 }}
      style={{ background: "transparent" }}
      gl={{ toneMapping: THREE.NoToneMapping }}
    >
      {bg ? (
        <Aurora t={t} width={width} height={height} loopSeconds={loopSeconds} />
      ) : null}
      <Coins t={t} />
    </ThreeCanvas>
  </AbsoluteFill>
);

export const CoinTest: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: "var(--hmn-green)" }}>
      <CoinLayer t={frame / fps} width={width} height={height} />
    </AbsoluteFill>
  );
};
