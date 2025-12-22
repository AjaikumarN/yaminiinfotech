@echo off
echo ========================================
echo Yamini Infotech Backend Setup
echo ========================================
echo.

echo [1/3] Installing dependencies...
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo Error installing dependencies!
    pause
    exit /b %errorlevel%
)
echo.

echo [2/3] Initializing database...
python init_db.py
if %errorlevel% neq 0 (
    echo Error initializing database!
    pause
    exit /b %errorlevel%
)
echo.

echo [3/3] Starting development server...
echo.
echo API Server: http://localhost:8000
echo API Docs: http://localhost:8000/docs
echo.
uvicorn main:app --reload --port 8000
