@echo off
echo ========================================
echo   BINH VUONG ERP - KHOI DONG HE THONG
echo ========================================
echo.

echo [1/3] Kiem tra Node.js...
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Chua cai dat Node.js!
    echo Vui long tai tai: https://nodejs.org/
    pause
    exit /b 1
)
echo [OK] Node.js da cai dat

echo.
echo [2/3] Kiem tra dependencies...
if not exist "node_modules" (
    echo [INFO] Dang cai dat dependencies lan dau...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Cai dat that bai!
        pause
        exit /b 1
    )
) else (
    echo [OK] Dependencies da san sang
)

echo.
echo [3/3] Khoi dong ung dung...
echo.
echo ========================================
echo   Ung dung se mo tai: http://localhost:3000
echo   Nhan Ctrl+C de dung server
echo ========================================
echo.

call npm run dev

pause

