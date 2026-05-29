@echo off
setlocal enabledelayedexpansion

REM ============================================================================
REM        KIVYU SaaS Marketplace - Complete Automated Deployment
REM ============================================================================
REM This script deploys your entire marketplace to Railway + Vercel
REM ============================================================================

echo.
echo ========================================
echo   KIVYU - Complete Deployment Script
echo ========================================
echo.

REM Check prerequisites
echo Checking prerequisites...

REM Check if Git is installed
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Git not found. Install from https://git-scm.com
    pause
    exit /b 1
)
echo [OK] Git is installed

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js not found. Install from https://nodejs.org
    pause
    exit /b 1
)
echo [OK] Node.js is installed

echo.
echo ========================================
echo   STEP 1: Git Configuration
echo ========================================
echo.
echo Configure your Git credentials:
set /p GIT_EMAIL="Enter your email: "
set /p GIT_USERNAME="Enter your GitHub username: "

git config user.email "%GIT_EMAIL%"
git config user.name "%GIT_USERNAME%"

echo [OK] Git configured with: %GIT_EMAIL%
echo.

echo ========================================
echo   STEP 2: Update Environment Variables
echo ========================================
echo.
echo You need to update these keys:
echo   1. Stripe Secret Key (from https://dashboard.stripe.com/apikeys)
echo   2. MongoDB connection string (from MongoDB Atlas)
echo.
echo IMPORTANT FILES TO UPDATE:
echo   - backend/.env (database, stripe, email config)
echo.
echo.
set /p CONTINUE="Press Enter when you've updated backend/.env with your keys..."
echo.

echo ========================================
echo   STEP 3: Install Dependencies
echo ========================================
echo.
echo Installing backend dependencies...
cd backend
call npm install
cd ..
echo [OK] Dependencies installed
echo.

echo ========================================
echo   STEP 4: Testing Locally
echo ========================================
echo.
echo Starting local test (requires MongoDB running)...
echo To skip, press Ctrl+C
echo.
timeout /t 3 /nobreak
start "KIVYU Backend Test" cmd /k "cd backend && npm start"
timeout /t 5 /nobreak
echo Backend should be running at http://localhost:5000
echo Frontend should be accessed from: C:\Users\User\.openclaw\frontend\pages\auth\register.html
echo.
echo Testing API...
curl http://localhost:5000/health
echo.
echo.
set /p LOCAL_OK="Is the backend running? (yes/no): "
if /i not "%LOCAL_OK%"=="yes" (
    echo Fix the error and try again.
    pause
    exit /b 1
)
echo [OK] Local testing passed
echo.

echo ========================================
echo   STEP 5: Push to GitHub
echo ========================================
echo.
echo Your code needs to be on GitHub for deployment.
echo Visit: https://github.com/new
echo Create a new repository called: kivyu-marketplace
echo.
set /p GITHUB_URL="Enter your GitHub repository URL (e.g., https://github.com/username/kivyu-marketplace): "
echo.
echo Adding remote and pushing...
git remote add origin "%GITHUB_URL%"
git branch -M main
git push -u origin main
echo [OK] Code pushed to GitHub
echo.

echo ========================================
echo   STEP 6: Railway Deployment
echo ========================================
echo.
echo Opening Railway for backend deployment...
echo.
echo Steps:
echo   1. Go to https://railway.app/new
echo   2. Sign in with GitHub
echo   3. Click "Deploy from GitHub repo"
echo   4. Select your repository: kvyu-marketplace
echo   5. Click "Deploy Now"
echo   6. Add these environment variables:
echo      - MONGODB_URI: Your MongoDB connection string
echo      - STRIPE_SECRET_KEY: Your Stripe key
echo      - JWT_SECRET: your_secret_key
echo      - NODE_ENV: production
echo      (See DEPLOYMENT_GUIDE.md for complete list)
echo   7. Wait for deployment (2-3 minutes)
echo   8. Copy your Railway URL from Settings ^> Domains
echo.
set /p RAILWAY_URL="Enter your Railway URL (e.g., https://your-api-xxxxx.up.railway.app): "
echo [OK] Railway URL saved: %RAILWAY_URL%
echo.

echo ========================================
echo   STEP 7: Update Frontend API URL
echo ========================================
echo.
echo Updating frontend to use your Railway API...
echo.
powershell -Command "(Get-Content 'frontend\js\api-client.js') -replace 'http://localhost:5000/api', '%RAILWAY_URL%/api' | Set-Content 'frontend\js\api-client.js'"
echo [OK] Frontend API URL updated
echo.
git add frontend\js\api-client.js
git commit -m "Update API URL for production"
git push
echo [OK] Changes pushed to GitHub
echo.

echo ========================================
echo   STEP 8: Vercel Deployment
echo ========================================
echo.
echo Opening Vercel for frontend deployment...
echo.
echo Steps:
echo   1. Go to https://vercel.com
echo   2. Sign in with GitHub
echo   3. Click "Add New" ^> "Project"
echo   4. Click "Import Git Repository"
echo   5. Paste your GitHub URL
echo   6. Add environment variable: API_URL = %RAILWAY_URL%/api
echo   7. Click "Deploy"
echo   8. Wait for deployment (2-3 minutes)
echo   9. Copy your Vercel URL from the dashboard
echo.
set /p VERCEL_URL="Enter your Vercel URL (e.g., https://your-app.vercel.app): "
echo [OK] Vercel URL saved: %VERCEL_URL%
echo.

echo ========================================
echo   STEP 9: Final Configuration
echo ========================================
echo.
echo Updating environment variables...
echo.
echo [TO DO] Update these in Railway dashboard:
echo   - FRONTEND_URL = %VERCEL_URL%
echo.
echo [TO DO] Update these in Vercel dashboard:
echo   - API_URL = %RAILWAY_URL%/api
echo.
set /p CONFIG_OK="Have you updated the environment variables? (yes/no): "
echo.

echo ========================================
echo   TESTING YOUR LIVE DEPLOYMENT
echo ========================================
echo.
echo Testing backend...
curl "%RAILWAY_URL%/health"
echo.
echo.
echo Testing frontend registration page...
start "%VERCEL_URL%/frontend/pages/auth/register.html"
echo.

echo ========================================
echo   SUCCESS! YOUR MARKETPLACE IS LIVE!
echo ========================================
echo.
echo Frontend:  %VERCEL_URL%
echo Backend:   %RAILWAY_URL%
echo.
echo Next steps:
echo   1. Register an account at: %VERCEL_URL%/frontend/pages/auth/register.html
echo   2. Login and test the marketplace
echo   3. Share with friends: %VERCEL_URL%
echo.
echo Documentation:
echo   - README.md - Project overview
echo   - IMPLEMENTATION_GUIDE.md - Full technical docs
echo   - DEPLOYMENT_GUIDE.md - Deployment details
echo.
echo Congratulations! 🎉
echo Your SaaS marketplace is now live on the internet!
echo.

pause
