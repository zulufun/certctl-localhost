import paramiko
import sys

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    client.connect('10.1.0.68', username='administrator', password='abc@123', timeout=10)
    # Check the cert bound to 443
    script = """
    $binding = Get-WebBinding -Name 'vienlsqs' -Port 443 -Protocol 'https'
    if ($binding) {
        $thumb = $binding.certificateHash
        Write-Output "Binding Thumbprint: $thumb"
        $cert = Get-ChildItem -Path Cert:\\LocalMachine\\My | Where-Object { $_.Thumbprint -eq $thumb }
        if ($cert) {
            Write-Output "Subject: $($cert.Subject)"
            Write-Output "Issuer: $($cert.Issuer)"
            Write-Output "NotAfter: $($cert.NotAfter)"
        }
    }
    """
    stdin, stdout, stderr = client.exec_command(f'powershell.exe -Command "{script}"')
    print(stdout.read().decode())
    print(stderr.read().decode())
except Exception as e:
    print(e)
