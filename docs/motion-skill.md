---
name: harmonix-motion
description: >-
  Render animated Harmonix-brand videos (MP4) for X — stat cards, logo walls,
  chart reveals, launch clips. USE when the user wants a motion video or asks to
  animate something: "make a video for haUSDC", "animate this chart",
  "làm video cho vault", "video chart", "làm clip giới thiệu", "dựng video 16:9".
  Also USE when the user drops a reference video link and wants it analysed.
  For a still PNG/SVG chart use the matplotlib pipeline in drafts/project-charts
  instead — this skill only produces motion.
---

# Harmonix Motion

Dựng video có thương hiệu Harmonix bằng Remotion. Skill này lo phần **chart, brand
và dữ liệu**; phần engine (timing, font, scene, render) do agent skill chính chủ
của Remotion lo — cài riêng, đừng viết lại.

Mọi con số chuyển động trong `reference/scene-grammar.md` đều **đo từ video thật**,
không phải ước lượng. Đừng thay bằng cảm tính.

## Install

```bash
# skill chính chủ của Remotion (12 skill: markup, timing, render, studio...)
npx skills add remotion-dev/skills
```

Dự án đã dựng sẵn trên Mac Mini. Đường dẫn theo máy nằm trong `harmonix-motion.conf`.

## Commands

```bash
# xem trước, sửa tới đâu thấy tới đó
cd "$HM_REMOTION" && npx remotion studio

# render MỘT ẢNH TĨNH để soi bố cục — luôn làm bước này trước
npx remotion still src/index.ts <CompId> "$HM_OUT/check.png" --frame=300

# render video
npx remotion render src/index.ts <CompId> "$HM_OUT/<ten>.mp4" --log=error

# kiểm định dạng đầu ra
ffprobe -v error -show_entries stream=width,height,pix_fmt,color_range -of default=nw=1 <file>.mp4

# bóc tách clip tham khảo
yt-dlp -f "bv*[height<=1080]+ba/b" -o "$HM_CLIPS/%(id)s.%(ext)s" "<link X>"
```

## Workflow

Khi user đưa một ý tưởng video:

1. **Hỏi cho đủ trước khi viết dòng code nào.** Ba thứ bắt buộc: (a) khổ hình và
   thời lượng, (b) con số nào lên màn hình và **lấy từ đâu**, (c) tài sản hình
   ảnh nào cần.

2. **Kiểm tài sản có thật không.** Đừng giả định. `ls` thư mục logo trước khi
   viết composition — đã từng mất công vì tưởng có logo cổ phiếu mà thực ra không có.
   Nếu thiếu: nói ngay, đề xuất phương án thay (chữ ticker, tải từ nguồn ngoài),
   đừng tự bịa asset.

3. **Soát lại nội dung, không chỉ chính tả.** Nếu câu chữ mô tả sai bản chất sản
   phẩm thì phải nói. Ví dụ đã gặp: "exposure to stocks" cho một vault
   delta-neutral — đọc thành đang long cổ phiếu, ngược hẳn sản phẩm.

4. **Chọn khung kể chuyện** trong `reference/scene-grammar.md`, đừng nghĩ nhịp mới.

5. **Viết composition.** Tuân thủ mục Constraints bên dưới.

6. **Render ảnh tĩnh rồi NHÌN nó.** Không được bỏ bước này. Lỗi đè chữ chỉ lộ ra
   khi nhìn, không lộ ra khi đọc code. Sửa xong render lại tới khi sạch.

7. **Render video**, kiểm bằng `ffprobe`, copy về `~/Downloads` cho user xem.

8. **Ghi lại** vào `drafts/project-motion/research/project-NN-<slug>.md`: quyết định
   nào đã lấy, con số nào đo được, lỗi nào vấp phải.

Khi user đưa link video tham khảo: xem `reference/teardown.md`.

## Skill anh em

- **`harmonix-mesh-bg`** — nen mesh gradient dong. Dung khi can nen cho video
  moi, hoac khi nen phang trong chan.
- **`harmonix-coin-3d`** — vat the 3D kim loai co khac logo (dong xu token).
  Kem script sinh bo ban do khac cho logo moi.

Bo do chat luong dung chung: `verify/verify.py` (motion / banding / contrast /
layout / ref). Can `~/.venv/motion/bin/python`.

## Constraints

- **Mọi giá trị là hàm thuần của số frame.** `useCurrentFrame()` + `interpolate()`.
  CSS `transition`/`animation` **không render đúng** trong Remotion.
- **Renderer không tự tính một con số nào.** Số đến từ script Python trong
  `project-charts`. Nếu user đọc số bằng miệng thì phải ghi kèm nguồn và ngày
  lên màn hình.
- **Không spring trên số liệu.** APR nảy vọt rồi tụt về là bịa số. Spring chỉ cho chip.
- **Cột chữ xếp theo dòng chảy flexbox, KHÔNG dùng toạ độ tuyệt đối cho từng khối.**
  Đây là lỗi đã vấp hai lần: thêm một dòng là đè lên khối dưới.
- **Token chuyển động trong `colors_and_type.css` vô dụng ở đây** — chúng dành cho
  CSS transition. Màu/font/khoảng cách thì dùng nguyên qua `var(--hmn-*)`.
- **Không copy token brand.** Import qua symlink `src/brand`.
- App mode: nền teal phẳng `#0F2122`, **không gradient** (luật brand, và gradient
  tối là chỗ `yuv420p` vỡ dải màu nặng nhất).
- Một màu nhấn duy nhất mỗi video. Vàng `--hmn-yellow` chỉ cho callout chính.
- **Cảnh 3D (Three.js) bắt buộc render `--scale=2` rồi hạ xuống bằng ffmpeg
  (`scale=...:flags=lanczos`).** Normal map và metalness map ở góc nghiêng gắt sẽ vỡ
  viền thành đường đứt quãng; không có cách lọc texture nào chữa được, chỉ siêu lấy
  mẫu mới xử lý. 360 frame 2K nhân đôi hết ~34 giây trên M4.

  Đo mức lợi (2026-09-10, cảnh thẻ kim loại): render cùng một frame ở 1×, 2×, 4×,
  lấy bản 4× hạ xuống làm chuẩn rồi đo RMSE.

  | Vùng | 1× so chuẩn | 2× so chuẩn | Giảm |
  |---|---|---|---|
  | chồng thẻ | 3.142 | 0.646 | 79% |
  | dải chữ nhỏ | 4.277 | 0.831 | 81% |
  | cạnh vát + viền | 3.427 | 0.707 | 79% |
  | cả khung | 7.120 | 3.432 | 52% |

  **Đừng lấy con số "cả khung" làm căn cứ.** Hạt khử banding trong shader sinh
  bằng hàm băm theo toạ độ pixel, nên hai độ phân giải cho ra hạt khác nhau hoàn
  toàn — phần lớn sai số toàn khung là hạt, không phải răng cưa. Chỉ đo trên vùng
  có chi tiết nhỏ mới ra con số thật.

  Siêu lấy mẫu cũng kéo banding chroma xuống (U 2.87 → 2.51), nhưng đó là lợi ích
  PHỤ và có cách rẻ hơn nhiều là tăng `noise=alls` trong `finish.sh`. Lý do chính
  vẫn là răng cưa trên chi tiết 4–9px đang chuyển động: nó hiện ra dạng nhấp nháy
  giữa các frame, không phải viền gãy trên ảnh tĩnh, nên soi ảnh tĩnh sẽ bỏ sót.
- **Chi tiết trong normal map phải rộng ít nhất 3–4 pixel TRÊN MÀN HÌNH** — tính
  ngược từ kích thước vật thể trong khung, không phải từ kích thước texture.
- **`--gl=angle` bắt buộc** cho mọi composition dùng Three.js.
- **ShaderMaterial: phải encode sRGB HAI lần.** Framebuffer của pipeline này giải
  mã sRGB một lần trên giá trị shader ghi ra (đo 2026-09-09: ô CSS `#173132` ra
  đúng `23,49,50`, còn shader ghi `encode(linear)` chỉ ra `2.2,7.8,8.1`). Không
  encode đủ hai lần thì nền lệch hẳn so với màu CSS của chữ. Cách kiểm: đặt một
  `<div>` CSS cùng mã màu cạnh canvas rồi so pixel — đừng suy luận suông.
- **Gradient tối phải cấp lại hạt SAU khi hạ scale.** Dither trong shader không
  sống nổi qua `lanczos` 2:1 (trung bình 4 pixel → giảm nửa biên độ) rồi x264
  (lượng tử hoá nốt). Đo 2026-09-09: đoạn phẳng 1.9px → 9.5px, banding nhìn rõ.
  Dùng `scripts/finish.sh` (`noise=alls=2:allf=t+u` + `-tune grain` + crf 14) —
  khôi phục về 1.8px. Tăng dither trong shader KHÔNG cứu được, vì thủ phạm chính
  là encoder chứ không phải phép thu nhỏ.
- **Banding trên nền màu: ĐO KÊNH MÀU, đừng chỉ đo độ sáng.** Nền teal bão hoà
  bị "phân tầng" mà mọi phép đo luma đều báo sạch. Đo 2026-09-10 (độ dài đoạn
  phẳng): Y 2.25px nhưng U 9.06px, V 8.80px — cả khung chỉ có 33 mức V.
  Hai nguyên nhân độc lập, phải sửa cả hai:
  1. *Trong shader*: dither cộng CÙNG một giá trị vào R,G,B chỉ phá được bậc
     thang độ sáng. Phải tách hai phần — độ sáng ~1.6 LSB, màu thuần tuý ~6 LSB
     (mắt kém nhạy với nhiễu màu, và chroma còn bị lấy mẫu 2:1 nữa).
  2. *Trong encode*: x264 lượng tử hoá chroma thô hơn luma. `chroma-qp-offset=-4`
     đưa U/V từ 3.09 về 1.85. **Đừng đi quá -4**: ở -8 thì chroma còn 1.78 nhưng
     luma hỏng lên 4.22 — cùng một ngân sách bit, kéo bên này thì hụt bên kia.
- **Mesh gradient = radial-gradient xếp chồng + ALPHA COMPOSITING**, không phải
  trung bình có trọng số. `mix(col, ci, ai)` từng lớp đè lên nhau, giữ nguyên màu
  ở lõi mỗi vùng. `sum(c·w)/sum(w)` luôn kéo về màu trung bình → ra một khối
  đồng nhất, và **chỉnh hình học không cứu được** (bán kính nhỏ → thấy đường
  tròn; bán kính lớn → ramp phẳng; không có giá trị nào ở giữa). Ba lần thử
  hỏng mới nhận ra là sai ở PHÉP TRỘN chứ không phải ở hình học.
  Kèm theo: 4–6 lớp, 3–5 màu **khác biệt rõ** (giống nhau thì trộn kiểu gì cũng
  ra một màu), vùng màu là **elip có xoay**, **không dùng fbm/domain warp** (đó
  chính là thứ biến nền thành làn khói), và vẽ **to-tối trước, sáng-nhỏ sau** —
  lớp tối giữ cột chữ phải vẽ sau cùng mới thắng.
- Nét trên nền sáng tối thiểu **3px** — dưới mức đó biến mất ở khổ feed.

## Notes

- Render 420 frame 1080p mất ~12 giây trên Mac Mini M4. Cứ render thoải mái.
- `assets/logos/HMN-Logo-white.svg` và `HMN-Logo-yellow.svg` **bị hỏng**: thiếu khối
  `<style>` nên render ra đen. Dùng `logos/harmonix/hmn-logo-text-v5.png` (ngang, vàng).
- Logo ticker trong `logos/tickers/` là nhãn hiệu bên thứ ba, tải tạm. Nhắc user
  rà lại trước khi post công khai.
- Clip tham khảo tải về nằm ngoài KB. Không đưa video vào repo.
