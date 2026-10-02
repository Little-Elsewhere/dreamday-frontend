# Phần 4 — Thành viên, vai trò và lời mời

## Mục tiêu

Biến danh sách member giả lập trong prototype thành quan hệ user đã xác thực với trip. Lời mời pending phải tách khỏi membership active; email/token không được xem là quyền truy cập cho tới khi recipient accept hợp lệ.

## Mô hình dữ liệu

- `trip_memberships`: `trip_id`, `user_id`, role (`owner/editor/member/viewer`), status (`active/removed`), `joined_at`, timestamps. Unique partial active membership theo trip/user.
- `trip_invitations`: trip, email normalized, role không thể là owner, token hash, expiry, creator membership cùng trip, accepted/revoked timestamps, accepted user.
- Không lưu raw invitation token. Generate cryptographically random token ở server, chỉ gửi token một lần tới URL/email; DB lưu hash có salt/algorithm đã thống nhất.
- Email normalize bằng trim + lowercase; không giả định Unicode normalization là bằng chứng tài khoản.
- Invitation pending không tạo active membership và không cho đọc trip/member list.
- Trước khi ship invite, xác nhận Supabase Auth email confirmation/identity semantics hiện tại; accept phải khớp email đã xác thực của actor.

## Ma trận quyền

| Thao tác                       | Owner | Editor                               | Member         | Viewer | Người ngoài |
| ------------------------------ | ----- | ------------------------------------ | -------------- | ------ | ----------- |
| Đọc dữ liệu trip               | Có    | Có                                   | Có             | Có     | Không       |
| Sửa title/ngày/pace            | Có    | Có                                   | Không          | Không  | Không       |
| Gửi/revoke invite              | Có    | Có                                   | Không          | Không  | Không       |
| Đổi role/remove member         | Có    | Theo policy sản phẩm; mặc định không | Không          | Không  | Không       |
| Chuyển owner                   | Có    | Không                                | Không          | Không  | Không       |
| Tạo/hoàn tất TODO, ghi expense | Có    | Có                                   | Có theo policy | Không  | Không       |
| Quản lý thành viên khác        | Có    | Không                                | Không          | Không  | Không       |

Không cho xóa/đổi role của owner hiện tại trừ khi cùng transaction chuyển owner và đảm bảo đúng một owner.

## Luồng mời

1. Action xác thực session và Zod: trip UUID, email, role cho phép. Giới hạn số lời mời theo request/user/time để chống spam.
2. Service xác minh caller owner/editor trong trip; tra membership hiện có, email trùng, invitation pending và role target.
3. Nếu user đã có account và identity đã biết, không tiết lộ sự tồn tại của account trong thông báo ngoài phạm vi cần thiết; có thể dẫn tới sign-in/accept link chung.
4. Tạo invitation với token hash, expiry, inviter membership; commit trước khi gửi email. Nếu gửi mail lỗi, invitation ở trạng thái retryable/pending và UI cho retry có giới hạn.
5. Email dùng URL HTTPS có token ngắn hạn; tránh analytics/referrer và không ghi URL/token vào access logs nơi không kiểm soát.
6. Accept page verify token server-side, yêu cầu sign-in, verify email confirmed khớp invitation, kiểm tra chưa hết hạn/revoke/accept.
7. Trong transaction: khóa/conditional update invitation, tạo hoặc re-activate membership đúng policy, set accepted actor/time. Unique constraint xử lý double-click/race; accept lặp lại trả kết quả idempotent an toàn.
8. Revoke chỉ owner/editor; pending invitation bị đánh dấu revoked, token lập tức vô hiệu.

## Remove member và chuyển owner

- Remove đặt status `removed` để giữ lịch sử; session tiếp theo không còn truy cập nội dung trip.
- Query list phải lọc `active`, không chỉ kiểm tra có row membership.
- Xử lý authored rows: không cascade xóa task/expense/message; giữ audit. UI có thể hiển thị tên/profile đã lưu hoặc “thành viên đã rời chuyến” theo retention policy.
- Chuyển owner chạy trong transaction có khóa trip/membership: xác thực caller là owner, target active, promote target rồi demote caller; constraint và kiểm tra cuối bảo đảm đúng một owner.
- Rà soát signed URL Storage đã phát trước lúc remove: TTL ngắn phù hợp và không coi nó bị revoke tức thì.

## DTO và riêng tư

- Chỉ expose display name/avatar cần cho UI; không trả email của toàn bộ member.
- Email invitation chỉ cho owner/editor có quyền quản lý; token hash không bao giờ ra DTO.
- Không log body email, token hoặc nội dung link.
- Lỗi “không tồn tại/không thuộc trip” trả thông điệp không cho phép dò ID/email.

## Tiêu chí nghiệm thu

- Pending invite không truy cập được trip; chỉ accept bởi tài khoản có email đã xác thực trùng.
- Token hết hạn, revoke, sai email, sử dụng lại và race accept đều được kiểm soát.
- Member removal làm mất quyền ở mọi query/action kế tiếp nhưng giữ audit data.
- Viewer không ghi; member không nâng role; editor không đổi owner theo default.
- Có test matrix đủ role và tests concurrency/idempotency/rate limits.
