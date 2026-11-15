@echo off
title AeroHealth API REST + SQLite
echo ======================================================
echo    AEROHEALTH API - SQLite
echo ======================================================
echo.
cd /d "%~dp0backend"
node src/server.js
pause
