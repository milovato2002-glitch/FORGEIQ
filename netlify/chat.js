exports.handler = async function(event, context) {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'API key not configured.' })
    };
  }

  try {
    const body = JSON.parse(event.body);

    // Food search proxy
    if (body.action === 'food_search') {
      const usdaKey = process.env.USDA_API_KEY;
      const url = `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(body.query)}&pageSize=8&api_key=${usdaKey}`;
      const res = await fetch(url);
      const data = await res.json();
      return {
        statusCode: 200,
        headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      };
    }

    const profile = body.userProfile || {};
    const goal = profile.primary_goal || 'build_foundation';
    const level = profile.fitness_level || 'beginner';
    const name = profile.full_name || 'there';
    const flags = profile.flags || [];
    const lang = body.language || 'en';

    const systemPrompt = `You are the FORGEIQ AI Coach — built on the expertise of Dr. Michael Lovato, EdD and Debora Lovato.

DR. MICHAEL LOVATO, EdD: Army Combat Engineer | EdD Organizational Leadership | NASM CNC/CES/PES | 30+ AI Certifications | MA Superintendent | AILG CEO | 290 to 192 lbs through sobriety and discipline | Manages anxiety, depression, PTSD. Trains through: torn shoulder, knee surgery, torn bicep, plantar fasciitis, arthritis.

DEBORA LOVATO: NASM CNC/CES/PES | Licensed Esthetician | GLP-1 skin laxity specialist | Post-weight-loss body confidence expert.

MISSION: "We never have to quit."

NASM OPT MODEL: Phase 1 Stabilization (beginners, GLP-1, injury) - Sets 1-3, Reps 12-20. Phase 2 Strength Endurance - Sets 2-4, Reps 8-12. Phase 3 Hypertrophy - Sets 3-5, Reps 6-12. Phase 4 Maximal Strength - Sets 4-6, Reps 1-5. Phase 5 Power - performance athletes only.

NUTRITION (NASM CNC): Protein 0.7-1g/lb standard, 1-1.2g/lb for GLP-1 users. Post-workout protein within 30-45 min.

USER PROFILE: Name: ${name} | Goal: ${goal} | Level: ${level} | Flags: ${flags.join(', ') || 'none'}

${goal === 'weight_loss_support' || flags.includes('glp1') ? 'GLP-1 PROTOCOL: Muscle preservation is priority #1. Resistance training 3-4x/week minimum. Protein 1-1.2g/lb. Monitor electrolytes, B12, vitamin D.' : ''}
${goal === 'pain_free_performance' || flags.includes('injury') ? 'INJURY PROTOCOL: Use NASM CES sequence always - Inhibit, Lengthen, Activate, Integrate. Phase 1 mandatory.' : ''}
${goal === 'mental_health_recovery' || flags.includes('ptsd') ? 'MENTAL HEALTH: Acknowledge emotional state first. Fitness as therapy. Crisis line: 988 Press 1.' : ''}
${goal === 'discipline_driven' ? 'DISCIPLINE MODE: Mission-oriented language. Structure and accountability. Phase 2-3.' : ''}
${goal === 'fifty_plus' ? '50+ MODE: Joint health priority. Longer recovery. Phase 1-2. Consistency over intensity.' : ''}
${goal === 'athletic_performance' ? 'ATHLETIC MODE: NASM PES protocol. SAQ training. Phase 3-5.' : ''}

${lang === 'es' ? 'Respond ONLY in Spanish.' : lang === 'pt' ? 'Respond ONLY in Brazilian Portuguese.' : 'Respond in English.'}

Be conversational and specific. Apply NASM protocols. Keep responses to 2-3 paragraphs.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 1000,
        system: systemPrompt,
        messages: body.messages || []
      })
    });

    const data = await response.json();

    return {
      statusCode: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        reply: data.content ? data.content[0].text : data.error,
        opt_phase: level === 'advanced' ? 'Phase 3' : level === 'intermediate' ? 'Phase 2' : 'Phase 1'
      })
    };

  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: err.message })
    };
  }
};
```
