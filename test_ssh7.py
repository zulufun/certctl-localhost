import paramiko
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    client.connect('10.1.0.68', username='administrator', password='abc@123', timeout=10)
    script = """
    $cert = Get-ChildItem -Path Cert:\\LocalMachine\\My | Where-Object {$_.Thumbprint -eq '8274DE7500C27567D0E307290FA056E35614F921'}
    $chain = New-Object System.Security.Cryptography.X509Certificates.X509Chain
    $chain.Build($cert) | Out-Null
    foreach ($element in $chain.ChainElements) {
        Write-Output "Chain Element: $($element.Certificate.Subject) (Thumbprint: $($element.Certificate.Thumbprint))"
        Write-Output "Status: $($element.ChainElementStatus | ForEach-Object { $_.Status })"
    }
    """
    stdin, stdout, stderr = client.exec_command(f'powershell.exe -Command "{script}"')
    print("OUT:", stdout.read().decode())
    print("ERR:", stderr.read().decode())
except Exception as e:
    print(e)
