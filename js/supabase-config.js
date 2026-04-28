// The Doc Lovato Method — Supabase Configuration
// Note: Internal `FORGEIQ_CONFIG` namespace and `forgeiq_*` localStorage keys preserved (see FORGEIQ_SESSION_NOTES.md → BRAND HISTORY).
// ─────────────────────────────────────────────────────────────────
// IMPORTANT: Never hardcode real keys here.
// Set these in Netlify Environment Variables:
//   SUPABASE_URL       → your project URL (https://xxxx.supabase.co)
//   SUPABASE_ANON_KEY  → your project anon/public key
//
// These are injected into the window object via a Netlify edge
// function or set as meta tags. For local dev, replace the
// placeholder strings below temporarily — never commit real keys.
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

// ─── Supabase Auth Helpers ─────────────────────────────────────────
const SupabaseClient = {

  async signUp(email, password, metadata = {}) {
    const res = await fetch(`${FORGEIQ_CONFIG.supabaseUrl}/auth/v1/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': FORGEIQ_CONFIG.supabaseKey
      },
      body: JSON.stringify({
        email,
        password,
        data: metadata
      })
    });
    return res.json();
  },

  async signIn(email, password) {
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
    }
    return data;
  },

  async signOut() {
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
