# =============================================================================
# get-server-ca.ps1
# Script tiện ích: Lấy CA certificate từ certctl-server đang chạy
# và copy vào 2 bộ cài agent để dùng offline
# =============================================================================
# Chạy lệnh này trên máy đang chạy certctl-server (máy có Docker)
# =============================================================================

$SCRIPT_DIR = Split-Path -Parent $MyInvocation.MyCommand.Definition

Write-Host "Lấy CA certificate từ certctl-server..." -ForegroundColor Yellow

# Kiểm tra container đang chạy
$container = docker ps --filter "name=certctl-server" --format "{{.Names}}" 2>&1
if (-not $container -or $container -notmatch "certctl-server") {
    Write-Host "LỖI: Container 'certctl-server' không chạy!" -ForegroundColor Red
    Write-Host "Hãy chạy 'docker ps' để kiểm tra." -ForegroundColor Red
    exit 1
}

# Copy CA cert
docker cp certctl-server:/etc/certctl/tls/ca.crt "$SCRIPT_DIR\agent-windows-iis\server-ca.crt"
docker cp certctl-server:/etc/certctl/tls/ca.crt "$SCRIPT_DIR\agent-ubuntu-nginx\server-ca.crt"

Write-Host "OK! CA certificate đã được copy vào:" -ForegroundColor Green
Write-Host "  - $SCRIPT_DIR\agent-windows-iis\server-ca.crt" -ForegroundColor Cyan
Write-Host "  - $SCRIPT_DIR\agent-ubuntu-nginx\server-ca.crt" -ForegroundColor Cyan
Write-Host ""
Write-Host "Bây giờ bạn có thể copy các folder bộ cài ra máy agent." -ForegroundColor Green
