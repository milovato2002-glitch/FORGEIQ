// The Doc Lovato Method — Supabase Configuration
// Note: Internal `FORGEIQ_CONFIG` namespace and `forgeiq_*` localStorage keys preserved (see FORGEIQ_SESSION_NOTES.md → BRAND HISTORY).
// ─────────────────────────────────────────────────────────────────
// The anon/public key below is safe to ship to the browser by design — it is
// the publishable key and is protected by Row Level Security. It is NOT the
// service_role key, which must never appear in client code.
// ─────────────────────────────────────────────────────────────────

const FORGEIQ_CONFIG = {

  supabaseUrl:  'https://fxbzjuefctqsoypwhlha.supabase.co',
  supabaseKey:  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4YnpqdWVmY3Rxc295cHdobGhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyMTUwMzcsImV4cCI6MjA4OTc5MTAzN30.QfKJ41fhuwd8-3e354jMlgUkh_Z7uDDWxl6xgTyF6Oc',

  appName:      'The Doc Lovato Method',
  appVersion:   '1.0.0',
  supportEmail: 'support@forgeiq.app',
  founders: {
    primary: {
      name:        'Dr. Michael Lovato, EdD',
      title:       'Co-Founder & Head Strength Coach',
      credentials: 'EdD · Army Combat Engineer · NASM CNC/CES/PES · 30+ AI Certifications',
      tagline:     'From 290 lbs and battling addiction to DEKA FIT competitor — I built the coach I needed.'
    },
    partner: {
      name:        '[PARTNER NAME]',
      title:       'Co-Founder & Nutrition + Wellness Director',
      credentials: 'Nutrition · Wellness · Licensed Esthetician',
      tagline:     'Whole-body wellness — inside and out.'
    }
  }
};

// ─── Supabase client bootstrap ─────────────────────────────────────
// 2026-08-17 FIX: `window.forgeiqSupabase` was read by auth-guard.js and app.js but
// NEVER assigned anywhere in the codebase, and the Supabase SDK was never loaded.
// That caused every protected page to fail its auth check and bounce to /login.html.
// The SDK UMD bundle is now loaded in <head> immediately before this file, exposing
// the `supabase` global; we create the real client from it here.
(function initSupabaseClient(){
  try {
    var sdk = window.supabase;
    if (sdk && typeof sdk.createClient === 'function') {
      window.forgeiqSupabase = sdk.createClient(
        FORGEIQ_CONFIG.supabaseUrl,
        FORGEIQ_CONFIG.supabaseKey,
        {
          auth: {
            persistSession:     true,   // survive page navigation (this app is multi-page)
            autoRefreshToken:   true,   // fixes "Session expiry / no refresh token handling" in AUTH_STATUS.md
            detectSessionInUrl: true,   // required for the Google OAuth redirect callback
            storageKey:         'forgeiq_sb_auth'
          }
        }
      );
      console.log('[supabase-config] client ready');

      // Keep the legacy forgeiq_* keys in sync so every existing page keeps working.
      window.forgeiqSupabase.auth.onAuthStateChange(function(event, session){
        if (session && session.access_token) {
          localStorage.setItem('forgeiq_token', session.access_token);
          localStorage.setItem('forgeiq_user', JSON.stringify(session.user));
        } else if (event === 'SIGNED_OUT') {
          localStorage.removeItem('forgeiq_token');
          localStorage.removeItem('forgeiq_user');
          localStorage.removeItem('forgeiq_profile');
        }
      });
    } else {
      console.warn('[supabase-config] Supabase SDK not found — falling back to REST helpers. Check the CDN <script> tag in <head>.');
    }
  } catch (e) {
    console.error('[supabase-config] client init failed:', e);
  }
})();

// ─── Supabase Auth Helpers ─────────────────────────────────────────
const SupabaseClient = {

  async signUp(email, password, metadata = {}) {
    if (window.forgeiqSupabase) {
      const { data, error } = await window.forgeiqSupabase.auth.signUp({
        email, password, options: { data: metadata }
      });
      if (error) return { error_description: error.message, msg: error.message };
      if (data && data.session) {
        localStorage.setItem('forgeiq_token', data.session.access_token);
        localStorage.setItem('forgeiq_user', JSON.stringify(data.user));
        localStorage.setItem('forgeiq_auth_method', 'password');
        return { access_token: data.session.access_token, user: data.user };
      }
      // Email-confirmation flow: user created, no session yet.
      return { user: data ? data.user : null, confirmation_required: true };
    }
    const res = await fetch(`${FORGEIQ_CONFIG.supabaseUrl}/auth/v1/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': FORGEIQ_CONFIG.supabaseKey
      },
      body: JSON.stringify({ email, password, data: metadata })
    });
    return res.json();
  },

  async signIn(email, password) {
    if (window.forgeiqSupabase) {
      const { data, error } = await window.forgeiqSupabase.auth.signInWithPassword({ email, password });
      if (error) return { error_description: error.message, msg: error.message };
      if (data && data.session) {
        localStorage.setItem('forgeiq_token', data.session.access_token);
        localStorage.setItem('forgeiq_user', JSON.stringify(data.user));
        localStorage.setItem('forgeiq_auth_method', 'password');
        return { access_token: data.session.access_token, user: data.user };
      }
      return { error_description: 'Login failed. Check your email and password.' };
    }
    const res = await fetch(`${FORGEIQ_CONFIG.supabaseUrl}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': FORGEIQ_CONFIG.supabaseKey
      },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (data.access_token) {
      localStorage.setItem('forgeiq_token', data.access_token);
      localStorage.setItem('forgeiq_user', JSON.stringify(data.user));
      localStorage.setItem('forgeiq_auth_method', 'password');
    }
    return data;
  },

  // Google OAuth — requires the Google provider to be enabled in the Supabase dashboard
  // and this site's URL added to the allowed redirect list.
  async signInWithGoogle(nextPath) {
    if (!window.forgeiqSupabase) {
      return { error_description: 'Sign-in service is still loading. Please try again in a moment.' };
    }
    localStorage.setItem('forgeiq_auth_method', 'google');
    const redirectTo = window.location.origin + (nextPath || '/dashboard.html');
    const { error } = await window.forgeiqSupabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo }
    });
    if (error) return { error_description: error.message };
    return { redirecting: true };
  },

  async signOut() {
    if (window.forgeiqSupabase) {
      try { await window.forgeiqSupabase.auth.signOut(); } catch (e) { console.error('[auth] signOut:', e); }
    } else {
      const token = localStorage.getItem('forgeiq_token');
      if (token) {
        await fetch(`${FORGEIQ_CONFIG.supabaseUrl}/auth/v1/logout`, {
          method: 'POST',
          headers: {
            'apikey': FORGEIQ_CONFIG.supabaseKey,
            'Authorization': `Bearer ${token}`
          }
        });
      }
    }
    localStorage.removeItem('forgeiq_token');
    localStorage.removeItem('forgeiq_user');
    localStorage.removeItem('forgeiq_profile');
    window.location.href = '/index.html';
  },

  getUser() {
    try {
      return JSON.parse(localStorage.getItem('forgeiq_user') || 'null');
    } catch { return null; }
  },

  getToken() {
    return localStorage.getItem('forgeiq_token') || null;
  },

  isLoggedIn() {
    return !!this.getToken();
  },

  requireAuth() {
    if (!this.isLoggedIn()) {
      window.location.href = '/login.html';
    }
  },

  async saveProfile(profileData) {
    const token = this.getToken();
    const user  = this.getUser();
    if (!token || !user) return null;

    const res = await fetch(
      `${FORGEIQ_CONFIG.supabaseUrl}/rest/v1/profiles?id=eq.${user.id}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': FORGEIQ_CONFIG.supabaseKey,
          'Authorization': `Bearer ${token}`,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({ ...profileData, updated_at: new Date().toISOString() })
      }
    );
    const data = await res.json();
    if (data[0]) localStorage.setItem('forgeiq_profile', JSON.stringify(data[0]));
    return data[0];
  },

  async getProfile() {
    const token = this.getToken();
    const user  = this.getUser();
    if (!token || !user) return null;

    // Try cache first
    const cached = localStorage.getItem('forgeiq_profile');
    if (cached) return JSON.parse(cached);

    const res = await fetch(
      `${FORGEIQ_CONFIG.supabaseUrl}/rest/v1/profiles?id=eq.${user.id}&select=*`,
      {
        headers: {
          'apikey': FORGEIQ_CONFIG.supabaseKey,
          'Authorization': `Bearer ${token}`
        }
      }
    );
    const data = await res.json();
    if (data[0]) localStorage.setItem('forgeiq_profile', JSON.stringify(data[0]));
    return data[0] || null;
  }
};
