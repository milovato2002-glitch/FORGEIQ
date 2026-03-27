exports.handler = async function(event, context) {
  const CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: CORS, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: 'API key not configured' }) };
  }

  try {
    const body = JSON.parse(event.body || '{}');

    // Build the Anthropic API request
    const requestBody = {
      model: body.model || 'claude-sonnet-4-6-20250514',
      max_tokens: body.max_tokens || 2000,
      messages: body.messages || []
    };

    // System prompt — accept as top-level string
    if (body.system) {
      requestBody.system = body.system;
    }

    // Validate messages exist
    if (!requestBody.messages.length) {
      return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'No messages provided' }) };
    }

    // Filter out any accidental system role in messages (Anthropic rejects it)
    requestBody.messages = requestBody.messages.filter(m => m.role === 'user' || m.role === 'assistant');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(requestBody)
    });

    const responseText = await response.text();

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      return {
        statusCode: 502,
        headers: CORS,
        body: JSON.stringify({ error: 'Failed to parse API response', raw: responseText.substring(0, 500) })
      };
    }

    if (!response.ok) {
      return {
        statusCode: response.status,
        headers: CORS,
        body: JSON.stringify({ error: data.error?.message || 'API error', type: data.error?.type, status: response.status })
      };
    }

    return {
      statusCode: 200,
      headers: CORS,
      body: JSON.stringify(data)
    };

  } catch (err) {
    return {
      statusCode: 500,
      headers: CORS,
      body: JSON.stringify({ error: err.message })
    };
  }
};
