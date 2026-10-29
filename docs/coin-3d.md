---
name: harmonix-coin-3d
description: >-
  Dung vat the 3D kim loai co khac logo cho video Harmonix — dong xu token,
  huy hieu, dia kim loai. USE khi user muon "dong xu 3D", "token 3D", "coin",
  "vat the kim loai", "khac logo len xu", "lam dong xu cho token X", hoac khi
  can mot vat the 3D bong kim loai trong video. Cung USE khi can sinh lai bo
  ban do khac cho mot logo/token moi.
  Khong dung cho hoat hinh nhan vat hay canh 3D phuc tap — skill nay chi lo
  vat the kim loai deo co khac chim.
---

# Harmonix Coin 3D

Vat lieu, anh sang va hinh hoc cua dong xu PT-haHYPE — da can bang thu cong
va **do doi chieu voi clip that** (ZKsync) cho den khi khop.

File: `remotion/src/CoinTest.tsx` trong `harmonix-motion`.
Script sinh ban do: `scripts/make_engrave_maps.py` (trong skill nay).

## Dung cho token moi

```bash
# 1. sinh bo ban do khac tu logo
V=~/.venv/motion/bin/python     # can numpy pillow scipy
$V scripts/make_engrave_maps.py logo.svg  out/eng-<token> --enamel '#173132'
$V scripts/make_engrave_maps.py logo.png  out/eng-<token> --enamel none   # khac tran kim loai

# 2. tro ENGRAVE_FILE trong CoinTest.tsx sang tien to moi
# 3. render
npx remotion render src/index.ts <Comp> out/raw.mp4 --scale=2 --crf=10 --gl=angle
```

Script tu nhan dang logo dang **nen trong** (dung alpha) hay dang **badge dac**
co dau tren nen mau (dung do sang). File `hahype.svg` la dang thu hai: alpha dac
100%, dau logo chi la 16% pixel toi — dung alpha o day thi ca badge thanh vung
khac, sai hoan toan.

SVG can `rsvg-convert` (`brew install librsvg`). Mac Mini **chua co**; hoac cai,
hoac xuat PNG nen trong roi truyen PNG.

## Vat lieu (dung sua bang cam tinh — moi so deu do ma ra)

```
kim loai   color #f4f5f3  metalness 0.88  roughness 0.07  envMapIntensity 0.72
           polygonOffset: true, factor 1, units 1
mat khac   nhu tren + map / roughnessMap / metalnessMap / normalMap
           normalScale (1.25, 1.25)
```

- **`metalness` 0.88 chu khong phai 1.0.** O 1.0 khong con thanh phan khuech tan
  nen **bong do gan nhu vo dung** — anh sang moi truong khong bi che khuat. Ha
  xuong 0.88 va don ngan sach ve phia den truc thi moi co bong tiep xuc
  (0.11% -> 0.72% pixel thay doi).
- **`envMapIntensity` la HE SO NHAN.** Phai kiem lai moi khi doi do sang moi
  truong. Mot lan de 2.2 lam **57.4% pixel dong xu chay trang**; ha ve 1.0 con
  2.7%.
- **Khong bao gio dung `emissive` de "lam sang" xu.** Emissive khong nhan anh
  sang nen no lam PHANG moi sac do. Mot lan them `emissiveIntensity: 0.58` de
  chua vet am olive, ket qua la mat xu co **do bien thien do sang bang 1/255**
  trong khi ZKsync la 88/255. Go ra la het.
- `polygonOffset` de mat khac khong z-fight voi than xu.

## Anh sang

```
ambientLight    intensity 0.22
key   [-4, 6.5, 7]   intensity 4.2  castShadow  (NGUON DUY NHAT do bong)
fill  [6, -3, 3]     intensity 0.5   #eaf7dc
rim   [1, 1.5, -6]   intensity 0.55  #ffffff
face  [0.3, 0.6, 9]  intensity 0.7   #ffffff   (theo huong may quay)
shadow-mapSize 2048  bias -0.0004  normalBias 0.015  camera +-8, near 0.5 far 28
```

Chi mot nguon do bong. Them nguon do bong nua se ra bong chong cheo, khong that.

**Moi truong phan chieu** la mot `CanvasTexture` tu ve (equirect 2048x1024):
vai dai sang, vai dai toi `#202627` xen giua, vai dom sang mem. Vat lieu
`metalness` cao phan chieu MOI TRUONG chu khong phai den — khong co moi truong
thi xu tro thanh mang xam chet. Cac dai toi la thu tao ra **tuong phan sac tren
vanh** khi xu xoay.

## Hinh hoc

**Than xu phai la `latheGeometry`, khong phai `cylinderGeometry`.**
Do lat cat do sang qua dong xu ZKsync tu mep vao trong:
`161 -> 247 (vanh bat sang) -> 177 -> 125 (RANH TOI) -> 249 (go noi) -> 209 -> 251..227`

Cai **ranh toi** chenh 125 muc do sang so voi hai ben — do la tin hieu chieu sau
manh nhat tren ca dong xu. Khong the gia bang texture: co hinh hoc that thi no
dung duoi moi goc chieu sang va moi goc nhin.

Bien dang (theo ban kinh R, nua day t) o `coinProfile()`. Ty le day/duong kinh
`THICKNESS_RATIO = 0.13` (goc ZKsync 0.08 — day hon de vanh doc duoc o kho feed).

**`p.reverse()` o cuoi `coinProfile` la BAT BUOC.** `LatheGeometry` lay phap
tuyen theo chieu di cua bien dang; xep tu tren xuong thi phap tuyen huong VAO
TRONG, mat gan bi cull va nhin xuyen qua thay dia xa — dong xu trong nhu **nap
chai rong** va logo lech han.

## Chuyen dong tren duong cong

Dong xu **KHONG tu xoay**. Mat xu luon vuong goc voi TIEP TUYEN cua duong cong;
cai "3 do/giay" do duoc chinh la do cong cua quy dao. Cho no tu quay la sai mo hinh.

- Co so khong co diem ky di: dung **phap tuyen mat phang vong**, dung
  `cross(worldUp, tangent)` — khi hai vector nay trung phuong thi tich co huong
  ve 0 va dong xu **khung lai roi nhay**. Do duoc dinh dung o frame 125 va 250.
- **Tham so hoa theo DO DAI CUNG**: bang tich luy 2048 mau + tim nhi phan. Buoc
  tham so deu KHONG phai buoc cung deu tren elip.
- **Moi dong xu mot co duy nhat.** Xu that thi bang nhau; chenh lech kich thuoc
  tren man hinh chi duoc den tu phoi canh. Bo ngau nhien hoa ban kinh di thi lo
  ra la `fov 32` gan nhu khong co phoi canh — phai len `fov 52` va dua may quay
  lai gan.
- Nghieng ngau nhien (`wobble`) toi da ~15 do. Cao hon la mat xu "khong cung
  chieu, bi cheo".
- `PITCH` khac 0 tao **phep truot**: no them thanh phan x ty le `sin(a)` trong
  khi y cung ty le `sin(a)` — vong bi nghieng. Muon vong dung thang thi `PITCH = 0`.
- Muon xac dinh chieu quay cua mot clip tham chieu thi phai do **CA TRUONG VAN
  TOC**, mot cua so khong bao gio du — hai nhanh nguoc chieu cua vong kin se
  doc ra thanh "nhieu". Va voi nhieu dong xu giong het nhau thi block-matching
  bam nham hang xom; to do mot dong xu mau khac roi bam theo no.

## Bo ban do khac

3 file `<prefix>-{normal,orm,base}.png` o 2048x2048:
- `normal` — phap tuyen tangent-space
- `orm` — **G = do nham, B = do kim loai** (chuan glTF; R = AO de shader tu lo)
- `base` — trang o kim loai, mau men o long ranh

**Phai do men vao long ranh.** Normal map chi cho thay DOC; day ranh co cung
phap tuyen voi mat phang xung quanh, nen chi rieng normal map thi logo doc ra
chi la mot **duong vien rong ruot**. Do mau (metalness 0 o do) moi ra hinh dac.

Tham so trong script: `BEVEL 46px` (o kho 2048), `BLUR 1.6`, `SCALE 16`,
men bat dau o do sau 0.50 voi mep mem 0.34.

## Render

- **`--gl=angle` bat buoc.** Thieu la `THREE.WebGLRenderer: Error creating WebGL context`.
- **`--scale=2` roi ha xuong bang ffmpeg.** Day la cach duy nhat chua duoc rang
  cua cua normal map va metalness map o goc lia. Chi tiet trong normal map phai
  rong it nhat 3-4 pixel TREN MAN HINH.
- `NoToneMapping`. Mac dinh cua R3F la ACESFilmic — no nen va lam nhat mau, sai
  cho mau thuong hieu.
- **SSAO qua `@react-three/postprocessing` KHONG chay** trong pipeline nay:
  `EffectComposer` chiem quyen dieu khien vong render qua `useFrame` uu tien,
  khong tuong thich voi cach `@remotion/three` day frame. Ra **khung trang tron,
  khong bao loi**. Muon bong tiep xuc thi can bang lai anh sang, dung ep SSAO.

## Notes

- Da so sanh voi ZKsync sau khi can: do bien thien do sang mat xu 1 -> 96/255
  (ZKsync 88), do bao hoa 43 -> 77 (file goc 85), bien do kim loai 46 -> 97
  (ZKsync 91).
- Con co the tot hon: mat xu lam **chom cau nong** thay vi phang (mat ZKsync co
  vom, cho ra dai phan chieu chuyen dan). Va neu co AO that thi `metalness`
  duoc quay ve 1.0.
