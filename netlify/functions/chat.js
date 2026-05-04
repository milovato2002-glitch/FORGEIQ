// The Doc Lovato Method — Anthropic chat proxy
// Netlify synchronous function limit: 26 seconds; we abort at 25s.
exports.config = { maxDuration: 26 };

const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || 'https://forgeiq.netlify.app';
const FETCH_TIMEOUT_MS = 25000;

exports.handler = async function(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
    'Vary': 'Origin',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return { statusCode: 500, headers, body: JSON.stringify({ error: 'ANTHROPIC_API_KEY not set' }) };
  let body;
  try { body = JSON.parse(event.body || '{}'); } catch(e) { return { statusCode: 400, headers, body: JSON.stringify({ error: 'Bad JSON' }) }; }

  // Model is required — no silent default. Forces every caller to pass a valid Anthropic model id.
  if (!body.model || typeof body.model !== 'string' || !body.model.trim()) {
    console.error('[chat] missing model field; caller path or referrer should be checked');
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'model field is required' }) };
  }

  const payload = { model: body.model, max_tokens: body.max_tokens || 2000, messages: body.messages || [] };
  if (body.system) payload.system = body.system;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    const text = await r.text();
    let data;
    try { data = JSON.parse(text); } catch(e) {
      console.error('[chat] Anthropic returned non-JSON:', text.slice(0, 500));
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'Anthropic returned non-JSON response', status: r.status, raw: text.slice(0, 500) }) };
    }
    if (data.error) {
      console.error('[chat] Anthropic API error:', JSON.stringify(data.error));
      return { statusCode: r.status, headers, body: JSON.stringify({ error: data.error.message || data.error.type || 'Anthropic API error', type: data.error.type, anthropic_status: r.status }) };
    }
    return { statusCode: r.status, headers, body: JSON.stringify(data) };
  } catch(err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      console.error('[chat] Anthropic request timed out at ' + FETCH_TIMEOUT_MS + 'ms');
      return { statusCode: 504, headers, body: JSON.stringify({ error: 'AI request timed out — please try again with a shorter prompt.' }) };
    }
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
