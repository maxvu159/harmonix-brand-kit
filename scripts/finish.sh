#!/bin/bash
# Buoc hoan thien: 5K raw -> 2K giao hang.
#
# 1) "noise": render ra dither ~0.6 LSB de pha banding, NHUNG lanczos 2:1 lay
#    trung binh 4 pixel (giam nua bien do) roi x264 luong tu hoa not. Do
#    2026-09-09: doan phang tu 1.9px vot len 9.5px = banding nhin thay ro.
#    Phai cap lai hat SAU khi thu nho. alls=2 la muc nho nhat con tac dung —
#    alls=1 lam tron thanh 0, khong khac gi khong co hat.
#
# 2) "chroma-qp-offset=-4": x264 luong tu hoa kenh MAU tho hon kenh SANG. Tren
#    nen teal bao hoa, do la thu gay cam giac "phan tang / video phan giai thap"
#    ma do bang kenh sang KHONG bao gio thay. Do 2026-09-10 (doan phang):
#      khong co offset : Y 2.06 | U 3.09 | V 2.99   <- van bi che
#      offset -4       : Y 2.11 | U 1.85 | V 1.84   <- dat
#      offset -8       : Y 4.22 | U 1.78 | V 1.79   <- chroma tot hon nhung
#                        LUMA hong, vi cung mot ngan sach bit. Dung di qua -4.
#
# 3) crf 14 chu khong phai 17: o crf cao hon, offset chroma an het bit cua luma.
#    File ra ~145 MB cho 14s. Khong can toi uu — X gioi han 512 MB va se
#    re-encode, nen dua cho no ban goc sach nhat co the.
set -euo pipefail
IN="${1:-out/pt-raw.mp4}"
OUT="${2:-out/PT-haHYPE-2k.mp4}"
ffmpeg -v error -y -i "$IN" \
  -vf "scale=2560:1440:flags=lanczos,format=yuv444p10le,noise=alls=2:allf=t+u,format=yuv420p" \
  -c:v libx264 -crf 14 -tune grain -preset slow \
  -x264-params chroma-qp-offset=-4 \
  -pix_fmt yuv420p -colorspace bt709 -color_primaries bt709 -color_trc bt709 \
  -movflags +faststart "$OUT"
echo "-> $OUT"
