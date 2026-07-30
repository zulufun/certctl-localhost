import paramiko
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    client.connect('10.1.0.68', username='administrator', password='abc@123', timeout=10)
    script = """
    Import-Module WebAdministration
    $cert = Get-ChildItem -Path Cert:\\LocalMachine\\My\\EB90A83568CD3DDAE53E2446900B50BA290C9E60
    if ($cert) {
        # Get existing binding
        $binding = Get-WebBinding -Name 'vienlsqs' -Port 443 -Protocol 'https'
        if ($binding) {
            # Update certificate hash
            $binding.AddSslCertificate($cert.Thumbprint, 'My')
            Write-Output "Successfully updated binding to new cert: $($cert.Thumbprint)"
        } else {
            Write-Output "Binding not found"
        }
    } else {
        Write-Output "New cert not found in store"
    }
    """
    stdin, stdout, stderr = client.exec_command(f'powershell.exe -Command "{script}"')
    print("OUT:", stdout.read().decode())
    print("ERR:", stderr.read().decode())
except Exception as e:
    print(e)
