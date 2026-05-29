export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { provider } = req.body;

    if (!provider || !['google', 'apple'].includes(provider)) {
      return res.status(400).json({ error: 'Invalid provider' });
    }

    // In production: generate OAuth authorization URL
    const params = {
      google: {
        baseUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
        params: {
          client_id: process.env.GOOGLE_CLIENT_ID,
          redirect_uri: 'https://fxaro.com/api/oauth-callback?provider=google',
          response_type: 'code',
          scope: 'openid email profile',
          prompt: 'consent'
        }
      },
      apple: {
        baseUrl: 'https://appleid.apple.com/auth/authorize',
        params: {
          client_id: process.env.APPLE_CLIENT_ID,
          redirect_uri: 'https://fxaro.com/api/oauth-callback?provider=apple',
          response_type: 'code',
          scope: 'openid email name',
          response_mode: 'form_post'
        }
      }
    };

    const config = params[provider];
    const queryString = new URLSearchParams(config.params).toString();
    const authorizationUrl = `${config.baseUrl}?${queryString}`;

    console.log(`[OAuth] Initiated ${provider} login flow`);

    return res.status(200).json({
      success: true,
      provider: provider,
      authorizationUrl: authorizationUrl,
      message: 'OAuth flow ready. Redirect user to authorizationUrl'
    });
  } catch (error) {
    console.error('OAuth init error:', error);
    return res.status(500).json({
      error: 'Failed to initialize OAuth',
      message: error.message,
    });
  }
}
