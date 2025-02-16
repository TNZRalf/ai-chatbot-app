@echo off
setlocal

if "%1"=="" (
    echo Usage: manage [command]
    echo Commands:
    echo   clean      - Remove all dependencies
    echo   install    - Install all dependencies
    echo   reinstall  - Clean and reinstall all dependencies
    echo   start      - Start the application
    exit /b 1
)

if "%1"=="clean" (
    echo Cleaning dependencies...
    rd /s /q node_modules 2>nul
    rd /s /q backend\node_modules 2>nul
    rd /s /q backend\__pycache__ 2>nul
    echo Cleaned all dependencies
    exit /b 0
)

if "%1"=="install" (
    echo Installing frontend dependencies...
    call npm install
    
    echo Installing backend dependencies...
    cd backend
    call npm install
    pip install -r requirements.txt
    cd ..
    echo All dependencies installed
    exit /b 0
)

if "%1"=="reinstall" (
    call %0 clean
    call %0 install
    exit /b 0
)

if "%1"=="start" (
    echo Starting the application...
    start cmd /k "cd backend && python main.py"
    npm start
    exit /b 0
)

echo Unknown command: %1
echo Use 'manage' without arguments to see available commands
exit /b 1
