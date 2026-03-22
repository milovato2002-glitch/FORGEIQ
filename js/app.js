// AdaptFit i18n Engine + Core Utilities
// Supports: English (en), Spanish (es), Brazilian Portuguese (pt)

const AdaptFit = (() => {

  // ─── Language Engine ───────────────────────────────────────────
  let _locale = {};
  let _lang = 'en';

  async function loadLanguage(lang) {
    try {
      const res = await fetch(`/locales/${lang}.json`);
      _locale = await res.json();
      _lang = lang;
      localStorage.setItem('adaptfit_lang', lang);
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
      if (translation) {
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
      if (translation) el.innerHTML = translation;
    });
  }

  function getCurrentLang() { return _lang; }

  // ─── User Profile & Session ────────────────────────────────────
  function getProfile() {
    try {
      return JSON.parse(localStorage.getItem('adaptfit_profile') || '{}');
    } catch { return {}; }
  }

  function setProfile(profileData) {
    const existing = getProfile();
    const updated = { ...existing, ...profileData };
    localStorage.setItem('adaptfit_profile', JSON.stringify(updated));
    return updated;
  }

  function clearProfile() {
    localStorage.removeItem('adaptfit_profile');
    localStorage.removeItem('adaptfit_lang');
    localStorage.removeItem('adaptfit_session');
  }

  // ─── Supabase Auth Helpers ─────────────────────────────────────
  // NOTE: Replace SUPABASE_URL and SUPABASE_ANON_KEY via environment
  // These are injected at build time — never hardcode real keys here
  const SUPABASE_URL = window.SUPABASE_URL || '';
  const SUPABASE_KEY = window.SUPABASE_ANON_KEY || '';

  async function supabaseFetch(endpoint, method = 'GET', body = null, token = null) {
    const headers = {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${token || SUPABASE_KEY}`
    };
    const options = { method, headers };
    if (body) options.body = JSON.stringify(body);
    const res = await fetch(`${SUPABASE_URL}${endpoint}`, options);
    return res.json();
  }

  // ─── AI Coach ─────────────────────────────────────────────────
  let _conversationHistory = [];

  async function askCoach(userMessage) {
    const profile = getProfile();
    const lang = getCurrentLang();

    _conversationHistory.push({
      role: 'user',
      content: userMessage
    });

    try {
      const res = await fetch('/.netlify/functions/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: _conversationHistory,
          userProfile: profile,
          language: lang
        })
      });

      const data = await res.json();

      if (data.reply) {
        _conversationHistory.push({
          role: 'assistant',
          content: data.reply
        });
        return { success: true, reply: data.reply };
      } else {
        throw new Error(data.error || 'No reply received');
      }
    } catch (err) {
      console.error('Coach error:', err);
      return { success: false, error: err.message };
    }
  }

  function clearConversation() {
    _conversationHistory = [];
  }

  // ─── Readiness Check ──────────────────────────────────────────
  function logReadiness(level) {
    const profile = getProfile();
    const today = new Date().toISOString().split('T')[0];
    const readiness = profile.readiness_log || {};
    readiness[today] = level;
    setProfile({ readiness_log: readiness, last_readiness: level });
    return level;
  }

  function getTodayReadiness() {
    const profile = getProfile();
    const today = new Date().toISOString().split('T')[0];
    return profile.readiness_log?.[today] || null;
  }

  // ─── Streak Tracking ──────────────────────────────────────────
  function logActivity() {
    const profile = getProfile();
    const today = new Date().toISOString().split('T')[0];
    const log = profile.activity_log || {};
    log[today] = true;
    setProfile({ activity_log: log });
    return calculateStreak(log);
  }

  function calculateStreak(log) {
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

  // ─── Greeting ─────────────────────────────────────────────────
  function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return t('dashboard.greeting_morning');
    if (hour < 17) return t('dashboard.greeting_afternoon');
    return t('dashboard.greeting_evening');
  }

  // ─── Init ─────────────────────────────────────────────────────
  async function init() {
    const savedLang = localStorage.getItem('adaptfit_lang') || 'en';
    await loadLanguage(savedLang);
  }

  // Public API
  return {
    init,
    loadLanguage,
    t,
    getCurrentLang,
    getProfile,
    setProfile,
    clearProfile,
    askCoach,
    clearConversation,
    logReadiness,
    getTodayReadiness,
    logActivity,
    getStreak,
    getGreeting,
    supabaseFetch
  };

})();

// Auto-init on DOM ready
document.addEventListener('DOMContentLoaded', () => AdaptFit.init());
