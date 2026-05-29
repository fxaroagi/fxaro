import { users } from '../../lib/db.js';

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
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = users.findByEmail(email);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.emailVerified) {
      return res.status(400).json({ error: 'Email already verified' });
    }

    const verificationLink = `https://fxaro.com/?page=verify-email&token=${user.verificationToken}`;

    // In production, send via SendGrid
    console.log(`[VERIFICATION EMAIL] To: ${email}`);
    console.log(`[VERIFICATION EMAIL] Link: ${verificationLink}`);

    return res.status(200).json({
      success: true,
      message: 'Verification email sent',
      verificationLink: verificationLink, // For demo only
    });
  } catch (error) {
    console.error('Verification email error:', error);
    return res.status(500).json({
      error: 'Failed to send verification email',
      message: error.message,
    });
  }
}
