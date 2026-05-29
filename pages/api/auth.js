import { users } from '../../lib/db.js';
import crypto from 'crypto';

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

  try {
    const { action, email, password, name } = req.body;

    if (!action || !email || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (action === 'register') {
      if (!name) {
        return res.status(400).json({ error: 'Name required for registration' });
      }

      // Validate password strength
      if (password.length < 8) {
        return res.status(400).json({ error: 'Password must be at least 8 characters' });
      }

      if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
        return res.status(400).json({ error: 'Password must contain uppercase letter and number' });
      }

      try {
        const user = users.create(email, password, name);
        const token = Buffer.from(JSON.stringify({
          id: user.id,
          email: user.email,
          name: user.name,
          plan: user.plan,
        })).toString('base64');

        return res.status(201).json({
          success: true,
          message: 'Account created successfully. Please verify your email.',
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            plan: user.plan,
            emailVerified: user.emailVerified,
          },
          token: token,
        });
      } catch (error) {
        return res.status(400).json({
          error: 'Registration failed',
          message: error.message,
        });
      }
    }

    if (action === 'login') {
      try {
        const user = users.findByEmail(email);
        
        if (!user) {
          return res.status(401).json({ error: 'Invalid email or password' });
        }

        const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
        if (user.passwordHash !== passwordHash) {
          return res.status(401).json({ error: 'Invalid email or password' });
        }

        const token = Buffer.from(JSON.stringify({
          id: user.id,
          email: user.email,
          name: user.name,
          plan: user.plan,
        })).toString('base64');

        return res.status(200).json({
          success: true,
          message: 'Logged in successfully',
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            plan: user.plan,
            emailVerified: user.emailVerified,
          },
          token: token,
        });
      } catch (error) {
        return res.status(500).json({
          error: 'Login failed',
          message: error.message,
        });
      }
    }

    return res.status(400).json({ error: 'Invalid action' });
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(500).json({
      error: 'Authentication failed',
      message: error.message,
    });
  }
}
