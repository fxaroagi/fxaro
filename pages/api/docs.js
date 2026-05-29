export default function handler(req, res) {
  const docs = `
# FXARO API Documentation

## Base URL
\`https://fxaro.com/api\`

## Authentication
Endpoints that require authentication use Bearer tokens in the Authorization header:
\`\`\`
Authorization: Bearer <token>
\`\`\`

## Endpoints

### 1. Authentication

#### Register
- **Endpoint:** POST /api/auth
- **Body:**
  \`\`\`json
  {
    "action": "register",
    "email": "user@example.com",
    "password": "SecurePass123",
    "name": "John Doe"
  }
  \`\`\`
- **Response:**
  \`\`\`json
  {
    "success": true,
    "message": "Account created successfully",
    "user": { "id", "email", "name", "plan" },
    "token": "base64_encoded_token"
  }
  \`\`\`

#### Login
- **Endpoint:** POST /api/auth
- **Body:**
  \`\`\`json
  {
    "action": "login",
    "email": "user@example.com",
    "password": "SecurePass123"
  }
  \`\`\`

#### Forgot Password
- **Endpoint:** POST /api/forgot-password
- **Body:** \`{ "email": "user@example.com" }\`
- **Response:** Returns reset token and link

#### Reset Password
- **Endpoint:** POST /api/reset-password
- **Body:**
  \`\`\`json
  {
    "token": "reset_token",
    "newPassword": "NewPass123",
    "confirmPassword": "NewPass123"
  }
  \`\`\`

#### Verify Email
- **Endpoint:** POST /api/verify-email
- **Body:** \`{ "token": "verification_token" }\`

### 2. Chat (AI Trading Signals)

#### Get Trading Signal
- **Endpoint:** POST /api/chat
- **Body:**
  \`\`\`json
  {
    "messages": [
      { "role": "user", "content": "What's your BTC outlook?" }
    ]
  }
  \`\`\`
- **Response:**
  \`\`\`json
  {
    "content": "Trading signal response from AI"
  }
  \`\`\`
- **Rate Limiting:**
  - Starter: 5 queries/day
  - Pro: Unlimited
  - Enterprise: Unlimited

### 3. Portfolio

#### Get Portfolio
- **Endpoint:** GET /api/portfolio
- **Response:**
  \`\`\`json
  {
    "portfolio": [
      { "symbol": "AAPL", "shares": 10, "currentPrice": 189.42, "gain": 1234.56 }
    ],
    "summary": {
      "totalValue": 5000,
      "totalGain": 1234.56,
      "gainPercent": 24.69
    }
  }
  \`\`\`

### 4. Email Subscription

#### Subscribe
- **Endpoint:** POST /api/subscribe
- **Body:** \`{ "email": "user@example.com" }\`
- **Response:**
  \`\`\`json
  {
    "success": true,
    "subscription": { "id", "email", "createdAt" }
  }
  \`\`\`

### 5. Payment

#### Create Checkout Session
- **Endpoint:** POST /api/payment
- **Body:**
  \`\`\`json
  {
    "action": "create-checkout",
    "plan": "Pro",
    "userId": "user_id"
  }
  \`\`\`

### 6. Trading Signals

#### Send Daily Signals
- **Endpoint:** POST /api/send-signals
- **Body:** \`{ "action": "send-daily-signals" }\`
- **Response:** Array of 5 trading signals

## Error Handling

All endpoints return errors in this format:
\`\`\`json
{
  "error": "Error message",
  "message": "Detailed error message"
}
\`\`\`

## Rate Limiting
- Default: 100 requests/minute
- Pro plan: 1000 requests/minute
- Enterprise: Unlimited

## CORS
All endpoints support CORS from \`*\` origin.

## Status Codes
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 404: Not Found
- 405: Method Not Allowed
- 500: Server Error

## Support
For API support, contact: api-support@fxaro.com
`;

  res.setHeader('Content-Type', 'text/markdown');
  res.status(200).send(docs);
}
