import { users } from '../../lib/db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const token = req.body?.token || req.query?.token;

    if (!token) {
      return res.status(400).json({ error: 'Verification token is required' });
    }

    // Verify email with token
    const user = users.verifyEmail(token);

    return res.status(200).json({
      success: true,
      message: 'Email verified successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        plan: user.plan,
      },
    });
  } catch (error) {
    console.error('Email verification error:', error);
    return res.status(400).json({
      error: 'Invalid or expired verification token',
      message: error.message,
    });
  }
}
