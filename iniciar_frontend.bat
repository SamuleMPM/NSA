@echo off
title Iniciar AeroHealth (API REST + SQLite + Frontend)
echo ======================================================
echo    AEROHEALTH - CENTRO DE TELEMETRIA AEROESPACIAL
echo    API REST + SQLite + Consola React
echo ======================================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Node.js no esta instalado o no esta en el PATH.
  echo Instala Node.js 24 o superior: https://nodejs.org/
  pause
  exit /b 1
)

echo Iniciando API en http://127.0.0.1:4000 ...
start "AeroHealth API :4000" cmd /k "cd /d "%~dp0backend" && node src/server.js"

echo Esperando a que la base de datos SQLite este lista...
timeout /t 2 /nobreak >nul

cd /d "%~dp0frontend"
if not exist "node_modules" (
  echo Instalando dependencias del frontend...
  call npm.cmd install
)

echo Iniciando consola Vite en http://localhost:3000 ...
call npm.cmd run dev
pause
