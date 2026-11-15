@echo off
title HostelEase Launcher
cd /d "C:\Users\HP\Downloads\Software Engineering\HostelEase"

:: Check if server is already running on port 3000
netstat -ano | findstr :3000 | findstr LISTENING >nul
if %errorlevel% neq 0 (
    start /min "" cmd /c "node src/server.js"
    timeout /t 2 /nobreak >nul
)

:: Launch the application in default web browser
start "" "http://localhost:3000"
exit
