# Phần 10 — Ghi chú, chat và realtime

## Mục tiêu và phạm vi

Màn hình detail prototype có ghi chú và chat. Hai nhu cầu này khác nhau về retention, quyền sửa, thứ tự và realtime nên không nên gộp thành một cột JSON hoặc một bảng tùy tiện.

- **MVP tối thiểu:** sử dụng `trips.note` (giới hạn 1000 ký tự) nếu ghi chú là nội dung chung, đơn nhất cho cả trip.
- **Chat:** `trip_messages` chỉ triển khai khi sản phẩm xác nhận cần giao tiếp dạng nhiều tin nhắn.
- **Realtime:** là phase sau khi CRUD, quyền và revalidation ổn định; không cần để dữ liệu chat tồn tại.

## Note đơn

- `trips.note` giữ nội dung plain text, không render HTML tùy ý.
- Owner/editor sửa; member có quyền đọc; quyền member sửa phải được chốt.
- Lưu `updated_at` và `version`; conflict khi version cũ không ghi đè âm thầm.
- Autosave nếu UX yêu cầu phải debounce, báo trạng thái saving/saved/error và giữ input khi mất mạng; nếu không có yêu cầu, nút Save rõ ràng đơn giản hơn.
- Validate trim/length ở server, encode khi render theo React mặc định; không dùng `dangerouslySetInnerHTML`.

## Chat schema và quy tắc

Nếu chat được duyệt:

- `trip_messages`: `id`, `trip_id`, `author_membership_id`, `body varchar(1000)`, `created_at`, optional `edited_at`, optional `deleted_at`.
- Composite FK bảo đảm author thuộc cùng trip. Chỉ active member đọc/gửi; viewer có thể chỉ đọc tùy product matrix.
- Plain text trong MVP. Rich text/markdown cần allowlist renderer và XSS review.
- Message append-only về mặt audit: author được sửa/xóa tin của mình theo cửa sổ thời gian nếu product muốn; moderator xóa theo policy, không rewrite author.
- Soft delete hiển thị placeholder “tin nhắn đã xóa”; retention/privacy policy phải định nghĩa xóa tài khoản và hard-delete trip.
- Không lưu receipt/read cursor tới khi UI thực sự cần; nếu thêm cần bảng member cursor riêng thay cho update mọi message.
- Index `(trip_id, created_at DESC, id DESC)`; cursor pagination theo timestamp + id.
- Rate limit tin nhắn và giới hạn độ dài/tốc độ để chống spam.

## Đọc/ghi và UI trước realtime

- Server Component tải trang đầu/cursor messages qua DAL sau membership authorization.
- Send action Zod-validate nội dung, trim, xác nhận membership trong service; tạo message và revalidate detail.
- Client composer giữ local draft và pending/error state; không mất nội dung khi action fail.
- Polling là phương án tạm nếu cần gần realtime, có interval hợp lý, pause khi tab hidden, và không tạo request cho user không có quyền.
- Thiết kế loading/empty/older messages, auto-scroll chỉ khi người dùng đang gần đáy; không cướp focus/scroll khi đang đọc lịch sử.

## Realtime (phase sau)

- Chốt requirement latency và số lượng participant trước khi bật.
- Ưu tiên Supabase Broadcast cho khả năng scale nếu phù hợp; Postgres Changes có thể là bước đầu nhưng phải benchmark/load-test theo giới hạn hiện hành.
- Authorization channel dựa trên active membership, không dựa vào channel name bí mật.
- Realtime event chỉ báo dữ liệu mới/ID; khi cần đảm bảo nguồn chuẩn, client refetch row qua query được authorize.
- Xử lý reconnect, duplicate/out-of-order event, tab background và revoked membership; subscription phải cleanup khi unmount/trip đổi.
- Không broadcast body nhạy cảm tới audience rộng hơn membership hiện hành.

## Tiêu chí nghiệm thu

- Note không render HTML tùy ý; quyền và version conflict đúng.
- Nếu chat bật: người ngoài không đọc/gửi; pagination không lặp/mất message; message xóa giữ trạng thái audit.
- Rate limits và content limits chạy server-side.
- Realtime không bật trước khi authorization và reconnect semantics được kiểm tra; có fallback refetch.
- Có tests về XSS/plain text, permissions, cursor order, duplicate events và remove member.
