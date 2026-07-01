# Số hóa Di tích lịch sử Gò Ô Môi

Trang tham quan số hóa tương tác cho Di tích lịch sử Gò Ô Môi (phường Phú
Thuận, TP.HCM). Bản này được tái cấu trúc từ một file HTML gốc (thuần
HTML/CSS/JS nhúng, dữ liệu hard-code) thành một dự án Node.js + SQLite, giữ
nguyên giao diện và toàn bộ tương tác (kéo/zoom bản đồ, ghim thông tin, thư
viện ảnh, lightbox, đa ngôn ngữ Việt/Anh) của bản gốc.

## Cấu trúc dự án

```
├── public/                 # Frontend (được server phục vụ tĩnh)
│   ├── index.html
│   ├── css/style.css
│   ├── js/app.js           # Gọi API /api/site để lấy dữ liệu, dựng ghim/gallery động
│   ├── images/
│   │   ├── logos/           # Logo đơn vị (header)
│   │   ├── map/              # Ảnh mô hình/bản đồ di tích
│   │   └── gallery/          # Ảnh thư viện tham quan
│   └── audio/               # File thuyết minh (xem audio/README.md)
├── server/
│   ├── server.js           # Express app, phục vụ public/ + API
│   ├── db.js                # Truy vấn SQLite, gom dữ liệu cho frontend
│   ├── init-db.js           # Tạo schema + nạp dữ liệu gốc vào SQLite
│   └── routes/api.js       # GET /api/site
├── data/
│   └── ditich.db            # Database SQLite (tạo ra khi chạy init-db, không commit)
└── package.json
```

## Vì sao có database?

Bản gốc nhúng toàn bộ nội dung (tiêu đề, mô tả từng điểm di tích, danh sách
ảnh) trực tiếp trong code JavaScript của file HTML — muốn sửa nội dung phải
sửa code. Bản này chuyển dữ liệu đó vào SQLite (`data/ditich.db`) với 4 bảng:

- `points` — toạ độ và ảnh đại diện của từng điểm ghim trên bản đồ
- `point_translations` — tiêu đề/nội dung mỗi điểm, theo từng ngôn ngữ
- `site_translations` — các nhãn giao diện + nội dung tổng quan, theo ngôn ngữ
- `gallery_images` — danh sách ảnh trong thư viện tham quan

Frontend gọi một API duy nhất (`GET /api/site`) để lấy toàn bộ dữ liệu này,
sau đó dựng giao diện y hệt bản gốc.

## Cài đặt & chạy

Yêu cầu Node.js >= 22.5 (dùng module `node:sqlite` có sẵn, không cần cài
thêm driver database).

```bash
npm install        # cài Express
npm run init-db    # tạo & nạp dữ liệu cho data/ditich.db (an toàn để chạy lại)
npm start           # chạy server tại http://localhost:3000
```

Trong lúc phát triển có thể dùng `npm run dev` (tự khởi động lại khi sửa
code server).

## Cập nhật nội dung

Muốn sửa văn bản/toạ độ ghim/danh sách ảnh, sửa trực tiếp trong
`server/init-db.js` rồi chạy lại `npm run init-db`. Ảnh mới thêm vào thì bỏ
vào đúng thư mục phân loại trong `public/images/` (`logos`, `map`, hoặc
`gallery`) rồi khai báo đường dẫn tương ứng trong `init-db.js`.

## Ghi chú

- File âm thanh thuyết minh (`voice-vi.mp3`, `voice-en.mp3`) chưa có sẵn trong
  bộ tài liệu gốc — xem `public/audio/README.md`.
