/**
 * FORGEIQ SVG Muscle Diagram — Front + Back, Interactive
 * Usage: renderMuscleDiagram(containerId) then activateMuscles([...primary], [...secondary])
 */

const exerciseMuscles = {
  'barbell bench press': { primary: ['chest'], secondary: ['front-delts', 'triceps'] },
  'incline dumbbell press': { primary: ['chest'], secondary: ['front-delts', 'triceps'] },
  'barbell bent-over row': { primary: ['lats', 'rhomboids'], secondary: ['biceps', 'rear-delts', 'lower-back'] },
  'lat pulldown': { primary: ['lats'], secondary: ['biceps', 'rear-delts'] },
  'pull-up': { primary: ['lats'], secondary: ['biceps', 'rear-delts', 'rhomboids'] },
  'barbell back squat': { primary: ['quads', 'glutes'], secondary: ['hamstrings', 'lower-back'] },
  'romanian deadlift': { primary: ['hamstrings', 'glutes'], secondary: ['lower-back'] },
  'deadlift': { primary: ['lower-back', 'glutes', 'hamstrings'], secondary: ['traps', 'quads'] },
  'overhead press': { primary: ['front-delts'], secondary: ['triceps', 'traps'] },
  'face pull': { primary: ['rear-delts', 'rhomboids'], secondary: ['traps'] },
  'bicep curl': { primary: ['biceps'], secondary: ['forearms-front'] },
  'tricep pushdown': { primary: ['triceps'], secondary: ['forearms-back'] },
  'plank': { primary: ['abs'], secondary: ['obliques', 'lower-back'] },
  'leg press': { primary: ['quads'], secondary: ['glutes', 'hamstrings'] },
  'calf raise': { primary: ['calves'], secondary: ['tibialis'] },
  'dumbbell row': { primary: ['lats'], secondary: ['biceps', 'rear-delts'] },
  'cable fly': { primary: ['chest'], secondary: ['front-delts'] },
  'hip thrust': { primary: ['glutes'], secondary: ['hamstrings', 'lower-back'] },
  'lunges': { primary: ['quads', 'glutes'], secondary: ['hamstrings', 'calves'] },
  'bench press': { primary: ['chest'], secondary: ['front-delts', 'triceps'] },
  'squat': { primary: ['quads', 'glutes'], secondary: ['hamstrings', 'lower-back'] },
  'row': { primary: ['lats'], secondary: ['biceps', 'rear-delts'] },
  'curl': { primary: ['biceps'], secondary: ['forearms-front'] },
  'pushdown': { primary: ['triceps'], secondary: ['forearms-back'] },
  'press': { primary: ['chest', 'front-delts'], secondary: ['triceps'] },
  'fly': { primary: ['chest'], secondary: ['front-delts'] },
  'lunge': { primary: ['quads', 'glutes'], secondary: ['hamstrings', 'calves'] },
  'push-up': { primary: ['chest'], secondary: ['front-delts', 'triceps'] },
  'crunch': { primary: ['abs'], secondary: ['obliques'] },
  'lateral raise': { primary: ['front-delts'], secondary: ['traps'] },
  'shrug': { primary: ['traps'], secondary: ['rear-delts'] }
};

function getMusclesForExercise(exerciseName) {
  const name = exerciseName.toLowerCase();
  for (const key in exerciseMuscles) {
    if (name.includes(key)) return exerciseMuscles[key];
  }
  return { primary: [], secondary: [] };
}

function activateMuscles(primaryMuscles, secondaryMuscles) {
  document.querySelectorAll('.muscle-path').forEach(p => {
    p.classList.remove('active', 'secondary');
  });
  primaryMuscles.forEach(m => {
    document.querySelectorAll('[data-muscle="' + m + '"]').forEach(p => p.classList.add('active'));
  });
  (secondaryMuscles || []).forEach(m => {
    document.querySelectorAll('[data-muscle="' + m + '"]').forEach(p => {
      if (!p.classList.contains('active')) p.classList.add('secondary');
    });
  });
}

function renderMuscleDiagram(containerId, options) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const size = (options && options.size) || 'normal';
  const w = size === 'mini' ? 100 : 140;
  const h = size === 'mini' ? 186 : 260;
  const vb = '0 0 140 260';

  container.innerHTML = `
    <div class="muscle-diagram-wrap">
      <div>
        <svg class="muscle-diagram-svg" viewBox="${vb}" width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
          <!-- FRONT VIEW -->
          <!-- Head/neck -->
          <ellipse cx="70" cy="18" rx="12" ry="14" fill="#0e1e36" stroke="#1a2e4a" stroke-width="0.5"/>
          <rect x="64" y="30" width="12" height="8" rx="2" fill="#0e1e36" stroke="#1a2e4a" stroke-width="0.5"/>
          <!-- Torso outline -->
          <path d="M48 38 Q44 42 42 50 L40 80 Q40 88 44 95 L50 110 Q54 118 58 125 L62 135 L78 135 L82 125 Q86 118 90 110 L96 95 Q100 88 100 80 L98 50 Q96 42 92 38 Z" fill="#0e1e36" stroke="#1a2e4a" stroke-width="0.5"/>

          <!-- FRONT DELTS -->
          <path data-muscle="front-delts" class="muscle-path" d="M48 38 Q42 40 38 48 L36 56 Q38 58 42 54 L48 46 Z" fill="#1a2e4a" stroke="#2a4060" stroke-width="1"/>
          <path data-muscle="front-delts" class="muscle-path" d="M92 38 Q98 40 102 48 L104 56 Q102 58 98 54 L92 46 Z" fill="#1a2e4a" stroke="#2a4060" stroke-width="1"/>

          <!-- CHEST -->
          <path data-muscle="chest" class="muscle-path" d="M50 44 Q58 42 70 44 Q82 42 90 44 L92 48 Q88 58 70 60 Q52 58 48 48 Z" fill="#1a2e4a" stroke="#2a4060" stroke-width="1"/>

          <!-- BICEPS -->
          <path data-muscle="biceps" class="muscle-path" d="M36 58 Q32 62 30 72 L28 82 Q30 86 34 82 L38 72 Q40 64 38 58 Z" fill="#1a2e4a" stroke="#2a4060" stroke-width="1"/>
          <path data-muscle="biceps" class="muscle-path" d="M104 58 Q108 62 110 72 L112 82 Q110 86 106 82 L102 72 Q100 64 102 58 Z" fill="#1a2e4a" stroke="#2a4060" stroke-width="1"/>

          <!-- FOREARMS FRONT -->
          <path data-muscle="forearms-front" class="muscle-path" d="M28 84 Q26 94 24 104 L22 114 Q24 116 28 112 L32 100 Q34 90 32 84 Z" fill="#1a2e4a" stroke="#2a4060" stroke-width="1"/>
          <path data-muscle="forearms-front" class="muscle-path" d="M112 84 Q114 94 116 104 L118 114 Q116 116 112 112 L108 100 Q106 90 108 84 Z" fill="#1a2e4a" stroke="#2a4060" stroke-width="1"/>

          <!-- ABS -->
          <path data-muscle="abs" class="muscle-path" d="M60 62 L80 62 L80 70 L60 70 Z" fill="#1a2e4a" stroke="#2a4060" stroke-width="0.8"/>
          <path data-muscle="abs" class="muscle-path" d="M60 71 L80 71 L80 79 L60 79 Z" fill="#1a2e4a" stroke="#2a4060" stroke-width="0.8"/>
          <path data-muscle="abs" class="muscle-path" d="M60 80 L80 80 L80 88 L60 88 Z" fill="#1a2e4a" stroke="#2a4060" stroke-width="0.8"/>

          <!-- OBLIQUES -->
          <path data-muscle="obliques" class="muscle-path" d="M48 60 L58 62 L58 90 L50 95 Q46 88 46 78 Z" fill="#1a2e4a" stroke="#2a4060" stroke-width="1"/>
          <path data-muscle="obliques" class="muscle-path" d="M92 60 L82 62 L82 90 L90 95 Q94 88 94 78 Z" fill="#1a2e4a" stroke="#2a4060" stroke-width="1"/>

          <!-- HIP FLEXORS -->
          <path data-muscle="hip-flexors" class="muscle-path" d="M56 96 L64 94 L66 104 L58 106 Z" fill="#1a2e4a" stroke="#2a4060" stroke-width="0.8"/>
          <path data-muscle="hip-flexors" class="muscle-path" d="M84 96 L76 94 L74 104 L82 106 Z" fill="#1a2e4a" stroke="#2a4060" stroke-width="0.8"/>

          <!-- QUADS -->
          <path data-muscle="quads" class="muscle-path" d="M52 108 L66 106 L66 145 Q62 150 56 150 L50 148 Q48 138 50 125 Z" fill="#1a2e4a" stroke="#2a4060" stroke-width="1"/>
          <path data-muscle="quads" class="muscle-path" d="M88 108 L74 106 L74 145 Q78 150 84 150 L90 148 Q92 138 90 125 Z" fill="#1a2e4a" stroke="#2a4060" stroke-width="1"/>

          <!-- ADDUCTORS -->
          <path data-muscle="adductors" class="muscle-path" d="M66 108 L74 108 L72 140 L68 140 Z" fill="#1a2e4a" stroke="#2a4060" stroke-width="0.8"/>

          <!-- TIBIALIS / SHINS -->
          <path data-muscle="tibialis" class="muscle-path" d="M52 155 L60 152 L58 195 L50 198 Q48 180 50 165 Z" fill="#1a2e4a" stroke="#2a4060" stroke-width="1"/>
          <path data-muscle="tibialis" class="muscle-path" d="M88 155 L80 152 L82 195 L90 198 Q92 180 90 165 Z" fill="#1a2e4a" stroke="#2a4060" stroke-width="1"/>

          <!-- Feet -->
          <ellipse cx="55" cy="202" rx="8" ry="4" fill="#0e1e36" stroke="#1a2e4a" stroke-width="0.5"/>
          <ellipse cx="85" cy="202" rx="8" ry="4" fill="#0e1e36" stroke="#1a2e4a" stroke-width="0.5"/>
        </svg>
        <div class="muscle-label">FRONT</div>
      </div>
      <div>
        <svg class="muscle-diagram-svg" viewBox="${vb}" width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
          <!-- BACK VIEW -->
          <!-- Head/neck -->
          <ellipse cx="70" cy="18" rx="12" ry="14" fill="#0e1e36" stroke="#1a2e4a" stroke-width="0.5"/>
          <rect x="64" y="30" width="12" height="8" rx="2" fill="#0e1e36" stroke="#1a2e4a" stroke-width="0.5"/>
          <!-- Torso outline -->
          <path d="M48 38 Q44 42 42 50 L40 80 Q40 88 44 95 L50 110 Q54 118 58 125 L62 135 L78 135 L82 125 Q86 118 90 110 L96 95 Q100 88 100 80 L98 50 Q96 42 92 38 Z" fill="#0e1e36" stroke="#1a2e4a" stroke-width="0.5"/>

          <!-- TRAPS -->
          <path data-muscle="traps" class="muscle-path" d="M58 32 L70 28 L82 32 L88 42 L70 46 L52 42 Z" fill="#1a2e4a" stroke="#2a4060" stroke-width="1"/>

          <!-- REAR DELTS -->
          <path data-muscle="rear-delts" class="muscle-path" d="M48 40 Q42 42 38 50 L36 56 Q38 54 42 50 L48 44 Z" fill="#1a2e4a" stroke="#2a4060" stroke-width="1"/>
          <path data-muscle="rear-delts" class="muscle-path" d="M92 40 Q98 42 102 50 L104 56 Q102 54 98 50 L92 44 Z" fill="#1a2e4a" stroke="#2a4060" stroke-width="1"/>

          <!-- RHOMBOIDS -->
          <path data-muscle="rhomboids" class="muscle-path" d="M60 44 L68 46 L68 60 L60 58 Z" fill="#1a2e4a" stroke="#2a4060" stroke-width="0.8"/>
          <path data-muscle="rhomboids" class="muscle-path" d="M80 44 L72 46 L72 60 L80 58 Z" fill="#1a2e4a" stroke="#2a4060" stroke-width="0.8"/>

          <!-- LATS -->
          <path data-muscle="lats" class="muscle-path" d="M48 48 L58 50 L56 78 L48 88 Q44 80 44 68 Z" fill="#1a2e4a" stroke="#2a4060" stroke-width="1"/>
          <path data-muscle="lats" class="muscle-path" d="M92 48 L82 50 L84 78 L92 88 Q96 80 96 68 Z" fill="#1a2e4a" stroke="#2a4060" stroke-width="1"/>

          <!-- LOWER BACK -->
          <path data-muscle="lower-back" class="muscle-path" d="M62 62 L68 60 L68 92 L62 90 Z" fill="#1a2e4a" stroke="#2a4060" stroke-width="0.8"/>
          <path data-muscle="lower-back" class="muscle-path" d="M78 62 L72 60 L72 92 L78 90 Z" fill="#1a2e4a" stroke="#2a4060" stroke-width="0.8"/>

          <!-- TRICEPS -->
          <path data-muscle="triceps" class="muscle-path" d="M36 58 Q32 64 30 74 L28 82 Q30 84 34 80 L38 70 Q40 62 38 58 Z" fill="#1a2e4a" stroke="#2a4060" stroke-width="1"/>
          <path data-muscle="triceps" class="muscle-path" d="M104 58 Q108 64 110 74 L112 82 Q110 84 106 80 L102 70 Q100 62 102 58 Z" fill="#1a2e4a" stroke="#2a4060" stroke-width="1"/>

          <!-- FOREARMS BACK -->
          <path data-muscle="forearms-back" class="muscle-path" d="M28 84 Q26 94 24 104 L22 114 Q24 116 28 112 L32 100 Q34 90 32 84 Z" fill="#1a2e4a" stroke="#2a4060" stroke-width="1"/>
          <path data-muscle="forearms-back" class="muscle-path" d="M112 84 Q114 94 116 104 L118 114 Q116 116 112 112 L108 100 Q106 90 108 84 Z" fill="#1a2e4a" stroke="#2a4060" stroke-width="1"/>

          <!-- GLUTES -->
          <path data-muscle="glutes" class="muscle-path" d="M50 96 L68 94 L68 116 Q62 120 54 118 Q48 114 48 106 Z" fill="#1a2e4a" stroke="#2a4060" stroke-width="1"/>
          <path data-muscle="glutes" class="muscle-path" d="M90 96 L72 94 L72 116 Q78 120 86 118 Q92 114 92 106 Z" fill="#1a2e4a" stroke="#2a4060" stroke-width="1"/>

          <!-- HAMSTRINGS -->
          <path data-muscle="hamstrings" class="muscle-path" d="M50 120 L66 118 L66 155 Q60 158 54 156 Q48 150 48 138 Z" fill="#1a2e4a" stroke="#2a4060" stroke-width="1"/>
          <path data-muscle="hamstrings" class="muscle-path" d="M90 120 L74 118 L74 155 Q80 158 86 156 Q92 150 92 138 Z" fill="#1a2e4a" stroke="#2a4060" stroke-width="1"/>

          <!-- CALVES -->
          <path data-muscle="calves" class="muscle-path" d="M50 160 L62 158 L60 195 Q56 200 50 198 Q46 190 48 175 Z" fill="#1a2e4a" stroke="#2a4060" stroke-width="1"/>
          <path data-muscle="calves" class="muscle-path" d="M90 160 L78 158 L80 195 Q84 200 90 198 Q94 190 92 175 Z" fill="#1a2e4a" stroke="#2a4060" stroke-width="1"/>

          <!-- Feet -->
          <ellipse cx="55" cy="202" rx="8" ry="4" fill="#0e1e36" stroke="#1a2e4a" stroke-width="0.5"/>
          <ellipse cx="85" cy="202" rx="8" ry="4" fill="#0e1e36" stroke="#1a2e4a" stroke-width="0.5"/>
        </svg>
        <div class="muscle-label">BACK</div>
      </div>
    </div>`;
}

function renderMiniMuscleDiagram(containerId, exerciseName) {
  renderMuscleDiagram(containerId, { size: 'mini' });
  const muscles = getMusclesForExercise(exerciseName);
  setTimeout(() => {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.querySelectorAll('.muscle-path').forEach(p => p.classList.remove('active', 'secondary'));
    muscles.primary.forEach(m => {
      container.querySelectorAll('[data-muscle="' + m + '"]').forEach(p => p.classList.add('active'));
    });
    muscles.secondary.forEach(m => {
      container.querySelectorAll('[data-muscle="' + m + '"]').forEach(p => {
        if (!p.classList.contains('active')) p.classList.add('secondary');
      });
    });
  }, 50);
}

function renderMuscleList(containerId, primaryMuscles, secondaryMuscles) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const all = [...new Set([...(primaryMuscles || []), ...(secondaryMuscles || [])])];
  const labels = {
    'chest': 'Chest', 'front-delts': 'Front Delts', 'rear-delts': 'Rear Delts',
    'biceps': 'Biceps', 'triceps': 'Triceps', 'forearms-front': 'Forearms',
    'forearms-back': 'Forearms', 'abs': 'Abs', 'obliques': 'Obliques',
    'quads': 'Quads', 'hamstrings': 'Hamstrings', 'glutes': 'Glutes',
    'calves': 'Calves', 'tibialis': 'Shins', 'lats': 'Lats',
    'rhomboids': 'Rhomboids', 'traps': 'Traps', 'lower-back': 'Lower Back',
    'hip-flexors': 'Hip Flexors', 'adductors': 'Adductors'
  };
  container.innerHTML = '<div style="display:flex;gap:6px;overflow-x:auto;scrollbar-width:none;padding:4px 0;">' +
    all.map(m => {
      const isPrimary = (primaryMuscles || []).includes(m);
      return '<span style="flex-shrink:0;padding:4px 10px;border-radius:12px;font-size:11px;font-family:\'Barlow Condensed\',sans-serif;font-weight:700;letter-spacing:0.05em;' +
        (isPrimary ? 'background:rgba(240,165,0,0.15);color:#f0a500;border:1px solid rgba(240,165,0,0.4);' : 'background:rgba(244,162,97,0.1);color:#f4a261;border:1px solid rgba(244,162,97,0.3);') +
        '">' + (labels[m] || m) + '</span>';
    }).join('') + '</div>';
}

// Inject CSS for muscle diagram
(function() {
  if (document.getElementById('muscle-diagram-css')) return;
  const style = document.createElement('style');
  style.id = 'muscle-diagram-css';
  style.textContent = `
.muscle-diagram-wrap { display: flex; gap: 16px; justify-content: center; margin: 12px 0; }
.muscle-diagram-svg { width: 140px; height: 260px; }
.muscle-path { transition: fill 0.3s, filter 0.3s; cursor: pointer; }
.muscle-path.active { fill: #f0a500 !important; stroke: #ffb820 !important; stroke-width: 1.5; filter: drop-shadow(0 0 8px rgba(240,165,0,0.7)); }
.muscle-path.secondary { fill: #f4a261 !important; stroke: #f4a261 !important; filter: drop-shadow(0 0 4px rgba(244,162,97,0.4)); }
.muscle-path:hover { fill: #2a4a70; }
.muscle-label { font-family: 'Barlow Condensed', sans-serif; font-size: 0.62rem; font-weight: 700; letter-spacing: 0.1em; color: #4a6080; text-transform: uppercase; text-align: center; margin-top: 4px; }
.muscle-activation-bar { height: 4px; border-radius: 2px; background: rgba(255,255,255,0.08); margin-top: 2px; }
.muscle-activation-fill { height: 100%; border-radius: 2px; background: #f0a500; transition: width 0.5s; }
`;
  document.head.appendChild(style);
})();
