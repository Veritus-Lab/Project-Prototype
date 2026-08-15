@echo off
title Servidor FLERNK
cd /d "%~dp0"
echo ===================================================
echo           INICIANDO SERVIDOR FLERNK
echo ===================================================
echo.
echo Acesse no seu navegador: http://localhost:3000
echo Pressione Ctrl+C para encerrar o servidor.
echo.
node server.js
pause
