export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages, system } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'messages array required' });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    console.error('OPENROUTER_API_KEY not set');
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    // Build messages array with system message if provided
    let allMessages = [];
    if (system) {
      allMessages.push({
        role: 'system',
        content: system
      });
    }
    allMessages = allMessages.concat(messages.map(msg => ({
      role: msg.role,
      content: msg.content
    })));

    console.log('Calling OpenRouter API with', allMessages.length, 'messages');

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://fxaro.com',
        'X-Title': 'FXARO'
      },
      body: JSON.stringify({
        model: 'mistralai/mistral-7b-instruct:free',
        messages: allMessages,
        max_tokens: 1000,
        temperature: 0.7
      }),
    });

    console.log('OpenRouter response status:', response.status);

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenRouter error:', error);
      return res.status(response.status).json({ error: error || 'API error' });
    }

    const data = await response.json();
    console.log('OpenRouter response:', data.choices?.[0]?.message?.content?.substring(0, 50));

    const content = data.choices?.[0]?.message?.content || 'No response from API';

    return res.status(200).json({ content });
  } catch (error) {
    console.error('Chat API error:', error.message);
    return res.status(500).json({ error: `Server error: ${error.message}` });
  }
}
