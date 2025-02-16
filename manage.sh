#!/bin/bash

if [ -z "$1" ]; then
    echo "Usage: ./manage.sh [command]"
    echo "Commands:"
    echo "  clean      - Remove all dependencies"
    echo "  install    - Install all dependencies"
    echo "  reinstall  - Clean and reinstall all dependencies"
    echo "  start      - Start the application"
    exit 1
fi

case "$1" in
    "clean")
        echo "Cleaning dependencies..."
        rm -rf node_modules
        rm -rf backend/node_modules
        find . -type d -name "__pycache__" -exec rm -r {} +
        echo "Cleaned all dependencies"
        ;;
    
    "install")
        echo "Installing frontend dependencies..."
        npm install
        
        echo "Installing backend dependencies..."
        cd backend
        npm install
        pip install -r requirements.txt
        cd ..
        echo "All dependencies installed"
        ;;
    
    "reinstall")
        $0 clean
        $0 install
        ;;
    
    "start")
        echo "Starting the application..."
        (cd backend && python main.py) &
        npm start
        ;;
    
    *)
        echo "Unknown command: $1"
        echo "Use './manage.sh' without arguments to see available commands"
        exit 1
        ;;
esac
