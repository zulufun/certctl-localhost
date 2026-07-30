@echo off
setlocal EnableDelayedExpansion

REM ============================================================
REM  certctl Agent - Silent Installer
REM  Chay file nay voi quyen ADMINISTRATOR
REM  Toan bo output ghi vao install-log.txt
REM ============================================================

SET "SCRIPT_DIR=%~dp0"
SET "LOG=%SCRIPT_DIR%install-log.txt"
SET "SERVICE=certctl-agent"
SET "INSTALL_DIR=C:\Program Files\certctl-agent"
SET "CONFIG_DIR=C:\ProgramData\certctl"
SET "CONFIG_FILE=C:\ProgramData\certctl\agent.env"

REM --- Lay ten may tinh lam Agent Name ---
SET "AGENT_NAME=%COMPUTERNAME%"
SET "SERVER_URL=https://10.1.0.12:8443"

REM Mac dinh khi that bai
SET "AGENT_ID=%COMPUTERNAME%"
SET "API_KEY=demo-secret-123"

REM --- Auto-register with certctl Server ---
echo [INFO] Dang tu dong dang ky voi server %SERVER_URL%...
echo [INFO] Dang tu dong dang ky voi server %SERVER_URL%... >> "%LOG%"

powershell -Command "$ErrorActionPreference='Stop'; [Net.ServicePointManager]::SecurityProtocol = 15360; [System.Net.ServicePointManager]::ServerCertificateValidationCallback = {$true}; $body = @{name='%AGENT_NAME%'; hostname='%COMPUTERNAME%'; os='windows'; architecture='amd64'}; $json = $body | ConvertTo-Json; try { $response = Invoke-RestMethod -Uri '%SERVER_URL%/api/v1/agents' -Method Post -Headers @{Authorization='Bearer demo-secret-123'} -Body $json -ContentType 'application/json'; if ($response.api_key -and $response.id) { Write-Output ($response.id + '|' + $response.api_key) } else { Write-Output 'NO_KEY' } } catch { Write-Output 'ERROR' }" > "%TEMP%\certctl_register.tmp"
set /p AUTO_RESP=<"%TEMP%\certctl_register.tmp"
del "%TEMP%\certctl_register.tmp"

IF "%AUTO_RESP%"=="ERROR" (
  echo [WARN] Dang ky that bai. Dung ID/API key mac dinh.
  echo [WARN] Dang ky that bai. Dung ID/API key mac dinh. >> "%LOG%"
) ELSE IF "%AUTO_RESP%"=="NO_KEY" (
  echo [WARN] Khong lay duoc key. Dung ID/API key mac dinh.
  echo [WARN] Khong lay duoc key. Dung ID/API key mac dinh. >> "%LOG%"
) ELSE IF "%AUTO_RESP%"=="" (
  echo [WARN] Loi mang. Dung ID/API key mac dinh.
  echo [WARN] Loi mang. Dung ID/API key mac dinh. >> "%LOG%"
) ELSE (
  echo [OK] Dang ky thanh cong, da nhan ID/API Key moi!
  echo [OK] Dang ky thanh cong, da nhan ID/API Key moi! >> "%LOG%"
  for /f "tokens=1 delims=|" %%a in ("%AUTO_RESP%") do (
    SET "AGENT_ID=%%a"
  )

)

echo [%DATE% %TIME%] === certctl Agent Install Start === >> "%LOG%"
echo [%DATE% %TIME%] Computer: %COMPUTERNAME% >> "%LOG%"
echo [%DATE% %TIME%] Agent ID: %AGENT_ID% >> "%LOG%"
echo [%DATE% %TIME%] Server  : %SERVER_URL% >> "%LOG%"
echo. >> "%LOG%"

echo Bat dau cai dat certctl Agent...
echo (Log dang ghi vao: %LOG%)
echo.

REM --- Kiem tra quyen Admin ---
net session >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
  echo [LOI] Vui long chay file nay voi quyen ADMINISTRATOR!
  echo [LOI] Vui long chay file nay voi quyen ADMINISTRATOR! >> "%LOG%"
  pause
  exit /b 1
)
echo [OK] Quyen Administrator da xac nhan >> "%LOG%"

REM --- Kiem tra cac file can thiet ---
IF NOT EXIST "%SCRIPT_DIR%certctl-agent.exe" (
  echo [LOI] Khong tim thay certctl-agent.exe trong %SCRIPT_DIR%
  echo [LOI] Khong tim thay certctl-agent.exe >> "%LOG%"
  pause
  exit /b 1
)
IF NOT EXIST "%SCRIPT_DIR%winsw.exe" (
  echo [LOI] Khong tim thay winsw.exe trong %SCRIPT_DIR%
  echo [LOI] Khong tim thay winsw.exe >> "%LOG%"
  pause
  exit /b 1
)
echo [OK] Kiem tra file: certctl-agent.exe, winsw.exe >> "%LOG%"

REM --- Dung va xoa service cu neu ton tai ---
sc query %SERVICE% >nul 2>&1
IF %ERRORLEVEL% EQU 0 (
  echo [INFO] Dang dung service cu...
  echo [INFO] Dang dung service cu... >> "%LOG%"
  sc stop %SERVICE% >nul 2>&1
  timeout /t 3 /nobreak >nul
  IF EXIST "%INSTALL_DIR%\certctl-agent-service.exe" (
    "%INSTALL_DIR%\certctl-agent-service.exe" uninstall >> "%LOG%" 2>&1
  ) ELSE (
    sc delete %SERVICE% >nul 2>&1
  )
  timeout /t 2 /nobreak >nul
  echo [OK] Da xoa service cu >> "%LOG%"
)

REM --- Tao thu muc ---
IF NOT EXIST "%INSTALL_DIR%" mkdir "%INSTALL_DIR%"
IF NOT EXIST "%CONFIG_DIR%"  mkdir "%CONFIG_DIR%"
IF NOT EXIST "%CONFIG_DIR%\keys" mkdir "%CONFIG_DIR%\keys"
IF NOT EXIST "%CONFIG_DIR%\logs" mkdir "%CONFIG_DIR%\logs"
echo [OK] Tao thu muc: %INSTALL_DIR%, %CONFIG_DIR% >> "%LOG%"

REM --- Copy file binary va wrapper ---
copy /Y "%SCRIPT_DIR%certctl-agent.exe" "%INSTALL_DIR%\certctl-agent.exe" >nul
copy /Y "%SCRIPT_DIR%winsw.exe"         "%INSTALL_DIR%\certctl-agent-service.exe" >nul
echo [OK] Copy certctl-agent.exe, winsw.exe >> "%LOG%"

REM --- Copy CA cert neu co ---
IF EXIST "%SCRIPT_DIR%server-ca.crt" (
  copy /Y "%SCRIPT_DIR%server-ca.crt" "%CONFIG_DIR%\server-ca.crt" >nul
  SET "CA_LINE=CERTCTL_SERVER_CA_BUNDLE_PATH=%CONFIG_DIR%\server-ca.crt"
  echo [OK] Copy server-ca.crt >> "%LOG%"
) ELSE (
  SET "CA_LINE=# CERTCTL_SERVER_CA_BUNDLE_PATH="
)

REM --- Ghi file cau hinh agent.env ---
(
  echo # certctl Agent Configuration - Auto-generated
  echo # Generated: %DATE% %TIME%
  echo.
  echo CERTCTL_AGENT_ID=%AGENT_ID%
  echo CERTCTL_AGENT_NAME=%AGENT_NAME%
  echo.
  echo CERTCTL_SERVER_URL=%SERVER_URL%
  echo CERTCTL_API_KEY=%API_KEY%
  echo.
  echo %CA_LINE%
  echo CERTCTL_SERVER_TLS_INSECURE_SKIP_VERIFY=true
  echo.
  echo CERTCTL_KEY_DIR=%CONFIG_DIR%\keys
  echo CERTCTL_KEYGEN_MODE=agent
  echo.
  echo CERTCTL_DISCOVERY_DIRS=C:\inetpub\wwwroot,C:\inetpub\certs,C:\ssl
  echo.
  echo CERTCTL_LOG_LEVEL=info
) > "%CONFIG_FILE%"
echo [OK] Ghi file cau hinh: %CONFIG_FILE% >> "%LOG%"
type "%CONFIG_FILE%" >> "%LOG%"

REM --- Tao file XML cho WinSW ---
(
  echo ^<service^>
  echo   ^<id^>%SERVICE%^</id^>
  echo   ^<name^>certctl Agent - Certificate Lifecycle Management^</name^>
  echo   ^<description^>certctl Agent for Windows IIS^</description^>
  echo   ^<executable^>%INSTALL_DIR%\certctl-agent.exe^</executable^>
  echo   ^<log mode="roll"^>^</log^>
  echo   ^<env name="CERTCTL_AGENT_ID" value="%AGENT_ID%"/^>
  echo   ^<env name="CERTCTL_AGENT_NAME" value="%AGENT_NAME%"/^>
  echo   ^<env name="CERTCTL_SERVER_URL" value="%SERVER_URL%"/^>
  echo   ^<env name="CERTCTL_API_KEY" value="%API_KEY%"/^>
  echo   ^<env name="CERTCTL_SERVER_TLS_INSECURE_SKIP_VERIFY" value="true"/^>
  echo   ^<env name="CERTCTL_KEY_DIR" value="%CONFIG_DIR%\keys"/^>
  echo   ^<env name="CERTCTL_KEYGEN_MODE" value="agent"/^>
  echo   ^<env name="CERTCTL_DISCOVERY_DIRS" value="C:\inetpub\wwwroot,C:\inetpub\certs,C:\ssl"/^>
  echo   ^<env name="CERTCTL_LOG_LEVEL" value="info"/^>
  echo   ^<onfailure action="restart" delay="10 sec"/^>
  echo   ^<onfailure action="restart" delay="30 sec"/^>
  echo   ^<onfailure action="restart" delay="60 sec"/^>
  echo ^</service^>
) > "%INSTALL_DIR%\certctl-agent-service.xml"
echo [OK] Tao file XML WinSW >> "%LOG%"

REM --- Dang ky Windows Service ---
echo [INFO] Dang ky Windows Service...
"%INSTALL_DIR%\certctl-agent-service.exe" install >> "%LOG%" 2>&1
IF %ERRORLEVEL% NEQ 0 (
  echo [LOI] Khong the dang ky service! Xem chi tiet trong: %LOG%
  echo [LOI] WinSW install that bai, exit code: %ERRORLEVEL% >> "%LOG%"
  pause
  exit /b 1
)
echo [OK] Dang ky service thanh cong >> "%LOG%"

REM --- Khoi dong service ---
echo [INFO] Khoi dong service...
sc start %SERVICE% >> "%LOG%" 2>&1
timeout /t 5 /nobreak >nul

sc query %SERVICE% | find "RUNNING" >nul 2>&1
IF %ERRORLEVEL% EQU 0 (
  echo.
  echo ============================================================
  echo  [OK] CAI DAT THANH CONG!
  echo  Service certctl-agent dang RUNNING
  echo  Agent ID: %AGENT_ID%
  echo  Server  : %SERVER_URL%
  echo  Log     : %LOG%
  echo ============================================================
  echo [OK] Service RUNNING >> "%LOG%"
) ELSE (
  echo.
  echo ============================================================
  echo  [WARN] Service chua RUNNING - co the dang khoi dong
  echo  Kiem tra log tai: %LOG%
  echo  Hoac chay: sc query %SERVICE%
  echo ============================================================
  echo [WARN] Service chua RUNNING sau 5s >> "%LOG%"
)

echo.
echo [%DATE% %TIME%] === Install Completed === >> "%LOG%"
echo.
echo Log chi tiet: %LOG%
echo.
pause
