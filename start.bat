@echo off
chcp 65001 > nul
title 46Hz Heart Sound Letterbox
cd /d "%~dp0"

echo ==========================================================
echo          46Hz - Human-Centered Heart Sound Letterbox
echo ==========================================================
echo Starting via PowerShell launcher...
echo.

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0start.ps1" %*

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Launcher exited with error code %ERRORLEVEL%.
    pause
)
