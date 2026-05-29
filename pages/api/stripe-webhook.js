import { users } from '../../lib/db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const event = req.body;

    // In production: verify webhook signature
    // const sig = req.headers['stripe-signature'];
    // const event = stripe.webhooks.constructEvent(
    //   req.body,
    //   sig,
    //   process.env.STRIPE_WEBHOOK_SECRET
    // );

    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        const userId = paymentIntent.metadata?.userId;
        const plan = paymentIntent.metadata?.plan;

        if (userId && plan) {
          users.updatePlan(userId, plan);
          console.log(`[STRIPE] Payment succeeded for user ${userId}, upgrading to ${plan}`);
        }
        break;

      case 'customer.subscription.deleted':
        const subscription = event.data.object;
        const subUserId = subscription.metadata?.userId;
        if (subUserId) {
          users.updatePlan(subUserId, 'Starter');
          console.log(`[STRIPE] Subscription cancelled for user ${subUserId}, downgrading to Starter`);
        }
        break;
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(400).json({ error: error.message });
  }
}
