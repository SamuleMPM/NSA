@echo off
title Iniciar Centro de Telemetria NSA (Frontend React)
echo ======================================================
echo    INICIANDO CENTRO DE TELEMETRIA AEROESPACIAL NSA
echo ======================================================
echo.
cd /d "%~dp0frontend"
echo Iniciando servidor Vite en http://localhost:3000 ...
call npm.cmd run dev
pause
