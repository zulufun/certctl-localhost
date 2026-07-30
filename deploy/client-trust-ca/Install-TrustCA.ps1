# =============================================================================
# Install Root CA Certificate into Client (Windows) - LocalMachine\Root
# =============================================================================

$ErrorActionPreference = 'Stop'
$SCRIPT_DIR = Split-Path -Parent $MyInvocation.MyCommand.Definition
$CERT_PATH = Join-Path $SCRIPT_DIR "ca.crt"

# Check for Administrator privileges
if (-not ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Warning "Please run this script as Administrator (Right click -> Run as Administrator)."
    Write-Warning "Vui long chay script voi quyen Administrator."
    exit
}

if (-not (Test-Path $CERT_PATH)) {
    Write-Error "Certificate file not found: $CERT_PATH"
    exit
}

Write-Host "Installing Root CA certificate..." -ForegroundColor Cyan

# Install certificate using certutil (more reliable and avoids GUI prompts)
$process = Start-Process -FilePath "certutil.exe" -ArgumentList "-addstore -f `"Root`" `"$CERT_PATH`"" -Wait -NoNewWindow -PassThru

if ($process.ExitCode -eq 0) {
    Write-Host "Installation successful! Your browser will now trust certificates issued by CertCtl." -ForegroundColor Green
    Write-Host "Cai dat thanh cong!"
    Write-Host "Nhan Enter de thoat..."
    Read-Host
} else {
    Write-Error "Failed to install certificate. Exit code: $($process.ExitCode)"
    Write-Host "Nhan Enter de thoat..."
    Read-Host
}
