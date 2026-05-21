# FORGEIQ Pre-Launch Security & Quality Audit

> **⚠️ STALE — kept for historical reference.**
> This audit was performed on 2026-05-20 against local commit `55dbdb6`, which was
> behind the actual production branch by 4 commits. The production branch (origin/master)
> had already shipped a "Launch-readiness sprint" on 2026-05-04 that addressed most of
> the CRITICAL and HIGH findings below — see [FORGEIQ_SESSION_NOTES.md](FORGEIQ_SESSION_NOTES.md)
> for the canonical list of what was fixed and the intentional design decisions (guest mode,
> model-required-from-caller in chat.js, CSP Report-Only, action-level macro-plan gating,
> etc.). Read the session notes BEFORE acting on any finding here. Several findings below
> conflict with documented design intent and should NOT be re-applied.
>
> Surviving net-new items that may still be worth a Sprint B pickup:
> - body-size limit on chat.js (audit 4.1 step 6)
> - filename sanitization on generate-docx.js Content-Disposition (audit 4.6)
> - localStorage health-PII migration to Supabase (audit 3.1) — only partially addressed
> - rate limiting on Netlify Functions (audit 2.7, 4.5)
> - Privacy / Terms / Medical Disclaimer pages (audit 6.1)
> - robots.txt + sitemap.xml (audit 6.2)
> - Stripe webhook idempotency + subscription.updated handler (audit A.2, 4.9)
> - email-confirmation enforcement on signup (audit 2.10)

**Date:** 2026-05-20
**Branch:** master @ 55dbdb6 (stale)
**Scope:** Full repository, 7 audit passes
**Reviewer:** Claude Code (Opus 4.7)

> **Note on session notes:** `FORGEIQ_SESSION_NOTES.md` was not present in the local working tree at audit time. It DID exist on `origin/master` but the local branch hadn't fetched. Many of the findings below would have been answered (or contradicted) by the notes.

---

## Executive summary

**Launch verdict: DO NOT LAUNCH AS-IS.** There are launch-blocking defects that combine to mean the product currently has, in practice, no authentication enforcement, no HTTP security hardening, and no privacy/terms surface for App Store / Play Store / Stripe acceptance.

| Severity | Count |
|---|---|
| CRITICAL | 7 |
| HIGH | 13 |
| MEDIUM | 11 |
| LOW | 7 |

**Top blockers (must fix before any paying user touches the product):**

1. **`auth-guard.js` never runs its check** — it polls for `window.forgeiqSupabase`, which is never assigned anywhere in the codebase. Every "gated" page is effectively public. (CRITICAL — Pass 2)
2. **Pages explicitly listed as gated have no guard at all** — `onboarding.html` and `workout-logger.html` never load `auth-guard.js`. (CRITICAL — Pass 2)
3. **`/.netlify/functions/chat` has CORS `*`, no auth, no rate limit, and accepts a caller-controlled `model`** — anyone on the open internet can drain your Anthropic billing. (CRITICAL — Pass 4)
4. **`/.netlify/functions/create-checkout-session` accepts a caller-controlled `priceId`** with no server-side allowlist — attacker can swap to a $0 or wrong-product price. (CRITICAL — Pass 4)
5. **`/.netlify/functions/generate-docx` is ungated** — no auth, no email capture, no rate limit. Contradicts what the prompt said session notes claimed. (HIGH — Pass 4)
6. **`netlify.toml` ships zero security headers** — no CSP (not even Report-Only), no HSTS, no X-Frame-Options, no Referrer-Policy, no Permissions-Policy, no X-Content-Type-Options. (CRITICAL — Pass 5)
7. **Medical/health PII (weight, body fat, conditions, medications, GLP-1 status) is written to localStorage** with no encryption and accessible to every third-party script on the page (Crisp chat is one). Combined with absent CSP, an XSS = full health record exfiltration. (HIGH — Pass 3)
8. **Stripe accepts payment but the app has no Privacy Policy, no Terms of Service, no Medical Disclaimer link anywhere in the codebase.** App Store, Play Store, and Stripe TOS all require these. (HIGH — Pass 6)

The audit prompt's claim that session notes had flagged `forgeiq_profile` vs `forgeiq_profile_v1` "dual schema in use" is **still unresolved** — both keys are written and read across at least 9 files with no migration logic.

---

## Pass 1 — Secrets and exposed credentials

### CRITICAL — none.

### HIGH

**1.1 [HIGH] `.gitignore` does not cover `.env` files.**
[.gitignore](.gitignore)
```
node_modules/
.netlify/
netlify/functions/.netlify/
package-lock.json
```
**Impact:** A developer running `cp .env.example .env` (or any env tooling) will silently stage real secrets — `ANTHROPIC_API_KEY`, `STRIPE_SECRET_KEY`, `SUPABASE_SERVICE_ROLE_KEY` — into git. No safety net.
**Fix:** Add `.env`, `.env.*`, `!.env.example`, `.DS_Store`, `*.log`, `dist/`, `build/`.

**1.2 [HIGH] `package-lock.json` is gitignored.**
[.gitignore:4](.gitignore#L4) ignores `package-lock.json`. This was likely added to silence a CI warning but it disables reproducible builds and disables `npm audit` (confirmed — `npm audit` failed at repo root with `ENOLOCK`). It also expands supply-chain risk because every install resolves fresh from the registry.
**Fix:** Remove that line, run `npm install` to generate a lockfile, commit it.

### MEDIUM

**1.3 [MEDIUM] Supabase anon key is hardcoded in client JS.**
[js/supabase-config.js:16](js/supabase-config.js#L16). I decoded the JWT — `role: "anon"`, so this is the public anon key and is intended to be exposed (Supabase RLS is what protects data). **No action needed on the key itself**, but the inline hardcode (vs. injecting via Netlify env var) means you can't rotate it without a code deploy. Comment at lines 1–11 says "Never hardcode real keys here. Set these in Netlify Environment Variables" — the file then hardcodes the key. Misleading documentation.
**Fix:** Either delete the misleading comment, or move the value to a runtime-injected meta tag / Netlify build env injection.

**1.4 [MEDIUM] Anon-key expiry is 2036.**
The hardcoded anon JWT has `exp: 2089791037` (Mar 2036). That's fine for now, but flag it for rotation planning.

### LOW

**1.5 [LOW] All function secrets correctly read from `process.env`.** Verified `ANTHROPIC_API_KEY` ([netlify/functions/chat.js:10](netlify/functions/chat.js#L10)), `STRIPE_SECRET_KEY` ([netlify/functions/create-checkout-session.js:1](netlify/functions/create-checkout-session.js#L1), [netlify/functions/stripe-webhook.js:1](netlify/functions/stripe-webhook.js#L1)), `STRIPE_WEBHOOK_SECRET` ([netlify/functions/stripe-webhook.js:14](netlify/functions/stripe-webhook.js#L14)), `SUPABASE_SERVICE_ROLE_KEY` ([netlify/functions/stripe-webhook.js:49](netlify/functions/stripe-webhook.js#L49)). **Good.**

**1.6 [LOW] No `.env` file ever committed to git.** `git log --all --full-history` on env patterns returned nothing. **Good.**

**1.7 [LOW] No live or test Stripe keys committed.** `(sk_live|sk_test|pk_live|pk_test)_[a-zA-Z0-9]{20,}` regex returned no matches. **Good.**

---

## Pass 2 — Authentication and authorization

### CRITICAL

**2.1 [CRITICAL] `auth-guard.js` never redirects unauthenticated users.**
[js/auth-guard.js:3-9](js/auth-guard.js#L3-L9)
```js
function check(){
  if(window.forgeiqSupabase){
    window.forgeiqSupabase.auth.getSession().then(function(r){
      if(!r.data || !r.data.session){
        window.location.replace('/login.html?next='+...);
      }
    });
  } else { setTimeout(check, 100); }
}
```
The guard polls for `window.forgeiqSupabase`. **`window.forgeiqSupabase` is never assigned anywhere in the repo.** Verified with `grep -rn "forgeiqSupabase"` — only the two reads in `auth-guard.js` itself. The Supabase JS SDK is not loaded anywhere (no `<script src="...supabase-js...">`). The polling loop runs forever; the redirect never fires.

**Impact:** Every page that "loads auth-guard" — `dashboard.html`, `plan-builder.html`, `progress.html`, `train.html`, `nutrition.html`, `resources.html`, `peptide-library.html`, `glp-hub.html` — is fully accessible without any session. A logged-out visitor can navigate directly to `/dashboard` and read any localStorage cached profile the previous user left behind.

**Fix:** Replace with a working guard using the `SupabaseClient.isLoggedIn()` helper that already exists in [js/supabase-config.js:100-102](js/supabase-config.js#L100-L102), or load `@supabase/supabase-js` and actually assign `window.forgeiqSupabase = supabase.createClient(...)`. Move the guard `<script>` to the `<head>` and make it synchronous so it runs before any page content paints (currently it sits at the bottom of every page, after content is already on screen).

**2.2 [CRITICAL] `onboarding.html` has no auth guard.**
Confirmed: `grep -n "auth-guard\|requireAuth\|isLoggedIn\|getToken" onboarding.html` returns nothing. The audit prompt lists onboarding as a login-gated page. Anyone can post the entire onboarding flow without ever having signed up. Combined with localStorage-only persistence, this also pollutes the next real user's session if they share a device.

**2.3 [CRITICAL] `workout-logger.html` has no auth guard.**
Same — no `auth-guard.js`, no `requireAuth()`, no token check. Listed as gated in your prompt.

**2.4 [CRITICAL] Guest-mode signup grants full app access with no account.**
[signup.html:584-593](signup.html#L584-L593), [login.html:599-611](login.html#L599-L611). Both pages have an "always works" guest fallback that fabricates a token (`'guest_' + Date.now() + ...`) and writes it to `forgeiq_token`. The signup flow falls through to guest mode on any Supabase error or 6-second timeout ([signup.html:646-649, 663-670](signup.html#L646-L670)). Even if the auth guard worked, it would happily accept this self-issued guest token because the existing `isLoggedIn()` helper at [js/supabase-config.js:100-102](js/supabase-config.js#L100-L102) only checks `!!getToken()` — no server validation.

**Impact:** "Paid user" gating is fictitious. Anyone can become a "logged in" user in one click, complete onboarding, and use the full app. Stripe is the only real gate, and that gate is bypassable because there's no server-side enforcement of payment before access to gated pages.

### HIGH

**2.5 [HIGH] Marketing pages have the (broken) auth-guard attached.**
[glp-hub.html:1549](glp-hub.html#L1549), [peptide-library.html:779](peptide-library.html#L779), [resources.html:1567](resources.html#L1567). Your prompt lists these as **public** SEO-indexable marketing pages. Today they import `auth-guard.js`. The guard happens to be broken (see 2.1), so they're accidentally accessible — but the moment you fix 2.1, these pages get gated and de-indexed.
**Fix:** Remove the `<script src="/js/auth-guard.js"></script>` line from these three pages before fixing 2.1.

**2.6 [HIGH] Password rules disagree between signup and login.**
[signup.html:626](signup.html#L626): `password.length < 6` rejects. Login [login.html:547](login.html#L547): `pass.length < 8` rejects. Result: a user can register with a 6- or 7-character password and then be permanently locked out of their own account because the login form refuses to submit. Real users will hit this and rage-quit.
**Fix:** Pick one (8 minimum is the NIST recommendation) and apply in both places.

**2.7 [HIGH] No rate limiting on signup, login, or any Netlify Function.**
Supabase's `/auth/v1/signup` and `/auth/v1/token` endpoints have built-in rate limiting at the Supabase project level (default 30/hr per IP, configurable), but **`chat`, `generate-docx`, and `create-checkout-session`** have no throttle. Anthropic bill exposure is unbounded (see 4.1).

**2.8 [HIGH] No documented Supabase RLS posture.**
There is no SQL migration file, no schema dump, no RLS policy doc in the repo. The Stripe webhook talks to a `profiles` table ([netlify/functions/stripe-webhook.js:53-71](netlify/functions/stripe-webhook.js#L53-L71)) using `SUPABASE_SERVICE_ROLE_KEY` (which bypasses RLS), and the client talks to `profiles` using the user JWT ([js/supabase-config.js:115-126](js/supabase-config.js#L115-L126)). If RLS is not enabled on `profiles`, **any logged-in user can PATCH any other user's row** (e.g. set their own `tier` to `forgeplus`).
**Fix:** Verify in the Supabase dashboard that `profiles` (and any other user-data table) has RLS enabled with policies like `id = auth.uid()`. Add a `supabase/` directory in the repo with migration SQL so this is reviewable.

### MEDIUM

**2.9 [MEDIUM] Login error messages reveal whether an account exists.**
[login.html:576](login.html#L576). Reasonable for UX, but acceptable risk for a small product. Document the trade-off.

**2.10 [MEDIUM] No email-confirmation enforcement.**
Signup at [signup.html:709-716](signup.html#L709-L716) accepts the "no token, email confirmation required" path by sending the user to onboarding anyway — so unverified emails get to use the app immediately.

### LOW

**2.11 [LOW] Signup form sanity checks are minimal.** Only `email.indexOf('@') === -1` ([signup.html:620](signup.html#L620)). Will accept `a@b` as valid. Supabase server-side validates more strictly, so this is cosmetic.

---

## Pass 3 — Data integrity and localStorage

### CRITICAL

**3.1 [CRITICAL] Health/medical PII is written to localStorage in plaintext.**
[onboarding.html:1258-1342](onboarding.html#L1258-L1342) writes to `forgeiq_profile` and `forgeiq_profile_v1`: `currentWeight`, `goalWeight`, `bodyFat`, `goalBodyFat`, `conditions` (includes `glp1` flag — explicitly medical), `injuries`, `medications`, `bmr`, `tdee`, `calorieTarget`. Also `forgeiq_weight_log` and `forgeiq_bodyfat_log` time-series.

localStorage is unencrypted, persists indefinitely, and is readable by every script on the same origin including the Crisp third-party chat widget loaded on 7+ pages ([coaching.html:241](coaching.html#L241), [debora.html:266](debora.html#L266), [login.html:621](login.html#L621), [signup.html:774](signup.html#L774), [onboarding.html:1352](onboarding.html#L1352), [nutrition.html:1410](nutrition.html#L1410), [plan-builder.html:970](plan-builder.html#L970)).

**Impact:** Any XSS — or a future Crisp compromise — exfiltrates a full health record (weight, body fat, GLP-1 use, injuries, medications). For a product launching to App Store this is also a privacy-policy / HIPAA-adjacent disclosure problem, even if not a strict HIPAA covered entity.
**Fix (short term):** Move sensitive fields to Supabase via authenticated reads; cache only non-sensitive UI state in localStorage. Add CSP to lock down `connect-src` and `script-src` (see Pass 5). Document data handling in a privacy policy (see Pass 6).

### HIGH

**3.2 [HIGH] `forgeiq_profile` vs `forgeiq_profile_v1` dual schema is unresolved.**
Both keys are still in active use across 9 files. Read pattern is inconsistent:
- [nutrition.html:493](nutrition.html#L493): `profile` first, fall back to `v1`
- [train.html:2689](train.html#L2689): `v1` first, fall back to `profile`
- [login.html:563-565](login.html#L563-L565): reads BOTH and treats either `onboardingComplete: true` as completion
- [onboarding.html:1314-1316](onboarding.html#L1314-L1316): writes both with the same data
- [pricing.html, dashboard.html, plan-builder.html, progress.html, etc.]: each picks one

If anything ever writes to only one of the two keys (or writes them out of order), the two schemas diverge and behavior depends on which page the user lands on. The audit prompt said session notes flagged this — **status: still present**.
**Fix:** Pick `forgeiq_profile_v1` as canonical. Add a one-time migration at app startup that merges `forgeiq_profile` → `_v1`, deletes `forgeiq_profile`. Update all read sites to use `_v1` only.

**3.3 [HIGH] `forgeiq_max_lifts` (workout-logger) and `forgeiq_lift_maxes` (train) are different keys for what looks like the same data.**
- [workout-logger.html:887](workout-logger.html#L887) writes `forgeiq_max_lifts`
- [dashboard.html:1159](dashboard.html#L1159) reads `forgeiq_max_lifts`
- [train.html:3852](train.html#L3852) writes `forgeiq_lift_maxes` and [train.html:3848](train.html#L3848) reads `forgeiq_lift_maxes`

Result: max-lift PRs logged in `workout-logger.html` appear on the dashboard but **don't** show up in `train.html`'s max-lift display, and vice versa. A user who logs sets in workout-logger then opens train sees zero PRs. For a paid product where PR tracking is a headline feature, this is broken on first use.
**Fix:** Pick one key (suggest `forgeiq_max_lifts`), update train.html to use it.

**3.4 [HIGH] Dashboard reads three keys that nothing ever writes.**
- [dashboard.html:896](dashboard.html#L896): reads `forgeiq_goals` — no writer anywhere
- [dashboard.html:1081](dashboard.html#L1081): reads `forgeiq_meals` — no writer
- [dashboard.html:1093](dashboard.html#L1093): reads `forgeiq_nutrition_log` — no writer

Dashboard will always render the empty-state fallback for these. Either remove the dead reads or wire the writers.

**3.5 [HIGH] `workout-logger.html` reads `forgeiq_body_weight_kg` with default 75kg.**
[workout-logger.html:522](workout-logger.html#L522): `parseFloat(localStorage.getItem('forgeiq_body_weight_kg')) || 75`. This key is **never written anywhere in the codebase**. Every calorie calculation in the workout logger uses 75 kg (165 lb) regardless of the user's actual body weight, which is stored separately as `currentWeight` in `forgeiq_profile`. For a 100 kg user, calorie estimates are understated by ~33%. For a paid coaching product this is a credibility breaker.
**Fix:** Read `currentWeight` (or `bodyweight`) from `forgeiq_profile_v1`, convert lb→kg if needed.

### MEDIUM

**3.6 [MEDIUM] `forgeiq_lang` vs `forgeiq_language` — two language keys, mostly redundant.**
- [js/i18n.js:508-509](js/i18n.js#L508-L509) writes both (with a "backward compat" comment)
- [js/app.js:15](js/app.js#L15) writes only `forgeiq_lang`
- [train.html:2912, 4810](train.html#L2912): reads only `forgeiq_language`

If `app.js` changes the language and i18n.js doesn't re-sync, train.html falls back to English. Pick one key; delete the other.

**3.7 [MEDIUM] `forgeiq_active_plan` is written by plan-builder, never read.**
[plan-builder.html:765](plan-builder.html#L765). Only `forgeiq_active_multiday_plan` is read elsewhere. Dead write — either rename consumers or remove the writer.

**3.8 [MEDIUM] `forgeiq_token` is a JWT in localStorage.**
[js/supabase-config.js:67](js/supabase-config.js#L67). Standard Supabase pattern, but worth documenting that any XSS in the app gives token theft + full account takeover. Mitigation depends on CSP (Pass 5).

### LOW

**3.9 [LOW] Guest user `id` is `'guest_' + Date.now() + Math.random()`.**
[signup.html:586](signup.html#L586). Not cryptographically random. Two guests on the same machine in the same millisecond collide. Probability negligible in practice; flag for completeness.

---

## Pass 4 — Netlify Functions and API security

### CRITICAL

**4.1 [CRITICAL] `chat.js` is wide open — no auth, no rate limit, caller-controlled model.**
[netlify/functions/chat.js:1-14](netlify/functions/chat.js#L1-L14)
```js
const headers = {
  'Access-Control-Allow-Origin': '*',
  ...
};
...
const payload = { model: body.model || 'claude-sonnet-4-5', max_tokens: body.max_tokens || 2000, messages: body.messages || [] };
if (body.system) payload.system = body.system;
```

Issues stacked in one function:
- `Access-Control-Allow-Origin: '*'` — any website can call this endpoint cross-origin.
- No `Authorization` header check, no Supabase JWT verification.
- `body.model` is forwarded straight to Anthropic — caller can request `claude-opus-4-7` or any other (more expensive) model.
- `body.max_tokens` is forwarded straight — caller can request 200,000-token completions.
- `body.system` is forwarded straight — caller can override your coaching prompt and turn it into a general-purpose chatbot using your bill.
- No request body size limit.

**Impact:** Someone running `for i in $(seq 1 100000); do curl -s https://forgeiq.app/.netlify/functions/chat ...` against the Opus model with 200k max_tokens will burn through any reasonable Anthropic budget in hours. Whether or not anyone does this on purpose, web crawlers and security scanners *will* find the endpoint and probe it.

**Fix:**
1. Tighten CORS to `https://forgeiq.app` (and the staging domain if any).
2. Require a Supabase JWT in `Authorization: Bearer`; verify it server-side against `${SUPABASE_URL}/auth/v1/user`.
3. Server-side allowlist for `model` (e.g. only `claude-sonnet-4-5`) and `max_tokens` (cap at 2000).
4. Rate-limit per user-id (a simple Supabase table + counter is fine for v1; later move to Upstash/Cloudflare).
5. Reject any `system` field, or constrain to a list of known coach personas.

**4.2 [CRITICAL] `create-checkout-session.js` accepts caller-controlled `priceId` with no allowlist.**
[netlify/functions/create-checkout-session.js:25-46](netlify/functions/create-checkout-session.js#L25-L46). The function takes `priceId` from the request body and passes it directly to `stripe.checkout.sessions.create`. Anyone can pass any Stripe Price ID — including a $0.50 test price, or a Price ID belonging to a different product the user knows about. The Stripe webhook ([netlify/functions/stripe-webhook.js:3-6](netlify/functions/stripe-webhook.js#L3-L6)) does have a `PRICE_TO_TIER` allowlist for `'price_1TLJUbGdEZ2HZMx4LlHGNvJy' → 'forge'` and `'price_1TLJnuGdEZ2HZMx4YGEAPMB2' → 'forgeplus'`, but the checkout side does not.
**Impact:** Attacker sends `{priceId: "price_some_cheap_thing"}`, completes checkout for cents, webhook either grants `forge` tier (the default at [stripe-webhook.js:36](netlify/functions/stripe-webhook.js#L36) when priceId isn't in the map) or silently fails. Either way you've sold a real-money tier for the wrong amount.
**Fix:** On the server side accept `plan: 'forge' | 'forgeplus'` and look up the priceId from a server-only map. Reject everything else with 400.

### HIGH

**4.3 [HIGH] `generate-docx.js` is ungated.**
[netlify/functions/generate-docx.js:8-26](netlify/functions/generate-docx.js#L8-L26). CORS `*`, no auth, no email capture, no rate limit. Audit prompt said session notes claimed it was email-gated — **it is not**. The macro-plan UI ([macro-plan.html:856](macro-plan.html#L856)) calls it directly with no email field. Docx generation is compute-heavy; this is both a billing-amplification and a DoS vector.
**Fix:** Add either a Supabase JWT check (if it's a paid feature) or an email-capture-and-token-verify flow (if it's a lead magnet).

**4.4 [HIGH] CORS `*` on every function.**
[chat.js:3](netlify/functions/chat.js#L3), [generate-docx.js:9](netlify/functions/generate-docx.js#L9), [create-checkout-session.js:5](netlify/functions/create-checkout-session.js#L5). Per the audit prompt, session notes claimed CORS was tightened — **it is not tightened**. All three return `Access-Control-Allow-Origin: '*'`. Tighten to your production origin.

**4.5 [HIGH] No request size limit on any function.**
The Anthropic chat function will happily forward a 6 MB messages array to Anthropic and you'll pay for tokenization. The docx function will happily render a 50-meal plan if asked. Add an explicit `event.body.length > 100000` guard.

**4.6 [HIGH] `generate-docx.js` Content-Disposition uses caller-controlled filename.**
[netlify/functions/generate-docx.js:289](netlify/functions/generate-docx.js#L289): `(c.name || "Client").replace(/\s+/g, "_")`. Only whitespace is replaced. A `c.name` containing `\r\n` would inject a header. Quotes, semicolons, and non-ASCII go through unmodified. Header injection probably blocked by Netlify's layer, but worth fixing defensively: `c.name.replace(/[^A-Za-z0-9._-]/g, "_")`.

**4.7 [HIGH] Stripe webhook can update profile by email if `userId` is missing.**
[netlify/functions/stripe-webhook.js:74-97](netlify/functions/stripe-webhook.js#L74-L97). If the Stripe `customer_details.email` matches **any** row in `profiles`, that row gets `tier = 'forge'`. If a user changes their Supabase email later, an old `profiles` row with the previous email could get upgraded. If two users share an email (e.g. household), one purchase upgrades both. Acceptable risk if `email` is unique-constrained in the `profiles` table — verify and document.

### MEDIUM

**4.8 [MEDIUM] Error responses leak internal `err.message`.**
- [chat.js:33](netlify/functions/chat.js#L33): `body: JSON.stringify({ error: err.message })`
- [create-checkout-session.js:58](netlify/functions/create-checkout-session.js#L58): same
- [generate-docx.js:299](netlify/functions/generate-docx.js#L299): same

Stripe and Anthropic error messages can sometimes include internal identifiers, IP details, or request IDs that aren't useful to clients. Replace with generic messages and log the real error server-side via `console.error`.

**4.9 [MEDIUM] Webhook does not handle `customer.subscription.updated`.**
[stripe-webhook.js:103](netlify/functions/stripe-webhook.js#L103) only handles `checkout.session.completed` and `customer.subscription.deleted`. Mid-cycle upgrades, downgrades, plan changes, payment failures (`invoice.payment_failed`) are unhandled — a downgraded user keeps the old tier until they re-subscribe, and a failed payment doesn't pause access. Document this gap or implement.

**4.10 [MEDIUM] Webhook default tier is `'forge'`.**
[stripe-webhook.js:36, 41](netlify/functions/stripe-webhook.js#L36-L41). If the priceId lookup fails (new price, typo, etc.) the user is silently granted the cheaper tier. Better: log+alert and don't grant any tier until ops fixes the map.

**4.11 [MEDIUM] `chat.js` model defaults to bare alias `claude-sonnet-4-5`.**
[netlify/functions/chat.js:14](netlify/functions/chat.js#L14). Anthropic supports alias names like `claude-sonnet-4-5` that resolve to the latest snapshot, but pinning to a dated snapshot (e.g. `claude-sonnet-4-5-20250929`) is the published recommendation for production stability. As Anthropic adds new snapshots the alias's behavior can shift mid-deploy.
**Note:** I could not validate the audit prompt's note about `claude-sonnet-4-6-DATE` being the current upgrade format — verify on docs.claude.com before pinning.

### LOW

**4.12 [LOW] `create-checkout-session.js` doesn't validate `userEmail` is a real email shape.** Stripe will reject malformed values, but a 400 from your function is cheaper than a Stripe round-trip.

---

## Pass 5 — Content Security Policy and headers

### CRITICAL

**5.1 [CRITICAL] `netlify.toml` ships ZERO security headers.**
[netlify.toml](netlify.toml) has only `[build]` and `[[redirects]]` blocks. Confirmed `grep -E "Content-Security-Policy|X-Frame-Options|Strict-Transport|Referrer-Policy|Permissions-Policy|X-Content-Type"` returns no matches anywhere in the repo.

Missing:
- **`Content-Security-Policy`** — neither enforced nor Report-Only. (Audit prompt said session notes said Report-Only existed. It does not.)
- **`Strict-Transport-Security`** — Netlify enforces HTTPS via redirect but a missing HSTS header means a first-time visitor on a hostile network can be downgraded.
- **`X-Frame-Options` / `frame-ancestors`** — pages can be iframed by any origin. Phishing risk on login/signup/payment pages.
- **`X-Content-Type-Options: nosniff`** — exposes MIME-sniffing attacks.
- **`Referrer-Policy`** — full URLs (including session tokens in `?next=`) sent to third-party Crisp, fonts, etc.
- **`Permissions-Policy`** — pages can request camera/mic/geolocation with no permission gating.

**Fix:** Add a `[[headers]]` block to `netlify.toml`:
```toml
[[headers]]
  for = "/*"
  [headers.values]
    Strict-Transport-Security = "max-age=63072000; includeSubDomains; preload"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "camera=(), microphone=(), geolocation=()"
    Content-Security-Policy-Report-Only = "default-src 'self'; script-src 'self' 'unsafe-inline' https://client.crisp.chat https://*.stripe.com; connect-src 'self' https://*.supabase.co https://api.stripe.com https://*.crisp.chat wss://*.crisp.chat; img-src 'self' data: https:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self' https://checkout.stripe.com"
```
Start with `Content-Security-Policy-Report-Only` for 1–2 weeks, watch the violation reports, then promote to enforced `Content-Security-Policy` before launch.

### HIGH

**5.2 [HIGH] No `frame-ancestors 'none'` clickjacking protection.** Direct consequence of 5.1 — login.html, signup.html, payment redirect pages can be iframed and clickjacked.

### MEDIUM

**5.3 [MEDIUM] Crisp chat widget is loaded on 7 pages including auth pages.**
Crisp loads `https://client.crisp.chat/l.js` synchronously. Crisp's script has full access to the DOM and localStorage on every page it's embedded in — including `forgeiq_token`, `forgeiq_profile_v1` (medical data), and the entire signup/login form. Whether you trust Crisp's posture is a business decision; document it.

---

## Pass 6 — Pages, redirects, and SEO

### CRITICAL — none.

### HIGH

**6.1 [HIGH] No Privacy Policy, no Terms of Service, no Medical Disclaimer link.**
`grep -i "href=[\"'][^\"']*\(terms\|privacy\|legal\|tos\)"` returns **zero matches** across the entire repo. App Store, Play Store, and Stripe Connect all require linkable Privacy and Terms URLs. A health-data product additionally needs a Medical Disclaimer.
**Fix:** Add `/privacy`, `/terms`, `/medical-disclaimer` pages and link them in every page footer. Even placeholder shells before launch is better than 404s. The audit prompt explicitly noted "they will 404 currently but the link structure should be in place" — even the link structure is not in place.

**6.2 [HIGH] No `robots.txt` or `sitemap.xml`.**
Neither file exists. For a launch where you want public marketing pages (index, coaching, debora, glp-hub, peptide-library, resources, pricing, book, macro-plan) to rank, this is a hard miss.
**Fix:** Add `/robots.txt` with `Allow: /` and a `Sitemap:` line; generate a static `/sitemap.xml` listing the 9 public URLs with canonical paths.

**6.3 [HIGH] No `<meta name="robots" content="noindex,nofollow">` on gated pages.**
Confirmed: `grep -n "noindex"` returns no matches. `dashboard.html`, `onboarding.html`, `train.html`, `progress.html`, `nutrition.html`, `plan-builder.html`, `workout-logger.html`, `login.html`, `signup.html`, `success.html`, `cancel.html` should all carry a `noindex` meta. Without it, Google can index a user's `/dashboard` URL and expose the (currently un-gated) page in search results.

**6.4 [HIGH] No Open Graph or Twitter Card meta on any page.**
`grep "og:|twitter:"` returns zero matches. Every share of `forgeiq.app/coaching` or `/glp-hub` on Twitter/LinkedIn/Slack will render a bare URL with no preview, no image. This is a marketing miss on day one.

**6.5 [HIGH] No `<link rel="canonical">` on any page.**
Confirmed: zero matches. Combined with clean-URL redirects in `netlify.toml`, the same page is reachable at `/coaching` and `/coaching.html` — duplicate content from Google's perspective.

### MEDIUM

**6.6 [MEDIUM] 12 pages lack `<meta name="description">`.**
With description: pricing, resources, peptide-library, glp-hub, index, debora, coaching, book.
Without: onboarding, macro-plan, signup, cancel, success, train, workout-logger, progress, plan-builder, nutrition, login, dashboard.
Gated pages can stay without description (they should `noindex` anyway), but `macro-plan.html` is in your public-marketing list and lacks one.

**6.7 [MEDIUM] No redirects for `success.html`, `cancel.html`, `workout-logger.html`.**
[netlify.toml](netlify.toml) has redirects for 17 pages but not these three. They're only accessed via internal links (`window.location.href = "/success.html?..."` from the Stripe flow, `train.html` linking to `workout-logger.html`), so functionally OK. But for consistency with the rest of the clean-URL scheme, add them.

**6.8 [MEDIUM] No consistent footer across pages.**
Spot-checked footers vary widely — `book.html` has a disclaimer paragraph, `index.html` and `coaching.html` have feature-rich footers, `workout-logger.html` has none. No single page carries copyright, contact email, or legal links (because legal pages don't exist — see 6.1).

### LOW

**6.9 [LOW] `/doc` redirect aliases to `/coaching.html`.**
[netlify.toml:46-49](netlify.toml#L46-L49). Intentional? If yes, document. If a leftover, remove.

---

## Pass 7 — Code hygiene and dependencies

### HIGH

**7.1 [HIGH] `signup.html` logs the access token (partial) to console.**
[signup.html:687](signup.html#L687): `console.log('[SIGNUP] Step 6: Supabase result:', JSON.stringify(result).substring(0, 200));`. The first 200 chars of the result object include the start of the JWT (`{"access_token":"eyJhbGc..."` — the header and start of payload are within 200 chars). Even the partial JWT leak is bad practice and is auditable in any visitor's browser console.

It also logs emails ([signup.html:585, 609](signup.html#L585), and 19 other lines) and `password length` ([signup.html:609](signup.html#L609)). Password *length* alone is a side-channel.

**Fix:** Strip every `console.log` from `signup.html` (23 of them). Keep `console.error` only for genuinely unrecoverable cases.

**7.2 [HIGH] `@anthropic-ai/sdk` is 58 minor versions behind.**
`npm outdated` in `netlify/functions/`:
```
@anthropic-ai/sdk   0.39.0 → 0.97.1
stripe              14.25.0 → 22.1.1
```
The Anthropic SDK has shipped bug fixes and new model support since 0.39. The Stripe SDK is 8 major versions behind — Stripe's v22 includes API-version updates and webhook improvements. Pin and upgrade before launch.

**Note:** The repo doesn't actually *use* the Anthropic SDK on the server side (the chat function calls `fetch('https://api.anthropic.com/v1/messages')` directly — see [netlify/functions/chat.js:17](netlify/functions/chat.js#L17)). The SDK dependency is unused dead weight. Consider removing it entirely from `netlify/functions/package.json`.

### MEDIUM

**7.3 [MEDIUM] 47 `console.*` calls in production code across 10 files.**
Counts: signup.html (23), stripe-webhook.js (10), train.html (4), app.js (2), chat.js (2), login.html (2), create-checkout-session.js (1), nutrition.html (1), onboarding.html (1), plan-builder.html (1). Server-side `console.error` in functions is fine (Netlify captures logs). Client-side logs leak app structure to anyone with devtools open.

**7.4 [MEDIUM] Root `package.json` declares `@anthropic-ai/sdk` but root has no JS that imports it.**
[package.json:9-11](package.json#L9-L11). Only `netlify/functions/` uses it (and as noted in 7.2, even there it's unused). Remove from root.

**7.5 [MEDIUM] Root has no package-lock.json.** See 1.2. Prevents reproducible installs and `npm audit`.

### LOW

**7.6 [LOW] No TODO / FIXME / HACK / XXX comments.** Clean — confirmed by `grep -nE "(TODO|FIXME|HACK|XXX)"` returning no matches. Good signal.

**7.7 [LOW] `npm audit` in `netlify/functions/`: 0 vulnerabilities.** Good.

**7.8 [LOW] No orphan HTML files.** All pages are reachable via either nav links, internal `window.location.href` redirects (success.html, cancel.html), or sub-page navigation (workout-logger.html from train.html).

---

## Additional findings (not in original 7 passes)

### HIGH

**A.1 [HIGH] No `MEDIA RX-style disclaimer link from auth pages.**
For a paid health-data product talking about GLP-1 coaching, the **signup** and **onboarding** flows should display (and require acceptance of) a medical disclaimer + privacy policy before collecting medications/conditions data. Currently the onboarding flow collects medications and conditions at [onboarding.html:1283](onboarding.html#L1283) with no prior consent surface. This is both an App Store reviewer concern and a real-user-trust concern.

**A.2 [HIGH] Stripe webhook idempotency.**
[stripe-webhook.js](netlify/functions/stripe-webhook.js) does not record processed Stripe event IDs. Stripe may retry the same event (network blip, function cold-start timeout) and the webhook would re-apply the tier update. Usually harmless (it's an upsert) but for any future ledger or credit grant logic it'll cause double-grants. Track `event.id` in a Supabase table.

### MEDIUM

**A.3 [MEDIUM] `pricing.html` reads `forgeiq_token` and `forgeiq_user` but doesn't validate them.**
[pricing.html:876-888](pricing.html#L876-L888). Will accept a stale or guest token as "logged in" and skip the signup flow on click-to-buy, sending an unauthenticated/guest user straight to Stripe. Their checkout will succeed but their account won't be linkable in the webhook because `userId` is fake (`'guest_...'`) and won't match a real `profiles.id`.

**A.4 [MEDIUM] App-Store readiness items missing.**
Beyond what's already flagged: no Apple App Site Association file (`/.well-known/apple-app-site-association`), no Android asset links (`/.well-known/assetlinks.json`), no PWA manifest, no app icon set, no `theme-color` meta. If you're shipping native shells (App Store / Play Store) these stop being "nice to have" — they're required for universal-link routing and install acceptance.

**A.5 [MEDIUM] No error monitoring.**
No Sentry, no LogRocket, no Datadog RUM. Server-side `console.error` lands in Netlify Function logs but there's no aggregation or alerting. Day-one production traffic with no observability is a tough position to debug from.

### LOW

**A.6 [LOW] `nutrition.html:1395` writes `forgeiq_exercise_calories` from inside the nutrition page even though writes also happen in `train.html` and `workout-logger.html`** — three writers, no shared schema doc. Risk of one writer overwriting another's keys.

**A.7 [LOW] `index.js` declared as `main` in [package.json:5](package.json#L5) does not exist.** Cosmetic.

---

## Recommended launch-readiness gates

Before any paying user touches the product, fix the **7 CRITICALs** at minimum, then:

1. Verify Supabase RLS is on for every user-data table (2.8).
2. Add CSP-Report-Only and run for 1–2 weeks to debug violations, then promote to enforced.
3. Stand up minimum-viable Privacy / Terms / Medical-Disclaimer pages and link from every page footer + signup flow.
4. Add an error monitor (Sentry free tier).
5. Re-run this audit (or `/ultrareview`) on the cleanup branch before merging.

Estimated time to a launch-acceptable state from current commit: **2–3 focused days** assuming the auth-guard rebuild is the longest single task.
