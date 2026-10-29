---
name: harmonix-mesh-bg
description: >-
  Nen mesh gradient dong cho video Harmonix — truong mau lien tuc, lap kin,
  khong thay hinh tron. USE khi can nen cho video moi, khi user noi "nen mesh",
  "nen gradient", "nen chuyen dong", "background mesh", "doi mau nen",
  "nen giong Apple", hoac khi nen phang trong chan. Cung USE khi user gui anh
  wallpaper/nen lam tham chieu va muon lam theo.
  Khong dung cho nen anh chup hay video nen — skill nay chi sinh gradient.
---

# Harmonix Mesh Background

Nen mesh gradient that: **luoi diem dieu khien**, noi suy bicubic, keo cac diem
ben trong de ca tam mau bien dang. Khong phai blob, khong phai noise.

File: `remotion/src/Aurora.tsx` trong `harmonix-motion`.
Ban sao di kem: `reference/Aurora.tsx`.

## Dung ngay

```tsx
import { Aurora, HARMONIX_MESH } from "./Aurora";

// mac dinh
<Aurora t={frame / fps} width={width} height={height} loopSeconds={14} />

// doi mau cho video khac
<Aurora t={t} width={w} height={h} loopSeconds={14}
        config={{ ...HARMONIX_MESH, grid: MY_GRID }} />
```

Dat trong CUNG canvas Three.js voi cac lop 3D khac — them context WebGL thu hai
la them mot cho de `--gl=angle` hong.

## MESH GRADIENT LA GI (dung nham la mat ca ngay)

"Mesh gradient" co **hai nghia**, va nghia pho bien tren web la nghia SAI:

| | CSS "mesh gradient" | mesh gradient THAT |
|---|---|---|
| la gi | cac `radial-gradient` xep chong | luoi diem dieu khien |
| vien gach | **hinh tron** | khong co tam, khong co ban kinh |
| mau tai mot diem | chong alpha cac lop | noi suy bicubic tu 4 goc o luoi |
| khi chuyen dong | cac dom **truot qua lai** | ca tam mau **bien dang** |

CSS phai di vong vi no khong co nguyen thuy mesh. Mesh that la thu ma
Illustrator Gradient Mesh, SwiftUI `MeshGradient` (iOS 18) va SVG2 dung.

**Da mat ba vong lam theo cong thuc CSS roi phai viet lai.** Mat luon nhin ra
hinh tron, va khong tham so nao chua duoc — vi hinh tron chinh la vien gach.

## Cau hinh

`MeshConfig` trong `Aurora.tsx`:
- `grid` — NY hang x NX cot ma mau, hang dau la tren cung. Mac dinh 5x5.
- `points` — cac diem BEN TRONG (do dai `(NX-2)*(NY-2)`), thu tu trai-phai roi
  tren-xuong. Moi diem: bien do keo `ax`/`ay`, so vong `kx`/`ky`/`ck`, pha, va
  `alt` la mau bien the de dao qua lai.
- `sub` — chia moi o thanh `sub`x`sub` tam giac. 18 du muot o kho 2K.
- `grain` — bien do hat theo do sang (LSB). Phan mau co dinh 6 LSB.

Vanh ngoai luon ghim co dinh — dung cho no chay, khung se ho.

## Constraints

- **Moi tan so phai la BOI SO NGUYEN cua chu ky**, neu khong nen khong lap kin.
- **Cac boi so phai NGUYEN TO CUNG NHAU.** Dung k = 2 va 3. Dung k = 2 va 4:
  o giua video ca hai cung ve cho cu, nen **lap lai nguyen si** — do duoc lech
  frame dau voi frame giua chi 0.108 (gan nhu trung khit).
  Rut ngan `uLoop` cung lam troi nhanh hon nhung dinh dung cai bay nay. Giu
  `uLoop` = dung do dai video, tang `k` thay vi.
- **Quy dao Lissajous, khong phai duong tron.** x va y hai tan so khac nhau ->
  toc do luc nhanh luc cham. Duong tron cho toc do DEU, doc ra la chuyen dong
  co khi. (Apple ease-in-out moi thu, khong bao gio tuyen tinh.)
- **Noi suy mau trong khong gian sRGB, khong phai tuyen tinh.** Catmull-Rom
  KHONG bi gioi han trong khoang cac diem dieu khien; trong khong gian tuyen
  tinh mau toi co gia tri cuc nho nen chi can vot nhe la xuong AM roi bi chan
  ve 0 -> **vet toi den si giua nen**. Do duoc mot diem RGB(0,0,51) trong khi
  diem dieu khien toi nhat quanh do la lum 30.8.
  Da vay van phai **chan ket qua trong khoang 16 diem dieu khien** duoc dung.
- **Vi mau dau vao la sRGB nen fragment chi `toSRGB` MOT lan.** Framebuffer cua
  pipeline nay giai ma sRGB mot lan tren gia tri shader ghi ra. Neu doi sang
  truyen mau tuyen tinh thi phai encode HAI lan.
- **Bien do keo NGANG phai dat rieng theo cot khi co chu de len nen.** 0.26 NDC
  nghe nho nhung bang 13% be ngang khung = 333px — du de loi mau sang cua cot
  phai vao han vung chu, keo tuong phan xuong 3.08:1. Cot phia chu 0.06-0.07,
  cot giua 0.11-0.13, cot xa 0.22-0.25. Bien do DOC de rong duoc.
- **Vung toi van phai NO MAU.** Do duoc: nen cu do tuoi 43.5 con wallpaper Apple
  110-221. Gan xam moi la thu lam nen chet, khong phai toi.
- **Do bao hoa theo ty le `(max-min)/max` DANH LUA tren mau toi** — nen nhat do
  ra 0.761 cao hon Apple 0.500. Phai dung **do tuoi tuyet doi `max-min`**.
- **Loc hat truoc khi do do doc mau**, neu khong grain ap dao dao ham. Lan dau
  do ra dot gap 13.6 lan, thuc te 1.5.

## Chon bang mau

Chat "mesh" quyet dinh boi **do sang va do tuoi**, khong phai so luong mau.
Wallpaper Apple thu hai chi co **30 do hue** — hep hon ca nen Harmonix — nhung
do tuoi 221 nen van dep.

Moc do duoc 2026-09-10:

| | do sang | do tuoi | quet hue |
|---|---|---|---|
| Apple #1 | 143.6 | 110.7 | 210 do |
| Apple #2 | 123.1 | **221.1** | **30 do** |
| Harmonix (dang dung) | 85.2 | 56.7 | 90 do |

Harmonix khong the sang bang Apple: chu trang va dong xu bac can nen toi moi
noi len. Nhung do tuoi thi bat chuoc duoc.

Bang mau dang dung: lam sau (trai, sau cot chu) -> teal -> luc (phai).

## Kiem tra truoc khi giao

```bash
V=~/.venv/motion/bin/python   # can numpy pillow scipy
$V .../harmonix-motion/verify/verify.py motion   nen.mp4
$V .../harmonix-motion/verify/verify.py contrast nen.mp4 khung-ghep.png
$V .../harmonix-motion/verify/verify.py ref      anh-tham-chieu.png
```

- `motion` — troi deu khong, co dong bang khong, **lap kin khong**
- `contrast` — WCAG tung dai chu tren MOI frame. Do mot frame duy nhat se bo
  sot: co lan mot frame ra 4.54:1 nhung khung xau nhat la 3.74:1.
- `ref` — boc tach anh tham chieu de dat muc tieu do sang/do tuoi

**Chua dat tuong phan thi nang DO SANG CHU, dung lam toi nen.** Mot vong lam
toi nen chi keo tuong phan len 0.07 diem ma lam mat 25 don vi do tuoi.

## Notes

- Da kiem: **khong co vet luoi** o `sub = 18`. Tru xu huong muot khoi anh thi
  phan du chi la hat (std 0.65 muc), khong co cau truc tuan hoan.
  Chi so FFT bao "9.0x nen" la **bat nham pho cua grain** — dung tin chi so pho
  khi anh co hat, phai nhin anh phan du.
- Chi phi CPU moi frame: `(NX-1)*sub+1` binh phuong dinh, moi dinh 5 kenh. O
  5x5/sub=18 la 5329 dinh — khong dang ke.
