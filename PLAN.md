# Triển khai hệ thống chuyến đi đa múi giờ và đa tiền tệ

## Tóm tắt

Giữ các quyết định đã chốt cho sáu chức năng: mời thành viên bằng tài khoản, bốn vai trò, nhiều checklist và sổ chi phí chia phần. Cập nhật phần lịch để các hoạt động có thể diễn ra ở những múi giờ khác nhau.

Prototype hiện chỉ lưu ngày và giờ địa phương, chưa lưu timezone. Checkout hiện cũng chưa có migration hoặc `prisma/schema.prisma` trên đĩa; kiểm tra và giữ lại mọi nội dung đang mở trong IDE trước khi bắt đầu triển khai.

## Schema và cách nhập thời gian

- Giữ các bảng `profiles`, `trips`, `trip_memberships`, `trip_invitations`, `trip_schedule_items`, `trip_checklists`, `trip_tasks`, `trip_funds`, `trip_expenses` và `trip_expense_splits`.
- Thêm `trips.time_zone` làm timezone chuẩn cho ngày bắt đầu/kết thúc và các ngày trên lịch chuyến đi. Bắt buộc chọn trước khi xuất bản chuyến.
- Thêm bộ chọn tìm kiếm timezone IANA riêng trong form chuyến đi và lịch trình. Điểm đến vẫn có thể nhập dạng text; không thêm dịch vụ geocoding. Có thể điền sẵn timezone của trình duyệt để tiện chọn, nhưng người dùng xác nhận timezone của chuyến.
- Mỗi lịch trình lưu `trip_day` để xác định cột ngày trên lịch; lưu `starts_at` và `ends_at` dạng `timestamptz`, cùng `start_time_zone` và `end_time_zone`. Hai timezone mặc định giống timezone của chuyến; hoạt động di chuyển có thể chọn timezone đầu và cuối khác nhau.
- Form nhập ngày/giờ địa phương theo timezone tương ứng rồi chuyển thành instant để lưu. PostgreSQL lưu `timestamptz` theo UTC và không giữ timezone ban đầu, nên cần lưu riêng IANA timezone cho từng đầu mốc. [PostgreSQL: Date/Time Types](https://www.postgresql.org/docs/17/datatype-datetime.html)
- Lịch hiển thị theo `trip_day`; giờ bắt đầu/kết thúc hiển thị theo timezone của từng đầu mốc và kèm nhãn timezone khi cần. Luồng “sắp diễn ra” sắp xếp theo instant UTC.
- Dùng IANA zone ID như `Asia/Tokyo`; không lưu offset cố định như `UTC+9` hay tên viết tắt như `JST`, vì offset thay đổi theo quy tắc địa phương. Nếu giờ nhập rơi vào khoảng không tồn tại do DST thì yêu cầu chọn giờ hợp lệ; nếu giờ bị lặp khi DST kết thúc thì yêu cầu chọn lần xuất hiện.

## Quyền và dữ liệu nghiệp vụ

- `owner` toàn quyền; `editor` quản lý chuyến, lịch, checklist, chi phí và lời mời; `member` tạo TODO, xử lý task được giao và ghi khoản chi; `viewer` chỉ xem.
- Tạo trip cùng membership owner, checklist mặc định và quỹ mặc định trong một transaction. Lời mời chỉ tạo membership hoạt động sau khi người nhận chấp nhận bằng tài khoản đúng email.
- Mỗi chuyến đi chọn một mã tiền tệ ISO 4217; quỹ và mọi khoản chi trong chuyến dùng mã đó. Lưu số tiền bằng `bigint` đơn vị nhỏ nhất và snapshot số chữ số thập phân của tiền tệ trên chuyến đi. Khóa việc đổi tiền tệ sau khoản chi đầu tiên. Không tự quy đổi tỷ giá trong MVP.
- Mỗi expense lưu người trả và các phần chia. Tạo expense cùng các dòng chia trong một transaction, rồi tính số dư từ sổ chi.
- Dùng Supabase SQL migrations làm nguồn schema và Prisma DAL server-only cho truy vấn. Kiểm tra membership/role trong server service. Bật RLS và khai báo rõ grants/revokes cho bảng được expose; Supabase yêu cầu xem grants và policies là hai lớp quyền riêng. [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security)

## Kiểm thử và triển khai

- Kiểm tra replay migration trên Supabase local; xác minh role và ràng buộc bằng `supabase test db`.
- Kiểm thử chuyến có timezone khác trình duyệt, lịch trình có timezone riêng, chuyến bay có timezone đầu/cuối khác nhau, DST gap/fold, chỉnh sửa rồi lưu lại không lệch giờ, và hoạt động băng qua ngày quốc tế.
- Kiểm thử tiền tệ 0 và 2 chữ số thập phân, chia số lẻ chính xác, tổng phần chia bằng tổng khoản chi và khóa tiền tệ sau khoản chi đầu tiên.
- Kiểm tra quyền owner/editor/member/viewer, lời mời pending và khóa ngoại ngăn tham chiếu chéo trip.
- Trước khi áp dụng migration, xác nhận trạng thái local và kiểm tra schema remote ở chế độ chỉ đọc. Không chạy migration lên remote trước khi xác định project và schema hiện có.
- Đồng bộ phiên bản Prisma CLI với `@prisma/client` và adapter 7.x trước khi generate; không dùng Prisma Migrate song song với SQL migrations.

## Giả định

- `trips.time_zone` xác định ngày lịch của chuyến; từng lịch trình xác định múi giờ thực tế tại thời điểm bắt đầu và kết thúc.
- Người dùng chọn timezone thủ công từ danh sách IANA; hệ thống không suy đoán từ tên điểm đến.
- Dữ liệu localStorage trong prototype tiếp tục là dữ liệu mock, không tự nhập vào database.
