# Bóc tách clip tham khảo

## Quy trình

```bash
# 1. tải bản chất lượng cao nhất
yt-dlp -f "bv*[height<=1080]+ba/b" -o "$HM_CLIPS/%(id)s.%(ext)s" "<link>"

# 2. thông số
ffprobe -v error -show_entries format=duration -show_entries \
  stream=codec_name,codec_type,width,height,r_frame_rate,nb_frames -of default=nw=1 <file>

# 3. dò cắt cảnh (thử nhiều ngưỡng)
ffmpeg -i <file> -vf "select='gt(scene,0.25)',showinfo" -fps_mode passthrough -f null - 2>&1 \
  | grep -o 'pts_time:[0-9.]*'

# 4. trích frame Ở ĐÚNG MỐC
ffmpeg -ss <giây> -i <file> -frames:v 1 -vf "scale=560:-1" -q:v 2 f_<giây>.jpg
```

## Luật đo — quan trọng nhất

**Luôn tua `-ss` tới đúng mốc rồi trích từng frame. KHÔNG BAO GIỜ suy mốc thời gian
bằng phép nhân trên ảnh lưới ghép.** Cách đó đã cho kết quả sai một lần: đọc ra dãy
số đếm `4→29→69→80→85→87` trong khi thật ra là `1→58→83→88`, và kết luận sai luôn
cả loại đường cong.

Ghép ảnh lưới thì dùng để **nhìn tổng thể**, còn muốn con số thì tua từng mốc.

## Đo đường cong easing bằng số

Cắt một cột pixel dọc xuyên qua vật đang chuyển động, đọc kích thước theo từng frame:

```bash
# crop 8px rồi ép về 1 cột, xuất raw gray
ffmpeg -i <file> -t 0.9 -vf "crop=w=8:h=<H>:x=<X>:y=0,format=gray,scale=1:<H>:flags=area" \
  -f rawvideo -pix_fmt gray col.raw
```

Rồi với mỗi frame: đi từ chân cột lên tới khi gặp nền → ra chiều cao. Chuẩn hoá
theo giá trị cuối, khớp ngược ra `cubic-bezier` bằng dò lưới.

Cạm bẫy: đừng lấy "pixel sáng bất kỳ" làm mốc — nhãn chữ phía trên cột sẽ lọt vào
phép đo và làm sai tỷ lệ. Đi từ chân lên và dừng ở pixel tối đầu tiên.

## Chấm mỗi clip theo bảng cố định

thời lượng · fps · khổ · số cảnh · độ dài shot · loại cắt · cảm giác easing ·
`stagger_ms` · số có đếm không và bao lâu · **chiều cao chữ cái theo % khung** ·
camera · số màu nhấn · có trục/gridline không · có tiếng không ·
**đọc được ở 350px không** · học/tránh

Hai cột quyết định design system là `cap_height_%` và `stagger_ms` — thu bằng số,
không mô tả bằng chữ.

## Đã thấy qua 4 clip

- **Không clip nào dùng cắt cảnh cứng.** Máy dò trả về 0 cả bốn lần.
- **Mỗi clip đúng một màu nhấn.**
- Số đếm luôn ~1,5 giây, ease-out gắt.
- Giữ hình rất lâu là chấp nhận được **khi có một lớp nền chuyển động** gánh phần
  "video vẫn đang chạy".
