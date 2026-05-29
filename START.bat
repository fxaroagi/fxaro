@echo off
echo.
echo ========================================
echo   KIVYU Marketplace - Start Script
echo ========================================
echo.

REM Check if Docker is installed
docker --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Docker detected - using Docker setup
    echo.
    echo Starting with Docker Compose...
    echo.
    docker-compose up
) else (
    echo Docker not found. Starting manual setup...
    echo.

    REM Start MongoDB (assumes it's installed as service)
    echo Starting MongoDB...
    net start MongoDB >nul 2>&1

    REM Start Backend
    echo Starting Backend Server...
    start "KIVYU Backend" cmd /k "cd backend && npm install && npm start"

    timeout /t 3 /nobreak

    REM Start Frontend
    echo Starting Frontend Server...
    start "KIVYU Frontend" cmd /k "python3 -m http.server 8000"

    echo.
    echo ========================================
    echo   Servers Started!
    echo ========================================
    echo.
    echo Backend:  http://localhost:5000
    echo Frontend: http://localhost:8000
    echo.
    echo Opening Browser...
    start http://localhost:8000/frontend/pages/auth/register.html

    pause
)
