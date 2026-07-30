import paramiko
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    client.connect('10.1.0.68', username='administrator', password='abc@123', timeout=10)
    script = """
    $cert1 = Get-ChildItem -Path Cert:\\LocalMachine\\My\\8274DE7500C27567D0E307290FA056E35614F921
    $cert2 = Get-ChildItem -Path Cert:\\LocalMachine\\My\\EB90A83568CD3DDAE53E2446900B50BA290C9E60
    Write-Output "OLD Cert: $($cert1.Issuer) - NotBefore: $($cert1.NotBefore)"
    Write-Output "NEW Cert: $($cert2.Issuer) - NotBefore: $($cert2.NotBefore)"
    """
    stdin, stdout, stderr = client.exec_command(f'powershell.exe -Command "{script}"')
    print("OUT:", stdout.read().decode())
except Exception as e:
    print(e)
