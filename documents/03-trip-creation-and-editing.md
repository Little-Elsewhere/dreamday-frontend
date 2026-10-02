# Phần 3 — Tạo và chỉnh sửa chuyến đi

## Mục tiêu và thiết kế tham chiếu

Triển khai luồng từ [`../design/trip-create.html`](../design/trip-create.html): nhập thông tin chuyến, ngày đi/về, nhịp chuyến, mô tả và ảnh bìa tùy chọn; hỗ trợ bước nhập/giao diện draft nếu đúng prototype. Giữ phạm vi business logic ở service, không để form tự quyết định quyền hoặc trạng thái persisted.

## Hành vi dữ liệu

- `trips.status`: `draft`, `planning`, `confirmed`, `cancelled`, `archived`; trạng thái card `upcoming/past` tính riêng.
- Draft có thể thiếu title/date theo quyết định phần 0. Khi publish/confirm, áp validation đầy đủ và không thể chuyển state tùy tiện.
- Create transaction tối thiểu: insert trip; insert owner membership; insert checklist mặc định (nếu checklist domain đã sẵn sàng); insert fund default (nếu quỹ được auto-init). Nếu một insert lỗi, rollback tất cả.
- `created_by_user_id` và membership owner lấy từ session; không nhận từ form.
- Mỗi trip có currency và timezone mặc định rõ ràng. Date-only giữ type `date`; timezone là tên IANA đã validate.
- `version` bắt đầu từ 1; `created_at/updated_at` UTC do DB/service quản lý nhất quán.

## Validation đề xuất

- Trim title/destination/description; từ chối chuỗi rỗng sau trim. Giới hạn title 40, destination 40, description 100 theo thiết kế DB/report.
- Ngày có format calendar hợp lệ; nếu cả hai có giá trị thì `end_date >= start_date`.
- Pace chỉ nhận `relaxed`, `balanced`, `active`; status chỉ được chuyển qua state transitions hợp lệ.
- Timezone phải là IANA timezone được hỗ trợ, không nhận timezone tùy ý gây dữ liệu không đọc được.
- Không nhận `coverImage` dạng data URL; upload ảnh là thao tác riêng qua Storage và gửi object path đã được server xác thực.
- Zod schema phía server là chuẩn; client validation chỉ hỗ trợ UX.

## Use cases và quyền

1. `createDraft`: user authenticated tạo trip draft và owner membership.
2. `saveTrip`: owner/editor cập nhật metadata; nếu từ draft sang planning/confirmed thì enforce trường bắt buộc.
3. `changeDates`: kiểm tra schedule/task hiện có trước khi đổi. Mặc định cảnh báo hoặc trả danh sách item nằm ngoài ngày mới; không âm thầm dời timestamp.
4. `archiveTrip`: owner thao tác; archive giữ dữ liệu và loại khỏi list mặc định.
5. `restoreTrip` (nếu cần): owner/admin; không tự khôi phục lời mời hoặc membership đã bị revoke.

Owner/editor mới sửa metadata; member/viewer chỉ đọc theo matrix ở report. Service kiểm tra role trong DAL cùng transaction khi có cập nhật.

## Luồng UI

- Server page xác thực route và tải data tối thiểu; form client nhận DTO đã lọc.
- Dùng form semantic, label thật, field errors, pending/disabled state và giữ input khi lỗi.
- Tất cả text qua `next-intl`, gồm status, validation, empty state và confirmation.
- Chuyển bước create không được làm mất data; nếu persisted draft, save rõ ràng và báo trạng thái. Nếu local-only step, không tự ghi session storage mà không có yêu cầu.
- Responsive theo prototype nhưng sử dụng token/components hiện có; keyboard tab order, focus error đầu tiên và focus visible.
- Cover upload xử lý riêng; form metadata vẫn có thể lưu khi upload thất bại và hiện trạng thái retry.

## Concurrency, cache và lỗi

- Update `where: { id, version, ...authorized predicate }`; increment version. Version mismatch trả conflict có localized recovery.
- Revalidate trip detail và current user trip list sau commit.
- Nếu database insert thành công nhưng cache revalidate gặp lỗi, mutation vẫn đã commit; phản hồi không được gợi ý rằng trip chưa được lưu. Ghi log correlation id và cho UI reload.
- Không cho enumeration trip id ngoài membership.

## Tiêu chí nghiệm thu

- Người chưa đăng nhập không tạo/sửa trip; member/viewer không sửa metadata.
- Owner và editor tạo/cập nhật hợp lệ; input sai được báo field-level.
- Tạo trip không thể để lại trip thiếu owner membership.
- Date-only không lệch ngày qua timezone; end trước start bị từ chối.
- Draft chỉ thấy theo đúng quyền; status filter không nhầm lifecycle với upcoming/past.
- Có test service/DB transaction, permission, validation, version conflict và responsive form flow.
