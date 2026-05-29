export default function handler(req, res) {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY;
    const keyStatus = apiKey ? (apiKey.substring(0, 20) + '...' + apiKey.substring(apiKey.length - 10)) : 'NOT SET';

    return res.status(200).json({
      status: 'ok',
      apiKeyPresent: !!apiKey,
      apiKeyPreview: keyStatus,
      nodeEnv: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Debug endpoint error',
      message: error.message
    });
  }
}
