import { subscriptions } from '../../lib/db.js';

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Invalid email' });
    }

    const result = subscriptions.create(email);

    res.status(200).json({
      success: true,
      message: 'Successfully subscribed to daily trading signals',
      email: email
    });
  } catch (error) {
    console.error('Subscribe error:', error);
    res.status(500).json({
      error: 'Subscription failed',
      message: error.message
    });
  }
}
