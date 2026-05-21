// The Doc Lovato Method — Stripe Checkout session creator
// Plan is selected server-side from a fixed allowlist; the caller cannot
// supply a raw priceId. CORS is pinned to ALLOWED_ORIGIN.

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Source of truth for paid tiers. Keep in sync with stripe-webhook.js PRICE_TO_TIER.
const PLAN_TO_PRICE_ID = {
  forge:     'price_1TLJUbGdEZ2HZMx4LlHGNvJy',
  forgeplus: 'price_1TLJnuGdEZ2HZMx4YGEAPMB2'
};

const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || 'https://forgeiq.netlify.app';

exports.handler = async function (event) {
  const headers = {
    'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
    'Vary': 'Origin',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('[checkout] STRIPE_SECRET_KEY not set');
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Server misconfigured' }) };
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Bad JSON' }) };
  }

  const { plan, userEmail, userId } = body;

  if (typeof plan !== 'string' || !Object.prototype.hasOwnProperty.call(PLAN_TO_PRICE_ID, plan)) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Unknown plan' }) };
  }
  const priceId = PLAN_TO_PRICE_ID[plan];

  const siteUrl = process.env.URL || ALLOWED_ORIGIN;

  try {
    const sessionParams = {
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${siteUrl}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/cancel.html`,
      metadata: { plan: plan }
    };

    if (typeof userEmail === 'string' && userEmail.indexOf('@') > 0) {
      sessionParams.customer_email = userEmail;
    }
    // Accept real Supabase user ids only; reject the legacy "guest_*" pattern
    // (see auth-guard / signup intentional guest-access design in session notes).
    if (typeof userId === 'string' && userId && userId.indexOf('guest_') !== 0) {
      sessionParams.metadata.supabase_user_id = userId;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ url: session.url })
    };
  } catch (err) {
    console.error('[checkout] Stripe error:', err.message);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Could not start checkout' })
    };
  }
};
