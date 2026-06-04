# Lỗi: Không vào được Web Server (TLS Handshake Error / HTTP sent to HTTPS)

## Triệu chứng
- Khi truy cập vào Dashboard qua trình duyệt, bạn thấy lỗi "This site can't be reached" hoặc "Connection reset".
- Nếu kiểm tra log của server (`docker compose logs certctl-server`), bạn sẽ thấy lỗi tương tự như:
  `http: TLS handshake error from 172.20.0.1:XXXXX: client sent an HTTP request to an HTTPS server`

## Nguyên nhân
Web server (`certctl-server`) được thiết kế mặc định chỉ phục vụ kết nối bảo mật qua giao thức **HTTPS** ở cổng `8443` (hoặc cổng mà bạn map ra ngoài). Tuy nhiên, khi bạn gõ `localhost:8443` hoặc `IP:8443` vào thanh địa chỉ, trình duyệt thường tự động thử giao thức **HTTP** (ví dụ `http://localhost:8443`). Do server nhận được dữ liệu dạng text chưa mã hóa thay vì quy trình "bắt tay" TLS, nó lập tức từ chối kết nối và in ra log lỗi trên.

## Cách khắc phục
Luôn luôn phải điền rõ giao thức `https://` vào trước địa chỉ IP hoặc tên miền.

- **Sai**: `localhost:8443` hoặc `http://localhost:8443`
- **Đúng**: `https://localhost:8443`

*Lưu ý: Do chứng chỉ số (certificate) của dự án này đang dùng chứng chỉ tự ký (self-signed) được tự động generate lúc boot, trình duyệt sẽ hiện một cảnh báo màu đỏ bảo mật (Ví dụ: `NET::ERR_CERT_AUTHORITY_INVALID`). Đây là điều bình thường trong môi trường nội bộ. Bạn nhấn vào nút "Advanced" (Nâng cao) -> "Proceed to localhost (unsafe)" (Tiếp tục truy cập) để vào trang web.*

---

# Lỗi: "Something went wrong" (React crash sau khi restart server/database)

## Triệu chứng
- Trang web tải được nhưng hiển thị màn hình đỏ **"Something went wrong — An unexpected error occurred"** với nút "Reload Page" và "Copy details".
- Trong phần "Error details", thấy stack trace có `vendor-router-***.js`.
- Nhấn "Reload Page" vẫn lặp lại lỗi.
- Server và các container Docker đều đang chạy bình thường (healthy).

## Nguyên nhân
Trình duyệt của bạn đang lưu **API key / session data cũ** trong LocalStorage từ lần đăng nhập trước. Sau khi server hoặc database được restart (đặc biệt khi xóa volume và tạo lại), API key này không còn hợp lệ nữa. React Router nhận được lỗi 401 ở giữa chừng, trigger một chuỗi sự kiện làm crash toàn bộ giao diện và hiển thị "Something went wrong" thay vì redirect về trang login.

## Cách khắc phục (từ nhanh đến chậm)

### Cách 1 — Nhanh nhất: Dùng tab ẩn danh
Mở tab ẩn danh (`Ctrl+Shift+N`) và truy cập `https://localhost:8443`. Tab ẩn danh không có localStorage của phiên cũ, sẽ hiện trang login ngay.

### Cách 2 — Xóa localStorage qua DevTools
1. Mở `https://localhost:8443` và nhấn `F12`.
2. Vào tab **Application** (Chrome) hoặc **Storage** (Firefox).
3. Bên trái chọn **Local Storage** → `https://localhost:8443` → click phải → **Clear**.
4. Xóa thêm **Session Storage** và **Cookies** cho cùng origin.
5. Nhấn `F5` reload lại trang.
6. Trang login sẽ xuất hiện.

### Cách 3 — Hard reset trình duyệt cho trang này
Nhấn `Ctrl+Shift+Delete` → chọn xóa "Cookies" và "Cached images and files" → chọn "All time" → Clear.

## Đăng nhập sau khi fix
Sau khi thấy trang login, nhập API key mặc định: `demo-secret-123`

## Phòng tránh
- Khi restart docker compose, dùng `docker compose restart certctl-server` thay vì `down -v` (lệnh `-v` xóa volume database, làm mất toàn bộ session).
- Nếu buộc phải `down -v`, sau khi start lại thì phải dùng tab ẩn danh hoặc xóa localStorage trước khi login.

