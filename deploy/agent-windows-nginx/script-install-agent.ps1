#Requires -RunAsAdministrator
<#
.SYNOPSIS
    certctl Agent - Bộ cài đặt Offline dành cho Windows NGINX
    
.DESCRIPTION
    Script cài đặt certctl-agent lên Windows dưới dạng Windows Service.
    Chạy hoàn toàn OFFLINE - không cần internet, không cần Docker.
    Toàn bộ files cần thiết đã có trong folder này.

.PARAMETER ServerURL
    Địa chỉ certctl server (ví dụ: https://192.168.1.100:8443)

.PARAMETER ApiKey
    API Key để kết nối với certctl server

.PARAMETER AgentName
    Tên định danh của agent trong fleet (mặc định: tên máy tính)

.PARAMETER AgentID
    Agent ID (để trống để tự động đặt bằng tên máy tính)

.PARAMETER CaBundlePath
    Đường dẫn tới file CA certificate của server (nếu server dùng self-signed cert)
    Để trống nếu server dùng CA được tin cậy bởi Windows

.PARAMETER DiscoveryDirs
    Các thư mục cần scan để tìm certificates hiện có (phân cách bằng dấu phẩy)
    Ví dụ: "C:\nginx\conf,C:\ssl"

.PARAMETER NoStart
    Cài đặt nhưng không khởi động service

.PARAMETER Uninstall
    Gỡ cài đặt agent

.EXAMPLE
    # Cài đặt tương tác (sẽ hỏi thông tin):
    .\install-agent.ps1

    # Cài đặt không tương tác (truyền tham số trực tiếp):
    .\install-agent.ps1 -ServerURL "https://192.168.1.100:8443" -ApiKey "demo-secret-123" -CaBundlePath ".\server-ca.crt"

    # Gỡ cài đặt:
    .\install-agent.ps1 -Uninstall
#>

[CmdletBinding()]
param(
    [string]$ServerURL    = "",
    [string]$ApiKey       = "",
    [string]$AgentName    = "",
    [string]$AgentID      = "",
    [string]$CaBundlePath = "",
    [string]$DiscoveryDirs = "",
    [switch]$NoStart      = $false,
    [switch]$Uninstall    = $false,
    [switch]$Quiet        = $false
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# ─── Constants ────────────────────────────────────────────────────────────────
$SERVICE_NAME    = "certctl-agent"
$DISPLAY_NAME    = "certctl Agent - Certificate Lifecycle Management"
$INSTALL_DIR     = "C:\Program Files\certctl-agent"
$CONFIG_DIR      = "C:\ProgramData\certctl"
$KEY_DIR         = "C:\ProgramData\certctl\keys"
$LOG_DIR         = "C:\ProgramData\certctl\logs"
$CONFIG_FILE     = "$CONFIG_DIR\agent.env"
$BINARY_NAME     = "certctl-agent.exe"
$SCRIPT_DIR      = Split-Path -Parent $MyInvocation.MyCommand.Definition

# ─── Colors ───────────────────────────────────────────────────────────────────
function Write-Green  { param($msg) Write-Host $msg -ForegroundColor Green  }
function Write-Yellow { param($msg) Write-Host $msg -ForegroundColor Yellow }
function Write-Red    { param($msg) Write-Host $msg -ForegroundColor Red    }
function Write-Cyan   { param($msg) Write-Host $msg -ForegroundColor Cyan   }

# ─── Banner ───────────────────────────────────────────────────────────────────
function Show-Banner {
    Write-Cyan  "=================================================="
    Write-Cyan  "  certctl Agent Installer - Windows NGINX Edition"
    Write-Cyan  "  Chế độ: OFFLINE (không cần internet)"
    Write-Cyan  "=================================================="
    Write-Host ""
}

# ─── Uninstall ────────────────────────────────────────────────────────────────
function Invoke-Uninstall {
    Write-Yellow "Đang gỡ cài đặt certctl-agent..."
    
    # Stop and remove service
    $svc = Get-Service -Name $SERVICE_NAME -ErrorAction SilentlyContinue
    if ($svc) {
        if ($svc.Status -eq "Running") {
            Write-Yellow "Đang dừng service..."
            Stop-Service -Name $SERVICE_NAME -Force
            Start-Sleep -Seconds 2
        }
        Write-Yellow "Đang xóa service..."
        sc.exe delete $SERVICE_NAME | Out-Null
        Write-Green "Service đã xóa."
    } else {
        Write-Yellow "Service không tồn tại, bỏ qua."
    }

    # Remove installed binary
    if (Test-Path $INSTALL_DIR) {
        Remove-Item -Path $INSTALL_DIR -Recurse -Force
        Write-Green "Đã xóa thư mục: $INSTALL_DIR"
    }

    Write-Host ""
    Write-Green "Gỡ cài đặt hoàn tất!"
    Write-Yellow "Lưu ý: Config và keys tại '$CONFIG_DIR' được giữ nguyên."
    Write-Yellow "Xóa thủ công nếu cần: Remove-Item '$CONFIG_DIR' -Recurse -Force"
}

# ─── Check binary exists ──────────────────────────────────────────────────────
function Assert-BinaryExists {
    $binaryPath = Join-Path $SCRIPT_DIR $BINARY_NAME
    if (-not (Test-Path $binaryPath)) {
        Write-Red "LỖI: Không tìm thấy file '$BINARY_NAME' trong thư mục này!"
        Write-Red "Đường dẫn tìm: $binaryPath"
        Write-Red ""
        Write-Red "Hãy đảm bảo bộ cài đủ file:"
        Write-Red "  - $BINARY_NAME   (binary agent)"
        Write-Red "  - install-agent.ps1  (script này)"
        Write-Red "  - agent.env.example  (mẫu cấu hình)"
        Write-Red "  - server-ca.crt      (nếu server dùng self-signed cert)"
        exit 1
    }
    return $binaryPath
}

# ─── Interactive prompt ────────────────────────────────────────────────────────
function Get-Configuration {
    Write-Host ""
    Write-Yellow "=== Cấu hình kết nối certctl Server ==="
    Write-Host ""

    # Tự động nạp cấu hình mặc định từ file agent.env nếu tồn tại
    $defaultServerURL = ""
    $defaultApiKey = ""
    $defaultAgentName = ""
    $defaultAgentID = ""
    $defaultDiscoveryDirs = ""
    $defaultCaBundlePath = ""

    $templateEnv = Join-Path $SCRIPT_DIR "agent.env"
    if (-not (Test-Path $templateEnv)) {
        $templateEnv = Join-Path $CONFIG_DIR "agent.env"
    }

    if (Test-Path $templateEnv) {
        Write-Cyan "  [Tự động] Đọc giá trị mặc định từ file agent.env..."
        $envLines = Get-Content $templateEnv
        foreach ($line in $envLines) {
            $line = $line.Trim()
            if ($line -and -not $line.StartsWith("#")) {
                $idx = $line.IndexOf("=")
                if ($idx -gt 0) {
                    $key = $line.Substring(0, $idx).Trim()
                    $val = $line.Substring($idx + 1).Trim()
                    switch ($key) {
                        "CERTCTL_SERVER_URL"            { $defaultServerURL = $val }
                        "CERTCTL_API_KEY"               { $defaultApiKey = $val }
                        "CERTCTL_AGENT_NAME"            { $defaultAgentName = $val }
                        "CERTCTL_AGENT_ID"              { $defaultAgentID = $val }
                        "CERTCTL_DISCOVERY_DIRS"        { $defaultDiscoveryDirs = $val }
                        "CERTCTL_SERVER_CA_BUNDLE_PATH" { $defaultCaBundlePath = $val }
                    }
                }
            }
        }
    }

    # Server URL
    if ([string]::IsNullOrWhiteSpace($script:ServerURL)) {
        if ($Quiet) {
            if (-not [string]::IsNullOrWhiteSpace($defaultServerURL)) {
                $script:ServerURL = $defaultServerURL
            } else {
                Write-Red "LỖI: Server URL không được để trống trong chế độ Quiet!"
                exit 1
            }
        } else {
            $promptText = "  Nhập certctl Server URL"
            if (-not [string]::IsNullOrWhiteSpace($defaultServerURL)) {
                $promptText += " (Enter để dùng: '$defaultServerURL')"
            } else {
                $promptText += " (ví dụ: https://192.168.1.100:8443)"
            }
            $inputVal = Read-Host $promptText
            $script:ServerURL = if ([string]::IsNullOrWhiteSpace($inputVal)) { $defaultServerURL } else { $inputVal.Trim() }
            if ([string]::IsNullOrWhiteSpace($script:ServerURL)) {
                Write-Red "LỖI: Server URL không được để trống!"
                exit 1
            }
        }
    }

    # API Key
    if ([string]::IsNullOrWhiteSpace($script:ApiKey)) {
        if ($Quiet) {
            if (-not [string]::IsNullOrWhiteSpace($defaultApiKey)) {
                $script:ApiKey = $defaultApiKey
            } else {
                Write-Red "LỖI: API Key không được để trống trong chế độ Quiet!"
                exit 1
            }
        } else {
            $promptText = "  Nhập API Key"
            if (-not [string]::IsNullOrWhiteSpace($defaultApiKey)) {
                $promptText += " (Enter để dùng giá trị từ agent.env)"
            }
            $secureKey = Read-Host $promptText -AsSecureString
            $inputVal = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
                [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureKey)
            )
            $script:ApiKey = if ([string]::IsNullOrWhiteSpace($inputVal)) { $defaultApiKey } else { $inputVal.Trim() }
            if ([string]::IsNullOrWhiteSpace($script:ApiKey)) {
                Write-Red "LỖI: API Key không được để trống!"
                exit 1
            }
        }
    }

    # Agent Name
    if ([string]::IsNullOrWhiteSpace($script:AgentName)) {
        $fallbackName = $env:COMPUTERNAME.ToLower()
        $defName = if (-not [string]::IsNullOrWhiteSpace($defaultAgentName)) { $defaultAgentName } else { $fallbackName }
        if ($Quiet) {
            $script:AgentName = $defName
        } else {
            $inputVal = Read-Host "  Nhập tên Agent (Enter để dùng mặc định: $defName)"
            $script:AgentName = if ([string]::IsNullOrWhiteSpace($inputVal)) { $defName } else { $inputVal.Trim() }
        }
    }

    # Agent ID
    if ([string]::IsNullOrWhiteSpace($script:AgentID)) {
        $fallbackID = $env:COMPUTERNAME.ToLower()
        $defID = if (-not [string]::IsNullOrWhiteSpace($defaultAgentID)) { $defaultAgentID } else { $fallbackID }
        if ($Quiet) {
            $script:AgentID = $defID
        } else {
            $inputVal = Read-Host "  Nhập Agent ID (Enter để dùng mặc định: $defID)"
            $script:AgentID = if ([string]::IsNullOrWhiteSpace($inputVal)) { $defID } else { $inputVal.Trim() }
        }
    }

    # CA Bundle
    if ([string]::IsNullOrWhiteSpace($script:CaBundlePath)) {
        $autoCa = Join-Path $SCRIPT_DIR "server-ca.crt"
        if (Test-Path $autoCa) {
            Write-Green "  [Tự động] Tìm thấy server-ca.crt trong bộ cài, sẽ sử dụng file này."
            $script:CaBundlePath = $autoCa
        } elseif ((-not [string]::IsNullOrWhiteSpace($defaultCaBundlePath)) -and (Test-Path $defaultCaBundlePath)) {
            if ($Quiet) {
                $script:CaBundlePath = $defaultCaBundlePath
            } else {
                $inputVal = Read-Host "  Đường dẫn CA bundle (Enter để dùng mặc định: $defaultCaBundlePath)"
                $script:CaBundlePath = if ([string]::IsNullOrWhiteSpace($inputVal)) { $defaultCaBundlePath } else { $inputVal.Trim() }
            }
        } elseif (-not $Quiet) {
            $inputVal = Read-Host "  Đường dẫn CA bundle (Enter để bỏ qua - chỉ dùng khi server có self-signed cert)"
            $script:CaBundlePath = if ([string]::IsNullOrWhiteSpace($inputVal)) { "" } else { $inputVal.Trim() }
        }
    }

    # Discovery dirs
    if ([string]::IsNullOrWhiteSpace($script:DiscoveryDirs)) {
        $fallbackDirs = "C:\inetpub\wwwroot,C:\inetpub\certs"
        $defDirs = if (-not [string]::IsNullOrWhiteSpace($defaultDiscoveryDirs)) { $defaultDiscoveryDirs } else { $fallbackDirs }
        if ($Quiet) {
            $script:DiscoveryDirs = $defDirs
        } else {
            $inputVal = Read-Host "  Thư mục scan certificates (Enter để dùng mặc định: $defDirs)"
            $script:DiscoveryDirs = if ([string]::IsNullOrWhiteSpace($inputVal)) { $defDirs } else { $inputVal.Trim() }
        }
    }
}

# ─── Create directories ────────────────────────────────────────────────────────
function New-Directories {
    Write-Yellow "Tạo thư mục cài đặt..."
    New-Item -ItemType Directory -Force -Path $INSTALL_DIR | Out-Null
    New-Item -ItemType Directory -Force -Path $CONFIG_DIR  | Out-Null
    New-Item -ItemType Directory -Force -Path $KEY_DIR     | Out-Null
    New-Item -ItemType Directory -Force -Path $LOG_DIR     | Out-Null

    # Restrict permissions on key directory
    $acl = Get-Acl $KEY_DIR
    $acl.SetAccessRuleProtection($true, $false)
    $rule = New-Object System.Security.AccessControl.FileSystemAccessRule(
        "SYSTEM", "FullControl", "ContainerInherit,ObjectInherit", "None", "Allow"
    )
    $acl.AddAccessRule($rule)
    $rule2 = New-Object System.Security.AccessControl.FileSystemAccessRule(
        "Administrators", "FullControl", "ContainerInherit,ObjectInherit", "None", "Allow"
    )
    $acl.AddAccessRule($rule2)
    Set-Acl -Path $KEY_DIR -AclObject $acl

    Write-Green "  [OK] $INSTALL_DIR"
    Write-Green "  [OK] $CONFIG_DIR"
    Write-Green "  [OK] $KEY_DIR (quyền truy cập giới hạn)"
    Write-Green "  [OK] $LOG_DIR"
}

# ─── Copy binary ──────────────────────────────────────────────────────────────
function Install-Binary {
    param([string]$SourcePath)
    
    Write-Yellow "Cài đặt binary agent..."
    $destPath = Join-Path $INSTALL_DIR $BINARY_NAME
    Copy-Item -Path $SourcePath -Destination $destPath -Force
    Write-Green "  [OK] Binary: $destPath"
    return $destPath
}

# ─── Copy CA cert if provided ─────────────────────────────────────────────────
function Install-CaCert {
    $resolvedCaPath = ""
    
    if (-not [string]::IsNullOrWhiteSpace($script:CaBundlePath)) {
        if (Test-Path $script:CaBundlePath) {
            $destCa = Join-Path $CONFIG_DIR "server-ca.crt"
            Copy-Item -Path $script:CaBundlePath -Destination $destCa -Force
            $resolvedCaPath = $destCa
            Write-Green "  [OK] CA certificate: $destCa"
        } else {
            Write-Yellow "  [WARN] Không tìm thấy file CA: $($script:CaBundlePath) - bỏ qua"
        }
    }
    
    return $resolvedCaPath
}

# ─── Write config file ────────────────────────────────────────────────────────
function Write-ConfigFile {
    param([string]$CaDestPath)

    Write-Yellow "Ghi file cấu hình..."
    
    $caLine = ""
    if (-not [string]::IsNullOrWhiteSpace($CaDestPath)) {
        $caLine = "CERTCTL_SERVER_CA_BUNDLE_PATH=$CaDestPath"
    } else {
        $caLine = "# CERTCTL_SERVER_CA_BUNDLE_PATH=C:\ProgramData\certctl\server-ca.crt"
    }

    $discoveryLine = ""
    if (-not [string]::IsNullOrWhiteSpace($script:DiscoveryDirs)) {
        $discoveryLine = "CERTCTL_DISCOVERY_DIRS=$($script:DiscoveryDirs)"
    } else {
        $discoveryLine = "# CERTCTL_DISCOVERY_DIRS=C:\inetpub\certs"
    }

    $configContent = @"
# certctl Agent Configuration - Windows IIS
# Được tạo bởi install-agent.ps1 vào $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

# ─── Thông tin Agent ────────────────────────────────────────────────
CERTCTL_AGENT_ID=$($script:AgentID)
CERTCTL_AGENT_NAME=$($script:AgentName)

# ─── Kết nối Server ─────────────────────────────────────────────────
CERTCTL_SERVER_URL=$($script:ServerURL)
CERTCTL_API_KEY=$($script:ApiKey)

# ─── TLS Trust ──────────────────────────────────────────────────────
# Nếu server dùng self-signed cert hoặc Private CA, bỏ comment dòng dưới:
$caLine
# Dev/test only - BỎ TẮT trong production:
# CERTCTL_SERVER_TLS_INSECURE_SKIP_VERIFY=true

# ─── Key Storage ────────────────────────────────────────────────────
CERTCTL_KEY_DIR=$KEY_DIR
CERTCTL_KEYGEN_MODE=agent

# ─── Discovery ──────────────────────────────────────────────────────
$discoveryLine

# ─── Logging ────────────────────────────────────────────────────────
CERTCTL_LOG_LEVEL=info
"@

    $Utf8NoBomEncoding = New-Object System.Text.UTF8Encoding $False
    [System.IO.File]::WriteAllText($CONFIG_FILE, $configContent, $Utf8NoBomEncoding)

    # Restrict permissions on config file (chứa API key)
    $acl = Get-Acl $CONFIG_FILE
    $acl.SetAccessRuleProtection($true, $false)
    $sysRule = New-Object System.Security.AccessControl.FileSystemAccessRule("SYSTEM", "FullControl", "None", "None", "Allow")
    $admRule = New-Object System.Security.AccessControl.FileSystemAccessRule("Administrators", "FullControl", "None", "None", "Allow")
    $acl.AddAccessRule($sysRule)
    $acl.AddAccessRule($admRule)
    Set-Acl -Path $CONFIG_FILE -AclObject $acl

    Write-Green "  [OK] Config: $CONFIG_FILE (quyền truy cập giới hạn)"
}

# ─── Create NSSM wrapper or use sc.exe ────────────────────────────────────────
function Install-WindowsService {
    param([string]$BinaryPath)

    Write-Yellow "Đăng ký Windows Service..."

    # Remove old service if exists
    $existing = Get-Service -Name $SERVICE_NAME -ErrorAction SilentlyContinue
    if ($existing) {
        Write-Yellow "  Service cũ tồn tại, đang xóa..."
        if ($existing.Status -eq "Running") {
            Stop-Service -Name $SERVICE_NAME -Force
            Start-Sleep -Seconds 2
        }
        $winswDest = Join-Path $INSTALL_DIR "certctl-agent-service.exe"
        if (Test-Path $winswDest) {
            & $winswDest uninstall | Out-Null
        } else {
            sc.exe delete $SERVICE_NAME | Out-Null
        }
        Start-Sleep -Seconds 1
    }

    # Setup WinSW
    $winswSrc = Join-Path $SCRIPT_DIR "winsw.exe"
    if (-not (Test-Path $winswSrc)) {
        Write-Red "LỖI: Không tìm thấy winsw.exe trong thư mục cài đặt!"
        exit 1
    }

    $winswDest = Join-Path $INSTALL_DIR "certctl-agent-service.exe"
    Copy-Item -Path $winswSrc -Destination $winswDest -Force

    # Generate XML for WinSW
    $xmlPath = Join-Path $INSTALL_DIR "certctl-agent-service.xml"
    $xmlContent = @"
<service>
  <id>$SERVICE_NAME</id>
  <name>$DISPLAY_NAME</name>
  <description>certctl Agent - tự động gia hạn và deploy TLS certificates cho IIS</description>
  <executable>$BinaryPath</executable>
  <log mode="roll"></log>
  <onfailure action="restart" delay="10 sec"/>
  <onfailure action="restart" delay="30 sec"/>
  <onfailure action="restart" delay="60 sec"/>
"@

    # Add environment variables from CONFIG_FILE to XML
    if (Test-Path $CONFIG_FILE) {
        Get-Content $CONFIG_FILE | ForEach-Object {
            $line = $_.Trim()
            if ($line -and -not $line.StartsWith("#")) {
                $idx = $line.IndexOf("=")
                if ($idx -gt 0) {
                    $key = $line.Substring(0, $idx)
                    $val = $line.Substring($idx + 1)
                    $val = $val -replace "&", "&amp;" -replace "<", "&lt;" -replace ">", "&gt;" -replace '"', "&quot;" -replace "'", "&apos;"
                    $xmlContent += "`n  <env name=`"$key`" value=`"$val`"/>"
                }
            }
        }
    }

    $xmlContent += "`n</service>"
    $Utf8NoBomEncoding = New-Object System.Text.UTF8Encoding $False
    [System.IO.File]::WriteAllText($xmlPath, $xmlContent, $Utf8NoBomEncoding)

    # Install service
    & $winswDest install | Out-Null
    if ($LASTEXITCODE -ne 0) {
        Write-Red "LỖI: Không thể tạo Windows Service qua WinSW (exit code: $LASTEXITCODE)"
        exit 1
    }

    Write-Green "  [OK] Service đã đăng ký: $SERVICE_NAME (qua WinSW)"
    Write-Green "  [OK] Khởi động tự động: Có"
    Write-Green "  [OK] Khởi động lại khi lỗi: Có (10s / 30s / 60s)"
}

# ─── Start service ────────────────────────────────────────────────────────────
function Start-AgentService {
    if ($NoStart) {
        Write-Yellow "Bỏ qua khởi động service (tham số -NoStart)."
        return
    }

    Write-Yellow "Khởi động certctl-agent service..."
    try {
        Start-Service -Name $SERVICE_NAME
        Start-Sleep -Seconds 3
        $svc = Get-Service -Name $SERVICE_NAME
        if ($svc.Status -eq "Running") {
            Write-Green "  [OK] Service đang chạy!"
        } else {
            Write-Red "  [WARN] Service chưa chạy. Trạng thái: $($svc.Status)"
            Write-Yellow "  Kiểm tra logs: Get-EventLog -LogName Application -Source '$SERVICE_NAME' -Newest 10"
        }
    } catch {
        Write-Red "  [WARN] Không thể khởi động service: $_"
        Write-Yellow "  Thử khởi động thủ công: Start-Service '$SERVICE_NAME'"
    }
}

# ─── Print summary ────────────────────────────────────────────────────────────
function Show-Summary {
    $svc = Get-Service -Name $SERVICE_NAME -ErrorAction SilentlyContinue
    $status = if ($svc) { $svc.Status } else { "Không xác định" }

    Write-Host ""
    Write-Green "=================================================="
    Write-Green "  certctl Agent - Cài đặt hoàn tất!"
    Write-Green "=================================================="
    Write-Host ""
    Write-Host "Thông tin cài đặt:"
    Write-Cyan  "  Agent ID    : $($script:AgentID)"
    Write-Cyan  "  Agent Name  : $($script:AgentName)"
    Write-Cyan  "  Server URL  : $($script:ServerURL)"
    Write-Cyan  "  Trạng thái  : $status"
    Write-Host ""
    Write-Host "Đường dẫn:"
    Write-Cyan  "  Binary      : $(Join-Path $INSTALL_DIR $BINARY_NAME)"
    Write-Cyan  "  Config      : $CONFIG_FILE"
    Write-Cyan  "  Keys        : $KEY_DIR"
    Write-Cyan  "  Logs        : $LOG_DIR"
    Write-Host ""
    Write-Host "Lệnh quản lý:"
    Write-Yellow "  Xem trạng thái : Get-Service '$SERVICE_NAME'"
    Write-Yellow "  Xem logs       : Get-WinEvent -ProviderName '$SERVICE_NAME' -MaxEvents 20"
    Write-Yellow "  Xem log đơn giản: Get-EventLog -LogName Application -Newest 20 | Where Source -eq '$SERVICE_NAME'"
    Write-Yellow "  Dừng service   : Stop-Service '$SERVICE_NAME'"
    Write-Yellow "  Khởi động lại  : Restart-Service '$SERVICE_NAME'"
    Write-Yellow "  Gỡ cài đặt    : .\install-agent.ps1 -Uninstall"
    Write-Host ""
    Write-Host "Bước tiếp theo:"
    Write-Cyan  "  1. Truy cập Dashboard: $($script:ServerURL)"
    Write-Cyan  "  2. Vào menu 'Agents' - Agent '$($script:AgentName)' sẽ xuất hiện trong ~30 giây"
    Write-Cyan  "  3. Cấu hình Deployment Target để deploy cert lên IIS"
    Write-Host ""
}

# ─── Main ─────────────────────────────────────────────────────────────────────
function Main {
    Show-Banner

    if ($Uninstall) {
        Invoke-Uninstall
        exit 0
    }

    # Step 1: Verify binary present in package
    $binarySource = Assert-BinaryExists

    # Step 2: Get config interactively or from params
    Get-Configuration

    # Step 3: Create directories
    New-Directories

    # Step 4: Install binary
    $installedBinaryPath = Install-Binary -SourcePath $binarySource

    # Step 5: Install CA cert if available
    $caDestPath = Install-CaCert

    # Step 6: Write config file
    Write-ConfigFile -CaDestPath $caDestPath

    # Step 7: Register Windows Service
    Install-WindowsService -BinaryPath $installedBinaryPath

    # Step 8: Start service
    Start-AgentService

    # Step 9: Show summary
    Show-Summary
}

Main
