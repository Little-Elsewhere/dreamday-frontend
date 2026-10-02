# Phần 7 — Checklist và TODO

## Mục tiêu

Thêm feature checklist theo yêu cầu sản phẩm. Prototype chưa có màn hình tương ứng, vì vậy đây là phần cần thiết kế UI riêng sau khi domain contract được duyệt. Hỗ trợ nhiều checklist trong một trip (ví dụ “Chuẩn bị trước chuyến đi”, “Đồ cần mang”) và task có người phụ trách/deadline.

## Mô hình dữ liệu

### `trip_checklists`

- `id`, `trip_id`, title tối đa 80, `sort_order`, `created_by_membership_id`, `created_at`, `updated_at`.
- Composite uniqueness/FK cho `trip_id + id`; creator phải active member cùng trip tại lúc tạo.
- Trip mới tạo checklist mặc định cùng transaction nếu migration/service đã sẵn sàng. Tên mặc định dùng nội bộ key hoặc giá trị seed trung lập; hiển thị qua next-intl nếu là hệ thống mặc định.

### `trip_tasks`

- `id`, `trip_id`, `checklist_id`, title tối đa 160, description tối đa 1000.
- Status `open/done/cancelled`, optional `due_at timestamptz`, optional `assignee_membership_id`, `sort_order`.
- `created_by_membership_id`, nullable `completed_by_membership_id`, nullable `completed_at`, timestamps, optional `version`.
- Composite FK `(trip_id, checklist_id)` và `(trip_id, membership_id)` cho creator, assignee, completer.
- Quy tắc đồng bộ: `done` có `completed_at` và actor; `open/cancelled` không được mang trạng thái completion đang hoạt động. Nếu cho reopen, ghi rõ lịch sử hoặc giữ audit event.

## Quy tắc ngày giờ

- Task deadline là instant `timestamptz` nếu người dùng chọn thời gian; ngày-only deadline cần quy định rõ, đề xuất lưu `due_date date` riêng hoặc chuẩn hóa local end-of-day bằng timezone trip. Không dùng UTC midnight ngầm.
- Deadline tạo từ form được diễn giải theo timezone trip, cùng DST rules của schedule.
- Task được phép due ngoài ngày trip nếu đây là việc chuẩn bị trước chuyến; ngày trip không nên là constraint DB.

## Quyền và nghiệp vụ

- Owner/editor tạo, sửa, reorder và xóa/đóng checklist.
- Member có thể tạo task và hoàn tất task theo policy MVP; đề xuất chỉ assignee hoặc owner/editor được đổi nội dung/assignment, còn member khác có thể hoàn tất nếu checklist là cộng tác chung — chốt rõ trước code.
- Viewer chỉ đọc.
- Tạo task kiểm tra membership active và checklist cùng trip; không tin `created_by_membership_id` hoặc `completed_by` từ client.
- Complete action là idempotent hoặc trả trạng thái hiện tại; actor/time lấy từ session/DB.
- Reopen chỉ owner/editor hoặc assignee theo policy; clearing `completed_at/by` phải đồng bộ trong transaction.
- Xóa checklist có task: quyết định archive tasks/soft-delete hay cascade; đề xuất archive/soft delete để giữ audit và tránh mất việc đã giao.
- Reorder nhận danh sách ID trong checklist, xác thực toàn bộ cùng checklist, không cho kéo task từ trip khác; thực hiện transaction và chuẩn hóa position.

## UI và query

- Checklist card hiển thị progress `done/total` tính từ query; không lưu count materialized ban đầu.
- Task row hiển thị title, assignee, deadline, trạng thái; màu không phải cách duy nhất truyền overdue/done.
- Filter open/completed, sort manual/due date; pagination nếu danh sách dài.
- Tạo/sửa có field errors, optimistic completion có rollback khi action fail; bàn phím hỗ trợ checkbox và reorder thay cho drag-only.
- Server Component tải initial list; client dùng cho interaction. Upcoming query tái sử dụng tasks open có deadline.

## Tiêu chí nghiệm thu

- Không thể tạo task tham chiếu checklist/member của trip khác.
- Chỉ role phù hợp tạo/sửa/hoàn tất/reorder; `completed_by` luôn là actor đã xác thực.
- Deadline date-only/timed hiển thị đúng timezone, gồm task trước ngày trip.
- Completion/reopen và xóa checklist giữ trạng thái audit nhất quán.
- Có test constraint, permissions, race completion, reordering, empty/filter states và keyboard access.
