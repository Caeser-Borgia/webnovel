@echo off
echo [INFO] Killing process on port 3000...

REM Find and kill any process using port 3000
for /f "tokens=5" %%a in ('netstat -ano 2^>nul ^| find ":3000"') do (
    echo [INFO] Found PID: %%a, killing...
    taskkill /PID %%a /F >nul 2>&1
)

REM Clean build cache
if exist ".next" (
    echo [INFO] Cleaning .next folder...
    rmdir /s /q ".next" >nul 2>&1
)

echo [OK] Cleanup complete
echo.
echo You can now run start.bat
pause
