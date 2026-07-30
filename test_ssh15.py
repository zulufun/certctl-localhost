import paramiko
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    client.connect('10.1.0.68', username='administrator', password='abc@123', timeout=10)
    script = """
    $certs = Get-ChildItem -Path Cert:\\LocalMachine\\My
    foreach ($c in $certs) {
        if ($c.Thumbprint -eq '8274DE7500C27567D0E307290FA056E35614F921') {
            Write-Output "OLD Cert: $($c.Issuer) - NotBefore: $($c.NotBefore)"
        }
        if ($c.Thumbprint -eq 'EB90A83568CD3DDAE53E2446900B50BA290C9E60') {
            Write-Output "NEW Cert: $($c.Issuer) - NotBefore: $($c.NotBefore)"
        }
    }
    """
    stdin, stdout, stderr = client.exec_command(f'powershell.exe -Command "{script}"')
    print("OUT:", stdout.read().decode())
except Exception as e:
    print(e)
