import paramiko
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    client.connect('10.1.0.68', username='administrator', password='abc@123', timeout=10)
    stdin, stdout, stderr = client.exec_command('powershell.exe -Command "$cert = Get-ChildItem -Path Cert:\\LocalMachine\\My | Where-Object {$_.Thumbprint -eq \'8274DE7500C27567D0E307290FA056E35614F921\'}; if ($cert) { Write-Output \\"Subject: $($cert.Subject)\\"; Write-Output \\"Issuer: $($cert.Issuer)\\" }"')
    print("OUT:", stdout.read().decode())
    print("ERR:", stderr.read().decode())
except Exception as e:
    print(e)
