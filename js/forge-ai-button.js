/**
 * FORGE AI Chat Button — Self-contained drop-in script
 * Include on any page: <script src="/js/forge-ai-button.js"></script>
 */
(function () {
  'use strict';

  /* ------------------------------------------------------------------ */
  /*  PART 1 — AUTH GUARD                                               */
  /* ------------------------------------------------------------------ */
  // Public pages that should NEVER redirect to login
  // Matches both /signup and /signup.html variants
  var PUBLIC_SLUGS = ['', 'index', 'login', 'signup', 'pricing', 'onboarding', 'debora', 'coaching', 'book', 'glp-hub', 'peptide-library', 'resources', 'doc', 'nutrition', 'plan-builder', 'macro-plan'];

  function currentPath() {
    return window.location.pathname.replace(/\/$/, '') || '/';
  }

  function isPublicPage() {
    var p = currentPath();
    // Root path is always public
    if (p === '/' || p === '') return true;
    // Strip leading slash and .html extension to get the slug
    var slug = p.replace(/^\//, '').replace(/\.html$/, '');
    return PUBLIC_SLUGS.indexOf(slug) !== -1;
  }

  function authGuard() {
    // Flag set by public pages in <head> — runs before any other JS
    if (window.__FORGEIQ_PUBLIC_PAGE__) {
      injectLogoutButton();
      return;
    }
    if (!isPublicPage()) {
      var token = localStorage.getItem('forgeiq_token');
      if (!token) {
        window.location.href = '/login.html';
        return;
      }
    }
    injectLogoutButton();
  }

  function injectLogoutButton() {
    var token = localStorage.getItem('forgeiq_token');
    if (!token) return;

    var profile = null;
    try { profile = JSON.parse(localStorage.getItem('forgeiq_profile')); } catch (e) { /* ignore */ }
    var email = (profile && profile.email) ? profile.email : 'User';

    var container = document.querySelector('.nav-right') || document.querySelector('.nav-controls');
    if (!container) return;

    if (container.querySelector('.forgeiq-logout-btn')) return;

    var btn = document.createElement('button');
    btn.className = 'forgeiq-logout-btn';
    btn.innerHTML = email + ' &middot; <strong>Log out</strong>';
    btn.style.cssText =
      'background:transparent;border:1px solid rgba(240,165,0,0.4);color:#f0a500;' +
      'font-family:"Barlow",sans-serif;font-size:13px;padding:6px 14px;border-radius:6px;' +
      'cursor:pointer;margin-left:12px;transition:background 0.2s;';
    btn.addEventListener('mouseenter', function () { btn.style.background = 'rgba(240,165,0,0.1)'; });
    btn.addEventListener('mouseleave', function () { btn.style.background = 'transparent'; });
    btn.addEventListener('click', function () {
      if (typeof SupabaseClient !== 'undefined' && SupabaseClient.signOut) {
        SupabaseClient.signOut().then(function () {
          localStorage.removeItem('forgeiq_token');
          localStorage.removeItem('forgeiq_profile');
          window.location.href = '/login.html';
        });
      } else {
        localStorage.removeItem('forgeiq_token');
        localStorage.removeItem('forgeiq_profile');
        window.location.href = '/login.html';
      }
    });
    container.appendChild(btn);
  }

  /* ------------------------------------------------------------------ */
  /*  PART 2 & 3 — INJECT CSS                                          */
  /* ------------------------------------------------------------------ */
  function injectStyles() {
    var css = '' +
      /* FAB button */
      '#forge-ai-fab{position:fixed;bottom:20px;right:20px;width:160px;height:52px;' +
      'background:linear-gradient(135deg,#f0a500,#ffb820);border:none;border-radius:26px;' +
      'cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;' +
      'box-shadow:0 4px 20px rgba(240,165,0,0.5);z-index:9999;transition:transform 0.2s,box-shadow 0.2s;' +
      'animation:forgeai-pulse 2s infinite;padding:0 16px;}' +
      '#forge-ai-fab:hover{transform:scale(1.05);box-shadow:0 6px 28px rgba(240,165,0,0.7);}' +
      '#forge-ai-fab .fab-icon{font-size:20px;line-height:1;}' +
      '#forge-ai-fab .fab-text{display:flex;flex-direction:column;align-items:flex-start;}' +
      '#forge-ai-fab .fab-title{font-family:"Bebas Neue",sans-serif;font-size:18px;color:#fff;' +
      'letter-spacing:0.08em;line-height:1.1;}' +
      '#forge-ai-fab .fab-sub{font-family:"Barlow",sans-serif;font-size:9px;' +
      'color:rgba(255,255,255,0.85);line-height:1;}' +
      '@keyframes forgeai-pulse{0%,100%{box-shadow:0 4px 20px rgba(240,165,0,0.5);}' +
      '50%{box-shadow:0 4px 30px rgba(240,165,0,0.8);}}' +

      /* Panel */
      '#forge-ai-panel{position:fixed;top:0;right:-420px;width:400px;height:100vh;' +
      'background:#0e1e36;border-left:3px solid #f0a500;z-index:10000;display:flex;' +
      'flex-direction:column;transition:right 0.3s ease;box-shadow:-4px 0 30px rgba(0,0,0,0.5);}' +
      '#forge-ai-panel.open{right:0;}' +
      '@media(max-width:480px){#forge-ai-panel{width:100%;right:-100%;}' +
      '#forge-ai-panel.open{right:0;}}' +

      /* Overlay */
      '#forge-ai-overlay{position:fixed;top:0;left:0;width:100%;height:100%;' +
      'background:rgba(0,0,0,0.45);z-index:9998;opacity:0;pointer-events:none;' +
      'transition:opacity 0.3s ease;}' +
      '#forge-ai-overlay.visible{opacity:1;pointer-events:auto;}' +

      /* Panel header */
      '.forge-ai-header{display:flex;align-items:center;justify-content:space-between;' +
      'padding:16px 18px;border-bottom:1px solid rgba(240,165,0,0.25);flex-shrink:0;}' +
      '.forge-ai-header-left{display:flex;flex-direction:column;}' +
      '.forge-ai-header-title{font-family:"Bebas Neue",sans-serif;font-size:22px;' +
      'color:#f0a500;letter-spacing:0.06em;line-height:1.1;}' +
      '.forge-ai-header-sub{font-family:"Barlow",sans-serif;font-size:10px;' +
      'color:rgba(255,255,255,0.5);margin-top:2px;}' +
      '.forge-ai-close{background:transparent;border:none;color:#fff;font-size:22px;' +
      'cursor:pointer;padding:4px 8px;line-height:1;opacity:0.7;transition:opacity 0.2s;}' +
      '.forge-ai-close:hover{opacity:1;}' +

      /* Chat body */
      '.forge-ai-body{flex:1;overflow-y:auto;padding:16px 14px;display:flex;' +
      'flex-direction:column;gap:10px;}' +
      '.forge-ai-body::-webkit-scrollbar{width:6px;}' +
      '.forge-ai-body::-webkit-scrollbar-track{background:transparent;}' +
      '.forge-ai-body::-webkit-scrollbar-thumb{background:rgba(240,165,0,0.3);border-radius:3px;}' +

      /* Message bubbles */
      '.forge-msg{max-width:85%;padding:10px 14px;border-radius:14px;font-family:"Barlow",sans-serif;' +
      'font-size:14px;line-height:1.5;word-wrap:break-word;white-space:pre-wrap;}' +
      '.forge-msg.user{align-self:flex-end;background:rgba(240,165,0,0.15);' +
      'color:#ffe0a0;border-bottom-right-radius:4px;}' +
      '.forge-msg.assistant{align-self:flex-start;background:#142444;' +
      'color:#dce6f0;border-bottom-left-radius:4px;}' +

      /* Typing indicator */
      '.forge-typing{align-self:flex-start;display:flex;gap:5px;padding:12px 16px;}' +
      '.forge-typing span{width:8px;height:8px;background:rgba(240,165,0,0.6);' +
      'border-radius:50%;animation:forge-dot 1.4s infinite both;}' +
      '.forge-typing span:nth-child(2){animation-delay:0.2s;}' +
      '.forge-typing span:nth-child(3){animation-delay:0.4s;}' +
      '@keyframes forge-dot{0%,80%,100%{transform:scale(0.4);opacity:0.4;}' +
      '40%{transform:scale(1);opacity:1;}}' +

      /* Footer */
      '.forge-ai-footer{padding:12px 14px;border-top:1px solid rgba(240,165,0,0.2);' +
      'display:flex;gap:8px;align-items:flex-end;flex-shrink:0;}' +
      '.forge-ai-footer textarea{flex:1;background:#142444;border:1px solid rgba(240,165,0,0.25);' +
      'border-radius:10px;color:#dce6f0;font-family:"Barlow",sans-serif;font-size:14px;' +
      'padding:10px 12px;resize:none;outline:none;rows:2;min-height:40px;max-height:120px;' +
      'transition:border-color 0.2s;}' +
      '.forge-ai-footer textarea::placeholder{color:rgba(255,255,255,0.35);}' +
      '.forge-ai-footer textarea:focus{border-color:#f0a500;}' +
      '.forge-ai-send{background:linear-gradient(135deg,#f0a500,#ffb820);border:none;' +
      'border-radius:10px;width:42px;height:42px;cursor:pointer;display:flex;' +
      'align-items:center;justify-content:center;font-size:18px;flex-shrink:0;' +
      'transition:transform 0.15s;}' +
      '.forge-ai-send:hover{transform:scale(1.08);}' +
      '.forge-ai-send:disabled{opacity:0.5;cursor:default;transform:none;}';

    var style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
  }

  /* ------------------------------------------------------------------ */
  /*  PART 2 — FLOATING BUTTON                                         */
  /* ------------------------------------------------------------------ */
  function createFAB() {
    var btn = document.createElement('button');
    btn.id = 'forge-ai-fab';
    btn.innerHTML =
      '<span class="fab-icon">\u26A1</span>' +
      '<span class="fab-text">' +
        '<span class="fab-title">FORGE AI</span>' +
        '<span class="fab-sub">Powered by Claude</span>' +
      '</span>';
    document.body.appendChild(btn);
    return btn;
  }

  /* ------------------------------------------------------------------ */
  /*  PART 3 — CHAT PANEL                                              */
  /* ------------------------------------------------------------------ */
  function createPanel() {
    /* Overlay */
    var overlay = document.createElement('div');
    overlay.id = 'forge-ai-overlay';
    document.body.appendChild(overlay);

    /* Panel */
    var panel = document.createElement('div');
    panel.id = 'forge-ai-panel';
    panel.innerHTML =
      '<div class="forge-ai-header">' +
        '<div class="forge-ai-header-left">' +
          '<span class="forge-ai-header-title">\u26A1 FORGE AI</span>' +
          '<span class="forge-ai-header-sub">Powered by Claude \u00B7 Anthropic</span>' +
        '</div>' +
        '<button class="forge-ai-close" aria-label="Close">\u2715</button>' +
      '</div>' +
      '<div class="forge-ai-body"></div>' +
      '<div class="forge-ai-footer">' +
        '<textarea rows="2" placeholder="Ask your coach..."></textarea>' +
        '<button class="forge-ai-send" aria-label="Send">\u27A4</button>' +
      '</div>';
    document.body.appendChild(panel);

    return { overlay: overlay, panel: panel };
  }

  /* ------------------------------------------------------------------ */
  /*  PART 4 — CHAT LOGIC                                              */
  /* ------------------------------------------------------------------ */
  var chatHistory = [];
  var panelHasGreeted = false;

  function getTimeOfDay() {
    var h = new Date().getHours();
    if (h < 12) return 'morning';
    if (h < 18) return 'afternoon';
    return 'evening';
  }

  function getGreeting() {
    var p = currentPath().replace('.html', '').replace(/^\//, '');
    var tod = getTimeOfDay();

    var greetings = {
      'dashboard': 'Good ' + tod + '. I have your workout ready and I can see your recent activity. What do you need?',
      'train': 'Your coach is ready. Ask me about today\'s workout, your nutrition targets, or your supplement stack.',
      'progress': 'I can analyze your progress data. Ask me about your trends, what is working, or what to adjust.',
      'resources': 'I can explain any research here in plain language. Ask me about any GLP medication, peptide, or supplement.',
      'debora': 'You are on Debora\'s page. She specializes in GLP-1 skin changes, post-weight-loss confidence, and couples wellness. I can help you figure out which of her protocols is right for you.',
      'coaching': 'You are on Doc\'s coaching page. I can help you understand which coaching package fits your goals, or you can book a free 20-minute discovery call directly.',
      'book': 'Ready to book with Doc or Debora? I can help you pick the right session based on your goals.'
    };

    return greetings[p] || 'I am your FORGE AI coach. Ask me anything about training, nutrition, recovery, or your goals.';
  }

  function addMessage(body, role, text) {
    var div = document.createElement('div');
    div.className = 'forge-msg ' + role;
    div.textContent = text;
    body.appendChild(div);
    body.scrollTop = body.scrollHeight;
  }

  function showTyping(body) {
    var el = document.createElement('div');
    el.className = 'forge-typing';
    el.id = 'forge-typing-indicator';
    el.innerHTML = '<span></span><span></span><span></span>';
    body.appendChild(el);
    body.scrollTop = body.scrollHeight;
    return el;
  }

  function removeTyping() {
    var el = document.getElementById('forge-typing-indicator');
    if (el) el.remove();
  }

  function sendMessage(body, textarea) {
    var text = textarea.value.trim();
    if (!text) return;

    textarea.value = '';
    textarea.style.height = 'auto';

    addMessage(body, 'user', text);
    chatHistory.push({ role: 'user', content: text });

    var typing = showTyping(body);

    var profile = null;
    try { profile = JSON.parse(localStorage.getItem('forgeiq_profile')); } catch (e) { /* ignore */ }
    var lang = localStorage.getItem('forgeiq_lang') || 'en';

    var langLabel = lang === 'es' ? 'Respond ONLY in Spanish.' : lang === 'pt' ? 'Respond ONLY in Portuguese.' : 'Respond in English.';
    var sysPrompt = 'You are FORGE AI, built on the expertise of Dr. Michael P. Lovato, EdD. Dr. Lovato\'s credential stack: EdD (GCU), NASM CNC/CES/PES, NCSC, EPI Phase 2, ACE IFT Model, MyFIIT, AI in Fitness, Programming for GLP-1 Users (Pete McCall), Anti-Obesity Medications Guide, Nutritional Coaching (Melissa Layne), Metabolism Reality Check (Sohallia Digsby), Building Bigger Muscles (Dr. Zachary Mang), Abs Are Made in the Kitchen (Sohallia Digsby), Kettlebells: Mastering the Swing, Functional Techniques, Tactical Training Level 1, Fit Bodies Group Fitness Instructor, Foundations of Corrective Exercise, Insights to Shoulder Pain (Chuck Wolf), Flexibility Highways, OA Functional Breathing Instructor, TRX Yoga Hip Opening, Applying Yoga to Health and Fitness, Practical Stress Resilience Coaching, 30+ AI certifications. Army Combat Engineer veteran, 100% service connected, lost 98 lbs, trains daily through torn shoulder, knee surgery, arthritis. His wife Debora Lovato holds NASM CNC/CES/PES, Licensed Esthetician, Laser Certified, and specializes in GLP-1 skin changes, post-transformation wellness, collagen protocols, and couples coaching. When users ask about credentials, programming expertise, or qualifications -- reference this background accurately. ' + langLabel + ' Be direct, knowledgeable, concise.';

    // Build messages from chat history (user/assistant only, already includes current message)
    var msgs = chatHistory.filter(function(m){ return m.role === 'user' || m.role === 'assistant'; }).slice(-10);

    fetch('/.netlify/functions/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 2000,
        system: sysPrompt,
        messages: msgs
      })
    })
    .then(function (res) { return res.json(); })
    .then(function (data) {
      removeTyping();
      var reply = (data.content && data.content[0]) ? data.content[0].text : 'Sorry, something went wrong. Please try again.';
      addMessage(body, 'assistant', reply);
      chatHistory.push({ role: 'assistant', content: reply });

      // Smart trigger: detect pain/injury mentions in user message
      var lastUserMsg = (chatHistory.filter(function(m){return m.role==='user';}).slice(-1)[0] || {}).content || '';
      var painWords = ['pain','hurt','injury','sore','torn','surgery','ache','strain','sprain'];
      var mentionsPain = painWords.some(function(w){return lastUserMsg.toLowerCase().indexOf(w)>=0;});
      if (mentionsPain) {
        setTimeout(function(){
          addMessage(body, 'assistant', 'Before we adjust your program \u2014 Doc is a NASM CES corrective exercise specialist who completed Chuck Wolf\'s Shoulder Pain certification. If this needs professional eyes: <a href="https://calendly.com/milovato2002" target="_blank" style="color:#f0a500;text-decoration:underline;">Book a free 20-min call with Doc \u2192</a>');
        }, 1500);
      }
    })
    .catch(function () {
      removeTyping();
      addMessage(body, 'assistant', 'Connection error. Please check your network and try again.');
    });
  }

  /* ------------------------------------------------------------------ */
  /*  INIT                                                              */
  /* ------------------------------------------------------------------ */
  function init() {
    injectStyles();

    var fab = createFAB();
    var els = createPanel();
    var panel = els.panel;
    var overlay = els.overlay;

    var body = panel.querySelector('.forge-ai-body');
    var textarea = panel.querySelector('.forge-ai-footer textarea');
    var sendBtn = panel.querySelector('.forge-ai-send');
    var closeBtn = panel.querySelector('.forge-ai-close');

    function openPanel() {
      panel.classList.add('open');
      overlay.classList.add('visible');
      fab.style.display = 'none';

      if (!panelHasGreeted && chatHistory.length === 0) {
        panelHasGreeted = true;
        var greeting = getGreeting();
        addMessage(body, 'assistant', greeting);
        chatHistory.push({ role: 'assistant', content: greeting });

        // Smart coaching triggers
        try {
          var prof = JSON.parse(localStorage.getItem('forgeiq_profile') || '{}');
          var created = prof.createdAt || prof.completedAt || '';
          var daysSinceJoin = created ? Math.floor((Date.now() - new Date(created).getTime()) / 86400000) : 0;
          var meds = (prof.medications || []).join(' ').toLowerCase();
          var hasGLP = meds.indexOf('glp') >= 0 || meds.indexOf('ozempic') >= 0 || meds.indexOf('wegovy') >= 0 || meds.indexOf('mounjaro') >= 0 || meds.indexOf('semaglutide') >= 0 || meds.indexOf('tirzepatide') >= 0;

          if (daysSinceJoin >= 14) {
            setTimeout(function() {
              addMessage(body, 'assistant', 'You have been training consistently for ' + daysSinceJoin + ' days. Have you considered working directly with Doc? He reviews your FORGEIQ data before every session \u2014 he already knows your program. <a href="/coaching.html" style="color:#f0a500;text-decoration:underline;">Learn about 1-on-1 coaching \u2192</a>');
            }, 3000);
          }
          if (hasGLP && daysSinceJoin >= 30) {
            setTimeout(function() {
              addMessage(body, 'assistant', 'You are 30+ days into your GLP-1 journey. Debora specializes in exactly what you are going through right now \u2014 skin, confidence, and the things nobody warned you about. <a href="/debora.html" style="color:#f0a500;text-decoration:underline;">Connect with Debora \u2192</a>');
            }, 5000);
          }
        } catch(e) { /* silent */ }
      }

      textarea.focus();
    }

    function closePanel() {
      panel.classList.remove('open');
      overlay.classList.remove('visible');
      fab.style.display = 'flex';
    }

    fab.addEventListener('click', openPanel);
    closeBtn.addEventListener('click', closePanel);
    overlay.addEventListener('click', closePanel);

    sendBtn.addEventListener('click', function () {
      sendMessage(body, textarea);
    });

    textarea.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage(body, textarea);
      }
    });

    /* Auto-grow textarea */
    textarea.addEventListener('input', function () {
      this.style.height = 'auto';
      this.style.height = Math.min(this.scrollHeight, 120) + 'px';
    });

    /* Auth guard */
    authGuard();
  }

  /* Run on DOMContentLoaded or immediately if already loaded */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
