// Netlify synchronous function limit: 26 seconds
exports.config = { maxDuration: 26 };

exports.handler = async function(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
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
  const payload = { model: body.model || 'claude-sonnet-4-5', max_tokens: body.max_tokens || 2000, messages: body.messages || [] };
  if (body.system) payload.system = body.system;
  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify(payload)
    });
    const text = await r.text();
    let data;
    try { data = JSON.parse(text); } catch(e) {
      console.error('[FORGEIQ chat] Anthropic returned non-JSON:', text.slice(0, 500));
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'Anthropic returned non-JSON response', status: r.status, raw: text.slice(0, 500) }) };
    }
    if (data.error) {
      console.error('[FORGEIQ chat] Anthropic API error:', JSON.stringify(data.error));
      return { statusCode: r.status, headers, body: JSON.stringify({ error: data.error.message || data.error.type || 'Anthropic API error', type: data.error.type, anthropic_status: r.status }) };
    }
    return { statusCode: r.status, headers, body: JSON.stringify(data) };
  } catch(err) { return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) }; }
};