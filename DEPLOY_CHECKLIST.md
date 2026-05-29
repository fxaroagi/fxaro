# ✅ Deployment Checklist - Follow Step-by-Step

Complete this checklist to deploy your marketplace live!

---

## **📋 Pre-Deployment (5 minutes)**

### Create Accounts
- [ ] GitHub account: https://github.com/signup
- [ ] Railway account: https://railway.app (Sign up with GitHub)
- [ ] Vercel account: https://vercel.com (Sign up with GitHub)
- [ ] MongoDB Atlas: https://www.mongodb.com/cloud/atlas
- [ ] Stripe account: https://stripe.com

### Get Keys Ready
- [ ] Stripe Secret Key: https://dashboard.stripe.com/apikeys
- [ ] Stripe Publishable Key: https://dashboard.stripe.com/apikeys
- [ ] Email account password (Gmail app password recommended)

---

## **Step 1: GitHub Setup (5 minutes)**

### 1.1 Create Repository
- [ ] Go to https://github.com/new
- [ ] Name: `kivyu-marketplace`
- [ ] Make it Public
- [ ] Click "Create repository"
- [ ] Copy your GitHub URL (you'll see instructions on screen)

### 1.2 Upload Code to GitHub
```bash
# In PowerShell/Command Prompt, navigate to project
cd C:\Users\User\.openclaw

# Initialize Git
git init
git add .
git commit -m "Initial commit: KIVYU marketplace"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/kivyu-marketplace.git
git push -u origin main
```

- [ ] Code uploaded to GitHub
- [ ] Save your GitHub URL: `https://github.com/YOUR_USERNAME/kivyu-marketplace`

---

## **Step 2: MongoDB Atlas Setup (10 minutes)**

### 2.1 Create Cluster
- [ ] Go to https://cloud.mongodb.com
- [ ] Click "Build a Database"
- [ ] Select "M0 (Free)"
- [ ] Choose region closest to you
- [ ] Click "Create"
- [ ] Wait 2-3 minutes for cluster to deploy

### 2.2 Create Database User
- [ ] Click "Database Access" (left menu)
- [ ] Click "Add New Database User"
- [ ] Username: `kivyu_user`
- [ ] Password: Create secure password (save it!)
- [ ] Click "Add User"
- [ ] **Save**: Username and Password

### 2.3 Allow IP Access
- [ ] Click "Network Access" (left menu)
- [ ] Click "Add IP Address"
- [ ] Click "Allow Access from Anywhere"
- [ ] Click "Confirm"

### 2.4 Get Connection String
- [ ] Go to "Clusters" → Click "Connect"
- [ ] Select "Connect your application"
- [ ] Copy the connection string
- [ ] Replace `<password>` with your actual password
- [ ] Add `/kivyu_marketplace` at the end
- [ ] **Save**: Your complete MongoDB connection string

**Example:**
```
mongodb+srv://kivyu_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/kivyu_marketplace?retryWrites=true&w=majority
```

---

## **Step 3: Railway Backend Deployment (10 minutes)**

### 3.1 Create Railway Project
- [ ] Go to https://railway.app
- [ ] Click "New Project"
- [ ] Click "Deploy from GitHub repo"
- [ ] Authorize Railway to access GitHub
- [ ] Select `kivyu-marketplace` repository
- [ ] Click "Deploy"
- [ ] Wait 2-3 minutes for deployment

### 3.2 Set Environment Variables
In Railway dashboard:
- [ ] Go to "Variables"
- [ ] Click "Add Variable"
- [ ] Add each variable:

| Key | Value |
|-----|-------|
| `MONGODB_URI` | Your MongoDB connection string from Step 2.4 |
| `JWT_SECRET` | `your_super_secret_jwt_key_2026` |
| `STRIPE_SECRET_KEY` | From https://dashboard.stripe.com/apikeys |
| `STRIPE_PUBLIC_KEY` | From https://dashboard.stripe.com/apikeys |
| `STRIPE_WEBHOOK_SECRET` | `whsec_test_1234567890` (update after webhook setup) |
| `EMAIL_HOST` | `smtp.gmail.com` |
| `EMAIL_PORT` | `587` |
| `EMAIL_USER` | your email |
| `EMAIL_PASSWORD` | your app password |
| `EMAIL_FROM` | `noreply@kivyu.com` |
| `NODE_ENV` | `production` |
| `FRONTEND_URL` | Will update after Vercel (use placeholder for now) |

- [ ] Click "Save"
- [ ] Railway redeploys automatically
- [ ] Wait for deployment to complete

### 3.3 Get Backend URL
- [ ] Go to Railway "Settings"
- [ ] Find "Domains"
- [ ] Copy your Railway URL (looks like: `https://your-api-xxxxx.up.railway.app`)
- [ ] **Save**: Your Railway URL

---

## **Step 4: Vercel Frontend Deployment (10 minutes)**

### 4.1 Create Vercel Project
- [ ] Go to https://vercel.com
- [ ] Click "Add New" → "Project"
- [ ] Click "Import Git Repository"
- [ ] Paste: `https://github.com/YOUR_USERNAME/kivyu-marketplace`
- [ ] Click "Import"

### 4.2 Configure Settings
- [ ] Framework: Leave as "Other"
- [ ] Build Command: Leave empty
- [ ] Output Directory: `frontend`
- [ ] Root Directory: `.`

### 4.3 Add Environment Variables
Before deployment:
- [ ] Click "Environment Variables"
- [ ] Add `API_URL`: Your Railway URL from Step 3.3
- [ ] Add `FRONTEND_URL`: Will update after (placeholder for now)
- [ ] Click "Deploy"
- [ ] Wait 2-3 minutes

### 4.4 Get Frontend URL
- [ ] Go to Vercel Project "Settings" → "Domains"
- [ ] Copy your Vercel URL (looks like: `https://yourapp.vercel.app`)
- [ ] **Save**: Your Vercel URL

---

## **Step 5: Update URLs (5 minutes)**

### 5.1 Update Railway FRONTEND_URL
- [ ] Go to Railway → Variables
- [ ] Update `FRONTEND_URL` to your Vercel URL from Step 4.4
- [ ] Click "Save"
- [ ] Railway redeploys

### 5.2 Update Frontend API URL
- [ ] Edit: `C:\Users\User\.openclaw\frontend\js\api-client.js`
- [ ] Line 3, update with your Railway URL:
```javascript
const API_BASE_URL = 'https://your-api-xxxxx.up.railway.app/api';
```
- [ ] Save file
- [ ] Push to GitHub:
```bash
cd C:\Users\User\.openclaw
git add .
git commit -m "Update API URL for production"
git push
```
- [ ] Vercel auto-redeploys

---

## **Step 6: Setup Stripe Webhooks (5 minutes)**

### 6.1 Add Webhook
- [ ] Go to https://dashboard.stripe.com/webhooks
- [ ] Click "Add endpoint"
- [ ] Endpoint URL: `https://your-api-xxxxx.up.railway.app/api/payments/webhook`
- [ ] Events to listen:
  - [ ] `checkout.session.completed`
  - [ ] `payment_intent.succeeded`
  - [ ] `payment_intent.payment_failed`
  - [ ] `charge.refunded`
- [ ] Click "Add endpoint"

### 6.2 Get Webhook Secret
- [ ] Click on the webhook you just created
- [ ] Copy "Signing secret" (starts with `whsec_`)
- [ ] **Save**: Webhook secret

### 6.3 Update Railway
- [ ] Go to Railway → Variables
- [ ] Update `STRIPE_WEBHOOK_SECRET` with the webhook secret
- [ ] Click "Save"
- [ ] Railway redeploys

---

## **✅ Testing (5 minutes)**

### Test 1: Backend Health
```bash
curl https://your-api-xxxxx.up.railway.app/health
```
- [ ] Response: `{"success":true,"status":"API is running"}`

### Test 2: Register User
- [ ] Open: `https://your-vercel-app.vercel.app/frontend/pages/auth/register.html`
- [ ] Fill form and register
- [ ] Check: Success message or redirect to login

### Test 3: Login
- [ ] Open: `https://your-vercel-app.vercel.app/frontend/pages/auth/login.html`
- [ ] Login with credentials
- [ ] Check: Redirects to dashboard

### Test 4: Dashboard
- [ ] Check: User profile loads
- [ ] Check: Order stats display
- [ ] Check: No console errors (F12)

### Test 5: Services
- [ ] Open: `https://your-vercel-app.vercel.app/frontend/pages/marketplace/services.html`
- [ ] Check: Page loads
- [ ] Check: No console errors

---

## **🎉 Deployment Complete!**

### Save Your URLs
```
Frontend: https://YOUR_APP.vercel.app
Backend: https://your-api-xxxxx.up.railway.app
Admin: https://YOUR_APP.vercel.app/frontend/pages/admin/admin-dashboard.html
```

### Share Your Marketplace
- [ ] Send frontend URL to friends/team
- [ ] They can register and test
- [ ] Market it! It's live 🚀

---

## **Optional: Custom Domains**

### Railway Custom Domain
- [ ] Buy domain (e.g., from Namecheap, GoDaddy)
- [ ] Railway → Settings → Domains → Add Domain
- [ ] Update DNS records (Railway will show instructions)

### Vercel Custom Domain
- [ ] Vercel → Settings → Domains → Add Domain
- [ ] Update DNS records (Vercel will show instructions)

---

## **Troubleshooting**

### "Deployment failed"
- [ ] Check GitHub push succeeded: `git log`
- [ ] Check Railway logs for errors
- [ ] Check Vercel logs for errors

### "Can't connect to API"
- [ ] Check API URL in frontend matches Railway URL
- [ ] Check Railway backend is deployed and running
- [ ] Check CORS is configured in backend

### "MongoDB connection error"
- [ ] Check MONGODB_URI is correct in Railway
- [ ] Check IP whitelist includes 0.0.0.0/0
- [ ] Check MongoDB cluster is created

### "Stripe webhook not working"
- [ ] Check webhook URL is correct
- [ ] Check webhook secret is in Railway variables
- [ ] Check events are selected in Stripe dashboard

---

## **Next: Monitor & Maintain**

- [ ] Check Railway dashboard weekly
- [ ] Check Vercel analytics
- [ ] Monitor error logs
- [ ] Update code as needed (GitHub → auto-deploy)
- [ ] Keep dependencies updated

---

**Congratulations! Your marketplace is live! 🎉**

Share your URL:
```
https://YOUR_APP.vercel.app
```
