#!/usr/bin/env python3
"""
Sinh bo ban do KHAC MAT THE cho the kim loai Harmonix.

Khac voi make_engrave_maps.py cua skill dong xu o ba diem, va ca ba deu la
bat buoc chu khong phai cho tien:

1. KHO CHU NHAT, khong vuong. Mat the ti le 1.602:1 (the tin dung sau khi tru
   canh vat), nen ban do phai dung ti le do — keo mot ban do vuong len se lam
   chu beo ngang.

2. HAI DO SAU VAT CHEO. Vat cheo la mot doc distance-transform tinh tu MEP net
   chu vao trong. Chu tieu de net day ~70px thi vat 26px vua dep; chu nho net
   day ~9px thi vat 26px khong bao gio cham day ranh -> khong duoc do men, chu
   ra rong ruot. Nen ve rieng hai mat na roi lay do sau NHO HON (sau hon) tai
   moi diem.

3. KIM LOAI CO MAU. Script dong xu de kim loai trang roi nhan mau o material.
   O day khong lam vay duoc: nhan mau se nhan ca len men, ra men xanh reu
   nhan lime = mau bun. Nen nen kim loai va men deu do thang vao base map,
   material giu color trang.
"""
import argparse, io, pathlib, subprocess, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFont
from scipy.ndimage import distance_transform_edt, gaussian_filter

W = 4096
ASPECT = 1.6019                 # khop chinh xac voi mat phang face trong CardTest.tsx
H = int(round(W / ASPECT))      # 2557

BEVEL_HERO, BEVEL_BODY, BEVEL_DECO = 26, 3, 55
BLUR_HERO, BLUR_BODY, BLUR_DECO = 1.5, 0.5, 4.0  # sigma PHAI ti le voi be rong vat cheo
DECO_DEPTH = 0.62               # hoa van chim nong hon chu nhieu
DOME = 8.0                      # do vong cua mat the — xem chu thich o main()
DECO_ROUGH = 0.075              # xem chu thich o main()
SCALE = 15.0

# Mat the la be mat NHAM (anod hoa); chi canh vat la bong, va canh vat thuoc ve
# khoi extrude chu khong thuoc ban do nay.
# Do nham cua rieng phan KIM LOAI, men giu nguyen matte. Chenh lech nay la co
# y: 0.16 du sac de cac dai sang hep trong moi truong hien ra thanh VET chay
# tren mat the, con men 0.46 thi khong bao gio bat sang — nen chu luon doc duoc
# du vet sang quet qua no. Truoc do de 0.26 thi PMREM tan het moi dai thanh
# mang mo, mat the ra bet nhu nhua.
METAL_ROUGH, ENAMEL_ROUGH = 0.16, 0.46
# Do kim loai PHAI ha khi mat the doi sang mau SANG. Kim loai co do kim loai
# cao thi gan nhu khong co khuech tan — no chi phan chieu moi truong. Nen kim
# loai sang (phan xa ~78%) hat gan nguyen ca dai sang tran studio vao may quay
# va mat the trang xoa, chu nho chim het. Nhom anod mau sang trong doi thuc
# cung khong phai kim loai tran: lop oxit phu tren la mot lop DIEN MOI co mau.
# 0.42 la muc de mau nen doc ra duoc, con chat kim loai thi de canh vat ganh
# (vo the van giu 0.86).
METAL_METAL, ENAMEL_METAL = 0.38, 0.00
GRAIN_AMP, GRAIN_SIGMA = 0.030, 7.0   # van kim loai duc, xem chu thich o main()

FONTDIR = pathlib.Path(__file__).resolve().parent.parent / "design-system/fonts"
MARKSVG = pathlib.Path(__file__).resolve().parent.parent / "logos/tokens/har.svg"

MX, MY = 210, 175               # le trai/phai, le tren


def font(name: str, size: int):
    return ImageFont.truetype(str(FONTDIR / f"Aeonik-{name}.otf"), size)


def tracked(d: ImageDraw.ImageDraw, xy, text, f, track=0.0, anchor_right=False):
    """Ve chu co gian cach. PIL khong co letter-spacing nen phai ve tung ky tu."""
    adv = []
    for ch in text:
        adv.append(d.textlength(ch, font=f) + track)
    total = sum(adv) - (track if text else 0)
    x, y = xy
    if anchor_right:
        x -= total
    for ch, a in zip(text, adv):
        d.text((x, y), ch, font=f, fill=255)
        x += a
    return total


def load_mark(size: int) -> Image.Image:
    """Dau Harmonix. har.svg la badge dac: nen #173132, dau #E0F49F.
    Can rieng cai dau, nen bo the <rect> nen roi to lai thanh den tren nen trong."""
    src = MARKSVG.read_text()
    body = src[src.index("<g>"):src.index("</svg>")]
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 250 250" '
           f'width="{size}" height="{size}">'
           f'<style>.st0{{fill:#000}}.st1{{fill:#000}}</style>{body}</svg>')
    exe = next((c for c in ("rsvg-convert", "/opt/homebrew/bin/rsvg-convert")
                if subprocess.run(["which", c], capture_output=True).returncode == 0
                or pathlib.Path(c).exists()), None)
    if exe is None:
        sys.exit("Can rsvg-convert: brew install librsvg")
    png = subprocess.run([exe, "-w", str(size), "-h", str(size), "-"],
                         input=svg.encode(), capture_output=True).stdout
    return Image.open(io.BytesIO(png)).convert("RGBA").split()[3]


def draw_faces(card):
    """Tra ve (hero_mask, body_mask, deco_mask) — ba anh L, 255 = cho khac."""
    hero = Image.new("L", (W, H), 0)
    body = Image.new("L", (W, H), 0)
    deco = Image.new("L", (W, H), 0)
    dh, db = ImageDraw.Draw(hero), ImageDraw.Draw(body)

    f_hero = font("Medium", 300)
    f_und = font("Medium", 236)
    f_desc = font("Medium", 74)
    f_sub = font("Regular", 62)
    f_lab = font("Regular", 50)
    f_val = font("Medium", 74)
    f_word = font("Medium", 68)

    # --- ticker + tai san goc, cung mot hang ---
    dh.text((MX, MY), card["ticker"], font=f_hero, fill=255)
    dh.text((W - MX, MY + 30), card["under"], font=f_und, fill=255, anchor="ra")

    # --- duong noi dut net giua hai ben, dung nhu the len may bay ---
    tw = dh.textlength(card["ticker"], font=f_hero)
    uw = dh.textlength(card["under"], font=f_und)
    x0, x1 = MX + tw + 90, W - MX - uw - 90
    y = MY + 175
    x = x0
    while x < x1:
        db.line([(x, y), (min(x + 26, x1), y)], fill=255, width=5)
        x += 48
    cx = x0 + (x1 - x0) * 0.62                       # dau cong nho tren duong
    db.line([(cx - 22, y), (cx + 22, y)], fill=255, width=7)
    db.line([(cx, y - 22), (cx, y + 22)], fill=255, width=7)

    # --- mo ta duoi ticker, in hoa gian cach rong ---
    yy = MY + 350
    for line in card["desc"]:
        tracked(db, (MX, yy), line.upper(), f_desc, track=5.0)
        yy += 100
    tracked(db, (W - MX, MY + 300), card["undername"], f_sub, track=2.0, anchor_right=True)

    # --- hang o duoi day ---
    top, inner = 1655, W - 2 * MX
    db.line([(MX, top), (W - MX, top)], fill=255, width=4)
    n = len(card["cells"])
    for i, (lab, val) in enumerate(card["cells"]):
        cxx = MX + inner * i / n
        if i:
            db.line([(cxx, top), (cxx, top + 330)], fill=255, width=4)
        tracked(db, (cxx + 46, top + 52), lab.upper(), f_lab, track=4.0)
        tracked(db, (cxx + 46, top + 160), val, f_val, track=1.5)

    # --- dau nha phat hanh, goc duoi trai ---
    ms = 118
    mark = load_mark(int(ms * 0.62))
    box = Image.new("L", (ms, ms), 0)
    ImageDraw.Draw(box).rounded_rectangle([0, 0, ms - 1, ms - 1], radius=26, outline=255, width=5)
    box.paste(mark, (int(ms * 0.19), int(ms * 0.19)), mark)
    body.paste(box, (MX, H - MY - ms), box)
    tracked(db, (MX + ms + 40, H - MY - ms + 22), "Harmonix", f_word, track=1.0)

    # --- hoa van chim giua the ---
    # Khoang giua the truoc do trong tron. The kim loai that lap cho do bang
    # hoa van DAP CHIM khong to mau: no chi hien ra khi anh sang quet ngang, nen
    # khong bao gio tranh cho voi chu. O day dung dau Harmonix co lon, va no
    # KHONG vao mat na men — chi khac tran vao kim loai.
    ds = int(H * 0.72)
    big = load_mark(ds)
    deco.paste(big, (int(W * 0.615), int(H * 0.20)), big)

    return hero, body, deco


def height(mask: Image.Image, bevel: int, blur: float) -> np.ndarray:
    """0 = mat the, -1 = day ranh khac.

    Lam mem NGAY TAI DAY chu khong lam mem tong hop sau: sigma phai ti le voi
    be rong vat cheo cua chinh mat na nay. Lam mem ca hai bang mot sigma chung
    thi rung cua chu nho (rong 3px) bi san phang gan het — do dung la loi da
    lam ty le men tut xuong 0.01%.
    """
    a = np.asarray(mask).astype(np.float32) / 255.0
    dist = distance_transform_edt(a > 0.5)
    return gaussian_filter(-np.clip(dist / bevel, 0.0, 1.0), blur)


def normal_map(h):
    gy, gx = np.gradient(h)
    nx, ny, nz = -gx * SCALE, -gy * SCALE, np.ones_like(h)
    ln = np.sqrt(nx * nx + ny * ny + nz * nz)
    return (((np.stack([nx / ln, ny / ln, nz / ln], -1)) * 0.5 + 0.5) * 255).clip(0, 255).astype(np.uint8)


CARDS = {
    "hahype": dict(ticker="haHYPE", under="HYPE", undername="Hyperliquid",
                   desc=["Harmonix HYPE", "Yield Vault"],
                   cells=[("Network", "HYPERLIQUID"), ("Asset", "HYPE"),
                          ("Type", "YIELD VAULT"), ("Status", "LIVE")]),
    "hausdc": dict(ticker="haUSDC", under="USDC", undername="USD Coin",
                   desc=["Harmonix USDC", "Yield Vault"],
                   cells=[("Network", "HYPERLIQUID"), ("Asset", "USDC"),
                          ("Type", "YIELD VAULT"), ("Status", "LIVE")]),
    "hakhype": dict(ticker="haKHYPE", under="kHYPE", undername="Kinetiq Staked HYPE",
                    desc=["Harmonix kHYPE", "Yield Vault"],
                    cells=[("Network", "HYPERLIQUID"), ("Asset", "kHYPE"),
                           ("Type", "YIELD VAULT"), ("Status", "LIVE")]),
}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("card", choices=sorted(CARDS))
    ap.add_argument("prefix")
    ap.add_argument("--metal", default="#B7D9A6", help="mau nen kim loai anod hoa")
    ap.add_argument("--enamel", default="#173132", help="mau men do vao long ranh")
    a = ap.parse_args()

    hero, body, deco = draw_faces(CARDS[a.card])
    h = np.minimum(height(hero, BEVEL_HERO, BLUR_HERO), height(body, BEVEL_BODY, BLUR_BODY))
    h = np.minimum(h, height(deco, BEVEL_DECO, BLUR_DECO) * DECO_DEPTH)

    # DO VONG CUA MAT THE.
    # Mot mat PHANG chi phan chieu dung mot vung nho cua moi truong, nen khi moi
    # truong xoay thi ca mat the sang len roi toi di CUNG LUC — no nhap nhay chu
    # khong quet. Do duoc: doi do kim loai (0.34..0.55) va do nham (0.16..0.22)
    # deu khong nhuc nhich, chenh sang-toi dung im o 1.65:1 (2026-09-10).
    # Muon vet sang CHAY ngang mat the thi phap tuyen phai bien thien tren mat,
    # tuc mat phai cong. The kim loai that deu hoi vong len va chinh cai vong do
    # lam vet sang chay.
    # Khong can uon hinh hoc that: chi can nuong do vong vao normal map. `h` o
    # day chi con dung de sinh normal map (men lay tu mat na chu khong tu h),
    # nen cong them mot buou rat thoai la du. DOME = 8.0 cho phap tuyen nghieng
    # ~7 do o mep — dung tam de vet sang quet het be ngang the.
    yy, xx = np.mgrid[0:H, 0:W]
    u = 2.0 * xx / (W - 1) - 1.0
    v = 2.0 * yy / (H - 1) - 1.0
    h = h + DOME * (1.0 - u * u) * (1.0 - v * v)

    # MEN PHU CA NET CHU, khong chi phan sau hon mot nguong.
    # Nguong theo do sau la mo hinh cua dong xu, va no sai o day: net chu than
    # the day ~7px, nua be rong 3.5px, nen khong bao gio dat toi day ranh —
    # chu se ra rong ruot. O kho render cuoi, mot ranh chu V rong 3px khong the
    # doc ra la "khac" duoc; cai mat NHIN THAY la net chu co mau men.
    # Nen: men = chinh mat na (da co khu rang cua cua PIL), con truong do cao
    # chi con nhiem vu duy nhat la sinh normal map.
    e = np.maximum(np.asarray(hero), np.asarray(body)).astype(np.float32) / 255.0

    pathlib.Path(a.prefix).parent.mkdir(parents=True, exist_ok=True)
    Image.fromarray(normal_map(h)).save(f"{a.prefix}-normal.png")

    hexcol = lambda s: np.array([int(s.lstrip('#')[i:i + 2], 16) / 255.0 for i in (0, 2, 4)])
    cm, ce = hexcol(a.metal), hexcol(a.enamel)

    # VAN KIM LOAI. Mot mat kim loai co do nham HANG SO tuyet doi thi phan chieu
    # ra mot mang phang chet, khong co gi de mat bam vao. Kim loai that luon co
    # van rat mo. Nhieu trang tan so cao thi bi mipmap an mat va gay nhap nhay
    # khi the xoay; phai la nhieu TAN SO THAP — dom lon, mo — moi song sot qua
    # mipmap va doc ra la be mat.
    rng = np.random.default_rng(7)
    grain = gaussian_filter(rng.random((H, W)).astype(np.float32) - 0.5, GRAIN_SIGMA)
    grain *= GRAIN_AMP / (np.abs(grain).max() + 1e-9)

    # HOA VAN CHIM: them CHENH DO NHAM trong long khac.
    # Chi rieng normal map thi hoa van chi hien khi co tia sang quet ngang qua —
    # phan lon thoi gian no bien mat. Dap chim tren kim loai that doi luon ca do
    # min be mat, khong chi hinh dang, nen cho long khac nham hon mot chut thi
    # no doc ra o MOI goc chieu sang, khong phu thuoc vao viec co tia nao quet
    # qua hay khong.
    dm = np.asarray(deco).astype(np.float32) / 255.0
    rough = (METAL_ROUGH + (ENAMEL_ROUGH - METAL_ROUGH) * e
             + grain * (1.0 - e)
             + DECO_ROUGH * dm * (1.0 - e))
    orm = np.stack([np.ones_like(h),
                    np.clip(rough, 0.03, 1.0),
                    METAL_METAL + (ENAMEL_METAL - METAL_METAL) * e], -1)
    Image.fromarray((orm * 255).clip(0, 255).astype(np.uint8)).save(f"{a.prefix}-orm.png")

    base = np.empty((H, W, 3), np.float32)
    for i in range(3):
        base[..., i] = cm[i] + (ce[i] - cm[i]) * e
    Image.fromarray((base * 255).clip(0, 255).astype(np.uint8)).save(f"{a.prefix}-base.png")

    print(f"-> {a.prefix}-{{normal,orm,base}}.png   ({W}x{H})")
    print(f"   ty le pixel co men: {(e > 0.5).mean()*100:.2f}%")


if __name__ == "__main__":
    main()
