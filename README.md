<p align="center">
  <img src="docs/screenshots/logo/certctl-logo.png" alt="certctl logo" width="350">
</p>

# certctl — Nền tảng tự động hóa vòng đời chứng chỉ TLS/SSL

**certctl** là giải pháp tự động hóa toàn bộ vòng đời chứng chỉ TLS/SSL (cấp phát, gia hạn, tự động triển khai) trên hệ thống On-Premise & Cloud với độ an toàn cao và không cần can thiệp thủ công.

---

## 📌 Tổng quan hệ thống

Hệ thống hoạt động theo mô hình **Control Plane & Agent** (Pull-based architecture):
* **Control Plane (certctl-server):** Quản lý tập trung CA Issuers, Deployment Targets, Jobs, theo dõi cảnh báo và cấp phát/gia hạn chứng chỉ.
* **Agent (certctl-agent):** Chạy ngầm trên máy chủ mục tiêu (NGINX, Apache, IIS, F5, K8s,...), tự sinh Private Key tại chỗ (Private key **không bao giờ** gửi về server) và tự động nhận/triển khai chứng chỉ khi có yêu cầu.

```
┌─────────────────┐       HTTPS Poll       ┌──────────────────┐
│  certctl Server │ ◄────────────────────  │  certctl Agent   │
│  (Control Plane)│                        │ (NGINX/Apache/...)│
└────────┬────────┘                        └─────────┬────────┘
         │ (Tích hợp CAs)                            │ (Deploy Cert & Key)
┌────────┴────────┐                        ┌─────────┴────────┐
│ Local CA / ACME │                        │ Web Server Config│
└─────────────────┘                        └──────────────────┘
```

---

## ✨ Tính năng nổi bật

* **Đa dạng CA (Issuers):** Tích hợp Local CA, Let's Encrypt / ACME, Smallstep (`step-ca`), Vault PKI, Microsoft ADCS, AWS ACM, DigiCert, Sectigo,...
* **Tự động triển khai (Targets):** NGINX, Apache, IIS, HAProxy, Traefik, Caddy, F5 BIG-IP, Java Keystore, K8s Secrets,...
* **Bảo mật tuyệt đối (Agent-Keygen):** Private Key tự động sinh tại máy chủ Agent và lưu an toàn ở local, không chuyển qua mạng.
* **Tự động quét & phát hiện (Discovery):** Tự phát hiện file chứng chỉ trên hệ thống và quét cổng TLS trên dải mạng.
* **Phân quyền & Kiểm duyệt (RBAC & Approval):** Phân quyền chi tiết, hỗ trợ quy trình duyệt 2 người cho các chứng chỉ quan trọng.
* **Cảnh báo đa kênh:** Gửi thông báo hết hạn/lỗi qua Slack, Teams, Email, Webhook.

---

## 🚀 Khởi động nhanh (Quick Start)

### 1. Chạy certctl Server (Docker Compose)

```bash
git clone https://github.com/zulufun/certctl-localhost.git
cd certctl-localhost

# Khởi động bản Demo (đầy đủ dữ liệu mẫu & Dashboard):
./deploy/demo-up.sh -d --build
```
> Truy cập Dashboard tại: **`https://localhost:8443`**

### 2. Cài đặt Agent trên máy chủ

* **Linux (Ubuntu/Debian):**
  Tải bộ cài offline tại `deploy/agent-ubuntu-nginx` (hoặc `agent-ubuntu-apache`) và chạy:
  ```bash
  sudo ./script-install-agent.sh
  ```
* **Windows (IIS):**
  Tải bộ cài tại `deploy/agent-windows-iis` và chạy với PowerShell:
  ```powershell
  .\script-install-agent.ps1
  ```

---

## 📁 Cấu trúc thư mục dự án

* `cmd/`: Mã nguồn các binary (`certctl-server`, `certctl-agent`, `mcp-server`)
* `internal/`: Logic xử lý lõi (Connectors, Issuers, Targets, Auth, RBAC, Services)
* `web/`: Giao diện Dashboard (React + TypeScript + Vite)
* `deploy/`: Bộ cài đặt Offline Agent, Docker Compose, Helm Charts
* `docs/`: Tài liệu chi tiết và Runbooks

---

## 📄 Giấy phép (License)
Dự án phát hành theo giấy phép [Business Source License 1.1 (BSL 1.1)](LICENSE).
