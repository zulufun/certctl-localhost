#Requires -RunAsAdministrator
<#
.SYNOPSIS
    certctl Agent - Kiem tra trang thai va xuat log de debug
.DESCRIPTION
    Ket xuat toan bo thong tin debug cua certctl-agent Windows Service.
    Chay script nay (Run as Administrator) roi copy toan bo output de gui support.
#>

$OUTPUT_FILE = "$PSScriptRoot\agent-debug-$(Get-Date -Format 'yyyyMMdd-HHmmss').txt"
$SERVICE_NAME = "certctl-agent"
$INSTALL_DIR  = "C:\Program Files\certctl-agent"
$CONFIG_FILE  = "C:\ProgramData\certctl\agent.env"

function Section([string]$title) {
    $line = "=" * 60
    Write-Output "`n$line"
    Write-Output "  $title"
    Write-Output $line
}

function TryRun([scriptblock]$cmd) {
    try { & $cmd } catch { Write-Output "  [ERROR] $_" }
}

$report = & {
    Section "certctl Agent - Debug Report"
    Write-Output "  Generated : $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
    Write-Output "  Computer  : $env:COMPUTERNAME"
    Write-Output "  OS        : $(([Environment]::OSVersion).VersionString)"

    # ── 1. Service Status ──────────────────────────────────────────
    Section "1. Windows Service Status"
    TryRun { Get-Service -Name $SERVICE_NAME -ErrorAction Stop | Format-List * }

    # ── 2. WinSW Logs ─────────────────────────────────────────────
    Section "2. WinSW Service Wrapper Logs (last 80 lines)"
    $wrapperOut = Join-Path $INSTALL_DIR "certctl-agent-service.out.log"
    $wrapperErr = Join-Path $INSTALL_DIR "certctl-agent-service.err.log"
    foreach ($f in @($wrapperOut, $wrapperErr)) {
        Write-Output "`n--- $f ---"
        if (Test-Path $f) {
            Get-Content $f -Tail 80
        } else {
            Write-Output "  [NOT FOUND] $f"
        }
    }

    # ── 3. Windows Event Log ───────────────────────────────────────
    Section "3. Windows Event Log (last 30 entries for certctl-agent)"
    TryRun {
        Get-EventLog -LogName Application -Source $SERVICE_NAME -Newest 30 -ErrorAction SilentlyContinue |
            Format-Table TimeGenerated, EntryType, Message -AutoSize -Wrap
    }

    # ── 4. Config File ─────────────────────────────────────────────
    Section "4. Config File: $CONFIG_FILE"
    if (Test-Path $CONFIG_FILE) {
        # Mask API key for safety
        Get-Content $CONFIG_FILE | ForEach-Object {
            if ($_ -match "^CERTCTL_API_KEY=(.+)") {
                "CERTCTL_API_KEY=***MASKED***"
            } else { $_ }
        }
    } else {
        Write-Output "  [NOT FOUND] $CONFIG_FILE"
    }

    # ── 5. Run Agent Directly (5 seconds) ─────────────────────────
    Section "5. Run Agent Directly (5 seconds) - Live Output"
    $agentBin = Join-Path $INSTALL_DIR "certctl-agent.exe"
    if (-not (Test-Path $agentBin)) {
        Write-Output "  [NOT FOUND] $agentBin"
    } elseif (-not (Test-Path $CONFIG_FILE)) {
        Write-Output "  [SKIP] Config file not found, cannot run agent"
    } else {
        Write-Output "  Running agent for 5 seconds to capture startup errors..."
        Write-Output ""

        # Load env vars from config
        $envBackup = @{}
        Get-Content $CONFIG_FILE | ForEach-Object {
            $line = $_.Trim()
            if ($line -and -not $line.StartsWith("#")) {
                $idx = $line.IndexOf("=")
                if ($idx -gt 0) {
                    $key = $line.Substring(0, $idx)
                    $val = $line.Substring($idx + 1)
                    $envBackup[$key] = [System.Environment]::GetEnvironmentVariable($key)
                    [System.Environment]::SetEnvironmentVariable($key, $val)
                }
            }
        }

        $proc = Start-Process -FilePath $agentBin `
            -RedirectStandardOutput "$env:TEMP\agent-stdout.tmp" `
            -RedirectStandardError  "$env:TEMP\agent-stderr.tmp" `
            -NoNewWindow -PassThru

        Start-Sleep -Seconds 5

        if (-not $proc.HasExited) {
            $proc.Kill()
            Write-Output "  [INFO] Agent still running after 5s (good sign - no immediate crash)"
        } else {
            Write-Output "  [WARN] Agent exited with code: $($proc.ExitCode)"
        }

        Write-Output ""
        Write-Output "--- STDOUT ---"
        if (Test-Path "$env:TEMP\agent-stdout.tmp") {
            Get-Content "$env:TEMP\agent-stdout.tmp"
            Remove-Item "$env:TEMP\agent-stdout.tmp" -Force
        }
        Write-Output ""
        Write-Output "--- STDERR ---"
        if (Test-Path "$env:TEMP\agent-stderr.tmp") {
            Get-Content "$env:TEMP\agent-stderr.tmp"
            Remove-Item "$env:TEMP\agent-stderr.tmp" -Force
        }

        # Restore env vars
        foreach ($key in $envBackup.Keys) {
            [System.Environment]::SetEnvironmentVariable($key, $envBackup[$key])
        }
    }

    # ── 6. Network Connectivity ────────────────────────────────────
    Section "6. Network Connectivity Test"
    $serverUrl = ""
    if (Test-Path $CONFIG_FILE) {
        $serverUrl = (Get-Content $CONFIG_FILE | Where-Object { $_ -match "^CERTCTL_SERVER_URL=" }) -replace "^CERTCTL_SERVER_URL=", ""
    }
    if ($serverUrl) {
        try {
            $uri = [System.Uri]$serverUrl
            $host_ = $uri.Host
            $port  = $uri.Port
            Write-Output "  Server   : $serverUrl"
            Write-Output "  Testing TCP to ${host_}:${port}..."
            $tcp = Test-NetConnection -ComputerName $host_ -Port $port -WarningAction SilentlyContinue
            Write-Output "  TCP Ping : $($tcp.TcpTestSucceeded)"
            Write-Output "  Ping RTT : $($tcp.PingReplyDetails.RoundtripTime) ms"
        } catch {
            Write-Output "  [ERROR] Network test failed: $_"
        }
    } else {
        Write-Output "  [SKIP] Could not read CERTCTL_SERVER_URL from config"
    }

    # ── 7. Firewall ────────────────────────────────────────────────
    Section "7. Windows Firewall Rules (certctl)"
    TryRun { Get-NetFirewallRule | Where-Object { $_.DisplayName -like "*certctl*" } | Format-Table Name, DisplayName, Enabled, Direction, Action -AutoSize }
    Write-Output "  (No rules = no outbound blocks for certctl specifically)"

    Section "END OF REPORT"
    Write-Output "  Full report saved to: $OUTPUT_FILE"
}

# Write to file AND display on screen
$report | Tee-Object -FilePath $OUTPUT_FILE

Write-Host ""
Write-Host "================================================================" -ForegroundColor Green
Write-Host "  Report saved to: $OUTPUT_FILE" -ForegroundColor Green
Write-Host "  Copy noi dung file nay de gui support!" -ForegroundColor Green
Write-Host "================================================================" -ForegroundColor Green
Write-Host ""
pause
