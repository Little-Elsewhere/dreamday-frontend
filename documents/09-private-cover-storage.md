# Phần 9 — Ảnh bìa riêng tư trên Supabase Storage

## Mục tiêu

Thay data URL/Base64 trong prototype bằng object trong Storage. Database chỉ lưu object path (`trips.cover_object_path`); file không đi qua Postgres và không được public nếu trip là dữ liệu riêng tư.

## Bucket và đường dẫn

- Tạo bucket private riêng cho cover (và avatar nếu cần, với policy riêng); không bật public URL.
- Object key do server tạo từ trip UUID + random identifier, không lấy nguyên filename do người dùng gửi; extension/MIME được allowlist.
- Path nên chứa trip ID để policy xác minh membership, ví dụ `trips/{tripId}/covers/{objectId}.{ext}`; không nhúng email/token/user secret.
- Lưu key trong DB, không lưu signed URL vì URL có TTL và là bearer credential.
- Cấu hình giới hạn bytes, content type, image dimensions/pixel count và xử lý SVG/metadata theo chính sách. Nên ưu tiên JPEG/PNG/WebP đã decode/validate; tránh tin MIME header của client.

## Luồng upload an toàn

1. Client chọn file; UI hiển thị preview local tạm thời, giới hạn kích thước để UX nhưng không xem đó là bảo mật.
2. Server xác thực user và quyền owner/editor với trip; tạo object path không thể đoán.
3. Dùng signed upload URL ngắn hạn hoặc upload qua server tùy kích thước/runtime; signed URL chỉ cấp sau authorization và giới hạn object path.
4. Validate file thật (magic bytes/decode), MIME, kích thước và dimension ở server hoặc pipeline tin cậy trước khi gắn cover.
5. Upload vào object mới trước; sau khi thành công, update DB cover path bằng transaction/conditional version. Nếu DB update fail, dọn object mới theo compensation.
6. Sau commit, xóa object cũ async/idempotent; không xóa cũ trước khi path mới commit.
7. Response chỉ trả object path hoặc signed read URL ngắn hạn cần thiết; không lưu URL token trong telemetry.

## Access control

- Bucket private; Storage policy kiểm tra `bucket_id` và trip ID trong `name` path, rồi xác thực active membership/role.
- Prisma server upload/service credential cần giới hạn; nếu dùng service-role key thì chỉ trong server-only module và app vẫn phải authorize trước mọi thao tác, vì key bypass RLS.
- Read access chỉ cấp signed URL sau khi DAL xác minh membership; cache signed URL theo TTL ngắn, không shared cache giữa user.
- Remove member không thể thu hồi signed URL đã phát ngay lập tức; TTL cần ngắn theo threat model.
- File public marketing assets tiếp tục ở static assets, không dùng bucket private cho nội dung thực sự public.

## Xóa và orphan cleanup

- Khi thay cover, update path và dọn object cũ sau commit.
- Khi archive trip, giữ cover. Khi hard-delete trip được duyệt, xóa DB theo policy rồi queue Storage cleanup; không giả định FK xóa object tự động.
- Có job/quy trình tìm object không còn tham chiếu và xóa sau grace period; tránh xóa nhầm file do transaction fail hoặc upload dang dở.
- Đặt lifecycle retention cho abandoned multipart/temp upload nếu Supabase hỗ trợ ở cấu hình được chọn.

## UI và accessibility

- Dùng `next/image` với URL được cấp từ server và cấu hình image remote đúng host; không expose URL service key.
- Hiển thị preview, upload progress/pending, lỗi retry và cover fallback; form metadata không bị mất khi upload lỗi.
- Alt text theo mục đích ảnh; nếu ảnh chỉ trang trí, alt rỗng; người dùng có thể xóa/thay ảnh bằng keyboard.
- Locale hóa kích thước/loại file được phép và lỗi upload.

## Tiêu chí nghiệm thu

- Non-member không đọc object qua Storage API; bucket không public.
- Upload object không thể ghi vào trip khác hoặc path do client tùy ý chọn.
- MIME giả, file quá lớn, file decode lỗi và content không allowlist bị từ chối.
- Fail sau upload không để DB tham chiếu file thiếu; fail sau commit không xóa cover mới.
- DB lưu path, không data URL/signed URL; có xử lý orphan/cleanup và tests policy.
