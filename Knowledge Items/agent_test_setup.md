# Agent Test: Cách chạy agent riêng kết nối vào server đang chạy

## Vấn đề thường gặp
Khi vào dashboard, thấy nhiều agents **Offline** (ag-mac-dev, ag-k8s-prod, ag-edge-01, v.v.). Đây là **demo seed data** (dữ liệu giả) được tạo lúc database khởi tạo, không phải agent thật đang chạy.

## Giải pháp: docker-compose.agent-test.yml

File [`deploy/docker-compose.agent-test.yml`](file:///c:/D_Disk/certctl-1/deploy/docker-compose.agent-test.yml) chỉ chứa agent, **không có server/postgres**. Nó kết nối trực tiếp vào network của server đang chạy.

### Yêu cầu trước khi chạy

1. Server production đang chạy và healthy:
   ```
   docker compose -f deploy/docker-compose.yml ps
   ```
2. CA cert của server đã được copy vào `deploy/test/certs/`:
   ```powershell
   New-Item -ItemType Directory -Force deploy/test/certs
   docker cp certctl-server:/etc/certctl/tls/ca.crt deploy/test/certs/ca.crt
   docker cp certctl-server:/etc/certctl/tls/server.crt deploy/test/certs/server.crt
   docker cp certctl-server:/etc/certctl/tls/server.key deploy/test/certs/server.key
   ```
   > **Lưu ý**: Cần redo bước này mỗi khi server bị recreate (vì TLS cert sẽ được gen lại).

### Chạy agent test

```bash
docker compose -f deploy/docker-compose.agent-test.yml up -d --build
```

Sau khoảng 1-2 phút (build Go binary), sẽ thấy `agent-test-local-01` và `agent-test-local-02` xuất hiện **Online** trong dashboard.

### Dừng agent test

```bash
docker compose -f deploy/docker-compose.agent-test.yml down -v
```

### Xem log của agent

```bash
docker compose -f deploy/docker-compose.agent-test.yml logs -f
```

## Xóa Demo Agents (Offline) trong Database

Nếu muốn dọn sạch demo agents khỏi dashboard:

```sql
-- Chạy trong container postgres:
-- docker exec certctl-postgres psql -U certctl -d certctl

SET session_replication_role = replica;
DELETE FROM agents WHERE id IN (
  'ag-mac-dev','ag-k8s-prod','ag-edge-01','ag-iis-prod',
  'ag-web-staging','cloud-azure-kv','cloud-gcp-sm','cloud-aws-sm',
  'ag-data-prod','ag-web-prod','ag-lb-prod','agent-demo-1','server-scanner'
);
SET session_replication_role = DEFAULT;
```
> **Lý do dùng `session_replication_role = replica`**: Có nhiều bảng liên kết với `agents` (discovery_scans, deployment_targets, v.v.). Thay vì xóa theo thứ tự foreign key, ta tạm thời disable FK check để xóa nhanh hơn.

## Sơ đồ kết nối

```
deploy/docker-compose.yml     deploy/docker-compose.agent-test.yml
─────────────────────────     ─────────────────────────────────────
certctl-server (8443)    ←──  certctl-agent-test-01
certctl-postgres              certctl-agent-test-02
                              (joined via external network: certctl_certctl-network)
```
