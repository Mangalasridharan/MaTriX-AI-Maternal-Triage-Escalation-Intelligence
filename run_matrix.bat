@echo off
setlocal enabledelayedexpansion

:: MaTriX-AI Unified Setup & Run Script
:: Optimized for Windows users to clone and run instantly

title MaTriX-AI Control Center

echo #################################################
echo ## MaTriX-AI: Maternal Triage Intelligence     ##
echo ##  Edge 4B + Cloud 27B Agentic Workflow      ##
echo #################################################
echo.

:CHECK_PREREQS
echo [%TIME%] Checking prerequisites...
where python >nul 2>nul || (echo Error: Python not found. Please install Python 3.13. && pause && exit /b 1)
where node >nul 2>nul || (echo Error: Node.js not found. Please install Node.js 18+. && pause && exit /b 1)
where docker >nul 2>nul || (echo Error: Docker not found. Please install Docker Desktop. && pause && exit /b 1)
echo Prerequisites OK.

:MENU
echo.
echo =================================================
echo  Select Action:
echo  1. FULL SETUP (Env, Deps, Docker, Seed)
echo  2. START WEBSITE (Edge, Cloud, Frontend)
echo  3. CONNECT CLOUD MODELS (SageMaker Deploy)
echo  4. RE-RUN SEEDING (Update Guidelines/Users)
echo  5. STOP INFRASTRUCTURE (Docker Stop)
echo  Q. EXIT
echo =================================================
echo.
set /p opt="Choice (1-5, Q): "

if "%opt%"=="1" goto FULL_SETUP
if "%opt%"=="2" goto START_STACK
if "%opt%"=="3" goto CLOUD_DEPLOY
if "%opt%"=="4" goto RE_SEED
if "%opt%"=="5" goto STOP_ALL
if /i "%opt%"=="Q" exit /b
goto MENU

:FULL_SETUP
echo [%TIME%] Creating environment files...
if not exist "edge\.env" (
    copy "edge\.env.example" "edge\.env"
    echo Created edge/.env - Remember to set a secure JWT_SECRET_KEY.
)
if not exist "cloud\.env" (
    copy "cloud\.env.example" "cloud\.env"
    echo Created cloud/.env
)
if not exist "frontend\.env.local" (
    echo NEXT_PUBLIC_API_URL=http://localhost:8000 > "frontend\.env.local"
    echo Created frontend/.env.local
)

echo [%TIME%] Installing Python dependencies...
py -3.13 -m pip install -q -r edge/requirements.txt
py -3.13 -m pip install -q -r cloud/requirements.txt

echo [%TIME%] Installing Frontend dependencies...
cd frontend && call npm install --quiet && cd ..

echo [%TIME%] Starting Docker database...
docker-compose up -d db
echo Waiting for DB to be ready (15s)...
timeout /t 15 /nobreak >nul

:RE_SEED
echo [%TIME%] Running database ingestion and demo seeding...
py -3.13 edge/scripts/ingest_guidelines.py
py -3.13 edge/scripts/seed_demo.py
echo.
echo [%TIME%] Setup/Seeding Complete.
pause
goto MENU

:START_STACK
echo [%TIME%] Launching all services in separate terminals...

:: Start Edge API
start "MaTriX-AI Edge API (Port 8000)" cmd /k "cd edge && py -3.13 -m uvicorn app.main:app --port 8000 --reload"

:: Start Cloud API
start "MaTriX-AI Cloud API (Port 9000)" cmd /k "cd cloud && py -3.13 -m uvicorn app.main:app --port 9000 --reload"

:: Start Frontend
start "MaTriX-AI Frontend (Port 3000)" cmd /k "cd frontend && npm run dev"

echo.
echo Success! Website will be available at http://localhost:3000
echo Default Login: username='demo' password='demo1234'
echo.
echo Keep those terminal windows open while using the app.
pause
goto MENU

:CLOUD_DEPLOY
echo.
echo [%TIME%] SageMaker Deployment Utility
echo NOTE: This requires valid AWS credentials and HF_API_TOKEN in cloud/.env
echo.
echo Options:
echo  A. medgemma-27b (High accuracy, Cloud)
echo  B. medgemma-4b  (Edge-equivalent, Cloud)
echo  C. paligemma-3b (Multimodal VQA, Cloud)
echo  D. Back to Menu
echo.
set /p d_opt="Choice (A-D): "

if /i "%d_opt%"=="A" py -3.13 cloud/scripts/deploy_sagemaker.py --model medgemma-27b
if /i "%d_opt%"=="B" py -3.13 cloud/scripts/deploy_sagemaker.py --model medgemma-4b
if /i "%d_opt%"=="C" py -3.13 cloud/scripts/deploy_sagemaker.py --model paligemma-3b
if /i "%d_opt%"=="D" goto MENU
pause
goto MENU

:STOP_ALL
echo [%TIME%] Stopping Docker infrastructure...
docker-compose stop
echo Done.
pause
goto MENU
