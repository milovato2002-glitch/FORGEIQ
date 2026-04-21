# FORGEIQ Authentication Status

## Providers

| Provider | Status | Notes |
|----------|--------|-------|
| Email + Password | Configured | Supabase email/password auth. Guest fallback on failure. |
| Google OAuth | Configured | Button present in signup.html. Supabase Google provider enabled. |
| Apple Sign-In | Deferred | Removed from UI pending Apple Developer account setup. Re-enable in signup.html when ready. |
| Email Magic Link | Not configured | Supabase supports it but not currently wired in UI. |

## Known Failure Modes

- **Supabase unreachable**: Signup falls back to guest mode automatically. Login shows connection error.
- **Guest mode**: Users get a local-only experience. Data stored in localStorage only. No cloud sync.
- **Auth-guard bypass**: Guest users with `forgeiq_user` in localStorage are allowed through auth-guard.
- **Session expiry**: Supabase sessions expire. User must re-login. No refresh token handling in current implementation.

## Files

- `js/supabase-config.js` — Supabase client initialization
- `js/auth-guard.js` — Session gating for protected pages
- `login.html` — Login form (email/password + guest)
- `signup.html` — Signup form (email/password + Google + guest fallback)
