# 🚀 KIVYU Marketplace - Quick Start Guide

## **Option 1: Docker (Easiest - Everything Automated)**

### Requirements
- Docker Desktop installed on your machine
- Download from: https://www.docker.com/products/docker-desktop

### Run Everything with One Command
```bash
cd C:\Users\User\.openclaw
docker-compose up
```

Wait for the output:
```
✓ KIVYU API Server running on port 5000
✓ MongoDB: Connected
```

That's it! Everything is running.

### Access the Application
- **Backend API**: http://localhost:5000
- **Frontend**: http://localhost:8000
- **MongoDB**: localhost:27017 (internal)

---

## **Option 2: Manual Local Setup (Without Docker)**

### Requirements
1. **Node.js** (v18+) - https://nodejs.org/
2. **MongoDB** - https://www.mongodb.com/try/download/community
3. **Python 3** (for frontend server)

### Step 1: Start MongoDB
```bash
# Windows - MongoDB should auto-start as service
# Or manually: mongod
```

### Step 2: Start Backend
```bash
cd C:\Users\User\.openclaw\backend
npm install
npm start
```

Expected output:
```
✓ KIVYU API Server running on port 5000
✓ MongoDB: Connected
```

### Step 3: Start Frontend Server (New Terminal)
```bash
cd C:\Users\User\.openclaw
python3 -m http.server 8000
```

### Step 4: Access Application
- **Register**: http://localhost:8000/frontend/pages/auth/register.html
- **Login**: http://localhost:8000/frontend/pages/auth/login.html
- **Services**: http://localhost:8000/frontend/pages/marketplace/services.html
- **Dashboard**: http://localhost:8000/frontend/pages/dashboard/buyer-dashboard.html

---

## **Option 3: Cloud Deployment (Live URL)**

### Deploy Backend to Railway (Free)

1. Go to https://railway.app
2. Sign up with GitHub
3. Create new project → Deploy from GitHub
4. Connect to your `.openclaw` repository
5. Add environment variables (from .env file)
6. Deploy!

### Deploy Frontend to Vercel (Free)

1. Go to https://vercel.com
2. Sign up with GitHub
3. Import project
4. Set build command: `npm run build` (or leave empty for static)
5. Deploy!

Result: Live URLs like:
- https://your-api-xxxxx.railway.app
- https://your-app-xxxxx.vercel.app

---

## **Testing Checklist**

### ✅ Backend is Working
```bash
curl http://localhost:5000/health
```
Should return: `{"success":true,"status":"API is running"}`

### ✅ Register User
1. Go to http://localhost:8000/frontend/pages/auth/register.html
2. Fill in: First Name, Last Name, Email, Password
3. Select role: "Buy Services"
4. Click "Create Account"

### ✅ Login
1. Go to http://localhost:8000/frontend/pages/auth/login.html
2. Enter email and password from registration
3. Click "Sign In"
4. Should redirect to dashboard

### ✅ View Dashboard
1. After login, see your profile and order stats
2. Click "Browse Services" to view marketplace

### ✅ Browse Services
1. See list of services (empty initially)
2. Use filters: Category, Price, Rating
3. Search for services

---

## **API Testing with Postman/cURL**

### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@test.com",
    "password": "test123456",
    "role": "buyer"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@test.com",
    "password": "test123456"
  }'
```

Response will include `token` - save this for authorized requests.

### Get User Profile (Authorized)
```bash
curl -X GET http://localhost:5000/api/users/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Get All Services
```bash
curl -X GET http://localhost:5000/api/services \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## **Available Endpoints**

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Current user
- `POST /api/auth/logout` - Logout

### Services (30+ endpoints)
- `GET /api/services` - List services
- `GET /api/services/:id` - Service details
- `POST /api/services` - Create service
- `PUT /api/services/:id` - Update service
- `DELETE /api/services/:id` - Delete service

### Orders (8+ endpoints)
- `GET /api/orders` - Your orders
- `POST /api/orders` - Create order
- `GET /api/orders/:id` - Order details
- `PUT /api/orders/:id/status` - Update status

### Payments (7+ endpoints)
- `POST /api/payments/create-checkout` - Stripe checkout
- `GET /api/payments/history` - Payment history
- `GET /api/payments/balance` - Wallet balance

### Reviews (9+ endpoints)
- `POST /api/reviews` - Create review
- `GET /api/reviews/service/:id` - Service reviews
- `GET /api/reviews/seller/:id` - Seller reviews

### Admin (11+ endpoints)
- `GET /api/admin/dashboard` - Analytics
- `GET /api/admin/users` - All users
- `GET /api/admin/orders` - All orders

---

## **Troubleshooting**

### "Connection Refused" Error
- **Solution**: Make sure backend is running on port 5000
- Check: http://localhost:5000/health

### "MongoDB Connection Error"
- **Solution 1 (Docker)**: Run `docker-compose up`
- **Solution 2 (Manual)**: Start MongoDB service
  - Windows: Check Services app → MongoDB Server
  - Or run: `mongod`

### "Frontend pages won't load"
- **Solution**: Make sure Python HTTP server is running
  - Run: `python3 -m http.server 8000`
  - From: `C:\Users\User\.openclaw` directory

### "Login not working"
- Check browser console (F12) for errors
- Verify backend is running
- Clear localStorage: `localStorage.clear()`

### "Services list is empty"
- This is normal! Create a service first as a seller
- Or use the admin API to create test data

---

## **Next Steps**

1. ✅ Get backend & frontend running (this guide)
2. ✅ Test registration & login
3. ✅ Browse services & create orders
4. ✅ Test payment flow (Stripe test cards)
5. ✅ Test admin dashboard
6. ✅ Deploy to production (Railway + Vercel)

---

## **Environment Variables**

Located in: `C:\Users\User\.openclaw\backend\.env`

```
# Required
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/kivyu
JWT_SECRET=your_secret_key_here
PORT=5000
NODE_ENV=development

# Optional (for features)
STRIPE_SECRET_KEY=sk_test_xxx
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
```

---

## **Need Help?**

1. Check `IMPLEMENTATION_GUIDE.md` for full documentation
2. Check API endpoint details
3. Review database schema in models/ folder
4. Check error messages in browser console (F12)
5. Check backend logs in terminal

---

## **Important Files**

- `backend/server.js` - Main backend file
- `backend/.env` - Configuration
- `frontend/js/api-client.js` - API wrapper
- `frontend/pages/auth/login.html` - Login page
- `frontend/pages/marketplace/services.html` - Services page
- `docker-compose.yml` - Docker setup (all services)

---

**🎉 You're all set! Start with Option 1 (Docker) for easiest setup.**
