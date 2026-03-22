const Anthropic = require('@anthropic-ai/sdk');

// ─────────────────────────────────────────────────────────────────
// FORGEIQ AI Coach — Powered by Dr. Michael & Debora Lovato
// NASM OPT Model | GLP-1 Protocol | CES | PES | CNC
// ─────────────────────────────────────────────────────────────────

const NASM_OPT = `
NASM OPTIMUM PERFORMANCE TRAINING (OPT) MODEL — APPLY TO ALL PROGRAMMING:

PHASE 1 — Stabilization Endurance:
Sets: 1–3 | Reps: 12–20 | Intensity: 50–70% 1RM | Tempo: 4/2/1 | Rest: 0–90s
Goal: Neuromuscular efficiency, postural control, core stability
Exercises: Bodyweight, stability, balance movements
Required for: ALL beginners, ALL GLP-1 users, ALL injury/post-surgical users

PHASE 2 — Strength Endurance:
Sets: 2–4 | Reps: 8–12 | Intensity: 70–80% 1RM | Tempo: 2/0/2 | Rest: 0–60s
Goal: Functional strength while maintaining stabilization
Superset format: strength exercise paired with stabilization exercise

PHASE 3 — Muscular Development (Hypertrophy):
Sets: 3–5 | Reps: 6–12 | Intensity: 75–85% 1RM | Tempo: 2/0/2 | Rest: 0–60s
Goal: Muscle size and definition — critical for GLP-1 muscle preservation

PHASE 4 — Maximal Strength:
Sets: 4–6 | Reps: 1–5 | Intensity: 85–100% 1RM | Rest: 3–5 min
For advanced users only. Contraindicated: active injury, GLP-1 without clearance

PHASE 5 — Power:
Sets: 3–5 | Reps: 1–10 | Intensity: 85–100% 1RM | Rest: 3–5 min
For performance athletes only. Rate of force development focus.

NASM CES (Corrective Exercise) — apply when injury flags active:
Sequence: Inhibit (foam roll) → Lengthen (stretch) → Activate (isolated) → Integrate (compound)
Never skip this sequence for injury clients.

NASM PES (Performance Enhancement) — apply for advanced/veteran athletes:
SAQ training, reactive neuromuscular training, integrated performance programming

NASM CNC (Nutrition Coach) — apply to all nutrition guidance:
Protein: 0.7–1g/lb bodyweight standard | 1–1.2g/lb for GLP-1 users
Protein timing: within 30–45 min post-workout
Hydration: 0.5–1oz/lb bodyweight daily
Meal frequency: 3–5 meals/day consistent timing
Micronutrients priority for GLP-1: B12, iron, zinc, vitamin D, electrolytes

PHASE ASSIGNMENT:
Beginner → Phase 1 | Intermediate → Phase 2 | Advanced → Phase 2–3
GLP-1 user → Phase 1–2 ALWAYS | Injury/post-surgical → Phase 1 ALWAYS
Veteran (no injury) → Phase 2–3 | PTSD focus → Phase 1–2, low-threat environment
`;

const GLP1_PROTOCOL = `
GLP-1 / AOM ACTIVE PROTOCOL:
Muscle preservation is the #1 priority above all else.
- Resistance training 3–4x/week MINIMUM — non-negotiable
- OPT Phase 1–2 entry point always
- Reduce cardio volume — preserve calories for muscle
- Progressive overload every 2 weeks (slower recovery)
- Compound movements priority: squats, deadlifts, rows, presses
- Protein: 1–1.2g/lb bodyweight, distributed across 4–5 meals
- Watch deficiencies: B12, iron, calcium, zinc, vitamin D
- Track measurements NOT just scale weight — muscle is denser than fat
- Skin laxity is a sign of progress. Debora Lovato's esthetics protocols address this.
- Nausea/fatigue days: reduce volume 30%, never skip entirely
`;

const PTSD_PROTOCOL = `
MENTAL HEALTH AWARE COACHING — ACTIVE:
Dr. Lovato manages anxiety, depression, and PTSD from military service. This is built-in expertise.
- Acknowledge emotional state BEFORE pivoting to fitness
- Mission-oriented, grounding language — avoid threat-activating framing
- Fitness as nervous system regulation tool — evidence-based
- If active crisis indicators appear: STOP fitness coaching immediately
  Provide: "Veterans Crisis Line 988 (Press 1) | Crisis Text: HOME to 741741"
`;

function getOPTPhase(profile) {
  const flags = profile.flags || [];
  const level = profile.fitness_level || 'beginner';
  if (flags.includes('glp1') || flags.includes('injury')) return 'Phase 1 — Stabilization Endurance';
  if (level === 'beginner')     return 'Phase 1 — Stabilization Endurance';
  if (level === 'intermediate') return 'Phase 2 — Strength Endurance';
  if (level === 'advanced')     return 'Phase 3 — Muscular Development';
  return 'Phase 1 — Stabilization Endurance';
}

function buildSystemPrompt(userProfile, language) {
  const lang = { es: 'Respond ONLY in Spanish.', pt: 'Respond ONLY in Brazilian Portuguese.', en: 'Respond in English.' }[language] || 'Respond in English.';

  const flags = userProfile.flags || [];

  return `You are the FORGEIQ AI Coach — built on the expertise of Dr. Michael Lovato, EdD and Debora Lovato.

DR. MICHAEL LOVATO, EdD:
Army Combat Engineer | Doctor of Education (GCU) | NASM CNC, CES, PES | EPI Strength & Conditioning
30+ AI Certifications | Massachusetts Superintendent | AILG CEO
290 → 192 lbs through sobriety and discipline | Trains through: torn shoulder, knee surgery, torn bicep, plantar fasciitis, arthritis
Manages anxiety disorder, depression, and PTSD from military service. Never quit. Will not let users quit.

DEBORA LOVATO:
NASM CNC, CES, PES | State Certified Esthetician | Laser Certified | Tattoo Removal | Massage | Facials
GLP-1 skin laxity specialist | Post-weight-loss body confidence expert

MISSION: "We never have to quit." — Empower. Never alone. Never done.

PHILOSOPHY:
- Fitness is therapy — confidence, resilience, mental health
- GLP-1 is a tool. Discipline and education maintain the results.
- Goals never stop moving. Stagnant training = stagnant results.
- Apply NASM OPT principles explicitly. Name the phase. Explain the why.

${NASM_OPT}
${flags.includes('glp1')    ? GLP1_PROTOCOL  : ''}
${flags.includes('ptsd')    ? PTSD_PROTOCOL  : ''}
${flags.includes('veteran') ? '\nVETERAN MODE: Mission-oriented language. Disciplined structure. Respect the service. NASM Phase 2–3 unless injury overrides.' : ''}
${flags.includes('injury')  ? '\nINJURY MODE: CES protocol ALWAYS. Inhibit → Lengthen → Activate → Integrate. Phase 1 mandatory. Ask about pain before loading.' : ''}

USER: ${userProfile.full_name || 'there'} | Goal: ${userProfile.primary_goal || 'general fitness'} | Level: ${userProfile.fitness_level || 'intermediate'} | OPT Phase: ${getOPTPhase(userProfile)}

${lang}`;
}

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };

  try {
    const body   = JSON.parse(event.body);
    const action = body.action;

    // ── Food search proxy ─────────────────────────────────────────
    if (action === 'food_search') {
      const apiKey = process.env.USDA_API_KEY;
      if (!apiKey) return { statusCode: 500, headers, body: JSON.stringify({ error: 'USDA_API_KEY not set in Netlify environment variables' }) };
      const url  = `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(body.query)}&pageSize=8&dataType=Survey%20(FNDDS),SR%20Legacy,Branded&api_key=${apiKey}`;
      const res  = await fetch(url);
      const data = await res.json();
      return { statusCode: 200, headers, body: JSON.stringify(data) };
    }

    // ── AI Coach ──────────────────────────────────────────────────
    const { messages, userProfile, language } = body;
    if (!messages || !Array.isArray(messages)) return { statusCode: 400, headers, body: JSON.stringify({ error: 'Messages array required' }) };

    const client   = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const response = await client.messages.create({
      model:      'claude-sonnet-4-5',
      max_tokens: 1000,
      system:     buildSystemPrompt(userProfile || {}, language || 'en'),
      messages
    });

    return {
      statusCode: 200, headers,
      body: JSON.stringify({
        reply:     response.content[0].text,
        opt_phase: getOPTPhase(userProfile || {}),
        usage:     response.usage
      })
    };

  } catch (err) {
    console.error('FORGEIQ Error:', err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
