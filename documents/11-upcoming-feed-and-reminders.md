# Phần 11 — Upcoming feed và nhắc việc

## Mục tiêu

Gom lịch trình sắp tới và TODO có deadline thành một feed/widget cho trang chính hoặc trip detail. Đây là read model tổng hợp, không phải bản sao dữ liệu cần ghi độc lập.

## Upcoming feed MVP

### Nguồn dữ liệu

- Schedule items có status `planned/booked`, `starts_at >= now()` và trip có membership active.
- Tasks status `open` có deadline trong khoảng truy vấn và trip có membership active; tùy product có thể chỉ lấy task assignee là user hoặc mọi task trong trip.
- Có thể thêm invitation expiry/reminder sau; không xem trip start date đơn thuần là “sự kiện” nếu chưa xác nhận UX.

### Query và DTO

- Tạo server query/service dùng DAL và actor đã xác thực; giới hạn khoảng thời gian, số row và trips được query.
- Nếu chạy hai query domain riêng, merge/sort ở server theo instant và deterministic tie-breaker. Nếu cần latency tốt hơn, đo trước khi dùng `UNION`/view.
- DTO tối thiểu: `id`, `tripId`, `tripTitle`, `kind` (schedule/task), `title`, `startsAt` hoặc `dueAt`, `timeZone`, `href`/route key.
- Không trả notes, expense details hay thông tin member không cần cho widget.
- Khóa cursor bằng `(instant, kind, id)` để phân trang ổn định khi cùng thời điểm.
- Default horizon (ví dụ 30 ngày) và số lượng phải được quyết định product; giới hạn server-side để query không tải vô tận.
- Format ngày theo timezone của từng item/trip; “hôm nay” trên trip khác timezone có thể khác ngày người dùng.

## Cache và cập nhật

- Dữ liệu phụ thuộc user membership; không đưa vào shared cache chung.
- Với Cache Components, đặt auth-dependent read trong request boundary nhỏ nhất phù hợp và Suspense fallback riêng.
- Khi thay schedule/task hoặc accept/remove membership, revalidate feed của actor; invite/removal cần invalidation để dữ liệu không còn hiển thị.
- “Now” là dữ liệu thời gian thay đổi liên tục; không cố cache ngày hiện tại dài hạn. Revalidate theo navigation/TTL ngắn đã kiểm tra với phiên bản Next hiện hành.
- Nếu dùng realtime sau này, vẫn refetch server-authorized DTO làm nguồn đúng.

## Reminder tự động — scope riêng, chưa phải MVP mặc định

Reminder khác upcoming feed: reminder tạo một side effect tại thời điểm tương lai. Trước khi làm cần chốt kênh (email/push/in-app), timezone semantics, lịch gửi, người nhận, unsubscribe, quiet hours, delivery status, retry và retention.

Mô hình tương lai có thể gồm:

- `trip_reminders`: trip, target task/schedule item, recipient user/membership, `remind_at`, status, created_by, timestamps.
- `notification_deliveries` hoặc outbox để idempotency, attempt count, provider message id, last error đã scrub.
- Unique key chống gửi trùng theo reminder/recipient/channel/occurrence.
- Worker/scheduler có lease/lock và retry backoff; không gửi email từ render hoặc Server Action đồng bộ.
- Khi item bị đổi/hủy, invalidate hoặc reschedule reminder trong transaction/outbox; xử lý timezone/DST.

Không lưu chỉ `sent_at` trên task nếu một task có nhiều recipient/kênh hoặc nhiều lần nhắc.

## Tiêu chí nghiệm thu

- Feed chỉ chứa item của trip actor active member.
- TODO feed lọc đúng status/due horizon; schedule sắp theo instant.
- Cursor không lặp/bỏ item khi nhiều item cùng giờ.
- Cache không rò dữ liệu giữa users; removal/accept phản ánh đúng sau revalidation.
- Reminder không được triển khai khi chưa xác định delivery contract; nếu bật thì có idempotency, retry và audit riêng.
