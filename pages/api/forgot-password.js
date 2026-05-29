import { users } from '../../lib/db.js';

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
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = users.findByEmail(email);
    if (!user) {
      // For security, don't reveal if user exists
      return res.status(200).json({
        success: true,
        message: 'If an account exists with this email, a reset link has been sent.',
      });
    }

    // Generate password reset token
    const resetToken = users.createPasswordReset(email);

    // In production, send email via SendGrid/Mailgun
    const resetLink = `https://fxaro.com/?page=reset-password&token=${resetToken}`;
    console.log(`[DEMO] Reset link for ${email}: ${resetLink}`);

    return res.status(200).json({
      success: true,
      message: 'Password reset link sent to email',
      // For demo purposes only - in production, don't return token
      resetToken: resetToken,
      resetLink: resetLink,
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({
      error: 'Failed to process password reset request',
      message: error.message,
    });
  }
}
