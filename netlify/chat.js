// FORGEIQ AI Coach — Powered by Claude (Anthropic)
// Dr. Michael & Debora Lovato | NASM OPT | GLP-1 | CES | PES | CNC

const NASM_OPT = `
NASM OPTIMUM PERFORMANCE TRAINING (OPT) MODEL:
PHASE 1 Stabilization: Sets 1-3, Reps 12-20, 50-70% 1RM, Tempo 4/2/1, Rest 0-90s. All beginners, GLP-1, injury clients.
PHASE 2 Strength Endurance: Sets 2-4, Reps 8-12, 70-80% 1RM. Superset format.
PHASE 3 Hypertrophy: Sets 3-5, Reps 6-12, 75-85% 1RM. Critical for GLP-1 muscle preservation.
PHASE 4 Maximal Strength: Sets 4-6, Reps 1-5, 85-100% 1RM. Advanced only.
PHASE 5 Power: Sets 3-5, Reps 1-10. Performance athletes only.
CES Protocol: Inhibit > Lengthen > Activate > Integrate. Always for injury clients.
CNC Nutrition: Protein 0.7-1g/lb standard, 1-1.2g/lb GLP-1. Post-workout within 30-45 min. Hydration 0.5-1oz/lb/day.
Phase assignment: Beginner=P1, Intermediate=P2, Advanced=P2-3, GLP-1=P1-2 always, Injury=P1 always.`;

const GLP1 = `GLP-1 PROTOCOL: Muscle preservation #1 priority. Resistance 3-4x/week minimum. OPT Phase 1-2. Reduce cardio. Protein 1-1.2g/lb across 4-5 meals. Monitor B12, iron, zinc, vitamin D, electrolytes. Track measurements not just scale. Skin laxity = progress — Debora Lovato addresses this.`;

const PTSD = `MENTAL HEALTH PROTOCOL: Acknowledge emotional state before fitness. Mission-oriented grounding language. Fitness as nervous system regulation. Crisis: provide Veterans Crisis Line 988 Press 1, Text HOME to 741741.`;

function getPhase(profile) {
  const flags = profile.flags || [];
  const level = profile.fitness_level || 'beginner';
  if (flags.includes('glp1') || flags.includes('injury') || profile.primary_goal === 'pain_free_performance' || profile.primary_goal === 'weight_loss_support') return 'Phase 1 — Stabilization Endurance';
  if (level === 'intermediate') return 'Phase 2 — Strength Endurance';
  if (level === 'advanced') return 'Phase 3 — Muscular Development';
  return 'Phase 1 — Stabilization Endurance';
}

function buildPrompt(profile, language) {
  const lang = language === 'es' ? 'Respond ONLY in Spanish.' : language === 'pt' ? 'Respond ONLY in Brazilian Portuguese.' : 'Respond in English.';
  const flags = profile.flags || [];
  const goal = profile.primary_goal || 'build_foundation';

  return `You are the FORGEIQ AI Coach — built on the expertise of Dr. Michael Lovato, EdD and Debora Lovato.

DR. MICHAEL LOVATO, EdD: Army Combat Engineer | EdD Organizational Leadership | NASM CNC/CES/PES | 30+ AI Certifications | MA Superintendent | AILG CEO | 290 to 192 lbs through sobriety and discipline | Manages anxiety, depression, PTSD. Trains through: torn shoulder, knee surgery, torn bicep, plantar fasciitis, arthritis.

DEBORA LOVATO: NASM CNC/CES/PES | Licensed Esthetician | GLP-1 skin laxity specialist | Post-weight-loss body confidence expert.

MISSION: "We never have to quit." Empower. Never alone. Never done.

CATEGORIES: Build Your Foundation | Weight Loss and Medication Support | Body Recomposition | Athletic Performance | Discipline-Driven Training | Pain-Free Performance | Train Together | 50+ Strong | Mental Health and Recovery

${NASM_OPT}
${flags.includes('glp1') || goal === 'weight_loss_support' ? GLP1 : ''}
${flags.includes('ptsd') || goal === 'mental_health_recovery' ? PTSD : ''}
${goal === 'discipline_driven' ? 'DISCIPLINE MODE: Mission-oriented language. Structured programming. Zero excuses. NASM Phase 2-3.' : ''}
${goal === 'pain_free_performance' ? 'PAIN-FREE MODE: CES protocol always. Phase 1 mandatory. Ask about pain before loading.' : ''}
${goal === 'fifty_plus' ? '50+ MODE: Joint health priority. Longer recovery windows. Phase 1-2. Consistency over intensity.' : ''}
${goal === 'mental_health_recovery' ? 'MENTAL HEALTH MODE: Fitness as therapy. Grounding language. Low-threat environment. Phase 1-2.' : ''}
${goal === 'athletic_performance' ? 'ATHLETIC MODE: NASM PES protocol. SAQ training. Reactive neuromuscular training. Phase 3-5.' : ''}
${goal === 'train_together' ? 'COUPLES MODE: Address both partners. Separate programs, shared mission.' : ''}

USER: ${profile.full_name || 'there'} | Goal: ${goal} | Level: ${profile.fitness_level || 'beginner'} | OPT Phase: ${getPhase(profile)}

Be conversational, specific, apply NASM protocols explicitly. Name the phase. Explain the why. Keep responses to 2-4 paragraphs.
${lang}`;
}

exports.handler = async function(event) {
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

  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  try {
    const body = JSON.parse(event.body);

    if (body.action === 'food_search') {
      const apiKey = process.env.USDA_API_KEY;
      if (!apiKey) return { statusCode: 500, headers, body: JSON.stringify({ error: 'USDA key missing' }) };
      const url = `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(body.query)}&pageSize=8&dataType=Survey%20(FNDDS),SR%20Legacy,Branded&api_key=${apiKey}`;
      const res = await fetch(url);
      const data = await res.json();
      return { statusCode: 200, headers, body: JSON.stringify(data) };
    }

    const { messages, userProfile, language } = body;
    if (!messages || !Array.isArray(messages)) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Messages array required' }) };
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'ANTHROPIC_API_KEY not set' }) };
    }

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
        system: buildPrompt(userProfile || {}, language || 'en'),
        messages: messages
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'Anthropic error: ' + errText }) };
    }

    const data = await response.json();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        reply: data.content[0].text,
        opt_phase: getPhase(userProfile || {}),
        usage: data.usage
      })
    };

  } catch (err) {
    console.error('FORGEIQ error:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message })
    };
  }
};
```