# Bộ cài certctl Agent - Ubuntu NGINX Edition

**Phiên bản:** Offline - Không cần internet, không cần Docker

---

## 📦 Nội dung bộ cài

| File | Mô tả |
|---|---|
| `certctl-agent` | Binary agent (đã build sẵn cho Linux x86_64) |
| `install-agent.sh` | Script cài đặt tự động dưới dạng systemd service |
| `agent.env.example` | Mẫu file cấu hình - tham khảo |
| `server-ca.crt` | *(Tùy chọn)* CA certificate của server - copy từ server vào đây |
| `README.md` | File hướng dẫn này |

---

## ⚡ Cài đặt nhanh

### Bước 1: Lấy CA certificate từ certctl server

Nếu certctl server dùng self-signed cert (mặc định khi cài qua Docker), bạn cần copy file CA:

```bash
# Chạy lệnh này trên máy certctl server:
docker cp certctl-server:/etc/certctl/tls/ca.crt ./server-ca.crt

# Sau đó copy file server-ca.crt này vào cùng folder bộ cài trên máy NGINX
```

### Bước 2: Phân quyền và chạy script cài đặt

```bash
# Copy cả folder này lên máy Ubuntu, ví dụ:
# scp -r agent-ubuntu-nginx/ user@nginx-server:/tmp/certctl-install/

# SSH vào máy NGINX, vào folder:
cd /tmp/certctl-install

# Cấp quyền thực thi:
chmod +x install-agent.sh certctl-agent

# Chạy cài đặt (cần quyền root):
sudo ./install-agent.sh
```

Script sẽ hỏi:
- **Server URL**: Địa chỉ certctl server (ví dụ: `https://192.168.1.100:8443`)
- **API Key**: Lấy từ trang Settings > API Keys trên Dashboard
- **Agent Name**: Tên định danh (mặc định: hostname)

### Cài đặt không tương tác (batch/automation)

```bash
sudo ./install-agent.sh \
    --server-url https://192.168.1.100:8443 \
    --api-key "your-api-key-here" \
    --ca-bundle ./server-ca.crt \
    --agent-name nginx-web-01
```

---

## 🔧 Quản lý Service

```bash
# Xem trạng thái
systemctl status certctl-agent

# Xem logs realtime
journalctl -u certctl-agent -f

# Xem logs gần nhất
journalctl -u certctl-agent -n 50 --no-pager

# Khởi động lại
sudo systemctl restart certctl-agent

# Dừng service
sudo systemctl stop certctl-agent

# Tắt autostart
sudo systemctl disable certctl-agent

# Gỡ cài đặt
sudo ./install-agent.sh --uninstall
```

---

## 📁 Đường dẫn sau khi cài đặt

| Mục đích | Đường dẫn |
|---|---|
| Binary agent | `/usr/local/bin/certctl-agent` |
| File cấu hình | `/etc/certctl/agent.env` |
| Private keys | `/var/lib/certctl/keys/` (chmod 700) |
| CA certificate | `/etc/certctl/server-ca.crt` |
| systemd service | `/etc/systemd/system/certctl-agent.service` |

---

## ⚙️ Cấu hình thủ công

Sau khi cài, bạn có thể chỉnh file cấu hình:

```bash
sudo nano /etc/certctl/agent.env
```

Sau khi thay đổi, khởi động lại service:

```bash
sudo systemctl restart certctl-agent
```

---

## 🔗 Tích hợp với NGINX

Sau khi agent deploy certificate vào thư mục `/etc/nginx/certs/`, NGINX cần được reload.
Cấu hình **Deployment Target** trên Dashboard với Post-Deploy Command:

```bash
# Reload NGINX sau khi deploy cert mới:
nginx -t && systemctl reload nginx
```

Khai báo trong `nginx.conf`:
```nginx
server {
    listen 443 ssl;
    server_name your-domain.com;

    ssl_certificate     /etc/nginx/certs/your-domain.com.crt;
    ssl_certificate_key /etc/nginx/certs/your-domain.com.key;
}
```

---

## ❓ Troubleshooting

**Agent không xuất hiện trên Dashboard sau 1 phút:**
```bash
# Xem log lỗi chi tiết:
journalctl -u certctl-agent -n 50 --no-pager

# Kiểm tra kết nối tới server:
curl -k https://IP-SERVER:8443/health
```

**Lỗi TLS / Certificate:**
```bash
# Kiểm tra CA cert:
openssl x509 -in /etc/certctl/server-ca.crt -text -noout | grep -E "Subject|Issuer|Not"

# Test kết nối với CA cert:
curl --cacert /etc/certctl/server-ca.crt https://IP-SERVER:8443/health
```

**Lỗi Permission:**
```bash
# Kiểm tra quyền thư mục keys:
ls -la /var/lib/certctl/

# Fix nếu cần:
sudo chmod 700 /var/lib/certctl/keys
sudo chmod 600 /etc/certctl/agent.env
```
