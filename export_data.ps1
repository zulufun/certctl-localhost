$ErrorActionPreference = "Stop"

Write-Host "Exporting database to certctl_backup.sql..."
# Use docker cp to avoid PowerShell encoding issues with stdout
docker exec certctl-postgres pg_dump -c --if-exists -U certctl -d certctl -f /tmp/certctl_backup.sql
docker cp certctl-postgres:/tmp/certctl_backup.sql ./certctl_backup.sql

Write-Host "Compressing project directory to certctl-deploy.zip..."
if (Test-Path "certctl-deploy.zip") {
    Remove-Item "certctl-deploy.zip" -Force
}

$ExcludeDirs = @(".git", ".gemini", "node_modules", "tmp")
Get-ChildItem -Path . -Recurse | Where-Object {
    $exclude = $false
    foreach ($dir in $ExcludeDirs) {
        if ($_.FullName -match "\\$dir\\") {
            $exclude = $true
            break
        }
        if ($_.Name -eq $dir -and $_.PSIsContainer) {
            $exclude = $true
            break
        }
    }
    if ($_.Name -eq "certctl-deploy.zip" -or $_.Name -eq "certctl_backup.sql") {
        $exclude = $true
    }
    -not $exclude
} | Compress-Archive -DestinationPath "certctl-deploy.zip"

Write-Host "Done! Please transfer 'certctl-deploy.zip' and 'certctl_backup.sql' to your Ubuntu machine."
