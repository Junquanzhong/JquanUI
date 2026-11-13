@echo off
cd /d "%~dp0"
if not exist "node_modules\live-server\package.json" (
  where live-server >nul 2>nul
  if errorlevel 1 (
    call npm install --no-audit --no-fund
    if errorlevel 1 exit /b 1
  )
)
call npm run dev
pause
