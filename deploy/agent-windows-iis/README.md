# Bộ cài certctl Agent - Windows IIS Edition

**Phiên bản:** Offline - Không cần internet, không cần Docker

---

## 📦 Nội dung bộ cài

| File | Mô tả |
|---|---|
| `certctl-agent.exe` | Binary agent (đã build sẵn cho Windows x64) |
| `install-agent.ps1` | Script cài đặt tự động dưới dạng Windows Service |
| `agent.env.example` | Mẫu file cấu hình - tham khảo |
| `server-ca.crt` | *(Tùy chọn)* CA certificate của server - copy từ server vào đây |
| `README.md` | File hướng dẫn này |

---

## ⚡ Cài đặt nhanh

### Bước 1: Lấy CA certificate từ certctl server

Nếu certctl server dùng self-signed cert (mặc định khi cài qua Docker), bạn cần copy file CA:

```powershell
# Chạy lệnh này trên máy certctl server (hoặc nhờ admin server chạy):
docker cp certctl-server:/etc/certctl/tls/ca.crt .\server-ca.crt

# Sau đó copy file server-ca.crt này vào cùng folder bộ cài
```

### Bước 2: Chạy script cài đặt

> ⚠️ **Yêu cầu:** Chạy PowerShell với quyền **Administrator**

```powershell
# Mở PowerShell as Administrator, cd vào folder này rồi chạy:
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\install-agent.ps1
```

Script sẽ hỏi:
- **Server URL**: Địa chỉ certctl server (ví dụ: `https://192.168.1.100:8443`)
- **API Key**: Lấy từ trang Settings > API Keys trên Dashboard
- **Agent Name**: Tên định danh (mặc định: tên máy tính)

### Cài đặt không tương tác (tự động hóa)

```powershell
.\install-agent.ps1 `
    -ServerURL "https://192.168.1.100:8443" `
    -ApiKey "your-api-key-here" `
    -CaBundlePath ".\server-ca.crt"
```

---

## 🔧 Quản lý Service

```powershell
# Xem trạng thái
Get-Service certctl-agent

# Xem logs realtime
Get-WinEvent -ProviderName certctl-agent -MaxEvents 20

# Khởi động lại
Restart-Service certctl-agent

# Dừng service
Stop-Service certctl-agent

# Gỡ cài đặt
.\install-agent.ps1 -Uninstall
```

---

## 📁 Đường dẫn sau khi cài đặt

| Mục đích | Đường dẫn |
|---|---|
| Binary agent | `C:\Program Files\certctl-agent\certctl-agent.exe` |
| File cấu hình | `C:\ProgramData\certctl\agent.env` |
| Private keys | `C:\ProgramData\certctl\keys\` |
| CA certificate | `C:\ProgramData\certctl\server-ca.crt` |

---

## ⚙️ Cấu hình thủ công

Sau khi cài, bạn có thể chỉnh file cấu hình:

```
C:\ProgramData\certctl\agent.env
```

Sau khi thay đổi, khởi động lại service:

```powershell
Restart-Service certctl-agent
```

---

## ❓ Troubleshooting

**Agent không xuất hiện trên Dashboard sau 1 phút:**
```powershell
# Xem log lỗi:
Get-WinEvent -ProviderName certctl-agent -MaxEvents 50 | Format-List TimeCreated, Message

# Kiểm tra service đang chạy:
Get-Service certctl-agent
```

**Lỗi TLS / Certificate:**
- Đảm bảo file `server-ca.crt` đúng và trỏ đúng trong `agent.env`
- Thêm dòng `CERTCTL_SERVER_TLS_INSECURE_SKIP_VERIFY=true` vào `agent.env` để test (không dùng production)

**Lỗi API Key:**
- Vào Dashboard → Settings → API Keys → tạo key mới
- Cập nhật `CERTCTL_API_KEY` trong `C:\ProgramData\certctl\agent.env`
- Restart service
