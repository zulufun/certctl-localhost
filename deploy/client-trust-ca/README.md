# Hướng dẫn tin cậy (Trust) Root CA trên máy Client (Windows)

Mục đích của hướng dẫn này là để cài đặt chứng chỉ Root CA (Tổ chức phát hành chứng chỉ gốc) của hệ thống CertCtl vào máy tính client. 

Điều này sẽ giúp các trình duyệt (Chrome, Edge, Cốc Cốc...) trên máy bạn tự động **tin cậy** các trang web (như `https://vienlsqs.bqp`) do CertCtl cấp chứng chỉ, loại bỏ lỗi "Kết nối của bạn không an toàn" (Your connection is not private).

## Cách thực hiện

Bạn có thể chọn 1 trong 2 cách dưới đây:

### Cách 1: Tự động (Khuyên dùng)

1. Copy thư mục `client-trust-ca` này sang máy client.
2. Mở menu Start, gõ `PowerShell`, click chuột phải vào **Windows PowerShell** và chọn **Run as Administrator** (Chạy dưới quyền quản trị viên).
3. Sử dụng lệnh `cd` để di chuyển vào thư mục này:
   ```powershell
   cd C:\Đường\dẫn\tới\thư\mục\client-trust-ca
   ```
4. Chạy file script để tự động cài đặt:
   ```powershell
   .\Install-TrustCA.ps1
   ```
   *(Ghi chú: Nếu bị lỗi Execution Policy cấm chạy script, hãy gõ lệnh `Set-ExecutionPolicy Bypass -Scope Process -Force` sau đó chạy lại lệnh trên).* 

### Cách 2: Làm thủ công bằng chuột

1. Copy thư mục `client-trust-ca` này sang máy client.
2. Click đúp vào file `ca.crt` trong thư mục này.
3. Bấm vào nút **Install Certificate...** (Cài đặt chứng chỉ).
4. Ở phần Store Location, chọn **Local Machine** (Máy tính cục bộ) -> Chọn **Next** (hệ thống sẽ hỏi quyền Admin).
5. Chọn mục **Place all certificates in the following store**.
6. Bấm **Browse...** và chọn thư mục có tên **Trusted Root Certification Authorities** (Tổ chức phát hành chứng chỉ gốc đáng tin cậy).
7. Bấm **Next**, sau đó bấm **Finish**.
8. Màn hình sẽ hiện thông báo "The import was successful" (Nhập thành công).

## Kiểm tra

Sau khi cài đặt xong, hãy tắt hoàn toàn trình duyệt web của bạn và mở lại. Truy cập vào trang `https://vienlsqs.bqp`, bạn sẽ thấy biểu tượng ổ khóa an toàn (không bị gạch chéo đỏ).
