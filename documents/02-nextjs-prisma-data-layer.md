# Phần 2 — Next.js, Prisma và data access layer

## Mục tiêu

Thêm một ranh giới rõ ràng giữa UI, xác thực, quy tắc nghiệp vụ và Postgres. Không có component client nào được import Prisma hoặc credential; không có Server Action nào được xem là tin cậy chỉ vì nó được gọi từ UI nội bộ.

## Cấu trúc dự kiến

Tên và vị trí cuối cùng phải khớp patterns hiện tại trong `src/`; đề xuất:

```text
src/features/trips/
  actions/        # Server Actions nhỏ, nhận FormData/primitive, gọi service
  schemas/        # Zod schemas cho từng input; không để schema UI thành auth policy
  services/       # Use cases và transaction boundaries
  queries/        # Query cho RSC, trả DTO hẹp
  dal/            # Prisma queries có actor + permission predicate
  types/          # DTO, action result, domain unions
src/lib/prisma.ts # singleton client server-only
src/env/server.ts # DATABASE_URL/Prisma env được validate, server-only
```

Không cần tạo sẵn toàn bộ thư mục nếu feature chưa cần; giữ module nhỏ theo pattern repo.

## Cài đặt và cấu hình

1. Chốt và pin Prisma major phù hợp với Next 16/runtime đang dùng; cập nhật lockfile và scripts rõ ràng.
2. Thêm `server-only` vào Prisma client module; env server schema validate `DATABASE_URL` hoặc biến connection cụ thể.
3. Dùng Supabase pooler phù hợp cho runtime Next/serverless; migration/introspection dùng connection phù hợp session/direct. Không in URL trong logs hay lỗi trả về.
4. Prisma schema ánh xạ bảng SQL đã tạo (`@@map`, `@map`); không chạy Prisma Migrate nếu SQL migration là source of truth.
5. Sinh Prisma Client từ schema đồng bộ theo workflow local/CI; CI phải phát hiện schema drift mà không tự apply remote migration.
6. Xử lý Prisma `BigInt`, `Date`, enum và nullable fields trong DTO mapper; không serialize Prisma record trực tiếp cho client.

## Luồng xác thực và phân quyền chuẩn

```text
request -> đọc/verify claims bằng flow auth hiện có -> actor userId
        -> validate input Zod -> service -> DAL query có membership predicate
        -> transaction khi nhiều dòng -> map DTO/action result -> revalidate
```

- Lấy `userId` từ claim đã verify. Không nhận `userId`, role, `createdBy` hay `membershipId` làm actor tin cậy từ form.
- Mỗi service xác định quyền cần thiết cho use case; mọi query cập nhật/xóa chứa trip ID và predicate membership/role, hoặc kiểm tra quyền trong transaction trước mutation.
- Chống IDOR: truy cập ID trip/item không thuộc actor phải giống response `not found` hoặc forbidden chung theo conventions, không tiết lộ sự tồn tại ngoài quyền.
- Vì Prisma credential không mang user JWT và có thể bypass RLS, không viết DAL `findUnique({ id })` rồi update chỉ bằng ID.
- Mọi mutation nhiều bảng chạy trong transaction; side effects như email, Storage delete và Realtime publish chạy sau commit bằng job/outbox hoặc flow idempotent.

## Server Actions và DTO

- Action là entry point public có thể bị gọi trực tiếp; tự parse Zod, auth và gọi service.
- Form values phải được kiểm tra bằng `schema.parse(...)` ngay đầu Server Action, trước `try/catch`; dữ liệu không hợp lệ ném `ZodError` ngay, không chuyển thành Action result.
- Sau khi form values hợp lệ, trả discriminated union `{ success: true, data } | { success: false, error }` cho kết quả nghiệp vụ. Error code nội bộ có thể được map sang localized message ở UI; không trả SQL error/stack.
- Lỗi nhập liệu thông thường hiển thị cạnh field nhờ validation ở client. `ZodError` từ Server Action được chuyển cho caller hoặc cơ chế xử lý lỗi của framework; lỗi quyền/không tồn tại và lỗi xung đột được xử lý riêng.
- DTO chỉ chứa thông tin cần render. Không trả email toàn bộ thành viên, token invite, internal IDs không cần, Prisma relation thừa hay credential.
- Với số tiền bigint, serialize thành decimal string hoặc integer sau khi kiểm tra `Number.isSafeInteger`; quy định một format thống nhất trước khi UI dùng.
- Trả timestamp ISO UTC cho instant; kèm timezone trip để UI định dạng đúng. Date-only `start_date/end_date` không chuyển thành instant.

## Next.js rendering, cache và i18n

- Dùng Server Components cho dữ liệu ban đầu; client component chỉ giữ trạng thái interaction (form/calendar optimistic state).
- Bám theo `cacheComponents: true`: cookie/session read phải ở request-time boundary phù hợp, dùng Suspense nhỏ nhất có thể với fallback có cùng cấu trúc UI. Đọc hướng dẫn Next đã cài trong `node_modules/next/dist/docs/` trước khi code.
- Không cache response chứa trip riêng tư trong shared cache. Nếu dùng `use cache`, cache key không được làm lẫn danh tính; mặc định không cache DAL auth-dependent.
- Revalidate route/tag sau mutation; dùng key/tag theo trip và user nếu được framework hỗ trợ theo đúng hướng dẫn phiên bản đang cài. Không đưa raw user data vào global cache.
- Dùng `getTranslations()` trong Server Component và `useTranslations()` trong Client Component; date/number theo next-intl formatter.

## Đồng thời và lỗi

- Dùng `version` hoặc compare-and-swap cho chỉnh sửa metadata/item dễ ghi đè; nếu version không khớp, trả conflict và yêu cầu refresh/review.
- Unique/check/FK violation có thể phát sinh khi hai thao tác cạnh tranh; map mã lỗi DB đã biết sang kết quả domain an toàn.
- Unexpected errors log server-side với request/correlation id nhưng không log token, email, nội dung note/chat hoặc credential.
- Không nuốt lỗi bằng catch rỗng. Action không để raw error hoặc stack leak sang client.

## Tiêu chí hoàn tất

- `src/lib/prisma.ts` và env không thể import vào client bundle.
- Có helper/service auth thống nhất dựa trên `getClaims()` hiện hành.
- Mỗi query DAL private có test đảm bảo lọc bằng user membership và quyền.
- Action schemas/result types rõ; DTO không chứa record nhạy cảm.
- Local/CI có lệnh generate client; không có luồng Prisma Migrate song song với Supabase SQL migration.
- Các request phụ thuộc session hoạt động dưới Cache Components boundary theo hướng dẫn Next hiện tại.
