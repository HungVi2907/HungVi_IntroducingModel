# Transformer Visual Lab

Trang giới thiệu tương tác bằng tiếng Việt về Transformer Encoder–Decoder gốc trong *Attention Is All You Need* (2017).

Luồng chính kể câu chuyện qua các kết nối giữa token, nhiều attention head và một lượt Encoder–Decoder sinh câu. Không có sidebar bài học hay chương đánh số. Sơ đồ đầy đủ, công thức, heatmap, causal mask và chi phí n² nằm trong các mục chỉ mở khi người xem chọn. Cỡ chữ dùng hệ số `--text-scale: 1.15`.

Sáu ảnh tham khảo do người dùng chọn được đặt trong hai bộ chọn ảnh: ba góc nhìn tổng quan ở đầu hành trình, và ba hình cơ chế trong “Nhìn vào bên trong”. Mỗi ảnh có chú thích tiếng Việt, nút phóng lớn, điều khiển bàn phím và nguồn tác giả. Ảnh decoding mặc định là poster tĩnh; GIF chỉ tải/phát khi người xem chọn nút phát và được dừng khi đổi ảnh hoặc thu gọn phần chứa nó.

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

- `dist/index.html`: câu chuyện giới thiệu và các khu vực khám phá tùy chọn.
- `dist/story.css`: giao diện giới thiệu responsive, hỗ trợ reduced motion.
- `dist/illustrations.js`: bộ sơ đồ SVG vẽ riêng: token/vector, 8 head song song và 6+6 lớp Encoder–Decoder; có bố cục riêng cho màn hình nhỏ.
- `dist/assets/`: bản SVG và PNG xuất từ cùng mã vẽ, có thể dùng độc lập.
- `dist/reference-gallery.js` và `dist/reference-gallery.css`: bộ chọn ảnh tham khảo, điều khiển GIF và hộp phóng lớn.
- `dist/assets/jay-alammar/`: ảnh gốc của Jay Alammar, poster decoding và `sources.json` ghi nguồn/kích thước/giấy phép.
- `dist/styles.css`: kiểu dáng của các lab và sơ đồ chi tiết, được story.css sử dụng lại.
- `dist/app.js`: sơ đồ tương tác, đồng bộ token/head, luồng dịch có thể dừng/tiếp tục, lab Attention, Decoder và chi phí n².
- `dist/attention.js`: phép chiếu Q/K/V, scaled dot-product attention và causal mask.
- `server.mjs`: máy chủ xem trước bằng Node.js chuẩn.

Không có backend và không gửi dữ liệu học tập ra ngoài. Phông Be Vietnam Pro được tải từ Google Fonts, với font hệ thống dự phòng.

## Phạm vi mô phỏng

Lab dùng vector 4 chiều và d_k = 3 để dễ theo dõi. Ma trận chiếu được tạo xác định, không phải trọng số đã huấn luyện. Attention, heatmap và vector đầu ra đều được tính từ cùng ma trận. Xác suất và bản dịch ở phần Decoder được đặt sẵn để giải thích quá trình sinh token; causal mask là minh họa độc lập.

Sơ đồ bám cấu hình base gốc: 6 lớp Encoder, 6 lớp Decoder, 8 head, d_model = 512, d_ff = 2048, positional encoding sin/cos và Post-LN. Mỗi khung chỉ vẽ một lớp đại diện. Token trong ví dụ được tách theo từ để dễ đọc, không mô phỏng tokenizer subword của paper.

Nguồn: https://arxiv.org/abs/1706.03762

## Tham khảo hình ảnh

Tham khảo ngôn ngữ hình ảnh của [The Illustrated Transformer — Jay Alammar (2018)](https://jalammar.github.io/illustrated-transformer/): vector/ma trận thành ô màu, phân cấp mô hình và các luồng dữ liệu rõ ràng. Các sơ đồ SVG tương tác được vẽ riêng; ô màu là ký hiệu rút gọn, không biểu diễn giá trị đo hay toàn bộ kích thước tensor.

Sáu ảnh gốc trong bộ chọn ảnh thuộc Jay Alammar, được ghi nguồn theo [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/). Các ảnh PNG và GIF gốc được giữ nguyên; `decoding-poster.png` là khung số 40 trích từ GIF để chỉ phát chuyển động khi người xem yêu cầu. Chú thích tiếng Việt do trang bổ sung, không phải bản dịch chữ trực tiếp trong ảnh. Hình dùng hai lớp được đánh dấu là rút gọn; chú thích cũng nêu rõ causal mask của Decoder.

Xuất lại bộ ảnh SVG/PNG sau khi sửa `illustrations.js`:

```sh
npm run figures
```
