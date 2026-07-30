# certctl Agent - Windows NGINX Edition

Bộ cài đặt `certctl-agent` dành riêng cho môi trường **Windows NGINX (NGINX Web Server trên Windows)**.

---

## 📦 Các file trong bộ cài

- `certctl-agent.exe`: Binary chính của certctl Agent (dành cho Windows 64-bit).
- `winsw.exe`: Windows Service Wrapper để chạy agent dưới dạng Windows Service.
- `script-install-agent.ps1`: Script cài đặt/gỡ cài đặt chính bằng PowerShell.
- `install-silent.bat`: Lệnh cài đặt nhanh 1-Click (Tự động đăng ký với Server).
- `check-agent.ps1`: Script chẩn đoán và trích xuất log khi cần hỗ trợ/debug.
- `agent.env`: File chứa thông số cấu hình mặc định (Server URL, API Key, CA Cert...).
- `server-ca.crt`: Chứng chỉ CA của certctl Server (dành cho môi trường HTTPS tự ký).

---

## 🚀 Hướng dẫn cài đặt

### Cách 1: Cài đặt nhanh 1-Click (Khuyên dùng)
1. Giải nén thư mục `agent-windows-nginx` trên máy chủ Windows NGINX.
2. Nhấp chuột phải vào file **`install-silent.bat`** ➔ Chọn **Run as Administrator**.
3. Hệ thống sẽ tự động đăng ký Agent với Server `https://10.1.0.12:8443` và tạo Windows Service `certctl-agent`.

### Cách 2: Cài đặt qua PowerShell (Tùy chỉnh thông số)
1. Mở PowerShell với quyền **Administrator**.
2. Di chuyển vào thư mục bộ cài và chạy:
   ```powershell
   .\script-install-agent.ps1 -ServerURL "https://10.1.0.12:8443" -ApiKey "demo-secret-123"
   ```

---

## ⚙️ Cấu hình Target trên certctl Server

Sau khi cài đặt Agent thành công, trên giao diện certctl Dashboard (hoặc qua REST API), tạo Target với thông số:

- **Type**: `NGINX`
- **Agent ID**: Tên máy tính (hoặc ID đã cấu hình)
- **Config Mẫu**:
  ```json
  {
    "cert_path": "C:\\nginx\\certs\\cert.pem",
    "key_path": "C:\\nginx\\certs\\cert.key",
    "reload_command": "C:\\nginx\\nginx.exe -s reload",
    "validate_command": "C:\\nginx\\nginx.exe -t"
  }
  ```

---

## 🛠️ Quản lý & Chẩn đoán

- **Kiểm tra trạng thái Service**:
  ```powershell
  Get-Service certctl-agent
  ```
- **Chạy Script Chẩn đoán**:
  ```powershell
  .\check-agent.ps1
  ```
- **Gỡ cài đặt**:
  ```powershell
  .\script-install-agent.ps1 -Uninstall
  ```
