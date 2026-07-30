import urllib.request
try:
    urllib.request.urlopen("http://localhost:8080/.well-known/pki/ocsp/iss-local/0cd1f8a3d206eb191542095c47a89938cfaaa501")
except Exception as e:
    print(e)
