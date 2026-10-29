#!/usr/bin/env python3
"""
Sinh bo ban do cho MARK HARMONIX dung trong video buyback.

Khac voi make_card_maps.py o mot diem ban le: o day co mot ban do KHONG PHAI
hinh anh — ban do `flow`. Gia tri moi diem la KHOANG CACH TRAC DIA do TRONG
LONG RANH, tinh tu mot dau ranh. Shader hien men o cho `flow <= progress`.

Vi sao phai the, khong dung mat phang cat (clip plane): mark la hinh chu S.
Mot mat phang cat no theo duong THANG, nen o nhieu vi tri no dang do day HAI
THUY ROI NHAU cung luc — doc ra la hong. Khoang cach trac dia thi tu bam theo
duong cong cua ranh va tu di vong qua cai lo o giua.

Xuat ra:
  mark-flow.png    flow 16-bit = R*256 + B (0..65535), 65535 ngoai ranh
                   G = do phu cua ranh (0..1, co khu rang cua)
  mark-normal.png  thanh ranh + do vong mat (DOME)
  mark-front.json  128 toa do cua MAT DAN DAU theo progress — de dan xu bay
                   dung vao cho men dang dang len
"""

import json
import pathlib
import heapq

import numpy as np
from PIL import Image, ImageDraw
from scipy.ndimage import distance_transform_edt, gaussian_filter

W = 2048                 # canh ban do
SS = 2                   # boi supersample khi to hinh
U = 250.0                # khong gian toa do cua file SVG goc
S = W / U                # pixel tren mot don vi SVG

BORDER = 4.0             # be rong vanh kim loai con lai quanh ranh (don vi SVG)
WALL = 2.4               # be rong thanh vat cua ranh
DEPTH = 16.0             # do sau ranh, don vi PIXEL cua ban do (nz = 1)
DOME = 105.0             # do vong mat mark, don vi PIXEL — xem chu thich o duoi

OUT = pathlib.Path.home() / "Workspace/harmonix-motion/remotion/src/logos/mark"

# --------------------------------------------------------------- hinh hoc

# Cac doan cua duong vien, boc tay tu hmn-circle-green.svg. Duong 's' da duoc
# quy ve 'C' bang cach lay doi xung diem dieu khien thu hai qua diem cuoi.
OUTER = [
    ("C", (183.3, 66.0), (150.3, 46.8), (120.4, 71.4), (98.2, 109.7)),
    ("L", (98.2, 109.7), (62.2, 88.2)),
    ("C", (62.2, 88.2), (40.0, 126.5), (33.8, 164.9), (66.8, 183.3)),
    ("C", (66.8, 183.3), (99.8, 201.7), (129.7, 178.7), (151.9, 140.4)),
    ("L", (151.9, 140.4), (187.9, 161.1)),
    ("C", (187.9, 161.1), (210.1, 122.7), (216.3, 85.1), (183.3, 66.0)),
]

HOLE = [
    ("C", (145.7, 136.5), (132.7, 158.7), (117.3, 174.1), (102.0, 164.9)),
    ("C", (102.0, 164.9), (86.7, 156.5), (92.8, 135.0), (105.1, 112.8)),
    ("C", (105.1, 112.8), (117.4, 90.6), (133.5, 75.2), (148.8, 83.7)),
    ("C", (148.8, 83.7), (163.3, 93.6), (158.0, 114.3), (145.7, 136.5)),
]

# Dau ranh chon lam GOC do trac dia: mat cat phang o phia duoi-phai.
# Hai mat cat phang o hai dau ranh — doi xung nhau qua tam (125,125).
CUT_A = ((98.2, 109.7), (62.2, 88.2))
CUT_B = ((151.9, 140.4), (187.9, 161.1))


def flatten(segs, n=160):
    """Be cac doan bezier thanh da giac."""
    pts = []
    for seg in segs:
        if seg[0] == "L":
            p0, p1 = seg[1], seg[2]
            for i in range(n):
                u = i / n
                pts.append((p0[0] + (p1[0] - p0[0]) * u, p0[1] + (p1[1] - p0[1]) * u))
        else:
            p0, c1, c2, p1 = seg[1], seg[2], seg[3], seg[4]
            for i in range(n):
                u = i / n
                v = 1 - u
                x = v**3 * p0[0] + 3 * v * v * u * c1[0] + 3 * v * u * u * c2[0] + u**3 * p1[0]
                y = v**3 * p0[1] + 3 * v * v * u * c1[1] + 3 * v * u * u * c2[1] + u**3 * p1[1]
                pts.append((x, y))
    return pts


def rasterize():
    """Mat na cua mark, da khu rang cua bang cach to o SS lan roi thu nho."""
    big = W * SS
    img = Image.new("L", (big, big), 0)
    d = ImageDraw.Draw(img)
    d.polygon([(x * S * SS, y * S * SS) for x, y in flatten(OUTER)], fill=255)
    d.polygon([(x * S * SS, y * S * SS) for x, y in flatten(HOLE)], fill=0)
    return np.asarray(img.resize((W, W), Image.LANCZOS)).astype(np.float32) / 255.0


# --------------------------------------------------------------- trac dia


def geodesic(groove_bin, seed_bin):
    """
    Dijkstra 8 huong tren luoi, gia di chuyen 1 va sqrt(2).

    Dung BFS 8 huong gia 1 deu thi duong cheo re hon that -> mat dan dau bi
    xien di trong cac doan cheo cua ranh. Phai tra dung gia sqrt(2).
    """
    h, w = groove_bin.shape
    INF = np.float32(1e9)
    dist = np.full((h, w), INF, dtype=np.float32)
    pq = []
    ys, xs = np.nonzero(seed_bin)
    for y, x in zip(ys, xs):
        dist[y, x] = 0.0
        heapq.heappush(pq, (0.0, int(y), int(x)))

    nb = [(-1, 0, 1.0), (1, 0, 1.0), (0, -1, 1.0), (0, 1, 1.0),
          (-1, -1, 1.41421356), (-1, 1, 1.41421356),
          (1, -1, 1.41421356), (1, 1, 1.41421356)]

    while pq:
        dcur, y, x = heapq.heappop(pq)
        if dcur > dist[y, x]:
            continue
        for dy, dx, cost in nb:
            ny, nx = y + dy, x + dx
            if ny < 0 or nx < 0 or ny >= h or nx >= w:
                continue
            if not groove_bin[ny, nx]:
                continue
            nd = dcur + cost
            if nd < dist[ny, nx]:
                dist[ny, nx] = nd
                heapq.heappush(pq, (nd, ny, nx))
    return dist, INF


# ------------------------------------------------------------------ main


def main():
    OUT.mkdir(parents=True, exist_ok=True)

    cov = rasterize()                  # do phu 0..1
    inside = cov > 0.5

    # khoang cach tu MEP vao trong, don vi SVG
    dist_in = distance_transform_edt(inside).astype(np.float32) / S

    # ranh = phan long o giua, chua lai mot vanh kim loai rong BORDER
    groove = np.clip((dist_in - BORDER) / 0.9, 0.0, 1.0) * cov

    # --- truong do cao: long ranh sau xuong, ca mat mark vong len nhe ---
    #
    # DOME khong phai trang tri. Mat phang chi phan chieu DUNG MOT vung nho cua
    # moi truong, nen xoay moi truong chi lam no nhap nhay chu khong keo duoc
    # vet sang chay qua. Phai co do cong mat thi vet sang moi chay — do la thu
    # giu cho mark dung yen 5 giay cuoi ma van song.
    wall = np.clip((dist_in - BORDER) / WALL, 0.0, 1.0)
    wall = wall * wall * (3.0 - 2.0 * wall)          # smoothstep
    h = -DEPTH * wall

    yy, xx = np.mgrid[0:W, 0:W]
    u = 2.0 * xx / (W - 1) - 1.0
    v = 2.0 * yy / (W - 1) - 1.0
    h = h + DOME * np.clip(1.0 - u * u, 0, 1) * np.clip(1.0 - v * v, 0, 1)
    h = gaussian_filter(h, 1.2)

    gy, gx = np.gradient(h)
    # nz = 1 nghia la truong do cao tinh bang PIXEL: doc 1px tren 1px = 45 do.
    # Ban truoc de nz = 12 nen thanh ranh chi nghieng 6 do va DOME chi 0.07 do —
    # ca hai deu vo dung. Do duoc phai la: thanh ranh ~39 do de doc ra la RANH,
    # vom mat ~8.5 do o mep de vet sang CHAY duoc khi xoay moi truong.
    nz = np.full_like(h, 1.0)
    n = np.stack([-gx, gy, nz], axis=-1)             # +Y cua anh di xuong
    n /= np.linalg.norm(n, axis=-1, keepdims=True)
    normal = ((n * 0.5 + 0.5) * 255.0).astype(np.uint8)
    Image.fromarray(normal, "RGB").save(OUT / "mark-normal.png")

    # --- trac dia: FAST MARCHING tu HAI dau ranh ---
    #
    # Ban truoc: Dijkstra 8 huong o 512 roi luu 8-bit. Hai loi nhin thay duoc:
    #   - Dijkstra tren luoi cho mat song BAT GIAC -> mep men gap ghenh.
    #   - 8-bit chi 256 muc, mep men sac hon mot muc -> mep bam theo bac thang
    #     luong tu -> rang cua.
    # Gio: giai phuong trinh eikonal (fast marching) o 2048, luu 16-bit.
    #
    # HAI dau ranh cung bat dau. Mark doi xung xoay 180 do quanh (125,125) nen
    # hai dong la anh guong cua nhau va GAP NHAU O EO GIUA — do la cao trao.
    import skfmm

    def near_segment(a, b, rad):
        ax, ay, bx, by = a[0] * S, a[1] * S, b[0] * S, b[1] * S
        dx, dy = bx - ax, by - ay
        t = np.clip(((xx - ax) * dx + (yy - ay) * dy) / (dx * dx + dy * dy), 0, 1)
        return np.hypot(xx - (ax + t * dx), yy - (ay + t * dy)) < rad * S

    def march(seed):
        phi = np.ma.MaskedArray(np.where(seed & inside, -1.0, 1.0), ~inside)
        d = skfmm.distance(phi, dx=1.0 / S)            # don vi SVG
        return np.clip(np.ma.filled(d, np.inf), 0, None).astype(np.float32)

    dA = march(near_segment(CUT_A[0], CUT_A[1], 1.5))
    dB = march(near_segment(CUT_B[0], CUT_B[1], 1.5))
    d = np.minimum(dA, dB)
    lab_a = dA <= dB

    gm = groove > 0.5
    if not np.isfinite(d[gm]).all():
        raise SystemExit("co pixel ranh khong toi duoc")
    dmax = float(d[gm].max())
    flow = np.clip(d / dmax, 0.0, 1.0)
    print(f"fast marching: dai nhat {dmax:.1f} don vi SVG | nua A {lab_a[gm].mean()*100:.1f}% ranh")

    # --- can bang theo DIEN TICH (luu luong khong doi) ---
    hist, edges = np.histogram(flow[gm], bins=16384, range=(0.0, 1.0))
    cdf = np.cumsum(hist).astype(np.float64)
    cdf /= cdf[-1]
    flow = np.interp(flow, edges[1:], cdf).astype(np.float32)

    # --- BON mat dan dau ---
    # Mark la mot VONG khep kin quanh cai lo; hai mat cat chi la hai khac tren
    # vong. Nen men tu moi khac chay theo CA HAI chieu -> bon mat dan dau, gap
    # nhau tung doi o giua cung ngoai cua moi thuy. Tach bon nhanh theo: gan dau
    # cat nao (A/B) x nam ben nao cua truc tu tam toi dau cat do.
    c = np.array([125.0 * S, 125.0 * S])
    mid = {k: (np.array(v[0]) + np.array(v[1])) / 2 * S for k, v in (("a", CUT_A), ("b", CUT_B))}
    ys_, xs_ = np.nonzero(gm)
    fv, la = flow[gm], lab_a[gm]
    px, py = xs_ - c[0], ys_ - c[1]
    fronts = []
    for key, sel_lab in (("a", la), ("b", ~la)):
        vx, vy = mid[key] - c
        side = (vx * py - vy * px) > 0
        for sd in (side, ~side):
            pts = []
            for k in range(128):
                sel = sel_lab & sd & (fv >= k / 128.0) & (fv < (k + 1) / 128.0)
                if sel.sum() < 4:
                    pts.append(None)
                    continue
                pts.append([round(float(xs_[sel].mean()) / W - 0.5, 5),
                            round(0.5 - float(ys_[sel].mean()) / W, 5)])
            # moc trong: lap lai diem hop le gan nhat (truoc het tien, roi lui)
            first = next(q for q in pts if q is not None)
            last = first
            for k in range(len(pts)):
                if pts[k] is None:
                    pts[k] = last
                last = pts[k]
            fronts.append(pts)
    (OUT / "mark-front.json").write_text(json.dumps(fronts))
    ts = ["// SINH TU scripts/make_mark_maps.py — dung sua tay.",
          "// BON mat dan dau cua men theo progress, don vi: ti le cua canh MARK_SIZE.",
          "export const FRONTS: [number, number][][] = ["]
    for pts in fronts:
        ts.append("  [" + ", ".join(f"[{x}, {y}]" for x, y in pts) + "],")
    ts.append("];")
    (OUT.parents[1] / "markFront.ts").write_text("\n".join(ts) + "\n")

    # --- xuat: flow 16-bit tach hai kenh R (byte cao) + B (byte thap) ---
    flow = np.where(groove > 0.05, flow, 1.0)
    q = np.round(np.clip(flow, 0, 1) * 65535).astype(np.uint32)
    rgb = np.zeros((W, W, 3), dtype=np.uint8)
    rgb[..., 0] = (q >> 8).astype(np.uint8)
    rgb[..., 1] = np.clip(groove * 255, 0, 255).astype(np.uint8)
    rgb[..., 2] = (q & 255).astype(np.uint8)
    Image.fromarray(rgb, "RGB").save(OUT / "mark-flow.png")

    h10, _ = np.histogram(flow[gm], bins=10, range=(0, 1))
    print("  phan phoi flow tren ranh:", " ".join(f"{c*100.0/gm.sum():.1f}" for c in h10))

    pub = OUT.parents[2] / "public" / "mark"
    pub.mkdir(parents=True, exist_ok=True)
    for f in ("mark-flow.png", "mark-normal.png"):
        (pub / f).write_bytes((OUT / f).read_bytes())

    print("da ghi:", OUT)
    print(f"  do phu mark {cov.mean()*100:.2f}%  |  ranh {groove.mean()*100:.2f}%")


if __name__ == "__main__":
    main()
