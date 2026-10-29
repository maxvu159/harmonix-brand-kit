#!/usr/bin/env python3
"""
Sinh bo ban do KHAC LOGO VAO KIM LOAI cho mat dong xu.

VI SAO KHAC CHU KHONG DAN ANH: dan anh logo len mat xu thi mat xu la mot mang
mau PHANG nam TREN vat the kim loai — mai mai khong hoa vao duoc, va no khong
phan ung voi anh sang. Khac chim thi ca dong xu la mot khoi kim loai duy nhat.

VI SAO PHAI DO MEN (enamel): normal map chi cho thay DOC. Day cua ranh khac co
cung phap tuyen voi mat phang xung quanh, nen chi rieng normal map thi logo doc
ra chi la mot ĐUONG VIEN rong ruot. Phai do mau vao long ranh (metalness = 0 o
do) thi moi ra hinh dac.

Dau ra 3 file <prefix>-normal.png, -orm.png, -base.png o 2048x2048:
  normal : phap tuyen tangent-space
  orm    : R = AO, G = do nham, B = do kim loai   (chuan glTF)
  base   : mau nen — trang o phan kim loai, mau men o long ranh

Dung:
    make_engrave_maps.py logo.png  out/eng-green   --enamel '#173132'
    make_engrave_maps.py logo.svg  out/eng-green   --enamel '#173132'   # can rsvg-convert
    make_engrave_maps.py logo.png  out/eng-metal   --enamel none        # khac tran, khong do men

Can numpy + Pillow + scipy.
"""
import argparse
import pathlib
import subprocess
import sys

import numpy as np
from PIL import Image
from scipy.ndimage import distance_transform_edt, gaussian_filter

SIZE = 2048
BEVEL = 46      # be rong vat cheo, tinh bang pixel o kho 2048
BLUR = 1.6      # lam mem canh vat cheo
SCALE = 16.0    # do doc cua phap tuyen; cao qua se ra vien cung
ENAMEL_LO = 0.50   # men bat dau do o do sau nay (0 = mat, 1 = day ranh)
ENAMEL_SOFT = 0.34 # do mem cua mep men

METAL_ROUGH, ENAMEL_ROUGH = 0.07, 0.35
METAL_METAL, ENAMEL_METAL = 1.00, 0.00


def load_alpha(path: str) -> np.ndarray:
    p = pathlib.Path(path)
    if p.suffix.lower() == ".svg":
        exe = None
        for c in ("rsvg-convert", "/opt/homebrew/bin/rsvg-convert"):
            if subprocess.run(["which", c], capture_output=True).returncode == 0 or pathlib.Path(c).exists():
                exe = c
                break
        if exe is None:
            sys.exit("Can rsvg-convert de doc SVG:  brew install librsvg\n"
                     "Hoac xuat logo ra PNG co nen trong roi truyen file PNG.")
        png = subprocess.run([exe, "-w", str(SIZE), "-h", str(SIZE), str(p)],
                             capture_output=True).stdout
        import io
        im = Image.open(io.BytesIO(png)).convert("RGBA")
    else:
        im = Image.open(p).convert("RGBA")
    im = im.resize((SIZE, SIZE), Image.LANCZOS)
    arr = np.asarray(im).astype(np.float32)
    a = arr[..., 3] / 255.0

    # Logo thuong o mot trong hai dang: nen TRONG (dung alpha), hoac BADGE dac
    # co dau nam tren nen mau (phai dung do sang). File hahype.svg la dang thu
    # hai — alpha dac 100%, dau logo chi la 16% pixel toi. Neu dung alpha o day
    # thi ca badge thanh vung khac, ra sai hoan toan.
    if (a > 0.5).mean() < 0.95:
        return a

    lum = 0.2126 * arr[..., 0] + 0.7152 * arr[..., 1] + 0.0722 * arr[..., 2]
    mid = (lum.min() + lum.max()) / 2
    dark = lum < mid
    # dau logo luon la phan THIEU SO tren badge
    mark = dark if dark.mean() < 0.5 else ~dark
    # giu mep muot: chuyen sang [0,1] theo khoang cach toi nguong
    soft = np.clip((mid - lum) / max(mid - lum.min(), 1e-6), 0, 1)
    return soft if mark is dark else 1.0 - soft


def build(alpha: np.ndarray):
    """height: 0 = mat kim loai, -1 = day ranh khac."""
    mask = alpha > 0.5
    dist = distance_transform_edt(mask)              # khoang cach vao trong tu mep logo
    h = -np.clip(dist / BEVEL, 0.0, 1.0)
    h = gaussian_filter(h, BLUR)
    return h


def normal_map(h: np.ndarray) -> np.ndarray:
    gy, gx = np.gradient(h)
    nx, ny, nz = -gx * SCALE, -gy * SCALE, np.ones_like(h)
    ln = np.sqrt(nx * nx + ny * ny + nz * nz)
    out = np.stack([nx / ln, ny / ln, nz / ln], -1)
    return ((out * 0.5 + 0.5) * 255).clip(0, 255).astype(np.uint8)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("logo")
    ap.add_argument("prefix", help="duong dan + tien to, vd out/eng-green")
    ap.add_argument("--enamel", default="#173132",
                    help="mau do vao long ranh, hoac 'none' de khac tran kim loai")
    ap.add_argument("--bevel", type=int, default=BEVEL)
    a = ap.parse_args()
    globals()["BEVEL"] = a.bevel

    h = build(load_alpha(a.logo))
    pathlib.Path(a.prefix).parent.mkdir(parents=True, exist_ok=True)

    Image.fromarray(normal_map(h)).save(f"{a.prefix}-normal.png")

    if a.enamel.lower() == "none":
        e = np.zeros_like(h)
        col = np.array([1.0, 1.0, 1.0])
    else:
        e = np.clip((-h - ENAMEL_LO) / ENAMEL_SOFT, 0.0, 1.0)
        c = a.enamel.lstrip("#")
        col = np.array([int(c[i:i + 2], 16) / 255.0 for i in (0, 2, 4)])

    orm = np.stack([
        np.ones_like(h),                                      # AO — de shader tu lo
        METAL_ROUGH + (ENAMEL_ROUGH - METAL_ROUGH) * e,       # G = do nham
        METAL_METAL + (ENAMEL_METAL - METAL_METAL) * e,       # B = do kim loai
    ], -1)
    Image.fromarray((orm * 255).clip(0, 255).astype(np.uint8)).save(f"{a.prefix}-orm.png")

    base = np.ones((SIZE, SIZE, 3), np.float32)
    for i in range(3):
        base[..., i] = 1.0 + (col[i] - 1.0) * e
    Image.fromarray((base * 255).clip(0, 255).astype(np.uint8)).save(f"{a.prefix}-base.png")

    print(f"-> {a.prefix}-normal.png  -orm.png  -base.png   ({SIZE}x{SIZE})")
    print(f"   ty le pixel co men: {(e > 0.5).mean()*100:.1f}%")


if __name__ == "__main__":
    main()
