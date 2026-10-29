# Ngữ pháp cảnh — số đo thật

Mọi con số dưới đây đo từ video thật (GRVT, dashboard tím, Theo Network), không ước lượng.

## Hằng số chuyển động

| Việc | Giá trị | Nguồn |
|---|---|---|
| Số đếm lên | **1,5 giây**, ease-out gắt | đo 2 clip độc lập, cùng ra 1,5s |
| Đường cong số liệu | `Easing.bezier(0.45, 0.5, 0.0, 0.8)` | khớp ngược, RMS 0,012 |
| Đường cong chữ | `Easing.bezier(0.16, 1, 0.3, 1)` | token `--ease-out` của brand |
| So le giữa cột bar | **150ms** | đo 2 lần, cùng ra 150,0 |
| Cột bar mọc | **350ms** | đo |
| So le giữa khối chữ | **~900ms** | đo |
| Tường logo cuộn | **164 px/giây**, cột ngược chiều xen kẽ | đo |
| Khoảng cách cột tường | 156px, tile 128px | đo |
| Giữ hình sau khi động xong | tối thiểu **1,2 giây** | chuẩn nghề |
| Mặt nạ mờ đầu/cuối tường | 13% chiều cao | đo |

**Chữ và số dùng hai đường cong khác nhau.** Token `--ease-out` của brand vọt lên
49% chỉ trong 10% thời gian đầu — đúng cho nút bấm, sai cho dữ liệu (người xem không
kịp thấy cột lớn dần). Sai lệch RMS 0,21 so với đường cong đo được.

## Khung kể chuyện

### A. Tường + tuyên bố (đã dựng: haUSDC)
Chữ trái, tường logo cuộn phải, một cảnh duy nhất, không cắt cảnh.

| Giây | Việc |
|---|---|
| 0,0 | tường **đã đang cuộn** — đừng cho nó chạy vào |
| 0,4 | logo Harmonix |
| 1,3 | tên sản phẩm (hoặc dòng nhấn) |
| 1,6 | câu claim |
| 2,3 | mô tả |
| 3,5–5,0 | số đếm |
| 5,5 | nguồn + ngày |
| 7,0 | hàng logo đối tác |
| 7,5→hết | giữ hình, tường vẫn trôi |

Dùng khi: khoe bề rộng, ra mắt vault/token, cập nhật lợi suất.

### B. So với benchmark (đã dựng: AprBars v5)
Trục hiện 200ms → **cột benchmark mọc trước** → cột Harmonix vượt qua → callout chênh lệch.
Thứ tự mọc chính là chỗ kể chuyện: khoảng cách trở thành cú chốt chứ không có sẵn từ đầu.

### C. Tăng theo thời gian (chưa dựng)
Hai đường vẽ **cùng lúc, cùng đồng hồ** — vì thứ cần cảm là chúng tách nhau ra.
Vẽ lần lượt là mất hết ý nghĩa. Vùng tô bám sau nét ~100ms.

### D. Xếp hạng (chưa dựng)
Tiết lộ **từ thấp lên cao** để đỉnh rơi vào cuối. So le 80ms.

## Luật chart

| Chart | Làm | Tránh |
|---|---|---|
| Bar dọc | mọc từ trục lên, so le 60–80ms | fade cả cụm, mọc từ giữa |
| Bar ngang | kéo từ trái | kéo từ phải |
| Line | vẽ trái→phải, chấm ở đầu bút | vẽ ngược, vẽ nhanh dưới 1s |
| Vùng tô | bám sau nét, cùng đồng hồ | tô hiện trước đường |
| Donut | quét từ 12h, thuận kim đồng hồ | xoay cả bánh |
| Số KPI | đếm lên, `tabular-nums` | để chữ số nhảy layout |
| Lưới chấm | điền theo hàng, so le 20–30ms | điền ngẫu nhiên |

## Định dạng xuất

| Khổ | Kích thước | Dùng cho |
|---|---|---|
| 16:9 | 1920×1080 | mặc định |
| 4:5 | 1080×1350 | chiếm nhiều feed nhất trên mobile |
| 9:16 | 1080×1920 | story |

Luôn `yuv420p` + `color_range=tv` + `bt709`. Im lặng nhưng **có track AAC rỗng**.
Thời lượng cho X: 12–14 giây. Đừng theo 30 giây của clip tham khảo — 22 giây
đứng yên là quá dài.

## Cỡ chữ ở khổ feed

Video trên feed X rộng khoảng 350px, tức tỷ lệ 0,32.

| Vai trò | Cỡ ở 1080p | Ở feed | Đọc được? |
|---|---|---|---|
| Số chốt | 148px | 48px | rất rõ |
| Tiêu đề | 56–64px | 18–21px | rõ |
| Mô tả | 29–30px | 9–10px | vừa đủ |
| Dòng nguồn | 25px | 8px | chỉ cho người bấm vào xem |

Chấp nhận được: tiêu đề và con số gánh phần móc người xem, phần còn lại dành cho
người dừng lại. Nhưng **đừng đặt thông tin bắt buộc** ở cỡ dưới 25px.
