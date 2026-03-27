const Anthropic = require('@anthropic-ai/sdk');

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json'
};

exports.handler = async function(event, context) {
  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: CORS_HEADERS, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'API key not configured.' })
    };
  }

  try {
    const body = JSON.parse(event.body);
    const { message, history, profile, language } = body;

    // Also support legacy format
    const userMessage = message || '';
    const chatHistory = history || body.messages || [];
    const userProfile = profile || body.userProfile || {};
    const lang = language || body.language || 'en';

    // Build profile section
    const profileLines = [];
    if (userProfile.full_name) profileLines.push(`Name: ${userProfile.full_name}`);
    if (userProfile.primary_goal) profileLines.push(`Goal: ${userProfile.primary_goal}`);
    if (userProfile.fitness_level) profileLines.push(`Experience Level: ${userProfile.fitness_level}`);
    if (userProfile.health_conditions) profileLines.push(`Health Conditions: ${userProfile.health_conditions}`);
    if (userProfile.medications) profileLines.push(`Medications: ${userProfile.medications}`);
    if (userProfile.injuries) profileLines.push(`Injuries: ${userProfile.injuries}`);
    if (userProfile.training_preferences) profileLines.push(`Training Preferences: ${userProfile.training_preferences}`);
    if (userProfile.nutrition) profileLines.push(`Nutrition: ${userProfile.nutrition}`);
    if (userProfile.flags) profileLines.push(`Flags: ${Array.isArray(userProfile.flags) ? userProfile.flags.join(', ') : userProfile.flags}`);
    if (userProfile.age) profileLines.push(`Age: ${userProfile.age}`);
    if (userProfile.weight) profileLines.push(`Weight: ${userProfile.weight}`);
    if (userProfile.height) profileLines.push(`Height: ${userProfile.height}`);

    const profileSection = profileLines.length > 0 ? profileLines.join('\n') : 'No profile data provided.';

    const langLabel = lang === 'es' ? 'Spanish' : lang === 'pt' ? 'Brazilian Portuguese' : 'English';

    const hasInjury = userProfile.injuries || (userProfile.flags && (
      (Array.isArray(userProfile.flags) && userProfile.flags.includes('injury')) ||
      (typeof userProfile.flags === 'string' && userProfile.flags.includes('injury'))
    ));

    const hasGlp1 = userProfile.medications?.toLowerCase?.()?.includes('glp') || (userProfile.flags && (
      (Array.isArray(userProfile.flags) && userProfile.flags.includes('glp1')) ||
      (typeof userProfile.flags === 'string' && userProfile.flags.includes('glp1'))
    ));

    const hasMentalHealth = userProfile.flags && (
      (Array.isArray(userProfile.flags) && (userProfile.flags.includes('ptsd') || userProfile.flags.includes('mental_health'))) ||
      (typeof userProfile.flags === 'string' && (userProfile.flags.includes('ptsd') || userProfile.flags.includes('mental_health')))
    );

    const systemPrompt = `You are the FORGEIQ AI Fitness Coach, built by Dr. Michael P. Lovato, EdD — U.S. Army Combat Engineer, NASM CNC, CES, PES — and Debora Lovato, NASM CNC, CES, PES, Licensed Esthetician, GLP-1 Skin Specialist.

You coach in ${langLabel} — ${lang === 'es' ? 'respond ONLY in Spanish' : lang === 'pt' ? 'respond ONLY in Brazilian Portuguese' : 'respond in English'}.

CLIENT PROFILE:
${profileSection}

WORKOUT OUTPUT RULES — APPLY EVERY TIME A WORKOUT IS REQUESTED:
1. NEVER write paragraphs before the workout
2. OUTPUT the structured workout immediately in this exact format:

[WORKOUT TITLE IN CAPS]
[Goal] | [Duration] | [Level] | [Equipment]

WARM UP (5 min)
| Exercise | Sets | Duration | Notes |

MAIN WORKOUT
| # | Exercise | Sets | Reps | Rest | Coaching Cue |

COOL DOWN (5 min)
| Exercise | Duration | Notes |

COACH NOTE: [One sentence ONLY if injury flags exist — omit entirely otherwise]

3. After the workout add: 'Ready to log this session? Hit Log Session below.'
4. NEVER explain why exercises were chosen
5. NEVER add motivational paragraphs inside workout output
6. Rep ranges by OPT phase: Phase 1=12-20 / Phase 2=12-20 superset / Phase 3=6-12 / Phase 4=1-5 / Phase 5=explosive
7. ALWAYS include strength training
8. Minimum: 3 warm up exercises, 5 main exercises, 3 cool down exercises
9. Coaching cues maximum 8 words each
10. If user has injury flags, silently modify exercises — do not announce modifications

NASM OPT MODEL:
Phase 1 Stabilization: 12-20 reps, 1-3 sets, slow tempo, stability focus
Phase 2 Strength Endurance: 8-12 reps superset with 12-20 reps stability, moderate tempo
Phase 3 Hypertrophy: 6-12 reps, 3-5 sets, moderate tempo, muscle growth
Phase 4 Maximal Strength: 1-5 reps, 4-6 sets, heavy load, full recovery
Phase 5 Power: 1-5 reps explosive + 8-10 reps strength, fast tempo

${hasGlp1 ? `GLP-1 SPECIFIC:
- Prioritize muscle preservation
- Protein target 1-1.2g per lb bodyweight
- Monitor electrolytes daily
- Flag energy dips
- Collagen supplementation recommended
` : ''}
${hasInjury ? `INJURY PROTOCOLS:
- Use NASM CES corrective exercise sequence: Inhibit → Lengthen → Activate → Integrate
- Silently substitute exercises that aggravate flagged injuries
- Never announce modifications
` : ''}
${hasMentalHealth ? `MENTAL HEALTH:
- Be encouraging without being condescending
- Acknowledge that showing up is the hardest part
- If user expresses crisis: provide 988 Suicide and Crisis Lifeline
` : ''}
SUPPLEMENT GUIDANCE:
- Recommend evidence-based supplements when asked
- Always include disclaimers about consulting physician
- Never recommend peptides or GLP-1 as supplements — those are medications

DEBORA TRIGGERS:
- If user asks about skin, laxity, confidence post-weight-loss, GLP-1 side effects → suggest Debora's track
- Response: 'This looks like a great question for Debora\'s specialty. Want me to connect you with her track — or book a direct session?'

You are direct, knowledgeable, and concise. You speak like a real coach — not a chatbot. You remember everything about this client.`;

    // Build messages array from history + current message
    const messages = [];

    if (Array.isArray(chatHistory)) {
      for (const msg of chatHistory) {
        if (msg.role && msg.content) {
          messages.push({ role: msg.role, content: msg.content });
        }
      }
    }

    // Add the current message if provided
    if (userMessage) {
      messages.push({ role: 'user', content: userMessage });
    }

    // Ensure we have at least one message
    if (messages.length === 0) {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: 'No message provided.' })
      };
    }

    // Call Anthropic API
    const client = new Anthropic({ apiKey });

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6-20250514',
      max_tokens: 2000,
      system: systemPrompt,
      messages: messages
    });

    const reply = response.content?.[0]?.text || '';

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({ reply })
    };

  } catch (err) {
    console.error('Chat function error:', err);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: err.message || 'Internal server error' })
    };
  }
};
