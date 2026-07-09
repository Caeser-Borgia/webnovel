@echo off
setlocal enabledelayedexpansion

echo.
echo ============================================
echo   WebNovel Writer
echo ============================================
echo.

REM Check Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js not found
    echo.
    echo Please install Node.js 18+:
    echo https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo [OK] Node.js installed
echo.

REM Check node_modules
if not exist "node_modules" (
    echo [INFO] Installing dependencies...
    echo.
    call npm install
    if errorlevel 1 (
        echo [ERROR] npm install failed
        pause
        exit /b 1
    )
    echo.
)

REM Kill any existing process on port 3000
echo [INFO] Checking port 3000...
for /f "tokens=5" %%a in ('netstat -ano 2^>nul ^| find ":3000"') do (
    taskkill /PID %%a /F >nul 2>&1
)

REM Clean .next folder to avoid permission issues
if exist ".next" (
    echo [INFO] Cleaning build cache...
    rmdir /s /q ".next" >nul 2>&1
)

REM Start server in background
echo [INFO] Starting Next.js development server...
echo.

REM Run npm dev in new window
start "WebNovel Server" cmd /k npm run dev

REM Wait for server to start (check port 3000)
echo [INFO] Waiting for server to start...
set "counter=0"
:wait_loop
timeout /t 1 /nobreak >nul 2>&1
netstat -ano 2>nul | find ":3000" | find "LISTENING" >nul 2>&1
if errorlevel 0 (
    goto :open_browser
)
set /a counter+=1
if %counter% lss 30 (
    goto :wait_loop
)

REM If server didn't start, try anyway
echo [WARNING] Server may not be ready, opening browser anyway...

:open_browser
echo [INFO] Opening browser...
timeout /t 2 /nobreak >nul 2>&1
start http://localhost:3000

echo.
echo ============================================
echo   Application started!
echo   Address: http://localhost:3000
echo ============================================
echo.
echo Browser should open automatically.
echo If not, please visit: http://localhost:3000
echo.
pause
