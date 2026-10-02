# Phần 12 — Import dữ liệu prototype localStorage (tùy chọn)

## Quyết định phạm vi

Prototype trong `design/assets/trip-store.js` lưu dữ liệu dưới `dream-day:v2` và có thể bao gồm data URL, ID local, thành viên mẫu `self`, danh sách schedules/expenses/messages. Không import ngầm khi người dùng mở app mới. Chỉ làm phần này nếu có dữ liệu người dùng cần giữ lại; nếu prototype chỉ chứa dữ liệu demo, bỏ qua phase này.

## Rủi ro dữ liệu

- localStorage có thể cũ, bị sửa tay, thiếu field hoặc có schema version khác.
- `local-*` không phải UUID và không thể dùng làm FK.
- `self` không đảm bảo xác định được user đã đăng nhập.
- Data URL có thể lớn, MIME giả, file lỗi, hoặc chứa payload nhạy cảm.
- Expense participant IDs có thể tham chiếu member không còn tồn tại; tổng split chưa chắc bằng amount.
- Schedules có local date/time nhưng không lưu timezone; không thể khôi tra chính xác timezone gốc nếu prototype không ghi lại.
- Messages/members mẫu có thể không có danh tính thật và không được biến thành tài khoản thật.

## Luồng import an toàn

1. Versioned parser đọc key ở browser; không gửi toàn bộ raw blob cho server ngay.
2. Client tạo preview và đếm trip/schedule/expense/ảnh; user chọn rõ trip muốn import.
3. Chuyển payload qua server action/route có giới hạn bytes; xác thực session và rate limit. Không nhận `userId`, membership hay quyền từ localStorage.
4. Zod discriminated schema theo version; reject unknown/oversized fields, normalize strings, validate ngày/giờ/số tiền và giới hạn số item.
5. Map một local trip thành UUID mới; map item IDs bằng dictionary trong transaction. Chỉ map `self` về actor hiện tại; các member giả phải được bỏ hoặc chuyển thành placeholder sau khi user chọn.
6. Lời mời/email từ localStorage không được tự tạo invitation hoặc membership. Cần flow invite riêng và xác nhận thật.
7. Convert local date/time dùng timezone người dùng chọn trong preview; nếu thiếu timezone, yêu cầu lựa chọn rõ hoặc import schedule thành draft không có instant.
8. Expense chỉ import nếu xác định payer/splits thuộc user/member hợp lệ; server recompute split và hiển thị phần nào cần sửa trước khi commit.
9. Ảnh data URL decode/validate rồi upload Storage qua luồng cover an toàn; giới hạn kích thước. Không lưu data URL vào database.
10. Ghi import job/idempotency key liên kết actor + source hash; retry cùng payload không nhân đôi trip.
11. Commit trip, owner membership và imported children trong transaction theo batch phù hợp; nếu file upload ngoài transaction, dùng staging/compensation cleanup.
12. Sau thành công, chỉ xóa localStorage key sau xác nhận server commit; có thể cho tải export backup trước khi xóa.

## Import modes và observability

- Preview/dry-run chỉ trả validation issues và count, không tạo DB rows.
- Commit action trả import ID, counts, warnings; không trả raw payload.
- Warnings phải nêu mục bị bỏ (ví dụ mock member/message) và timezone giả định.
- Logs ghi actor/import ID/count/error category, không ghi email, token, nội dung note/chat hoặc ảnh base64.
- Hỗ trợ hủy/retry; rollback import bằng soft-delete group hoặc import batch marker nếu đã ghi dữ liệu.

## Tiêu chí quyết định bỏ qua

Nếu không có người dùng đã lưu dữ liệu thật hoặc prototype chỉ có fixture/demo, đánh dấu phase “not in MVP”, không thêm parser/import path làm tăng attack surface và maintenance.

## Tiêu chí nghiệm thu khi triển khai

- Preview không tạo dữ liệu; import cần actor đăng nhập và explicit confirmation.
- Payload lỗi/oversized/retry được xử lý có giới hạn và idempotent.
- Không tạo fake membership/invitation; mapping timezone và split hiện rõ.
- Data URL chỉ chuyển qua validated Storage pipeline; local source chỉ bị xóa sau server success.
- Có test fixtures cho schema versions, malformed input, duplicate retry, mapping và rollback.
