const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const PRICE_TO_TIER = {
  'price_1TLJUbGdEZ2HZMx4LlHGNvJy': 'forge',
  'price_1TLJnuGdEZ2HZMx4YGEAPMB2': 'forgeplus'
};

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  const sig = event.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!endpointSecret) {
    console.error('[stripe-webhook] STRIPE_WEBHOOK_SECRET not set');
    return { statusCode: 500, body: 'Webhook secret not configured' };
  }

  let stripeEvent;
  try {
    stripeEvent = stripe.webhooks.constructEvent(event.body, sig, endpointSecret);
  } catch (err) {
    console.error('[stripe-webhook] Signature verification failed:', err.message);
    return { statusCode: 400, body: `Webhook Error: ${err.message}` };
  }

  if (stripeEvent.type === 'checkout.session.completed') {
    const session = stripeEvent.data.object;
    const userId = session.metadata && session.metadata.supabase_user_id;
    const customerEmail = session.customer_details && session.customer_details.email;
    const subscriptionId = session.subscription;

    // Determine tier from the subscription's price
    let tier = 'forge'; // default
    if (subscriptionId) {
      try {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const priceId = subscription.items.data[0].price.id;
        tier = PRICE_TO_TIER[priceId] || 'forge';
      } catch (err) {
        console.error('[stripe-webhook] Failed to retrieve subscription:', err.message);
      }
    }

    // Update Supabase profile with tier
    const supabaseUrl = process.env.SUPABASE_URL || 'https://fxbzjuefctqsoypwhlha.supabase.co';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (supabaseKey && userId) {
      try {
        const res = await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${userId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Prefer': 'return=representation'
          },
          body: JSON.stringify({
            tier: tier,
            stripe_customer_id: session.customer,
            stripe_subscription_id: subscriptionId,
            subscription_status: 'active',
            updated_at: new Date().toISOString()
          })
        });
        const data = await res.json();
        console.log('[stripe-webhook] Profile updated for user:', userId, 'tier:', tier, 'result:', JSON.stringify(data).slice(0, 200));
      } catch (err) {
        console.error('[stripe-webhook] Supabase update failed:', err.message);
      }
    } else if (supabaseKey && customerEmail) {
      // Fallback: match by email if no userId in metadata
      try {
        const res = await fetch(`${supabaseUrl}/rest/v1/profiles?email=eq.${encodeURIComponent(customerEmail)}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Prefer': 'return=representation'
          },
          body: JSON.stringify({
            tier: tier,
            stripe_customer_id: session.customer,
            stripe_subscription_id: subscriptionId,
            subscription_status: 'active',
            updated_at: new Date().toISOString()
          })
        });
        const data = await res.json();
        console.log('[stripe-webhook] Profile updated by email:', customerEmail, 'tier:', tier);
      } catch (err) {
        console.error('[stripe-webhook] Supabase update by email failed:', err.message);
      }
    } else {
      console.warn('[stripe-webhook] No SUPABASE_SERVICE_ROLE_KEY or no userId/email — skipping profile update');
    }
  }

  if (stripeEvent.type === 'customer.subscription.deleted') {
    const subscription = stripeEvent.data.object;
    const supabaseUrl = process.env.SUPABASE_URL || 'https://fxbzjuefctqsoypwhlha.supabase.co';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (supabaseKey) {
      try {
        await fetch(`${supabaseUrl}/rest/v1/profiles?stripe_subscription_id=eq.${subscription.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`
          },
          body: JSON.stringify({
            subscription_status: 'canceled',
            updated_at: new Date().toISOString()
          })
        });
        console.log('[stripe-webhook] Subscription canceled:', subscription.id);
      } catch (err) {
        console.error('[stripe-webhook] Cancel update failed:', err.message);
      }
    }
  }

  return { statusCode: 200, body: JSON.stringify({ received: true }) };
};
