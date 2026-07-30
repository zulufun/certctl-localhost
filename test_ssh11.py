import paramiko
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    client.connect('10.1.0.68', username='administrator', password='abc@123', timeout=10)
    stdin, stdout, stderr = client.exec_command('powershell.exe -Command "certutil -store Root | Select-String -Context 0, 5 \\"CN=CertCtl Local CA\\""')
    print("OUT:", stdout.read().decode())
except Exception as e:
    print(e)
