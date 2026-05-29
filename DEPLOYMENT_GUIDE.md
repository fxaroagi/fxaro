# 🚀 Deployment Guide - Railway + Vercel

Deploy your KIVYU marketplace to live URLs in 30 minutes!

---

## **Prerequisites**

- ✅ GitHub account (free at https://github.com)
- ✅ Railway account (free at https://railway.app)
- ✅ Vercel account (free at https://vercel.com)
- ✅ MongoDB Atlas account (free at https://www.mongodb.com/cloud/atlas)
- ✅ Stripe account (free at https://stripe.com)

**Total cost: $0 (all free tiers)**

---

## **STEP 1: Create GitHub Repository**

### 1.1 Go to GitHub
1. Visit https://github.com/new
2. Repository name: `kivyu-marketplace`
3. Description: `KIVYU SaaS Marketplace`
4. Public (so you can share)
5. Click "Create repository"

### 1.2 Initialize Git Locally
```bash
cd C:\Users\User\.openclaw
git init
git add .
git commit -m "Initial commit: KIVYU marketplace"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/kivyu-marketplace.git
git push -u origin main
```

✅ **Result**: Code on GitHub

---

## **STEP 2: Deploy Backend to Railway**

### 2.1 Go to Railway
1. Visit https://railway.app
2. Click "Start New Project"
3. Sign in with GitHub
4. Click "Deploy from GitHub repo"
5. Select `kivyu-marketplace`
6. Click "Deploy Now"

### 2.2 Configure Environment Variables
Railway will auto-detect `package.json` in `backend/` folder.

Go to Railway project → Variables → Add:

```
MONGODB_URI = mongodb+srv://YOUR_USER:YOUR_PASS@cluster0.xxxxx.mongodb.net/kivyu_marketplace

JWT_SECRET = your_super_secret_jwt_key_2026_change_this_in_production

STRIPE_SECRET_KEY = sk_test_51234567890123456789
STRIPE_PUBLIC_KEY = pk_test_01234567890123456789
STRIPE_WEBHOOK_SECRET = whsec_test_1234567890

EMAIL_HOST = smtp.gmail.com
EMAIL_PORT = 587
EMAIL_USER = your_email@gmail.com
EMAIL_PASSWORD = your_app_password
EMAIL_FROM = noreply@kivyu.com

NODE_ENV = production
PORT = 5000
FRONTEND_URL = https://YOUR_VERCEL_URL.vercel.app
```

### 2.3 Get Backend URL
Railway will give you a URL like:
```
https://your-api-xxxxxxx.up.railway.app
```

**Save this - you'll need it for frontend!**

### 2.4 Add Custom Domain (Optional)
1. Go to Railway project → Settings → Domain
2. Add custom domain (e.g., `api.your-domain.com`)

✅ **Result**: Backend live at `https://your-api-xxxxxxx.up.railway.app`

---

## **STEP 3: Deploy Frontend to Vercel**

### 3.1 Go to Vercel
1. Visit https://vercel.com
2. Click "Add New..." → "Project"
3. Click "Import Git Repository"
4. Paste: `https://github.com/YOUR_USERNAME/kivyu-marketplace`
5. Click "Import"

### 3.2 Configure Build Settings
- **Framework Preset**: Other (static)
- **Build Command**: Leave empty
- **Output Directory**: `frontend`
- **Root Directory**: `.`

### 3.3 Add Environment Variables
Before deploying, go to Settings → Environment Variables:

```
API_URL = https://your-api-xxxxxxx.up.railway.app
FRONTEND_URL = https://your-vercel-url.vercel.app
```

### 3.4 Deploy
Click "Deploy" and wait 2-3 minutes.

Vercel will give you a URL like:
```
https://kivyu-marketplace.vercel.app
```

✅ **Result**: Frontend live at `https://kivyu-marketplace.vercel.app`

---

## **STEP 4: Setup MongoDB Atlas**

### 4.1 Create Cluster
1. Go to https://cloud.mongodb.com/
2. Create M0 (free) cluster
3. Choose region (closest to you)
4. Wait for cluster to deploy (2-3 minutes)

### 4.2 Create Database User
1. Click "Database Access"
2. "Add New Database User"
3. Username: `kivyu_user`
4. Password: Generate secure password
5. Click "Add User"

### 4.3 Allow IP Access
1. Click "Network Access"
2. "Add IP Address"
3. Click "Allow Access from Anywhere"
4. Confirm

### 4.4 Get Connection String
1. Go to "Clusters"
2. Click "Connect"
3. Select "Connect your application"
4. Copy connection string:
```
mongodb+srv://kivyu_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

### 4.5 Update Railway Variables
1. Go back to Railway
2. Update `MONGODB_URI` with your connection string
3. Wait for auto-redeploy

✅ **Result**: Database connected to live backend

---

## **STEP 5: Setup Stripe Webhooks**

### 5.1 Get Webhook URL
From Railway dashboard:
```
https://your-api-xxxxxxx.up.railway.app/api/payments/webhook
```

### 5.2 Add Webhook to Stripe
1. Go to https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. Endpoint URL: `https://your-api-xxxxxxx.up.railway.app/api/payments/webhook`
4. Events: Select:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
5. Click "Add endpoint"
6. Copy "Signing secret" (starts with `whsec_`)
7. Update `STRIPE_WEBHOOK_SECRET` in Railway

✅ **Result**: Stripe webhooks connected

---

## **STEP 6: Update Frontend API URL**

### 6.1 Update API Client
Edit: `frontend/js/api-client.js`

Line 3, change:
```javascript
const API_BASE_URL = process.env.API_URL || 'http://localhost:5000/api';
```

To:
```javascript
const API_BASE_URL = 'https://your-api-xxxxxxx.up.railway.app/api';
```

### 6.2 Push to GitHub
```bash
git add .
git commit -m "Update API URL for production"
git push
```

### 6.3 Vercel Auto-Redeploys
Vercel automatically redeploys when you push to GitHub!

✅ **Result**: Frontend connected to live backend

---

## **STEP 7: Test Live URLs**

### 7.1 Test Backend Health
```bash
curl https://your-api-xxxxxxx.up.railway.app/health
```

Should return:
```json
{"success":true,"status":"API is running","timestamp":"2026-05-20..."}
```

### 7.2 Register Account
1. Open: `https://your-vercel-url.vercel.app/frontend/pages/auth/register.html`
2. Fill in: First Name, Last Name, Email, Password
3. Click "Create Account"

### 7.3 Login
1. Open: `https://your-vercel-url.vercel.app/frontend/pages/auth/login.html`
2. Enter email and password
3. Should redirect to dashboard

### 7.4 Test API Directly
```bash
# Register
curl -X POST https://your-api-xxxxxxx.up.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@test.com",
    "password": "test123456",
    "role": "buyer"
  }'

# Login
curl -X POST https://your-api-xxxxxxx.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@test.com",
    "password": "test123456"
  }'
```

✅ **Result**: Live marketplace working!

---

## **STEP 8: Custom Domain (Optional)**

### 8.1 Railway Custom Domain
1. Railway Project → Settings → Domain
2. Add domain: `api.your-domain.com`
3. Update DNS records (instructions on Railway)

### 8.2 Vercel Custom Domain
1. Vercel Project → Settings → Domains
2. Add domain: `your-domain.com`
3. Update DNS records (instructions on Vercel)

---

## **📋 Your Live URLs**

Once deployed, share these links:

```
🌐 Frontend: https://your-vercel-url.vercel.app
📡 Backend API: https://your-api-xxxxxxx.up.railway.app
🔧 Admin: https://your-vercel-url.vercel.app/frontend/pages/admin/admin-dashboard.html
```

---

## **🔑 Environment Variables Checklist**

### Backend (Railway)
- [ ] MONGODB_URI - MongoDB Atlas connection string
- [ ] JWT_SECRET - Secret key for JWT
- [ ] STRIPE_SECRET_KEY - Stripe test/live key
- [ ] STRIPE_WEBHOOK_SECRET - Stripe webhook signing secret
- [ ] EMAIL_HOST - SMTP host (e.g., smtp.gmail.com)
- [ ] EMAIL_USER - Email address
- [ ] EMAIL_PASSWORD - Email password/app password
- [ ] FRONTEND_URL - Your Vercel URL
- [ ] NODE_ENV - Set to "production"

### Frontend (Vercel)
- [ ] API_URL - Your Railway backend URL

---

## **🧪 Test Checklist**

- [ ] Backend health check returns 200
- [ ] Can register new user
- [ ] Can login with credentials
- [ ] Dashboard loads with user data
- [ ] Can browse services
- [ ] API returns data with proper headers
- [ ] Error handling works (try invalid password)
- [ ] Token persists after refresh

---

## **⚠️ Important Notes**

1. **Keep .env files safe** - Never commit .env to GitHub
2. **Update API URL** - Frontend must know backend URL
3. **CORS configured** - Backend allows frontend domain
4. **SSL/HTTPS** - Both Railway and Vercel provide free HTTPS
5. **Auto-scaling** - Both services auto-scale with traffic
6. **Free tier limits** - Railway: 500 hours/month, Vercel: unlimited

---

## **Troubleshooting**

### "API connection refused"
- ✅ Check backend URL is correct in frontend
- ✅ Check Railway deployment succeeded
- ✅ Check environment variables are set

### "MongoDB connection failed"
- ✅ Check connection string is correct
- ✅ Check IP whitelist includes 0.0.0.0/0
- ✅ Check MongoDB Atlas cluster is created

### "Frontend won't load"
- ✅ Check Vercel deployment succeeded
- ✅ Check file paths are correct
- ✅ Open browser console for errors

### "Payment webhook not working"
- ✅ Check webhook URL is correct
- ✅ Check STRIPE_WEBHOOK_SECRET is set
- ✅ Check events are selected in Stripe dashboard

---

## **Next Steps**

1. ✅ Deploy backend (Railway) - **~5 minutes**
2. ✅ Deploy frontend (Vercel) - **~5 minutes**
3. ✅ Setup MongoDB Atlas - **~10 minutes**
4. ✅ Configure Stripe webhooks - **~5 minutes**
5. ✅ Test live URLs - **~5 minutes**

**Total: ~30 minutes for live deployment! 🚀**

---

## **Monitoring & Maintenance**

### Railway Dashboard
- Monitor: CPU, Memory, Logs
- Check: Deployment status
- View: Error logs in real-time

### Vercel Dashboard
- Monitor: Page load times
- View: Error logs
- Analytics: Traffic stats

### GitHub
- Push updates → Auto-redeploy (Railway + Vercel)
- View: Deployment history

---

## **Scaling & Performance**

### Current Limits (Free Tier)
- Railway: 500 hours/month (plenty for testing)
- Vercel: 100 GB bandwidth/month
- MongoDB Atlas: 5 GB storage

### When You Need to Upgrade
- **Railway Pro**: Pay-as-you-go ($5+/month)
- **Vercel Pro**: $20/month for team features
- **MongoDB Atlas**: Atlas M2 ($9/month)

---

## **Success! 🎉**

Your marketplace is now:
- ✅ Live on the internet
- ✅ Accessible 24/7
- ✅ Automatically deployed (via GitHub)
- ✅ Fully functional (registration, orders, payments)
- ✅ Shareable with anyone

**Share your link:**
```
https://your-vercel-url.vercel.app
```

---

**Need help? Check the troubleshooting section or review the IMPLEMENTATION_GUIDE.md**
