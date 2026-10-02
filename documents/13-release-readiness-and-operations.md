# Phần 13 — Tích hợp, release readiness và vận hành

## Mục tiêu

Xác nhận các domain được tích hợp thành một luồng an toàn, có thể khôi phục và phát hành theo pipeline hiện tại. Hoàn tất phần này sau khi scope MVP và các phase được chốt; không coi build thành công là bằng chứng phân quyền đúng.

## Checklist dữ liệu và migration

- [ ] Migration replay thành công trên local database sạch theo đúng thứ tự.
- [ ] Remote/dev schema được so sánh với source control trước apply; xác nhận đúng project ref.
- [ ] Có backup/restore hoặc phương án phục hồi được kiểm chứng trước migration phá dữ liệu.
- [ ] Migrations idempotency/transaction behavior và lock được hiểu; không sửa migration đã deploy nếu cần forward fix.
- [ ] Seed chỉ chứa fixture; remote không nhận seed demo.
- [ ] Prisma schema/client đồng bộ SQL; không có Prisma Migrate vô tình chạy.
- [ ] Index query chính được xem xét bằng `EXPLAIN`; bảng/list có pagination.

## Checklist authorization và privacy

- [ ] Mỗi Server Action xác thực session và Zod input, kiểm tra actor/role server-side.
- [ ] User A không thể đọc/sửa trip B bằng cách sửa URL, form ID hay action payload.
- [ ] Viewer không mutate; member/editor không vượt role; invitation pending chưa cấp quyền.
- [ ] Remove member vô hiệu hóa query/action tiếp theo; signed URL TTL phù hợp.
- [ ] RLS bật và grants explicit trên exposed schema; policy test riêng với grants.
- [ ] Prisma/server credential, service-role key, database URL không xuất hiện trong client chunk, HTML, DTO, logs hay error response.
- [ ] Email/token, note/chat, expense payload được giảm thiểu trong telemetry.
- [ ] Chỉ collect profile/member PII cần thiết; có chính sách xóa/export theo yêu cầu pháp lý/product.

## Checklist domain/data integrity

- [ ] Create trip/owner/checklist/fund atomic.
- [ ] Date-only và instant không bị chuyển sai; timezone IANA hợp lệ; DST edge cases được kiểm tra.
- [ ] Schedule end > start; trùng giờ được hỗ trợ.
- [ ] Task actor/assignee cùng trip; completion actor/time nhất quán.
- [ ] Expense và splits atomic, remainder deterministic, sum balances bằng zero.
- [ ] Cover upload/update/cleanup có compensation; object không public.
- [ ] Upcoming feed giới hạn horizon và lọc actor membership; cache không cross-user.
- [ ] Import prototype là tùy chọn, preview + idempotent nếu được bật.

## Checklist Next.js/UI/accessibility

- [ ] Đã đọc guide của đúng phiên bản Next trong `node_modules/next/dist/docs/` cho Server Actions, auth, DAL và Cache Components.
- [ ] Cookie/auth-dependent reads nằm dưới boundary/Suspense phù hợp; không cache private data trong shared cache.
- [ ] Initial data tải ở Server Component; client component chỉ giữ interactivity cần thiết.
- [ ] Loading/empty/error/not-found states đầy đủ; error generic, không leak SQL/stack.
- [ ] Mọi user-facing string đã thêm vào namespace next-intl cho các locale hỗ trợ.
- [ ] Keyboard, focus management, aria labels, contrast và status text/icon được rà soát.
- [ ] Responsive checks cho desktop/mobile theo design; ảnh dùng next/image nơi phù hợp.

## Kiểm thử bắt buộc khi bắt đầu implementation

Tài liệu này không thực thi test. Khi code được triển khai, chọn tests theo rủi ro:

1. Unit: Zod validation, status/date classification, timezone conversion, split allocation, DTO mapping.
2. Integration với Postgres local: FK/check/unique, transaction rollback, RLS/grants, DAL role matrix.
3. Auth flows: unauthenticated, owner/editor/member/viewer, non-member, pending invitation, removed member.
4. E2E critical journeys: sign in → create trip → invite/accept → add schedule/task/expense → verify list/detail/upcoming.
5. Storage: private read/write, invalid MIME/oversize, replacement/cleanup.
6. Runtime: route request-time rendering với Cache Components, session changes, retry/error states.
7. CI: format, lint, typecheck, build theo đúng scripts và Doppler config hiện hành.

Không chạy test/build/migration trong lúc chỉ lập kế hoạch; thực thi kiểm tra khi có code thay đổi và môi trường phù hợp.

## Rollout khuyến nghị

1. Tách PR nền tảng/migration khỏi feature UI nếu schema lớn; review SQL và authorization trước.
2. Áp dụng schema additive tại môi trường dev; deploy code tương thích schema cũ/mới theo expand-contract.
3. Seed/test data dev và kiểm tra các luồng quyền bằng tài khoản role khác nhau.
4. Bật feature theo route/flag nếu rollout incremental cần thiết; không bật import/realtime/reminder mặc định.
5. Quan sát latency/error rate, database pool saturation, query count và Storage failures; alerts không chứa PII.
6. Nếu lỗi sau deploy, ưu tiên disable feature/forward-fix; tránh rollback code nếu schema/data mới khiến rollback mất dữ liệu.
7. Áp dụng migrations vào production chỉ theo quy trình CI/CD/project approval hiện có sau review; kế hoạch này không cấp quyền áp dụng migration.

## Vận hành sau release

- Theo dõi kết nối pool Prisma và cấu hình pooler theo concurrency thực tế.
- Có retention cho invite expired/revoked, soft-deleted rows, abandoned uploads và import batch.
- Quy trình support: tìm trip/item qua opaque ID, audit actor/action, không cần đọc message/expense content.
- Định kỳ kiểm tra migration drift, grants/RLS drift, orphaned Storage objects và query chậm.
- Tài liệu hóa rotate credential và xử lý lộ token/secret; invite token revoke được mà không thay đổi identity.

## Tiêu chí hoàn tất

- Các checklist bảo mật, dữ liệu và release được owner/domain reviewers đánh dấu.
- CI green theo branch/pipeline rules hiện hành.
- Có runbook migration/restore và telemetry baseline.
- Scope được ghi rõ: MVP đã phát hành, feature phase sau chưa bật, rủi ro còn lại có owner.
