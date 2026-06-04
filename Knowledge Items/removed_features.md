# Thay đổi tính năng và API Key (2026-06-04)

## Các tính năng bị gỡ bỏ
Các tính năng sau đây đã được gỡ bỏ hoàn toàn khỏi hệ thống (cả backend lẫn frontend) nhằm tinh gọn hệ thống:
1. **Mail Notifier / Digest Emails**: Không còn gửi email cảnh báo tự động.
2. **EJBCA Issuer**: Đầu nối cấp phát chứng chỉ thông qua EJBCA bị loại bỏ.
3. **Vault PKI Issuer**: Đầu nối cấp phát chứng chỉ thông qua HashiCorp Vault bị loại bỏ.

## Cấu hình kết nối Agent
Hệ thống hiện tại sử dụng một Authentication Middleware toàn cục kiểm tra cấu hình `CERTCTL_AUTH_SECRET`. Mặc dù trong bảng `agents` ở database có thể có key riêng cho từng agent (như `test-agent-key-2026`), nhưng route API của Agent hiện chưa có Middleware riêng biệt để hỗ trợ kiểm tra key theo từng agent cụ thể này.

**Hệ quả**: Agent sẽ nhận lỗi `401 Invalid API key` nếu cố gắng xác thực bằng Agent API Key.
**Giải pháp**: Cấu hình `CERTCTL_API_KEY` của Agent phải được đặt giống với `CERTCTL_AUTH_SECRET` (admin key) của Server. (Ví dụ: `test-key-2026`).

## Docker Compose Testing
Để test thử nghiệm với môi trường gần giống production:
1. Chạy server chính: `docker compose -f deploy/docker-compose.yml up -d`
2. Chạy agent ở compose tách biệt: `docker compose -f deploy/docker-compose.agent-test.yml up -d`
Lưu ý: `docker-compose.agent-test.yml` được cấu hình để join vào mạng `certctl_certctl-network` của hệ thống production.
