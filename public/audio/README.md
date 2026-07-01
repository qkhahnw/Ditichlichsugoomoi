# Thư mục âm thanh thuyết minh

Bản HTML gốc (trước khi tái cấu trúc) có trình phát audio nhưng trỏ tới các file
`voice-vi.mp3` / `voice-vietnamese.mp4` / `voice-english.mp4` **không tồn tại**
trong bộ tài liệu gốc — đây là lỗi có sẵn từ trước, không phải do quá trình
tái cấu trúc gây ra.

Trang mới đã chuẩn hoá lại đường dẫn (thống nhất đuôi `.mp3` cho cả hai ngôn
ngữ). Để tính năng thuyết minh hoạt động, hãy đặt 2 file sau vào đúng thư mục
này:

- `voice-vi.mp3` — thuyết minh tiếng Việt
- `voice-en.mp3` — thuyết minh tiếng Anh

Nếu chưa có file, trình phát vẫn hiển thị nhưng sẽ báo lỗi khi bấm play —
không ảnh hưởng tới các chức năng khác của trang.
