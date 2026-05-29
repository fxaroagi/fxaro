# 🔌 INTEGRATION GUIDE

## Quick Setup

### 1. SendGrid Email Service

```bash
# Install package
npm install @sendgrid/mail

# Add to .env.local
SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@fxaro.com

# In pages/api/email-send.js, uncomment and use:
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
```

### 2. Stripe Payment Processing

```bash
# Install package
npm install stripe

# Add to .env.local
STRIPE_PUBLIC_KEY=pk_test_xxxxx
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# Uncomment Stripe code in pages/api/stripe-checkout.js
# Set up webhook in Stripe Dashboard pointing to:
# https://fxaro.com/api/stripe-webhook
```

### 3. Google OAuth

```bash
# 1. Create OAuth app at: https://console.cloud.google.com
# 2. Add redirect URI: https://fxaro.com/api/oauth-callback?provider=google
# 3. Get credentials

# Add to .env.local
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret

# Uncomment code in pages/api/oauth-init.js
# Test flow at: POST /api/oauth-init with { provider: "google" }
```

### 4. Apple OAuth

```bash
# 1. Go to: https://developer.apple.com
# 2. Create App ID and Sign In with Apple capability
# 3. Create Service ID and configure URLs

# Add to .env.local
APPLE_CLIENT_ID=com.fxaro.app
APPLE_TEAM_ID=your-team-id
APPLE_KEY_ID=your-key-id
APPLE_CLIENT_SECRET=your-client-secret

# Uncomment code in pages/api/oauth-init.js
# Test flow at: POST /api/oauth-init with { provider: "apple" }
```

### 5. NewsAPI Integration

```bash
# 1. Get API key at: https://newsapi.org
# 2. Add to .env.local
NEWSAPI_KEY=your-api-key

# Update pages/api/news.js to use real API:
const response = await fetch(
  `https://newsapi.org/v2/everything?q=${searchQuery}&apiKey=${process.env.NEWSAPI_KEY}`
);
```

### 6. PostgreSQL Database (Optional Upgrade)

```bash
# Install driver
npm install pg

# Add to .env.local
DATABASE_URL=postgresql://user:password@localhost:5432/fxaro

# Create migration file in lib/db-postgres.js
# Update API calls to use PostgreSQL instead of JSON files
```

## Testing Integrations

### Email
```bash
curl -X POST http://localhost:3000/api/send-verification-email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

### Stripe
```bash
curl -X POST http://localhost:3000/api/stripe-checkout \
  -H "Content-Type: application/json" \
  -d '{"plan":"Pro","userId":"user123"}'
```

### OAuth
```bash
curl -X POST http://localhost:3000/api/oauth-init \
  -H "Content-Type: application/json" \
  -d '{"provider":"google"}'
```

### News
```bash
curl "http://localhost:3000/api/news?market=NASDAQ"
```

## Production Deployment

1. **Add Secrets in Vercel Dashboard**
   - Environment Variables section
   - Add all .env keys
   - Deploy

2. **Configure Third-Party Webhooks**
   - Stripe: Settings → Webhooks → Add endpoint
   - SendGrid: Already webhooks-ready
   - OAuth: Redirect URIs already set

3. **Verify All APIs**
   - Test each endpoint in production
   - Monitor logs for errors
   - Check response times

4. **Security Checklist**
   - All API keys rotate monthly
   - Webhook signatures verified
   - Rate limiting enabled
   - HTTPS enforced
   - CORS origins whitelist set

## Cost Estimation

- SendGrid: Free tier (12,000 emails/month)
- Stripe: 2.9% + $0.30 per transaction
- Google Cloud: Pay as you go (Free tier available)
- Apple OAuth: Free
- NewsAPI: Free tier (500 requests/day)

## Support

Need help? Check:
- `/api/docs` - API reference
- `PROJECT_COMPLETE.md` - Status
- `.env.example` - Configuration template
