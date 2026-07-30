import paramiko
import sys

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    client.connect('10.1.0.68', username='administrator', password='abc@123', timeout=10)
    stdin, stdout, stderr = client.exec_command("curl -v https://vienlsqs.bqp")
    print(stdout.read().decode())
    print(stderr.read().decode())
except Exception as e:
    print(e)
