@echo off
setlocal
cd /d %~dp0
echo Starting WebNovel Writer...
if exist server.log del /q server.log >nul 2>nul
start "WebNovel Writer Server" /min cmd /c ""%~dp0node.exe" server.js > server.log 2>&1"
set "URL=http://127.0.0.1:3000"
call :wait_for_server
start "" "%URL%"
echo Opened %URL%
echo Server logs: server.log
pause
exit /b

:wait_for_server
set "TRIES=0"
:retry
powershell -NoProfile -Command "try { $r = Invoke-WebRequest -Uri '%URL%' -UseBasicParsing -TimeoutSec 2; if ($r.StatusCode -ge 200 -and $r.StatusCode -lt 500) { exit 0 } exit 1 } catch { exit 1 }" >nul 2>nul
if %errorlevel%==0 exit /b 0
set /a TRIES+=1
if %TRIES% GEQ 60 (
  echo Server did not respond in time. Check server.log.
  exit /b 1
)
timeout /t 1 /nobreak >nul
goto retry
