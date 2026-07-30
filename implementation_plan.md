# Kế hoạch Triển khai: Thay đổi Xác thực, Dịch Giao diện & Tích hợp Step CA

Mục tiêu: Chuyển đổi hệ thống từ đăng nhập bằng API Key sang Username/Password, hỗ trợ quản lý tài khoản, dịch giao diện sang Tiếng Việt, loại bỏ hoàn toàn tính năng gửi email, và tích hợp CA mã nguồn mở (Step CA) cùng các cấu hình mẫu.

## User Review Required

> [!IMPORTANT]
> **Thay đổi Cơ chế Đăng nhập & Database**
> - Bảng `users` hiện tại được thiết kế chặt chẽ cho OIDC/SSO. Tôi sẽ sửa đổi bảng này (qua DB migration) để hỗ trợ lưu trữ `password_hash` cục bộ (Bcrypt), và cho phép các trường OIDC là tuỳ chọn.
> - Tính năng đăng nhập bằng `API-Key` ở màn hình chính sẽ bị gỡ bỏ, thay vào đó là form đăng nhập bằng Email/Password. API Keys sẽ chỉ được tạo và quản lý bởi admin trong hệ thống, dùng riêng cho agent/API.

> [!WARNING]
> **Loại bỏ Email**
> - Toàn bộ mã nguồn liên quan đến gửi thông báo qua Email (SMTP) ở cả Backend (Service, Helm charts, docs) và Frontend sẽ bị **xoá bỏ hoàn toàn**.
> - Việc này có thể ảnh hưởng đến các cài đặt cũ đang dựa vào Email để nhận thông báo hết hạn chứng chỉ.

## Open Questions

> [!CAUTION]
> 1. Đối với cơ chế tài khoản cục bộ mới, bạn có muốn thiết lập một tài khoản **Admin mặc định** khi khởi tạo hệ thống (ví dụ: `admin@certctl.local` / `admin`) không? Hiện tại hệ thống OIDC sẽ tự động tạo user khi đăng nhập lần đầu.
> 2. Dịch giao diện: Bạn có muốn giữ nguyên từ "Agent" hay dịch thành "Trạm", "Máy chủ đích"? (Tôi đề xuất giữ nguyên "Agent" tương tự các từ kỹ thuật khác như NGINX, ACME).

## Proposed Changes

---

### Xác thực & Quản lý người dùng (Backend & Frontend)
#### [NEW] `migrations/000048_local_auth.up.sql`
- Bổ sung cột `password_hash` vào bảng `users`. Xoá tính bắt buộc của `oidc_provider_id`. Thêm unique constraint cho `email`.
#### [MODIFY] `internal/domain/user.go` & `internal/auth/...`
- Bổ sung cấu trúc dữ liệu cho Password Hash.
- Viết API endpoints: `POST /api/v1/auth/login` (cấp JWT/Session), `GET/POST /api/v1/users` (CRUD User), `PUT /api/v1/users/{id}/password`.
#### [MODIFY] `web/src/pages/LoginPage.tsx`
- Xoá form đăng nhập API Key, thay bằng form Email & Password.
#### [NEW] `web/src/pages/UsersPage.tsx`
- Giao diện CRUD quản lý tài khoản dành cho Admin.

---

### Dịch Giao diện sang Tiếng Việt
#### [MODIFY] `web/src/...` (Các file component/pages)
- Quét toàn bộ mã nguồn frontend để dịch các nhãn, tiêu đề, nút bấm (Dashboard, Targets, Certificates, API Keys, v.v.).
- Giữ nguyên các thuật ngữ chuyên môn: NGINX, F5 Big-IP, ACME, certificate, API, CRUD, Agent, Target.

---

### Xoá tính năng Email
#### [DELETE/MODIFY] `internal/service/notification.go` & `internal/connector/notifier/...`
- Xoá hằng số `NotificationChannelEmail`, xoá logic gọi SMTP, gỡ tham số SMTP trong cấu hình (`config.go`).
- Xoá các trường liên quan đến email trong cấu hình Helm (`deploy/helm/...`).

---

### Tích hợp Step CA (CA Mã nguồn mở)
#### [MODIFY] `deploy/docker-compose.yml`
- Bổ sung service `step-ca` (dựa trên cấu hình chuẩn), liên kết cùng mạng lưới với `certctl-server`.
- Khởi tạo Step CA cùng với ACME provisioner.
#### [MODIFY] `migrations/seed_demo.sql`
- Thêm Issuer mới vào cơ sở dữ liệu mẫu với loại ACME trỏ đến URL của `step-ca`.

---

### Tạo Cấu hình Target & Kịch bản thử nghiệm
#### [NEW] `examples/targets-demo/`
- Tạo các file cấu hình hoặc hướng dẫn kết nối IIS, Apache HTTP, và NGINX.
- Tạo kịch bản mẫu: Dùng Step CA cấp chứng chỉ ACME, Certctl Agent tự động kéo chứng chỉ về và cài đặt lên NGINX / IIS giả lập trong Docker.

## Verification Plan

### Automated Tests
- Viết unit test cho hàm hash mật khẩu và endpoint Login mới.
- Viết integration test (API) đảm bảo:
  - Admin tạo được user.
  - User thường chỉ đổi được mật khẩu của mình.
  - Quản lý API Key yêu cầu uỷ quyền đúng role.

### Manual Verification
- Truy cập màn hình Login: đăng nhập bằng `admin` account -> Tạo user mới -> Phân quyền.
- Chạy hệ thống bằng `docker-compose up`, kiểm tra `step-ca` có hoạt động trên cổng 9000 và nhận yêu cầu ACME thành công từ certctl.
