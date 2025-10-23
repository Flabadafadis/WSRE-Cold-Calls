@echo off
echo ========================================
echo WSRE Cold Call Script v7.0
echo ========================================
echo.
echo Starting local server...
start powershell -Command "cd 'c:\Users\flaba\.specialprojects\WSRE-Cold-Calls-main-Working\WSRE-Cold-Calls-main\Cold-Calls-Workbook'; python -m http.server 8000"
timeout /t 3 /nobreak >nul
echo.
echo Opening browser...
start http://localhost:8000/index-new.html
echo.
echo ========================================
echo Server running on port 8000
echo Press Ctrl+Shift+D for Developer Mode
echo ========================================
pause