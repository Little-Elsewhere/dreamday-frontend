# Phần 6 — Lịch trình và schedule items

## Mục tiêu và reference

Triển khai lịch ngày/tuần trong [`../design/trip-detail.html`](../design/trip-detail.html) và hành vi của [`../design/assets/trip-calendar.js`](../design/assets/trip-calendar.js). Item có title, category, ngày/giờ bắt đầu/kết thúc, địa điểm, địa chỉ, mô tả và trạng thái. Prototype cho phép hoạt động chồng giờ; database cũng không chặn overlap.

## Mô hình dữ liệu

`trip_schedule_items` tối thiểu gồm:

- `id`, `trip_id`; title (tối đa 80), category `explore/meal/travel/stay/free`, description (500), place/address.
- `starts_at`, `ends_at` kiểu `timestamptz`, `time_zone` tên IANA, `status` `planned/booked/completed/cancelled`, `sort_order`.
- `created_by_membership_id`, timestamps; nếu cần audit sửa nhiều người thì thêm `updated_by_membership_id`.
- Composite FK bảo đảm creator thuộc cùng trip; `ends_at > starts_at`.

Timezone gốc lấy từ trip khi tạo schedule, lưu snapshot để thay đổi timezone trip sau này không làm diễn giải lại thời gian cũ. Nếu hỗ trợ timezone override từng activity, ghi override explicitly thay vì dùng browser local timezone.

## Chuyển local date/time sang instant

- Form nhập ngày và giờ địa phương trong timezone trip; server parse thành instant bằng thư viện có hỗ trợ IANA DST.
- Không tự parse `new Date('YYYY-MM-DD HH:mm')` theo timezone máy chủ.
- Giờ không tồn tại khi DST chuyển tiến phải bị từ chối hoặc yêu cầu người dùng chọn giờ khác. Giờ lặp khi DST lùi cần quy tắc offset/disambiguation rõ.
- UI prototype dùng `24:00`; chuẩn hóa thành `00:00` ngày kế tiếp trước khi lưu, không lưu “24:00” như time value.
- Date-only của trip vẫn là `date`, không tạo timestamp giả tại nửa đêm UTC.
- Render instant theo `time_zone` của item (hoặc trip) và locale; luôn giữ timezone/offset khi round-trip edit.

## Quyền và workflow

- Owner/editor tạo, sửa, hủy/xóa schedule theo policy.
- Member có thể xem; nếu product cho member thêm item thì action riêng, có audit và không cho đổi trip/creator tùy ý.
- Viewer và non-member chỉ đọc được khi active membership; non-member bị chặn server-side.
- Update/delete phải scope bằng `trip_id + item_id + authorized membership`, không lookup ID độc lập rồi ghi.
- Chuyển status validated; completed/cancelled không tự xóa lịch sử.
- Khi đổi ngày trip, schedule ngoài phạm vi mới được giữ và báo rõ, trừ khi product duyệt quy tắc khác.

## Truy vấn calendar

- Query theo `[local day start, next local day start)` sau khi chuyển ranh giới ngày trip timezone thành UTC. Không giả định một ngày luôn 24 giờ trong DST zones.
- Week view query bằng khoảng UTC tương ứng tuần local; sort `starts_at`, sau đó `sort_order`, rồi `id` để thứ tự ổn định.
- Cho phép overlap; UI bố trí lane/overlap nhưng persistence không từ chối.
- Index `(trip_id, starts_at)`; có thể partial cho `status NOT IN ('cancelled','completed')` nếu query và planner tận dụng.
- Paginate dài hạn hoặc giới hạn khoảng ngày; không tải toàn bộ lịch của trip nhiều năm cho tuần đang xem.

## UI, a11y và trạng thái lỗi

- Dùng semantic buttons cho chuyển tuần/ngày, aria-label có ngày đầy đủ, keyboard interaction cho mở/chọn item.
- Tên category và status dịch; icon không phải chỉ báo duy nhất.
- Empty day có CTA phù hợp quyền; viewer chỉ thấy empty state.
- Form giữ ngày và timezone đã chọn nếu validation thất bại.
- Conflict version hoặc item đã bị xóa được trả lỗi thân thiện; refresh giữ ngày hiện tại trong calendar.

## Tiêu chí nghiệm thu

- Thời gian lưu/render nhất quán cho timezone `Asia/Ho_Chi_Minh` và timezone DST được hỗ trợ.
- Local edit round-trip không lệch ngày/giờ; `24:00` chuyển sang ngày kế tiếp.
- End trước/equal start bị chặn; schedule overlap vẫn lưu được.
- User không thuộc trip không thể đọc/ghi; role không đủ không sửa được.
- Có test ranh giới ngày/tuần, DST gap/fold, sort ổn định, permission và update race.
