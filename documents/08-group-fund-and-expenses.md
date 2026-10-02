# Phần 8 — Quỹ nhóm, khoản chi và chia tiền

## Mục tiêu và phạm vi

Hỗ trợ màn hình fund/expenses trong trip detail theo prototype. MVP là sổ ghi nhận khoản chi và chia phần giữa thành viên; không nhận tiền, chuyển khoản, giữ số dư tiền thật hay đồng bộ ngân hàng.

## Mô hình dữ liệu

### `trip_funds`

- Một dòng trên trip (`trip_id UNIQUE`), `currency_code CHAR(3)` mặc định `VND`, optional `budget_limit_minor bigint`, timestamps.
- Chốt rõ budget là hạn mức chi hay mục tiêu góp quỹ; schema hiện đề xuất hạn mức chi để không nhầm với số tiền đã góp.
- Currency không đổi sau khi có expense; nếu cho đổi thì chỉ khi ledger rỗng.

### `trip_expenses`

- `id`, `trip_id`, `fund_id`, title tối đa 60, `amount_minor bigint > 0`, `spent_at date`, category, optional note.
- `paid_by_membership_id` là người đã trả ngoài đời; `created_by_membership_id` là người nhập sổ. Hai actor có thể khác.
- Status/deleted time theo chính sách xóa; đề xuất soft delete để audit và tái tính balance.
- VND không có phần thập phân theo UI: một unit lưu bằng một đồng. Không dùng float/JS `number` unchecked cho tính tiền.

### `trip_expense_splits`

- `trip_id`, `expense_id`, `membership_id`, `share_minor bigint >= 0`; unique expense/member.
- Composite FK expense và membership cùng trip.
- Tổng split của mỗi expense phải bằng amount; expense active có ít nhất một participant. Người trả có thể cũng nằm trong split.

## Quy tắc chia và số dư

- Với chia đều, tính `base = amount_minor / participant_count`, `remainder = amount_minor % participant_count`; phân từng đồng dư theo thứ tự ổn định (ví dụ membership UUID tăng dần hoặc order đã được xác nhận), để kết quả không phụ thuộc thứ tự array từ client.
- Người dùng có thể chọn share custom nếu UI cho phép, nhưng server kiểm tra mọi share là integer không âm và tổng khớp chính xác.
- Trong một transaction: validate fund/trip, payer, participants active; insert/update expense; thay split set; xác nhận tổng split. Lỗi bất kỳ rollback cả nhóm.
- Balance một thành viên = tổng khoản họ trả cho expense active trừ tổng shares được phân bổ cho họ.
- Tổng balance của toàn trip phải bằng zero khi ledger/splits hợp lệ. Đây là invariant kiểm tra bổ sung.
- Danh sách người nợ/người được nhận là phép tính server từ balance; không lưu balance snapshot vào bảng nguồn.
- Nếu một payer/member bị remove, dữ liệu ledger cũ vẫn giữ membership reference/audit; không tự xóa hoặc chuyển payer.

## Input và xử lý tiền an toàn

- UI có thể nhận string digits từ input; server parse thành BigInt sau khi trim, từ chối dấu thập phân/âm/format mơ hồ và kiểm tra giới hạn nghiệp vụ.
- `BigInt` không serialize trực tiếp thành JSON; DTO dùng chuỗi thập phân hoặc safe integer có kiểm tra, thống nhất API/UI.
- Chọn format locale qua formatter; không lấy giá trị đã format làm input API.
- Category/status giới hạn enum; `spent_at` là date-only, note giới hạn độ dài.
- Validation client chỉ UX; Zod server schema và DB checks là chuẩn cuối.

## Quyền và audit

- Member trở lên được tạo expense theo default report; viewer chỉ đọc.
- Owner/editor được sửa/xóa expense theo policy; nếu member sửa expense của mình, giới hạn actor và lưu audit rõ.
- Không cho client giả `created_by_membership_id`; payer/participant phải active membership trong trip lúc tạo.
- Khi update participants, tránh race xóa membership bằng FK và transaction. Lỗi bị remove trả lỗi để user refresh.
- Không log note/expense payload, bank-like information hoặc PII.

## UI và query

- Widget hiển thị tổng đã chi, ngân sách (nếu có), recent expenses, payer/participants và balance summary.
- Pagination expense theo `spent_at DESC, id DESC`; query summary phải cùng quyền trip.
- Empty state phân biệt chưa có expense với lỗi tải.
- Confirmation xóa hiển thị tác động tới balance; undo chỉ nếu soft-delete policy hỗ trợ an toàn.
- Thao tác split custom cần a11y label, bàn phím, field-level errors và summary tổng còn thiếu/thừa.

## Tiêu chí nghiệm thu

- Mọi amount integer dương; split không âm, cùng trip và tổng chính xác.
- Remainder chia đều ổn định qua lần lưu/reload.
- Add/update/delete atomically; fail ở bất kỳ bước nào không để split/expense lệch.
- Tổng balance bằng 0; không lưu redundant balance.
- Viewer/outsider bị chặn; payer và data-entry actor không bị đánh đồng.
- Có test rounding/remainder, BigInt boundary/serialization, transaction rollback, authorization và concurrent update.
