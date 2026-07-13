@echo off
rem Frees the dev ports (vite 5173-5175, api 3001) then starts fresh.
powershell -NoProfile -Command "Get-NetTCPConnection -LocalPort 5173,5174,5175,3001 -State Listen -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }"
timeout /t 2 /nobreak >nul
cd /d D:\hermes\gothacked
npm run dev
