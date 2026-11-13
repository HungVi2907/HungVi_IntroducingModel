# Transformer Visual Lab

Trang frontend bằng tiếng Việt giải thích Transformer Encoder–Decoder gốc trong *Attention Is All You Need* (2017).

## Chạy tại máy

Cần Node.js 20 trở lên. Không cần cài dependencies.

```sh
npm run dev
```

Mở http://127.0.0.1:5173. Có thể đặt biến môi trường `PORT` để đổi cổng.

## Kiểm tra

```sh
npm test
```

Cài công cụ kiểm tra bằng `npm install` trước lần chạy test đầu tiên. Máy chủ xem trước không cần dependency. Các bài kiểm tra xác minh Softmax, tổng trọng số, phép tổng hợp V của cả 8 head, causal mask và toàn bộ thao tác trên DOM bằng jsdom. Kiểm tra DOM không thay thế kiểm tra giao diện bằng trình duyệt thật.

## Cấu trúc

- `dist/index.html`: nội dung và cấu trúc trang.
- `dist/styles.css`: giao diện responsive, hỗ trợ reduced motion.
- `dist/app.js`: sơ đồ SVG tương tác, lab Attention, Decoder và chi phí n².
- `dist/attention.js`: phép chiếu Q/K/V, scaled dot-product attention và causal mask.
- `server.mjs`: máy chủ xem trước bằng Node.js chuẩn.

Không có backend và không gửi dữ liệu học tập ra ngoài. Phông Be Vietnam Pro được tải từ Google Fonts, với font hệ thống dự phòng.

## Phạm vi mô phỏng

Lab dùng vector 4 chiều và d_k = 3 để dễ theo dõi. Ma trận chiếu được tạo xác định, không phải trọng số đã huấn luyện. Attention, heatmap và vector đầu ra đều được tính từ cùng ma trận. Xác suất và bản dịch ở phần Decoder được đặt sẵn để giải thích quá trình sinh token; causal mask là minh họa độc lập.

Sơ đồ bám cấu hình base gốc: 6 lớp Encoder, 6 lớp Decoder, 8 head, d_model = 512, d_ff = 2048, positional encoding sin/cos và Post-LN. Mỗi khung chỉ vẽ một lớp đại diện. Token trong ví dụ được tách theo từ để dễ đọc, không mô phỏng tokenizer subword của paper.

Nguồn: https://arxiv.org/abs/1706.03762
