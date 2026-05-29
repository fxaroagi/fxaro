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
    const { plan, userId } = req.body;

    if (!plan || !userId) {
      return res.status(400).json({ error: 'Plan and userId are required' });
    }

    const user = users.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const plans = {
      'Pro': { price: 2900, interval: 'month' }, // $29/month in cents
      'Enterprise': { price: 9900, interval: 'month' } // $99/month in cents
    };

    const planData = plans[plan];
    if (!planData) {
      return res.status(400).json({ error: 'Invalid plan' });
    }

    // In production: create Stripe checkout session
    // const session = await stripe.checkout.sessions.create({
    //   payment_method_types: ['card'],
    //   mode: 'subscription',
    //   customer_email: user.email,
    //   line_items: [
    //     {
    //       price_data: {
    //         currency: 'usd',
    //         product_data: { name: `FXARO ${plan}` },
    //         unit_amount: planData.price,
    //         recurring: { interval: planData.interval }
    //       },
    //       quantity: 1
    //     }
    //   ],
    //   success_url: 'https://fxaro.com/?tab=Pricing&success=true',
    //   cancel_url: 'https://fxaro.com/?tab=Pricing',
    //   metadata: { userId, plan }
    // });

    // Demo response
    const checkoutUrl = `https://checkout.stripe.com/pay/demo_${plan}_${user.id}`;

    console.log(`[STRIPE] Checkout session created for ${plan} plan (${user.email})`);

    return res.status(200).json({
      success: true,
      checkoutUrl: checkoutUrl,
      plan: plan,
      amount: planData.price / 100, // Convert back to dollars
      currency: 'USD',
      message: 'In production, user would be redirected to Stripe checkout'
    });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return res.status(500).json({
      error: 'Failed to create checkout session',
      message: error.message,
    });
  }
}
