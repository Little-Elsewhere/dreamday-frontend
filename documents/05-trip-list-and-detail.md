# Phần 5 — Danh sách chuyến và trang chi tiết

## Mục tiêu và reference

Đưa các màn hình [`../design/trips.html`](../design/trips.html) và [`../design/trip-detail.html`](../design/trip-detail.html) từ dữ liệu prototype sang query có phân quyền. Trang list hiển thị các trip user là member active; detail chỉ load sau khi quyền đọc đã xác minh.

## Phân loại và bộ lọc

`trips.status` là lifecycle (`draft`, `planning`, `confirmed`, `cancelled`, `archived`). Nhãn UI được tính riêng theo ngày địa phương trong timezone trip:

1. `cancelled`: tab riêng hoặc ẩn theo quyết định product.
2. `archived`: không hiện mặc định; có bộ lọc archive nếu được hỗ trợ.
3. `draft/planning`: “đang lên kế hoạch”. Draft chỉ hiện với owner/creator theo quyết định phần 0.
4. `confirmed` và `end_date < localToday`: “đã qua”.
5. `confirmed` chưa kết thúc: “sắp tới”; nếu trip đã bắt đầu nhưng chưa kết thúc, label sản phẩm có thể là “đang diễn ra” dù report UI hiện dùng nhóm upcoming.

Không ghi các nhãn suy ra vào cột status. Múi giờ localToday phải xác định trong server/query theo từng trip, không dùng timezone máy chủ mặc định.

## Query và dữ liệu cần tải

- Trip list lấy membership active cho authenticated user, join trips; select đúng fields cho card: title, destination, date range, timezone, status, cover path, role và summary counters nếu đã tối ưu.
- Không tải toàn bộ schedule, expenses hoặc chat chỉ để render card. Counter có thể query aggregate hoặc thêm materialized value sau khi đo.
- Search `destination/title` phải trim, giới hạn độ dài và escape wildcard theo query builder; tránh endpoint tìm kiếm không giới hạn.
- Sort mặc định: confirmed upcoming gần nhất trước; planning/drafts theo updated time; past riêng. Quy tắc sort ghi trong query, không phụ thuộc thứ tự database.
- Pagination dùng cursor ổn định (date + id hoặc updatedAt + id); không tải không giới hạn. Giữ filter/search trong URL query params an toàn.
- Detail tải trip và membership trong một query/transaction logic; chỉ sau khi authorize mới tải các domain widgets.

## Trạng thái UI

- Loading/skeleton giữ layout card tránh jump.
- Empty state giải thích chưa có chuyến và CTA tạo chuyến theo quyền/auth.
- Search không có kết quả có clear filter.
- Archived/cancelled có label text/icon; không truyền ý nghĩa chỉ bằng màu.
- Cover thiếu/lỗi hiển thị placeholder không làm hỏng detail.
- Error state không tiết lộ database hoặc cho biết trip ID của user khác có tồn tại.
- `next-intl` xử lý labels, dates, count pluralization; format ngày là date-only theo timezone rõ.

## Giao diện chi tiết và domain ownership

Detail layout lấy header trip, member summary, schedule, fund, checklist, note/chat như design. Mỗi widget gọi query/domain riêng hoặc nhận DTO rõ; không truyền Prisma record nguyên bản qua cây UI.

- Trip metadata/cover thuộc feature trip.
- Member list thuộc invitation/membership.
- Schedule, TODO, expenses và messages được phân kỳ riêng nhưng gắn vào detail qua DTO.
- Tab/component không được coi tab visibility là access control. Mọi action/query vẫn kiểm tra membership.

## Cache và invalidation

- Detail phụ thuộc cookie/session nên dùng request-time boundary theo Cache Components; không cache chéo user.
- Mutation revalidate list của actor và detail của trip; invite accept/remove revalidate member summary; expense/task/schedule revalidate đúng widget/upcoming feed.
- Nếu dùng tags, chọn tag namespace và invalidation contract thống nhất trong DAL, không rải chuỗi tag ngẫu nhiên ở component.

## Tiêu chí nghiệm thu

- List chỉ gồm chuyến user active member có quyền xem.
- Trạng thái planning/upcoming/past cập nhật đúng theo ngày hiện tại và timezone của trip.
- Draft/archive/cancelled theo đúng visibility/filter decision.
- Pagination/search/sort ổn định; không N+1 query trên số trip lớn.
- User ngoài trip không đọc detail hoặc widget data bằng URL trực tiếp.
- Có test timezone/date boundaries, authorization, empty/error states và query pagination.
