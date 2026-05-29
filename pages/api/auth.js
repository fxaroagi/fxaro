export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { action, email, password, name } = req.body;

  if (!action || !email || !password) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Simulate user database (in production, use actual database)
  const users = {};

  try {
    if (action === 'register') {
      if (!name) {
        return res.status(400).json({ error: 'Name required for registration' });
      }

      const userKey = `user_${email}`;
      const mockUser = {
        id: Math.random().toString(36).substr(2, 9),
        name,
        email,
        password: Buffer.from(password).toString('base64'),
        createdAt: new Date().toISOString(),
        plan: 'Starter',
      };

      return res.status(201).json({
        success: true,
        message: 'Account created successfully',
        user: { id: mockUser.id, name: mockUser.name, email: mockUser.email, plan: mockUser.plan },
        token: Buffer.from(JSON.stringify(mockUser)).toString('base64'),
      });
    }

    if (action === 'login') {
      const mockUser = {
        id: Math.random().toString(36).substr(2, 9),
        name: email.split('@')[0],
        email,
        plan: 'Pro',
        createdAt: new Date().toISOString(),
      };

      return res.status(200).json({
        success: true,
        message: 'Logged in successfully',
        user: { id: mockUser.id, name: mockUser.name, email: mockUser.email, plan: mockUser.plan },
        token: Buffer.from(JSON.stringify(mockUser)).toString('base64'),
      });
    }

    return res.status(400).json({ error: 'Invalid action' });
  } catch (error) {
    return res.status(500).json({
      error: 'Authentication failed',
      message: error.message,
    });
  }
}
