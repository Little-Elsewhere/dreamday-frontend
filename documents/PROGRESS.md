# Theo dõi tiến độ triển khai

> Cập nhật lần đầu: 2026-10-02  
> Phạm vi: 14 phần trong [`README.md`](README.md), từ `00` đến `13`.  
> Đây là trạng thái theo repository hiện tại; chỉ đánh dấu hoàn thành khi có thay đổi triển khai và bằng chứng nghiệm thu tương ứng.

## Tổng quan

| Nhóm                                 | Hoàn tất |              Tổng | Trạng thái                                |
| ------------------------------------ | -------: | ----------------: | ----------------------------------------- |
| Phân tích và tài liệu kế hoạch       |       14 |                14 | Hoàn tất bản nháp chi tiết                |
| Quyết định sản phẩm đã được xác nhận |        0 | 14 phần liên quan | Còn cần chốt các quyết định ghi ở phần 00 |
| Triển khai tính năng                 |        0 |                14 | Chưa bắt đầu                              |
| Nghiệm thu implementation            |        0 |                14 | Chưa bắt đầu                              |

Supabase Auth và các màn hình authenticate đã tồn tại trước kế hoạch này, nhưng không tính là phần triển khai của 14 hạng mục chuyến đi. Hiện chưa có migration, Prisma DAL hay feature trip được tạo theo kế hoạch; report thiết kế database là tài liệu, không phải bằng chứng schema đã triển khai.

## Trạng thái theo từng phần

Quy ước:

- **Kế hoạch — Hoàn tất:** file phân tích tương ứng đã được tạo.
- **Quyết định — Chờ xác nhận:** quyết định sản phẩm/kiến trúc có thể ảnh hưởng implementation vẫn cần được chốt.
- **Code — Chưa bắt đầu:** chưa có thay đổi source/migration cho hạng mục theo kế hoạch.
- **Nghiệm thu — Chưa chạy:** chưa có test hoặc xác minh runtime cho implementation.

|   # | Phần                                    | Tài liệu                                                                         | Kế hoạch | Quyết định                                          | Code         | Nghiệm thu |
| --: | --------------------------------------- | -------------------------------------------------------------------------------- | -------- | --------------------------------------------------- | ------------ | ---------- |
|  00 | Chốt quyết định sản phẩm và baseline    | [00-product-decisions-and-baseline.md](00-product-decisions-and-baseline.md)     | Hoàn tất | Chờ xác nhận các default/phạm vi                    | Chưa bắt đầu | Chưa chạy  |
|  01 | Schema SQL, migrations và bảo mật       | [01-database-schema-and-security.md](01-database-schema-and-security.md)         | Hoàn tất | Phụ thuộc phần 00 và xác minh remote schema         | Chưa bắt đầu | Chưa chạy  |
|  02 | Next.js, Prisma và data access layer    | [02-nextjs-prisma-data-layer.md](02-nextjs-prisma-data-layer.md)                 | Hoàn tất | Cần chốt Prisma version, pooler và credential       | Chưa bắt đầu | Chưa chạy  |
|  03 | Tạo và chỉnh sửa chuyến đi              | [03-trip-creation-and-editing.md](03-trip-creation-and-editing.md)               | Hoàn tất | Draft, date range và quyền cần chốt                 | Chưa bắt đầu | Chưa chạy  |
|  04 | Thành viên, vai trò và lời mời          | [04-members-and-invitations.md](04-members-and-invitations.md)                   | Hoàn tất | Role matrix, email delivery và accept flow cần chốt | Chưa bắt đầu | Chưa chạy  |
|  05 | Danh sách chuyến và trang chi tiết      | [05-trip-list-and-detail.md](05-trip-list-and-detail.md)                         | Hoàn tất | Bộ lọc/status hiển thị cần chốt                     | Chưa bắt đầu | Chưa chạy  |
|  06 | Lịch trình và schedule items            | [06-itinerary-and-scheduling.md](06-itinerary-and-scheduling.md)                 | Hoàn tất | Quyền member và timezone override cần chốt          | Chưa bắt đầu | Chưa chạy  |
|  07 | Checklist và TODO                       | [07-checklists-and-todos.md](07-checklists-and-todos.md)                         | Hoàn tất | Quyền assignee/member và due date cần chốt          | Chưa bắt đầu | Chưa chạy  |
|  08 | Quỹ nhóm, khoản chi và chia tiền        | [08-group-fund-and-expenses.md](08-group-fund-and-expenses.md)                   | Hoàn tất | Xác nhận ledger-only, currency và quyền sửa chi     | Chưa bắt đầu | Chưa chạy  |
|  09 | Ảnh bìa private trên Supabase Storage   | [09-private-cover-storage.md](09-private-cover-storage.md)                       | Hoàn tất | Giới hạn file, upload flow và retention cần chốt    | Chưa bắt đầu | Chưa chạy  |
|  10 | Ghi chú, chat và realtime               | [10-notes-chat-and-realtime.md](10-notes-chat-and-realtime.md)                   | Hoàn tất | Chat/realtime đang ngoài MVP mặc định               | Chưa bắt đầu | Chưa chạy  |
|  11 | Upcoming feed và nhắc việc              | [11-upcoming-feed-and-reminders.md](11-upcoming-feed-and-reminders.md)           | Hoàn tất | Horizon/feed scope; reminder ngoài MVP mặc định     | Chưa bắt đầu | Chưa chạy  |
|  12 | Import dữ liệu prototype localStorage   | [12-legacy-localstorage-import.md](12-legacy-localstorage-import.md)             | Hoàn tất | Tùy chọn; cần xác nhận có dữ liệu thật để giữ       | Chưa bắt đầu | Chưa chạy  |
|  13 | Tích hợp, release readiness và vận hành | [13-release-readiness-and-operations.md](13-release-readiness-and-operations.md) | Hoàn tất | Phụ thuộc scope MVP và quy trình môi trường         | Chưa bắt đầu | Chưa chạy  |

## Các việc tiếp theo

1. Chốt quyết định sản phẩm/kiến trúc còn mở trong [phần 00](00-product-decisions-and-baseline.md), đặc biệt role, draft, timezone và ý nghĩa quỹ.
2. Xác minh trạng thái Supabase remote/dev và chọn baseline an toàn nếu đã có schema hoặc dữ liệu.
3. Bắt đầu [phần 01](01-database-schema-and-security.md): tạo migration đầu tiên và kiểm tra grants/RLS trên local.
4. Sau đó triển khai [phần 02](02-nextjs-prisma-data-layer.md) trước khi bắt đầu các use case ghi dữ liệu.
5. Khi một phần được code, cập nhật cột Code/Nghiệm thu cùng link PR/commit, migration hoặc test evidence; không đánh dấu xong chỉ vì code đã viết.

## Quy tắc cập nhật trạng thái

- **Chưa bắt đầu:** chưa có implementation tương ứng.
- **Đang làm:** có PR/change cụ thể, nhưng chưa qua đầy đủ tiêu chí nghiệm thu.
- **Chờ phụ thuộc:** chưa thể bắt đầu vì quyết định hoặc phần trước chưa hoàn tất; ghi rõ phụ thuộc.
- **Hoàn tất:** code đã merge vào branch mục tiêu, migration được quản lý, checks phù hợp đạt và tiêu chí trong file phần việc được nghiệm thu.
- **Ngoài phạm vi:** chỉ dùng khi product xác nhận bỏ hạng mục; không dùng cho feature đang trì hoãn.

Khi cập nhật, ghi ngày, người cập nhật và bằng chứng (PR/commit, migration, test hoặc kiểm tra runtime). Nếu implementation phát sinh thay đổi nghiệp vụ/schema, cập nhật file phần tương ứng và `DATABASE_DESIGN_REPORT.md` cùng lúc.

## Lịch sử cập nhật

| Ngày       | Thay đổi                                                                                   |
| ---------- | ------------------------------------------------------------------------------------------ |
| 2026-10-02 | Tạo tracker ban đầu; 14/14 kế hoạch đã có file, 0/14 phần được triển khai hoặc nghiệm thu. |
