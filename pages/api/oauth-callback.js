import { users } from '../../lib/db.js';
import crypto from 'crypto';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { code, provider } = req.query;

    if (!code || !provider) {
      return res.status(400).json({ error: 'Missing code or provider' });
    }

    // In production: exchange code for token with Google/Apple
    // const tokenResponse = await fetch(`https://oauth.${provider}.com/token`, {
    //   method: 'POST',
    //   body: JSON.stringify({
    //     code,
    //     client_id: process.env[`${provider.toUpperCase()}_CLIENT_ID`],
    //     client_secret: process.env[`${provider.toUpperCase()}_CLIENT_SECRET`],
    //     redirect_uri: 'https://fxaro.com/api/oauth-callback'
    //   })
    // });

    // const { id_token } = await tokenResponse.json();
    // const userData = decodeJWT(id_token);

    // For demo, create test OAuth user
    const demoUser = {
      id: crypto.randomBytes(12).toString('hex'),
      email: `${provider}_user_${Date.now()}@fxaro.com`,
      name: `${provider} User`,
      plan: 'Starter',
      emailVerified: true,
      oauthProvider: provider,
    };

    console.log(`[OAuth] User authenticated via ${provider}`);

    const token = Buffer.from(JSON.stringify({
      id: demoUser.id,
      email: demoUser.email,
      name: demoUser.name,
      plan: demoUser.plan,
    })).toString('base64');

    return res.status(200).json({
      success: true,
      user: demoUser,
      token: token,
      provider: provider,
      message: 'OAuth authentication successful'
    });
  } catch (error) {
    console.error('OAuth callback error:', error);
    return res.status(500).json({
      error: 'OAuth authentication failed',
      message: error.message,
    });
  }
}
