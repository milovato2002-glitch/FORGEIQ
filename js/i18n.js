/**
 * FORGEIQ Internationalization System
 * Supports EN, ES, PT across every page
 */
(function() {
  'use strict';

  var TRANSLATIONS = {
    en: {
      // Navigation
      nav_dashboard: 'Dashboard',
      nav_train: 'Train',
      nav_progress: 'Progress',
      nav_debora: 'Debora',
      nav_resources: 'Resources',
      nav_book: 'Book',
      nav_login: 'Log In',
      nav_signup: 'Get Started',

      // FORGE AI
      forge_ai_btn: 'FORGE AI',
      forge_ai_sub: 'Powered by Claude',
      forge_ai_placeholder: 'Ask your coach...',

      // Homepage
      hero_tagline: 'WE NEVER HAVE TO QUIT.',
      hero_sub: 'Built by a combat veteran and his wife — who met at a gym, lost nearly 100 lbs between them, and rebuilt their lives through discipline, love, and a refusal to stop. Your AI coach was built from that story. It was built for yours.',
      hero_cta: 'I WILL NOT QUIT',
      hero_cta2: 'See How It Works',
      features_title: 'THE ONLY TOOL THAT NEVER FAILS YOU IS YOUR OWN DISCIPLINE.',
      goals_title: 'WHAT IS YOUR PRIMARY GOAL?',
      goals_sub: 'Your AI coach builds every session around your goals. Select all that apply. You can update anytime.',
      founders_title: 'BUILT FROM REAL BATTLES. NOT A BOARDROOM.',
      couples_title: 'STRONGER TOGETHER.',
      faq_title: 'FREQUENTLY ASKED QUESTIONS',
      footer_cta_title: 'MAKE THE DECISION.',
      footer_cta_body: 'Nobody is coming to fix you. Nobody needs to. You have everything it takes — you just need a coach who believes that too.',

      // Onboarding
      onboard_step1_title: 'WHAT IS YOUR PRIMARY GOAL?',
      onboard_step1_sub: 'Select all that apply.',
      onboard_step2_title: 'WHAT HAS PREVENTED YOU FROM TAKING THE STEP?',
      onboard_step2_sub: 'Select all that apply.',
      onboard_step3_title: 'YOUR EXPERIENCE LEVEL',
      onboard_step3_sub: 'Select the one that best describes you.',
      onboard_step4_title: 'ANY OF THESE APPLY TO YOU?',
      onboard_step4_sub: 'Your AI coach uses this to protect you and build around your reality — not a generic plan. Select none if nothing applies.',
      onboard_step4b_title: 'ARE YOU CURRENTLY TAKING ANY MEDICATIONS?',
      onboard_step4b_sub: 'Select all that apply.',
      onboard_step4c_title: 'ARE YOU CURRENTLY TAKING ANY SUPPLEMENTS?',
      onboard_step4c_sub: 'Your coach uses this to avoid redundant recommendations and identify real gaps.',
      onboard_step5_title: "LET'S TALK ABOUT FOOD",
      onboard_step5_sub: 'Help your coach understand how you eat today.',
      onboard_step6_title: 'WHAT ARE YOUR NUTRITION GOALS?',
      onboard_step6_sub: 'Select all that apply.',
      onboard_step7_title: 'YOUR BODY GOALS',
      onboard_step7_sub: 'Give your coach a starting point. Skip anything you are not sure about.',
      onboard_step8_title: 'HOW DO YOU WANT TO TRAIN?',
      onboard_step8_sub: 'Select all training styles that interest you.',
      onboard_step9_title: 'A FEW QUICK QUESTIONS',
      onboard_step9_sub: 'This helps your coach scale everything to your current level.',
      onboard_step10_title: 'YOUR PLAN IS READY.',

      // Buttons
      btn_next: 'NEXT',
      btn_back: 'Back',
      btn_skip: 'Skip',
      btn_start: 'I WILL NOT QUIT — START NOW',
      btn_start_workout: 'START WORKOUT',
      btn_log_meal: 'Log Meal',
      btn_log_water: 'Log Water',
      btn_log_today: "LOG TODAY'S METRICS",
      btn_download_pdf: 'Download Report (PDF)',
      btn_save_drive: 'Save to Drive',
      btn_book_session: 'Book a Session',
      btn_get_started: 'Get Started',

      // Dashboard
      dashboard_greeting_morning: 'Good morning',
      dashboard_greeting_afternoon: 'Good afternoon',
      dashboard_greeting_evening: 'Good evening',
      dashboard_journey: 'Day {x} of your journey. Your coach has your workout ready.',
      dashboard_streak: 'Day Streak',
      dashboard_workouts_week: 'Workouts This Week',
      dashboard_goals_checked: 'Goals Checked',

      // Train
      train_tab_workout: 'Workout',
      train_tab_nutrition: 'Nutrition',
      train_tab_coach: 'Coach',
      train_select_type: 'SELECT YOUR WORKOUT TYPE',
      train_select_muscle: 'SELECT MUSCLE GROUP',
      train_select_focus: 'SELECT YOUR FOCUS',
      train_building: 'Building your workout...',
      train_history: 'WORKOUT HISTORY',
      train_tools: 'TOOLS',
      train_1rm_calc: '1RM Calculator',
      train_plates_calc: 'Plates Calculator',

      // Progress
      progress_title: 'Progress Tracking',
      progress_sub: 'Measurements tell the real story.',
      progress_weight: 'Current Weight',
      progress_lost: 'lbs Lost Total',
      progress_waist: 'Waist Change',
      progress_bf: 'Body Fat %',
      progress_entries: 'Total Entries',
      glp1_disclaimer: 'The scale is one data point. Muscle weighs more than fat. If you are on GLP-1 medication, prioritize measurements over scale weight. Resistance training and measurements tell the real story. Consistency is what counts.',

      // Debora
      debora_title: 'DEBORA LOVATO',
      debora_subtitle: 'Nutrition and Wellness Director',
      debora_quote: 'Your body is not broken. It just needs a different kind of support now.',

      // Resources
      resources_title: 'RESOURCES',
      resources_sub: 'Evidence-based education from Dr. Lovato and Debora. Every article is cited. Every recommendation has research behind it.',

      // Book
      book_title: 'BOOK A SESSION',
      book_sub: 'Direct coaching from Doc and Debora. Real humans. Real results.',

      // Pricing
      pricing_title: 'INVEST IN YOURSELF.',
      pricing_sub: 'Less than one session with a trainer. Cancel anytime. No excuses.',
      pricing_discount: 'Because some people have already given enough.',

      // FORGE AI greetings
      forge_ai_greeting_dashboard: 'Good {timeOfDay}. I have your workout ready and I can see your recent activity. What do you need?',
      forge_ai_greeting_train: 'Your coach is ready. Ask me about today\'s workout, your nutrition targets, or your supplement stack.',
      forge_ai_greeting_progress: 'I can analyze your progress data. Ask me about your trends, what\'s working, or what to adjust.',
      forge_ai_greeting_resources: 'I can explain any research here in plain language. Ask me about any GLP medication, peptide, or supplement.',
      forge_ai_greeting_debora: 'Debora\'s specialty is post-transformation support. I can help you understand what coaching area fits your situation.',
      forge_ai_greeting_book: 'Ready to book with Doc or Debora? I can help you pick the right session based on your goals.',
      forge_ai_greeting_default: 'I am your FORGE AI coach. Ask me anything about training, nutrition, recovery, or your goals.',

      // Misc
      disclaimer_medical: 'This is not medical advice. Always consult your physician.',
      disclaimer_supplements: 'FORGEIQ supplement recommendations are educational and evidence-based. They are not medical advice.',
    },

    es: {
      nav_dashboard: 'Panel',
      nav_train: 'Entrenar',
      nav_progress: 'Progreso',
      nav_debora: 'Debora',
      nav_resources: 'Recursos',
      nav_book: 'Reservar',
      nav_login: 'Iniciar sesión',
      nav_signup: 'Comenzar',
      forge_ai_btn: 'FORGE AI',
      forge_ai_sub: 'Impulsado por Claude',
      forge_ai_placeholder: 'Pregunta a tu coach...',
      hero_tagline: 'NUNCA TENEMOS QUE RENDIRNOS.',
      hero_sub: 'Construido por un veterano de combate y su esposa — que se conocieron en un gimnasio, perdieron casi 100 libras entre los dos, y reconstruyeron sus vidas a través de la disciplina, el amor y la negativa a rendirse. Tu entrenador de IA fue construido desde esa historia. Fue construido para la tuya.',
      hero_cta: 'NO ME RENDIRÉ',
      hero_cta2: 'Ver cómo funciona',
      features_title: 'LA ÚNICA HERRAMIENTA QUE NUNCA TE FALLA ES TU PROPIA DISCIPLINA.',
      goals_title: '¿CUÁL ES TU OBJETIVO PRINCIPAL?',
      goals_sub: 'Tu entrenador de IA construye cada sesión alrededor de tus objetivos. Selecciona todos los que apliquen.',
      founders_title: 'CONSTRUIDO DESDE BATALLAS REALES. NO DESDE UNA SALA DE JUNTAS.',
      couples_title: 'MÁS FUERTES JUNTOS.',
      faq_title: 'PREGUNTAS FRECUENTES',
      footer_cta_title: 'TOMA LA DECISIÓN.',
      footer_cta_body: 'Nadie viene a arreglarte. Nadie necesita hacerlo. Tienes todo lo que se necesita — solo necesitas un entrenador que también lo crea.',
      onboard_step1_title: '¿CUÁL ES TU OBJETIVO PRINCIPAL?',
      onboard_step1_sub: 'Selecciona todo lo que aplique.',
      onboard_step2_title: '¿QUÉ TE HA IMPEDIDO DAR EL PASO?',
      onboard_step2_sub: 'Selecciona todo lo que aplique.',
      onboard_step3_title: 'TU NIVEL DE EXPERIENCIA',
      onboard_step3_sub: 'Selecciona el que mejor te describa.',
      onboard_step4_title: '¿ALGUNA DE ESTAS APLICA A TI?',
      onboard_step4_sub: 'Tu entrenador de IA usa esto para protegerte y construir alrededor de tu realidad — no un plan genérico.',
      onboard_step4b_title: '¿ESTÁS TOMANDO ALGÚN MEDICAMENTO ACTUALMENTE?',
      onboard_step4b_sub: 'Selecciona todo lo que aplique.',
      onboard_step4c_title: '¿ESTÁS TOMANDO ALGÚN SUPLEMENTO ACTUALMENTE?',
      onboard_step4c_sub: 'Tu entrenador usa esto para evitar recomendaciones redundantes e identificar brechas reales.',
      onboard_step5_title: 'HABLEMOS DE COMIDA',
      onboard_step5_sub: 'Ayuda a tu entrenador a entender cómo comes hoy.',
      onboard_step6_title: '¿CUÁLES SON TUS OBJETIVOS NUTRICIONALES?',
      onboard_step6_sub: 'Selecciona todo lo que aplique.',
      onboard_step7_title: 'TUS OBJETIVOS CORPORALES',
      onboard_step7_sub: 'Dale a tu entrenador un punto de partida.',
      onboard_step8_title: '¿CÓMO QUIERES ENTRENAR?',
      onboard_step8_sub: 'Selecciona todos los estilos de entrenamiento que te interesen.',
      onboard_step9_title: 'PREGUNTAS RÁPIDAS',
      onboard_step9_sub: 'Esto ayuda a tu entrenador a ajustar todo a tu nivel actual.',
      onboard_step10_title: 'TU PLAN ESTÁ LISTO.',
      btn_next: 'SIGUIENTE',
      btn_back: 'Atrás',
      btn_skip: 'Saltar',
      btn_start: 'NO ME RENDIRÉ — COMENZAR AHORA',
      btn_start_workout: 'INICIAR ENTRENAMIENTO',
      btn_log_meal: 'Registrar comida',
      btn_log_water: 'Registrar agua',
      btn_log_today: 'REGISTRAR MÉTRICAS DE HOY',
      btn_download_pdf: 'Descargar informe (PDF)',
      btn_save_drive: 'Guardar en Drive',
      btn_book_session: 'Reservar una sesión',
      btn_get_started: 'Comenzar',
      dashboard_greeting_morning: 'Buenos días',
      dashboard_greeting_afternoon: 'Buenas tardes',
      dashboard_greeting_evening: 'Buenas noches',
      dashboard_journey: 'Día {x} de tu camino. Tu entrenador tiene tu entrenamiento listo.',
      dashboard_streak: 'Racha de días',
      dashboard_workouts_week: 'Entrenamientos esta semana',
      dashboard_goals_checked: 'Objetivos cumplidos',
      train_tab_workout: 'Entrenamiento',
      train_tab_nutrition: 'Nutrición',
      train_tab_coach: 'Entrenador',
      train_select_type: 'SELECCIONA TU TIPO DE ENTRENAMIENTO',
      train_select_muscle: 'SELECCIONA GRUPO MUSCULAR',
      train_select_focus: 'SELECCIONA TU ENFOQUE',
      train_building: 'Construyendo tu entrenamiento...',
      train_history: 'HISTORIAL DE ENTRENAMIENTOS',
      train_tools: 'HERRAMIENTAS',
      train_1rm_calc: 'Calculadora 1RM',
      train_plates_calc: 'Calculadora de Discos',
      progress_title: 'Seguimiento de Progreso',
      progress_sub: 'Las medidas cuentan la historia real.',
      progress_weight: 'Peso Actual',
      progress_lost: 'lbs Perdidas Total',
      progress_waist: 'Cambio de Cintura',
      progress_bf: 'Grasa Corporal %',
      progress_entries: 'Entradas Totales',
      glp1_disclaimer: 'La báscula es un solo dato. El músculo pesa más que la grasa. Si estás en medicación GLP-1, prioriza las medidas sobre el peso.',
      debora_title: 'DEBORA LOVATO',
      debora_subtitle: 'Directora de Nutrición y Bienestar',
      debora_quote: 'Tu cuerpo no está roto. Solo necesita un tipo diferente de apoyo ahora.',
      resources_title: 'RECURSOS',
      resources_sub: 'Educación basada en evidencia de Dr. Lovato y Debora. Cada artículo tiene citas. Cada recomendación tiene investigación.',
      book_title: 'RESERVAR UNA SESIÓN',
      book_sub: 'Coaching directo con Doc y Debora. Personas reales. Resultados reales.',
      pricing_title: 'INVIERTE EN TI.',
      pricing_sub: 'Menos que una sesión con un entrenador. Cancela cuando quieras. Sin excusas.',
      pricing_discount: 'Porque algunas personas ya han dado suficiente.',
      forge_ai_greeting_dashboard: 'Buenos {timeOfDay}. Tengo tu entrenamiento listo y puedo ver tu actividad reciente. ¿Qué necesitas?',
      forge_ai_greeting_train: 'Tu entrenador está listo. Pregúntame sobre tu entrenamiento, nutrición o suplementos.',
      forge_ai_greeting_progress: 'Puedo analizar tus datos de progreso. Pregúntame sobre tus tendencias.',
      forge_ai_greeting_resources: 'Puedo explicar cualquier investigación aquí en lenguaje sencillo.',
      forge_ai_greeting_debora: 'La especialidad de Debora es el apoyo post-transformación.',
      forge_ai_greeting_book: '¿Listo para reservar? Puedo ayudarte a elegir la sesión correcta.',
      forge_ai_greeting_default: 'Soy tu entrenador FORGE AI. Pregúntame lo que quieras sobre entrenamiento, nutrición o tus objetivos.',
      disclaimer_medical: 'Esto no es consejo médico. Siempre consulta a tu médico.',
      disclaimer_supplements: 'Las recomendaciones de suplementos de FORGEIQ son educativas y basadas en evidencia. No son consejo médico.',
    },

    pt: {
      nav_dashboard: 'Painel',
      nav_train: 'Treinar',
      nav_progress: 'Progresso',
      nav_debora: 'Debora',
      nav_resources: 'Recursos',
      nav_book: 'Reservar',
      nav_login: 'Entrar',
      nav_signup: 'Começar',
      forge_ai_btn: 'FORGE AI',
      forge_ai_sub: 'Desenvolvido por Claude',
      forge_ai_placeholder: 'Pergunte ao seu coach...',
      hero_tagline: 'NUNCA TEMOS QUE DESISTIR.',
      hero_sub: 'Criado por um veterano de combate e sua esposa — que se conheceram numa academia, perderam quase 50kg juntos, e reconstruíram suas vidas com disciplina, amor e recusa em parar. Seu coach de IA foi construído a partir dessa história. Foi construído para a sua.',
      hero_cta: 'NÃO VOU DESISTIR',
      hero_cta2: 'Ver como funciona',
      features_title: 'A ÚNICA FERRAMENTA QUE NUNCA FALHA COM VOCÊ É A SUA PRÓPRIA DISCIPLINA.',
      goals_title: 'QUAL É O SEU OBJETIVO PRINCIPAL?',
      goals_sub: 'Seu coach de IA constrói cada sessão em torno dos seus objetivos. Selecione todos que se aplicam.',
      founders_title: 'CONSTRUÍDO A PARTIR DE BATALHAS REAIS. NÃO DE UMA SALA DE REUNIÕES.',
      couples_title: 'MAIS FORTES JUNTOS.',
      faq_title: 'PERGUNTAS FREQUENTES',
      footer_cta_title: 'TOME A DECISÃO.',
      footer_cta_body: 'Ninguém vem te consertar. Ninguém precisa. Você tem tudo o que é preciso — só precisa de um coach que também acredite nisso.',
      onboard_step1_title: 'QUAL É O SEU OBJETIVO PRINCIPAL?',
      onboard_step1_sub: 'Selecione tudo que se aplica.',
      onboard_step2_title: 'O QUE TE IMPEDIU DE DAR O PASSO?',
      onboard_step2_sub: 'Selecione tudo que se aplica.',
      onboard_step3_title: 'SEU NÍVEL DE EXPERIÊNCIA',
      onboard_step3_sub: 'Selecione o que melhor descreve você.',
      onboard_step4_title: 'ALGUM DESSES SE APLICA A VOCÊ?',
      onboard_step4_sub: 'Seu coach de IA usa isso para protegê-lo e construir em torno da sua realidade — não um plano genérico.',
      onboard_step4b_title: 'VOCÊ ESTÁ TOMANDO ALGUM MEDICAMENTO ATUALMENTE?',
      onboard_step4b_sub: 'Selecione tudo que se aplica.',
      onboard_step4c_title: 'VOCÊ ESTÁ TOMANDO ALGUM SUPLEMENTO ATUALMENTE?',
      onboard_step4c_sub: 'Seu coach usa isso para evitar recomendações redundantes e identificar lacunas reais.',
      onboard_step5_title: 'VAMOS FALAR SOBRE COMIDA',
      onboard_step5_sub: 'Ajude seu coach a entender como você come hoje.',
      onboard_step6_title: 'QUAIS SÃO SEUS OBJETIVOS NUTRICIONAIS?',
      onboard_step6_sub: 'Selecione tudo que se aplica.',
      onboard_step7_title: 'SEUS OBJETIVOS CORPORAIS',
      onboard_step7_sub: 'Dê ao seu coach um ponto de partida.',
      onboard_step8_title: 'COMO VOCÊ QUER TREINAR?',
      onboard_step8_sub: 'Selecione todos os estilos de treino que te interessam.',
      onboard_step9_title: 'PERGUNTAS RÁPIDAS',
      onboard_step9_sub: 'Isso ajuda seu coach a ajustar tudo ao seu nível atual.',
      onboard_step10_title: 'SEU PLANO ESTÁ PRONTO.',
      btn_next: 'PRÓXIMO',
      btn_back: 'Voltar',
      btn_skip: 'Pular',
      btn_start: 'NÃO VOU DESISTIR — COMEÇAR AGORA',
      btn_start_workout: 'INICIAR TREINO',
      btn_log_meal: 'Registrar refeição',
      btn_log_water: 'Registrar água',
      btn_log_today: 'REGISTRAR MÉTRICAS DE HOJE',
      btn_download_pdf: 'Baixar relatório (PDF)',
      btn_save_drive: 'Salvar no Drive',
      btn_book_session: 'Reservar uma sessão',
      btn_get_started: 'Começar',
      dashboard_greeting_morning: 'Bom dia',
      dashboard_greeting_afternoon: 'Boa tarde',
      dashboard_greeting_evening: 'Boa noite',
      dashboard_journey: 'Dia {x} da sua jornada. Seu coach tem seu treino pronto.',
      dashboard_streak: 'Sequência de dias',
      dashboard_workouts_week: 'Treinos esta semana',
      dashboard_goals_checked: 'Objetivos cumpridos',
      train_tab_workout: 'Treino',
      train_tab_nutrition: 'Nutrição',
      train_tab_coach: 'Coach',
      train_select_type: 'SELECIONE SEU TIPO DE TREINO',
      train_select_muscle: 'SELECIONE GRUPO MUSCULAR',
      train_select_focus: 'SELECIONE SEU FOCO',
      train_building: 'Construindo seu treino...',
      train_history: 'HISTÓRICO DE TREINOS',
      train_tools: 'FERRAMENTAS',
      train_1rm_calc: 'Calculadora 1RM',
      train_plates_calc: 'Calculadora de Anilhas',
      progress_title: 'Acompanhamento de Progresso',
      progress_sub: 'As medidas contam a história real.',
      progress_weight: 'Peso Atual',
      progress_lost: 'lbs Perdidas Total',
      progress_waist: 'Mudança de Cintura',
      progress_bf: 'Gordura Corporal %',
      progress_entries: 'Entradas Totais',
      glp1_disclaimer: 'A balança é apenas um dado. Músculo pesa mais que gordura. Se você está em medicação GLP, priorize medidas em vez do peso.',
      debora_title: 'DEBORA LOVATO',
      debora_subtitle: 'Diretora de Nutrição e Bem-estar',
      debora_quote: 'Seu corpo não está quebrado. Ele só precisa de um tipo diferente de apoio agora.',
      resources_title: 'RECURSOS',
      resources_sub: 'Educação baseada em evidências do Dr. Lovato e Debora. Cada artigo é citado. Cada recomendação tem pesquisa.',
      book_title: 'RESERVAR UMA SESSÃO',
      book_sub: 'Coaching direto com Doc e Debora. Pessoas reais. Resultados reais.',
      pricing_title: 'INVISTA EM VOCÊ.',
      pricing_sub: 'Menos que uma sessão com um personal. Cancele quando quiser. Sem desculpas.',
      pricing_discount: 'Porque algumas pessoas já deram o suficiente.',
      forge_ai_greeting_dashboard: 'Bom {timeOfDay}. Tenho seu treino pronto e posso ver sua atividade recente. O que você precisa?',
      forge_ai_greeting_train: 'Seu coach está pronto. Pergunte sobre seu treino, nutrição ou suplementos.',
      forge_ai_greeting_progress: 'Posso analisar seus dados de progresso. Pergunte sobre suas tendências.',
      forge_ai_greeting_resources: 'Posso explicar qualquer pesquisa aqui em linguagem simples.',
      forge_ai_greeting_debora: 'A especialidade da Debora é o suporte pós-transformação.',
      forge_ai_greeting_book: 'Pronto para reservar? Posso ajudá-lo a escolher a sessão certa.',
      forge_ai_greeting_default: 'Sou seu coach FORGE AI. Pergunte qualquer coisa sobre treino, nutrição ou seus objetivos.',
      disclaimer_medical: 'Isto não é conselho médico. Sempre consulte seu médico.',
      disclaimer_supplements: 'As recomendações de suplementos da FORGEIQ são educacionais e baseadas em evidências. Não são conselho médico.',
    }
  };

  // Make translations globally accessible
  window.FORGEIQ_TRANSLATIONS = TRANSLATIONS;

  function getLanguage() {
    return localStorage.getItem('forgeiq_language') || localStorage.getItem('forgeiq_lang') || 'en';
  }

  function setLanguage(lang) {
    if (!TRANSLATIONS[lang]) return;
    localStorage.setItem('forgeiq_language', lang);
    localStorage.setItem('forgeiq_lang', lang); // backward compat
    applyTranslations(lang);
    // Update language toggle buttons
    document.querySelectorAll('.lang-btn').forEach(function(btn) {
      btn.classList.toggle('active', btn.getAttribute('data-lang') === lang || btn.textContent.trim().toLowerCase() === lang);
    });
  }

  function t(key, lang) {
    var l = lang || getLanguage();
    return (TRANSLATIONS[l] && TRANSLATIONS[l][key]) || (TRANSLATIONS.en && TRANSLATIONS.en[key]) || key;
  }

  function applyTranslations(lang) {
    var l = lang || getLanguage();

    // Translate data-i18n elements (textContent)
    document.querySelectorAll('[data-i18n]').forEach(function(el) {
      var key = el.getAttribute('data-i18n');
      var translation = (TRANSLATIONS[l] && TRANSLATIONS[l][key]);
      if (translation) {
        el.textContent = translation;
      }
    });

    // Translate data-i18n-placeholder elements
    document.querySelectorAll('[data-i18n-placeholder]').forEach(function(el) {
      var key = el.getAttribute('data-i18n-placeholder');
      var translation = (TRANSLATIONS[l] && TRANSLATIONS[l][key]);
      if (translation) {
        el.placeholder = translation;
      }
    });

    // Translate data-i18n-html elements (innerHTML)
    document.querySelectorAll('[data-i18n-html]').forEach(function(el) {
      var key = el.getAttribute('data-i18n-html');
      var translation = (TRANSLATIONS[l] && TRANSLATIONS[l][key]);
      if (translation) {
        el.innerHTML = translation;
      }
    });
  }

  // Auto-init
  document.addEventListener('DOMContentLoaded', function() {
    var lang = getLanguage();
    applyTranslations(lang);
    // Highlight active language button
    document.querySelectorAll('.lang-btn').forEach(function(btn) {
      btn.classList.toggle('active', btn.getAttribute('data-lang') === lang || btn.textContent.trim().toLowerCase() === lang);
    });
  });

  // Expose globally
  window.setLanguage = setLanguage;
  window.getLanguage = getLanguage;
  window.forgeiqTranslate = t;
  window.applyTranslations = applyTranslations;

})();
