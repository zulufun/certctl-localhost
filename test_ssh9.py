import paramiko
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    client.connect('10.1.0.68', username='administrator', password='abc@123', timeout=10)
    script = """
    $certs = Get-ChildItem -Path Cert:\\LocalMachine\\Root | Where-Object {$_.Subject -match 'CertCtl Local CA'}
    foreach ($cert in $certs) {
        Write-Output "Root CA Installed: Thumbprint=$($cert.Thumbprint)"
    }
    """
    stdin, stdout, stderr = client.exec_command(f'powershell.exe -Command "{script}"')
    print("OUT:", stdout.read().decode())
    print("ERR:", stderr.read().decode())
except Exception as e:
    print(e)
