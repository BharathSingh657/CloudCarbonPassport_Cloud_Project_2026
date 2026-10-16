@echo off
title Smart Cloud Carbon Passport - Application Launcher
cd /d "C:\Users\bhara\Desktop\CLOUD\CloudCarbonPassport_Cloud_Project_2026"

echo =========================================================================
echo       SMART CLOUD CARBON PASSPORT - FULL APPLICATION LAUNCHER
echo =========================================================================
echo.

echo [1/3] Checking PostgreSQL Database on port 5433...
netstat -ano | findstr 5433 >nul
if %errorlevel% neq 0 (
    echo Starting local PostgreSQL cluster...
    start /b "" "C:\Program Files\PostgreSQL\16\bin\postgres.exe" -D "C:\Users\bhara\Desktop\CLOUD\CloudCarbonPassport_Cloud_Project_2026\dataset\pgdata" -p 5433 >nul 2>&1
    timeout /t 2 /nobreak >nul
) else (
    echo PostgreSQL is already active on port 5433.
)

echo [2/3] Checking Backend API on port 5001...
netstat -ano | findstr 5001 >nul
if %errorlevel% neq 0 (
    echo Starting Backend API service...
    cd /d "C:\Users\bhara\Desktop\CLOUD\CloudCarbonPassport_Cloud_Project_2026\src\backend"
    start "Carbon Passport Backend" /min node src/server.js
    timeout /t 2 /nobreak >nul
    cd /d "C:\Users\bhara\Desktop\CLOUD\CloudCarbonPassport_Cloud_Project_2026"
) else (
    echo Backend API is already active on port 5001.
)

echo [3/3] Checking Frontend Dashboard on port 5173...
netstat -ano | findstr 5173 >nul
if %errorlevel% neq 0 (
    echo Starting Frontend Dashboard service...
    cd /d "C:\Users\bhara\Desktop\CLOUD\CloudCarbonPassport_Cloud_Project_2026\src\frontend"
    start "Carbon Passport Frontend" /min npm run dev
    timeout /t 3 /nobreak >nul
    cd /d "C:\Users\bhara\Desktop\CLOUD\CloudCarbonPassport_Cloud_Project_2026"
) else (
    echo Frontend service is already active on port 5173.
)

echo.
echo =========================================================================
echo  Application is LIVE! Opening browser at: http://localhost:5173
echo =========================================================================
start http://localhost:5173
echo.
echo Press any key to stop or close this launcher window...
pause >nul
