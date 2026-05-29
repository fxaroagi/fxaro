export default async function handler(req, res) {
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
    const { to, subject, html, type } = req.body;

    if (!to || !subject || !html) {
      return res.status(400).json({ error: 'Missing required fields (to, subject, html)' });
    }

    // In production, use SendGrid API:
    // const sgMail = require('@sendgrid/mail');
    // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    
    // const msg = {
    //   to,
    //   from: 'noreply@fxaro.com',
    //   subject,
    //   html,
    // };
    
    // await sgMail.send(msg);

    // For now, log to console (demo mode)
    console.log(`[EMAIL] To: ${to}`);
    console.log(`[EMAIL] Subject: ${subject}`);
    console.log(`[EMAIL] Type: ${type || 'generic'}`);

    return res.status(200).json({
      success: true,
      message: `Email sent to ${to}`,
      type: type || 'generic',
      // In production, return messageId from SendGrid
      // messageId: response.headers['x-message-id']
    });
  } catch (error) {
    console.error('Email error:', error);
    return res.status(500).json({
      error: 'Failed to send email',
      message: error.message,
    });
  }
}
