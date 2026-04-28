// The Doc Lovato Method — Core Utilities
// Language (en, es, pt), Profile, AI Coach, Navigation, Helpers
// Note: Internal namespace `ForgeIQ` and `forgeiq_*` localStorage keys are intentionally preserved (see FORGEIQ_SESSION_NOTES.md → BRAND HISTORY).

const ForgeIQ = (() => {

  // ─── Language Engine ───────────────────────────────────────────
  let _locale = {};
  let _lang = 'en';

  async function loadLanguage(lang) {
    try {
      const res = await fetch(`/locales/${lang}.json`);
      _locale = await res.json();
      _lang = lang;
      localStorage.setItem('forgeiq_lang', lang);
      applyTranslations();
      return true;
    } catch (e) {
      console.error('Language load failed:', e);
      return false;
    }
  }

  function t(keyPath) {
    const keys = keyPath.split('.');
    let val = _locale;
    for (const k of keys) {
      val = val?.[k];
    }
    return val || keyPath;
  }

  function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const translation = t(key);
      if (translation && translation !== key) {
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
          el.placeholder = translation;
        } else {
          el.textContent = translation;
        }
      }
    });
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
      const key = el.getAttribute('data-i18n-html');
      const translation = t(key);
      if (translation && translation !== key) el.innerHTML = translation;
    });
  }

  function getCurrentLang() { return _lang; }


  // ─── Profile Management ────────────────────────────────────────
  function getProfile() {
    try {
      return JSON.parse(localStorage.getItem('forgeiq_profile') || '{}');
    } catch { return {}; }
  }

  function setProfile(profileData) {
    const existing = getProfile();
    const updated = { ...existing, ...profileData };
    localStorage.setItem('forgeiq_profile', JSON.stringify(updated));
    return updated;
  }

  function clearProfile() {
    localStorage.removeItem('forgeiq_profile');
    localStorage.removeItem('forgeiq_lang');
  }


  // ─── Greeting ──────────────────────────────────────────────────
  function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return t('dashboard.greeting_morning');
    if (hour < 17) return t('dashboard.greeting_afternoon');
    return t('dashboard.greeting_evening');
  }


  // ─── AI Coach ──────────────────────────────────────────────────
  let _conversationHistory = [];

  async function askCoach(userMessage) {
    const profile = getProfile();
    const lang = getCurrentLang();
    const langLabel = lang === 'es' ? 'Respond in Spanish.' : lang === 'pt' ? 'Respond in Portuguese.' : 'Respond in English.';

    _conversationHistory.push({
      role: 'user',
      content: userMessage
    });

    const systemPrompt = `You are Dr. Lovato AI, the coach inside The Doc Lovato Method, built by Dr. Michael P. Lovato, EdD. Dr. Lovato's credential stack: EdD, NASM CNC/CES/PES, NCSC, EPI Phase 2, ACE IFT, MyFIIT, Programming for GLP-1 Users (Pete McCall), Nutritional Coaching (Melissa Layne), Metabolism (Sohallia Digsby), Building Bigger Muscles (Dr. Zachary Mang), Corrective Exercise, Shoulder Pain Specialist (Chuck Wolf), Functional Techniques, Kettlebells, Tactical Training, Group Fitness, Flexibility, OA Breathing Instructor, TRX Yoga, Applying Yoga, Anti-Obesity Medications, AI in Fitness, 30+ AI certs. Army Combat Engineer veteran, 100% service connected, lost 98 lbs, trains daily through torn shoulder, knee surgery, arthritis. ${langLabel} Be direct, specific, and warm. Keep answers under 4 sentences unless detail is needed. User profile: ${JSON.stringify(profile)}`;

    try {
      const res = await fetch('/.netlify/functions/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-5',
          max_tokens: 800,
          system: systemPrompt,
          messages: _conversationHistory
        })
      });

      const data = await res.json();

      if (data.content && data.content[0] && data.content[0].text) {
        const reply = data.content[0].text;
        _conversationHistory.push({
          role: 'assistant',
          content: reply
        });
        return { success: true, reply: reply };
      } else if (data.error) {
        throw new Error(data.error.message || data.error);
      } else {
        throw new Error('No reply received');
      }
    } catch (err) {
      console.error('Coach error:', err);
      return { success: false, error: err.message };
    }
  }

  function clearConversation() {
    _conversationHistory = [];
  }


  // ─── Streak Calculation ────────────────────────────────────────
  function calculateStreak(log) {
    if (!log) return 0;
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = d.toISOString().split('T')[0];
      if (log[key]) { streak++; } else { break; }
    }
    return streak;
  }

  function getStreak() {
    const profile = getProfile();
    return calculateStreak(profile.activity_log || {});
  }


  // ─── Navigation ────────────────────────────────────────────────
  function navigateBack() {
    if (window.history.length > 1) {
      history.back();
    } else {
      window.location.href = '/dashboard.html';
    }
  }

  function initNav() {
    const path = window.location.pathname;
    const navMap = {
      '/dashboard.html': 'Dashboard',
      '/workout-log.html': 'Train',
      '/train.html': 'Train',
      '/progress.html': 'Progress',
      '/debora.html': 'Debora',
      '/resources.html': 'Resources',
      '/book.html': 'Book'
    };

    const activeName = navMap[path];
    if (!activeName) return;

    document.querySelectorAll('.nav-links a').forEach(link => {
      if (link.textContent.trim() === activeName) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }


  // ─── PDF Download Helper ───────────────────────────────────────
  function downloadPDF(title, content) {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${title} — The Doc Lovato Method</title>
        <style>
          body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #222; padding: 40px; max-width: 800px; margin: 0 auto; }
          .pdf-header { border-bottom: 2px solid #c9a84c; padding-bottom: 16px; margin-bottom: 32px; display: flex; justify-content: space-between; align-items: center; }
          .pdf-logo { font-size: 1.8rem; font-weight: 700; letter-spacing: 3px; color: #222; }
          .pdf-logo span { color: #c9a84c; }
          .pdf-date { font-size: 0.8rem; color: #888; }
          .pdf-title { font-size: 1.4rem; font-weight: 700; margin-bottom: 24px; }
          .pdf-content { line-height: 1.7; font-size: 0.95rem; }
          .pdf-content table { width: 100%; border-collapse: collapse; margin: 16px 0; }
          .pdf-content th, .pdf-content td { border: 1px solid #ddd; padding: 8px 12px; text-align: left; font-size: 0.85rem; }
          .pdf-content th { background: #f5f5f5; font-weight: 600; }
          .pdf-footer { border-top: 1px solid #ddd; padding-top: 16px; margin-top: 48px; font-size: 0.75rem; color: #999; text-align: center; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <div class="pdf-header">
          <div class="pdf-logo">DOC LOVATO <span>METHOD</span></div>
          <div class="pdf-date">${formatDate(new Date())}</div>
        </div>
        <div class="pdf-title">${title}</div>
        <div class="pdf-content">${content}</div>
        <div class="pdf-footer">
          The Doc Lovato Method — Doctor-Led AI Fitness Coaching by Dr. Michael and Debora Lovato
          <br/>forgeiq.netlify.app — We never have to quit.
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => { printWindow.print(); }, 500);
  }


  // ─── Toast Notification ────────────────────────────────────────
  function toast(message, type = 'info', duration = 3000) {
    // Remove existing toast
    const existing = document.getElementById('forgeiq-toast');
    if (existing) existing.remove();

    const el = document.createElement('div');
    el.id = 'forgeiq-toast';
    el.textContent = message;

    const colors = {
      success: { bg: 'rgba(39,174,96,0.95)', color: '#fff' },
      error:   { bg: 'rgba(231,76,60,0.95)', color: '#fff' },
      info:    { bg: 'rgba(201,168,76,0.95)', color: '#0a0a0a' },
      warning: { bg: 'rgba(243,156,18,0.95)', color: '#0a0a0a' }
    };
    const c = colors[type] || colors.info;

    Object.assign(el.style, {
      position: 'fixed',
      bottom: '24px',
      left: '50%',
      transform: 'translateX(-50%) translateY(20px)',
      background: c.bg,
      color: c.color,
      padding: '12px 28px',
      borderRadius: '8px',
      fontFamily: "'DM Sans', sans-serif",
      fontSize: '0.88rem',
      fontWeight: '500',
      zIndex: '9999',
      opacity: '0',
      transition: 'opacity 0.3s, transform 0.3s',
      boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
      maxWidth: '90vw',
      textAlign: 'center'
    });

    document.body.appendChild(el);

    // Animate in
    requestAnimationFrame(() => {
      el.style.opacity = '1';
      el.style.transform = 'translateX(-50%) translateY(0)';
    });

    // Auto remove
    setTimeout(() => {
      el.style.opacity = '0';
      el.style.transform = 'translateX(-50%) translateY(20px)';
      setTimeout(() => el.remove(), 300);
    }, duration);
  }


  // ─── Format Date Helper ────────────────────────────────────────
  function formatDate(date, style = 'long') {
    if (!date) return '';
    const d = date instanceof Date ? date : new Date(date);
    if (isNaN(d.getTime())) return '';

    if (style === 'short') {
      return d.toLocaleDateString(_lang === 'pt' ? 'pt-BR' : _lang === 'es' ? 'es-ES' : 'en-US', {
        month: 'short', day: 'numeric'
      });
    }
    if (style === 'iso') {
      return d.toISOString().split('T')[0];
    }
    // long (default)
    return d.toLocaleDateString(_lang === 'pt' ? 'pt-BR' : _lang === 'es' ? 'es-ES' : 'en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  }


  // ─── Logo Smart Routing ─────────────────────────────────────────
  function initLogoRouting() {
    var logos = document.querySelectorAll('.nav-logo');
    if (!logos.length) return;
    // Quick sync check from localStorage
    var user = null;
    try { user = JSON.parse(localStorage.getItem('forgeiq_user')); } catch(e){}
    var dest = (user && user.id) ? '/dashboard.html' : '/index.html';
    logos.forEach(function(logo) { logo.setAttribute('href', dest); });
    // Async Supabase correction
    if (window.forgeiqSupabase) {
      window.forgeiqSupabase.auth.getSession().then(function(r) {
        var finalDest = (r.data && r.data.session) ? '/dashboard.html' : '/index.html';
        logos.forEach(function(logo) { logo.setAttribute('href', finalDest); });
      });
    }
  }

  // ─── Init ──────────────────────────────────────────────────────
  async function init() {
    const savedLang = localStorage.getItem('forgeiq_lang') || 'en';
    await loadLanguage(savedLang);
    initNav();
    initLogoRouting();

    // Sync lang toggle buttons if present
    document.querySelectorAll('.lang-btn').forEach(b => {
      b.classList.toggle('active', b.textContent.trim() === savedLang.toUpperCase());
    });
  }


  // ─── Public API ────────────────────────────────────────────────
  return {
    init,
    loadLanguage,
    t,
    getCurrentLang,
    applyTranslations,
    getProfile,
    setProfile,
    clearProfile,
    getGreeting,
    askCoach,
    clearConversation,
    calculateStreak,
    getStreak,
    navigateBack,
    initNav,
    downloadPDF,
    toast,
    formatDate
  };

})();

// Backward compatibility alias
const AdaptFit = ForgeIQ;

// Auto-init on DOM ready
document.addEventListener('DOMContentLoaded', () => ForgeIQ.init());
