# Phần 0 — Chốt quyết định sản phẩm và baseline

## Mục tiêu

Khóa các quyết định ảnh hưởng schema và phân quyền trước migration đầu tiên. Việc này tránh sửa dữ liệu đã phát sinh khi đổi ý nghĩa của “quỹ”, role thành viên, timezone hoặc vòng đời trip.

## Baseline hiện tại

- Next.js App Router đang dùng Next `16.3.7`, `cacheComponents: true`; Supabase Auth SSR đã tích hợp.
- Luồng auth hiện xác thực server-side bằng `getClaims()`. Phần trip phải tận dụng flow này, không tạo hệ thống mật khẩu/session khác.
- Repo chưa có Prisma trong dependency và chưa có migration/schema nghiệp vụ Supabase; `supabase/seed.sql` chỉ là placeholder.
- Prototype trong `design/` dùng localStorage `dream-day:v2`; ảnh có thể là data URL, thành viên mẫu có thể là `self`, và trạng thái trip được viết sẵn.
- UI đã có list/create/detail, calendar, members, fund/expenses, note/chat. Checklist TODO được yêu cầu nhưng chưa thấy trong prototype.

Trước khi coding cần kiểm tra lại trên branch thực tế vì dependency, remote schema và flow auth có thể đã thay đổi.

## Quyết định cần chốt

| Quyết định   | Mặc định đề xuất                                                                | Tác động nếu đổi                                                          |
| ------------ | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Ý nghĩa quỹ  | Ledger khoản chi và phần chia; không xử lý tiền thật                            | Theo dõi tiền góp cần bảng contribution, quy tắc hoàn tiền và audit riêng |
| Currency MVP | Một currency mỗi trip, mặc định VND                                             | Đa tiền tệ cần exponent, FX snapshot và không cộng tổng khác currency     |
| Role         | Owner/editor/member/viewer                                                      | Custom permissions làm tăng độ phức tạp query/policy                      |
| Quyền member | Thêm/hoàn tất TODO và ghi expense; không đổi metadata hoặc mời người            | Member sửa mọi thứ cần audit và xử lý xung đột đồng thời                  |
| Lời mời      | Email normalized, token hash dùng một lần, có expiry; membership tạo sau accept | Email delivery cần provider, template, rate limit và chống enumeration    |
| Timezone     | Một IANA timezone trên trip; schedule lưu UTC                                   | Chuyến nhiều múi giờ có thể cần override từng schedule item               |
| Trùng lịch   | Cho phép như prototype                                                          | Nếu cần cảnh báo, cảnh báo trên UI nhưng không chặn DB                    |
| Reminder     | Chưa gửi tự động trong MVP                                                      | Push/email cần scheduler, delivery state, retry và idempotency            |
| Chat         | Chưa cần realtime MVP; note/CRUD theo nhu cầu                                   | Realtime cần authorization, publication và vận hành kết nối               |
| Draft        | Trip draft chỉ người tạo/chủ thấy; nhiều trường có thể trống                    | Bỏ draft giúp đơn giản validation nhưng đổi create flow                   |
| Xóa trip     | Archive trước; hard delete cần owner/admin và xác nhận                          | Soft delete ảnh hưởng query, retention và dọn Storage                     |

Ghi quyết định cuối trong PR hoặc cập nhật file này trước migration. Mặc định chỉ áp dụng cho phần chưa được product owner định nghĩa.

## Kiểm tra môi trường và schema trước khi bắt đầu

1. Ghi nhận branch, `git status`, lockfile và phiên bản Node/pnpm; giữ mọi diff ngoài phạm vi.
2. Kiểm tra `package.json`, Supabase CLI local, `supabase/config.toml`, migration/schema dirs và tên biến môi trường mà không in giá trị secret.
3. Kiểm tra project ref remote bằng thao tác read-only; xác định bảng, migrations và dữ liệu đã có.
4. Nếu remote có schema chưa nằm trong repo, tạo baseline migration phù hợp trước khi phát triển; không reset hoặc `db push` remote tùy tiện.
5. Xác nhận UUID `auth.users.id` là khóa cho `profiles` và membership; không sao chép password hay dùng email làm khóa danh tính.
6. Ghi rõ cách dev nạp environment (Doppler hay `.env.local`) và bảo đảm local/CI không trỏ production.

## Kiến trúc dùng làm mặc định

- Supabase Postgres giữ dữ liệu nghiệp vụ; Supabase Auth giữ danh tính.
- SQL migration do Supabase CLI quản lý. Prisma Client là lớp query server-only, không chạy Prisma Migrate song song.
- `src/features/trips/` là ranh giới domain dự kiến: route/page đọc query DTO, action gọi service, service gọi DAL.
- Mutation qua Server Action: Zod validation, xác thực `getClaims()`, actor lấy từ session, quyền kiểm tra trong service.
- Prisma credential là secret server-side. Prisma không tự mang user JWT/cookie sang Postgres; RLS không đủ để phân quyền Prisma query.

## Câu hỏi nghiệp vụ cần được trả lời trong review

- Quyền role cho metadata, schedule, TODO, expense, invite và remove member.
- Chỉnh sửa expense cũ khi payer/participant đã bị remove: đề xuất giữ audit, giới hạn chỉnh sửa cho owner/editor.
- Date range có thể bỏ trống ở draft không; schedule được nằm ngoài khoảng trip không.
- Nếu đổi ngày trip khi đã có schedule/deadline, có cảnh báo hoặc cho phép nằm ngoài khoảng không. Đề xuất cảnh báo trước và không âm thầm sửa timestamp.
- Có cần soft delete/restore trip, task, expense; actor nào được làm và audit giữ bao lâu.

## Tiêu chí hoàn tất

- Mọi quyết định trong bảng được chốt hoặc default được chấp thuận.
- Local/dev và trạng thái remote được xác định mà không lộ secret.
- Có baseline nếu remote không trống.
- MVP tách rõ khỏi email delivery, realtime, reminders và localStorage import.
- Có đủ thông tin để viết migration mà không đoán ngữ nghĩa.
