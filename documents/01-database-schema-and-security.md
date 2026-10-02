# Phần 1 — Schema SQL, migrations và bảo mật dữ liệu

## Mục tiêu

Tạo nguồn sự thật có thể replay cho cấu trúc database, constraint và quyền truy cập. Các giai đoạn tính năng tiếp theo phải dựa trên migrations; không chỉnh schema production thủ công và không để Prisma schema trở thành nguồn migration thứ hai.

## Phạm vi schema

### Migration nền tảng

- `profiles`: `id` tham chiếu `auth.users.id`, `display_name`, avatar path, locale và timestamps.
- `trips`: UUID, creator, title, destination, description, date range, IANA timezone, pace, lifecycle status, cover object path, note, version, timestamps và archived time.
- `trip_memberships`: trip/user, role, active/removed status và joined/timestamps. Owner là một membership có role `owner`; không suy ra quyền chỉ từ `created_by_user_id`.
- Enum hoặc `CHECK` cho role/status/pace/category. Chọn enum khi tập giá trị ổn định; chọn `CHECK` nếu cần rollout linh hoạt. Đổi giá trị phải có migration.
- Composite uniqueness/FK để assignment, payer, split, author và completer luôn thuộc cùng trip.

### Migrations theo domain

- `trip_invitations` khi bắt đầu invitation flow.
- `trip_checklists`, `trip_tasks` cho TODO.
- `trip_schedule_items` cho lịch.
- `trip_funds`, `trip_expenses`, `trip_expense_splits` cho sổ chi.
- `trip_messages` chỉ khi chat thuộc MVP. Note đơn hiện có thể dùng `trips.note`.
- Reminder/delivery tables để giai đoạn sau; không tạo trước khi có yêu cầu gửi thật.

Tách migration để mỗi domain có SQL reviewable, thứ tự dependency rõ và có thể đánh giá tác động dữ liệu riêng.

## Constraint bắt buộc

- `end_date IS NULL OR start_date IS NULL OR end_date >= start_date`.
- Trip mới insert trip và owner membership trong cùng transaction; mỗi trip tối đa một owner.
- Chỉ một membership active theo `(trip_id, user_id)`; `user_id` null chỉ dành cho retention/audit sau khi user bị xóa.
- Invitation pending duy nhất theo `(trip_id, email_normalized)`; token hash unique, expiry bắt buộc, không lưu plaintext token.
- `schedule.ends_at > schedule.starts_at`; timestamps là `timestamptz`, IANA timezone dùng cho nhập/render.
- Task `done` phải nhất quán với completed actor/time theo constraint, trigger hoặc service transaction đã chọn.
- `expense.amount_minor > 0`; `share_minor >= 0`; expense có split và tổng split bằng amount.
- Tiền dùng `bigint`/Prisma `BigInt`; khi tạo DTO/JSON phải chuyển sang string hoặc safe integer có kiểm tra vì JSON không có BigInt native.
- Composite FK `(trip_id, membership_id)` cho mọi tham chiếu membership trong một trip.
- Mặc định archive trip; chỉ hard-delete khi retention/authorization đã cho phép.

## Index khởi điểm

- Membership `(user_id, status, trip_id)` cho trip list; `(trip_id, status, role)` cho query quyền.
- Invitation `token_hash` unique và partial unique email pending.
- Schedule `(trip_id, starts_at)` partial cho item chưa hủy/hoàn tất.
- Task `(trip_id, due_at)` partial cho open task có deadline.
- Expense `(trip_id, spent_at DESC)`; split `(trip_id, membership_id)`.
- Không index profile display name/cover path cho đến khi query thực tế cần.

Đo `EXPLAIN (ANALYZE, BUFFERS)` trên workload có dữ liệu đại diện rồi mới thêm index; index cũng có chi phí ghi và chiếm dung lượng.

## Grants, RLS và credential

1. Xác nhận `public` được expose qua Data API; bật RLS trên mọi bảng app trong schema exposed dù UI không dùng browser CRUD.
2. Viết rõ `REVOKE`/`GRANT` cho `anon`, `authenticated` và runtime roles. Không dựa vào default exposure của Supabase.
3. Trong kiến trúc hiện tại, không cấp CRUD business table qua Data API; Supabase browser client tiếp tục phục vụ Auth. Nếu muốn client CRUD về sau, thiết kế RLS theo user JWT và chuyển cả domain sang một đường ghi có chủ đích.
4. Policy dùng `TO authenticated`, `(select auth.uid())`; không dùng `user_metadata` làm role hay nguồn quyền.
5. Helper policy nếu cần phải nằm trong schema không expose, chỉ suy ra user từ `auth.uid()`, khóa `search_path`, không nhận `user_id` tùy ý và giới hạn `EXECUTE`.
6. Prisma runtime credential có thể bypass RLS. DAL/service phải luôn lọc membership, role và ownership; RLS là defense-in-depth cho Data API, không thay authorization của Prisma.
7. DDL/migration credential tách khỏi runtime credential. Secret chỉ ở server env; không vào `NEXT_PUBLIC_*`, action response hay logs.

## Dựng và kiểm tra migrations

- Tạo SQL migrations bằng Supabase CLI trong `supabase/migrations/`.
- Nếu dùng declarative `supabase/schemas/`, chọn rõ nguồn chuẩn và xác minh `db diff` tạo migration dễ review; không để hai nguồn lệch nhau.
- Khởi động Supabase local đúng version rồi replay/reset database local sạch.
- Seed chỉ chứa fixture dev an toàn, không có email/tài khoản hay dữ liệu giống production.
- Kiểm tra constraint với input hợp lệ và vi phạm; kiểm tra owner/editor/member/viewer/người ngoài/chưa accept invite.
- Test GRANT và RLS riêng: thiếu grant phải bị từ chối; có grant nhưng không thỏa policy không được thấy row.
- Tổng split được kiểm tra nguyên tử trong transaction/trigger/RPC có quyền phù hợp; không tin tổng client gửi.

## Rollout và khôi phục

- Review SQL trước mọi remote apply; migration phá dữ liệu cần backup và phương án forward-fix.
- Triển khai schema mở rộng trước code phụ thuộc schema; rename/drop đi theo expand-migrate-contract qua các release.
- Không chạy `supabase db reset`, `db push` hay lệnh xóa schema lên remote.
- Rollback phải tính đến data mới; ưu tiên migration sửa tiếp hơn down migration xóa data.

## Tiêu chí hoàn tất

- Clone sạch dựng được schema từ Supabase local workflow.
- FK/check/index/RLS/grants nằm trong migration có review.
- Có test quyền cho mọi role và user ngoài; viewer không thể ghi.
- Business table không có Prisma-write và browser-write song song.
- Không có credential, invite token hay PII trong seed/log.
