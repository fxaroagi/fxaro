export default async function handler(req, res) {
  // Allow CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages, system } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'messages array required' });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey || apiKey === 'paste_your_key_here') {
      return res.status(500).json({ error: 'OpenRouter API key not configured' });
    }

    // Build messages with system prompt
    const requestMessages = [];
    if (system) {
      requestMessages.push({
        role: 'system',
        content: system
      });
    }
    requestMessages.push(...messages);

    const openrouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://fxaro.com',
        'X-Title': 'FXARO'
      },
      body: JSON.stringify({
        model: 'mistralai/mistral-7b-instruct:free',
        messages: requestMessages,
        max_tokens: 500,
        temperature: 0.7
      })
    });

    if (!openrouterResponse.ok) {
      const errorData = await openrouterResponse.text();
      return res.status(openrouterResponse.status).json({
        error: `OpenRouter error: ${openrouterResponse.status}`,
        details: errorData.substring(0, 200)
      });
    }

    const data = await openrouterResponse.json();

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      return res.status(500).json({ error: 'Invalid response format from OpenRouter' });
    }

    return res.status(200).json({
      content: data.choices[0].message.content
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}
