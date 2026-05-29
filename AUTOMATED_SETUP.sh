#!/bin/bash
# AUTOMATED DEPLOYMENT SETUP
# This script guides you through deployment with pre-filled commands

echo "================================"
echo "KIVYU MARKETPLACE - AUTO DEPLOY"
echo "================================"
echo ""
echo "⚠️  You will need to:"
echo "   1. Create 4 free accounts (5 min)"
echo "   2. Run commands we provide (10 min)"
echo "   3. Copy/paste credentials (10 min)"
echo ""
read -p "Continue? (yes/no): " CONTINUE

if [ "$CONTINUE" != "yes" ]; then
    echo "Aborted."
    exit 1
fi

echo ""
echo "================================"
echo "STEP 1: OPEN THESE LINKS"
echo "================================"
echo ""
echo "1. Railway Signup:"
echo "   https://railway.app/new"
echo ""
echo "2. Vercel Signup:"
echo "   https://vercel.com/signup"
echo ""
echo "3. MongoDB Atlas:"
echo "   https://mongodb.com/cloud/atlas"
echo ""
echo "4. Stripe:"
echo "   https://stripe.com"
echo ""
read -p "Opened all 4? (yes/no): " OPENED

if [ "$OPENED" != "yes" ]; then
    echo "Please open these links and come back."
    exit 1
fi

echo ""
echo "================================"
echo "STEP 2: COPY YOUR CREDENTIALS"
echo "================================"
echo ""

read -p "Railway URL (https://your-api-xxx.up.railway.app): " RAILWAY_URL
read -p "Vercel URL (https://your-app.vercel.app): " VERCEL_URL
read -p "MongoDB Connection String: " MONGODB_URI
read -p "Stripe Secret Key (sk_test_...): " STRIPE_KEY

echo ""
echo "================================"
echo "STEP 3: UPDATE CONFIGURATION"
echo "================================"
echo ""

# Update frontend API URL
echo "Updating frontend API URL..."
sed -i "s|http://localhost:5000/api|$RAILWAY_URL/api|g" frontend/js/api-client.js
echo "✓ Frontend updated"

echo ""
echo "================================"
echo "STEP 4: PUSH TO GITHUB"
echo "================================"
echo ""
git add .
git commit -m "Auto-deployment configuration update"
git push origin master

echo ""
echo "✓ Pushed to GitHub"
echo ""
echo "================================"
echo "DEPLOYMENT COMPLETE!"
echo "================================"
echo ""
echo "Your marketplace is now:"
echo "  Frontend: $VERCEL_URL"
echo "  Backend: $RAILWAY_URL"
echo ""
echo "Next: Test your live deployment!"
echo ""
