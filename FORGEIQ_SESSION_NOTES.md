# THE DOC LOVATO METHOD — SESSION NOTES
Last updated: 2026-05-04

## BRAND HISTORY
- Rebranded from FORGEIQ to The Doc Lovato Method on 2026-04-28.
- The localStorage keys remain `forgeiq_*` intentionally — renaming them would log out every existing user and orphan their workout/nutrition/PR data. Treat the prefix as a frozen internal namespace.
- The internal `__FORGEIQ_PUBLIC_PAGE__` flag and `forgeiq_*` JS variables were also left intact for the same reason.
- The `doclovatomethod.com` domain has not been purchased yet — site still lives at `forgeiq.netlify.app`. All footer URLs and Netlify config still point there.
- File `FORGEIQ_SESSION_NOTES.md` is intentionally NOT renamed (preserves git history continuity).

## TECH STACK
- Flat HTML + Netlify Functions (Node.js) + Supabase (auth/data) + Anthropic SDK
- All AI calls route through /.netlify/functions/chat
- Model string: claude-sonnet-4-5 (still pinned — see "MODEL NAME" note in 2026-05-04 sprint below)
- localStorage canonical keys (post-2026-05-04 migration, see CANONICAL KEYS section)
- Repo: github.com/milovato2002-glitch/FORGEIQ (private, master) — repo not renamed yet
- Deployed: forgeiq.netlify.app (domain change pending)

## BRAND
- Name: The Doc Lovato Method (full), DLM (tight nav), Doc Lovato Method (alt)
- Tagline: Doctor-led coaching. Real-world results.
- Colors: navy #0a1628, nav #0e1e36, card #142444, gold #f0a500 (UNCHANGED)
- Fonts: Bebas Neue (headings), Barlow Condensed, Barlow (UNCHANGED)

## KEY FILES
- index.html — public homepage
- login.html / signup.html — auth
- onboarding.html — profile builder (writes to Supabase + localStorage)
- dashboard.html — main logged-in landing
- plan-builder.html — generates workout plans via AI
- train.html — workout builder + START WORKOUT -> workout-logger.html
- workout-logger.html — sets/weights entry + PR tracking + calorie calc
- progress.html — tracking with charts
- nutrition.html — calorie/macro logging with visual budget graph, 4-option weekly reports
- macro-plan.html — macro calculator with educational calorie slider
- coaching.html / debora.html — coach bio pages (NOTE: gated by auth-guard as of 2026-05-04 — see 2026-05-04 sprint, may need to revert if SEO is a priority)
- resources.html / glp-hub.html / peptide-library.html — gated content
- book.html / pricing.html — public
- js/auth-guard.js — session gating, hides `<html>` until auth confirmed (loaded synchronously in `<head>` of every protected page)
- js/supabase-config.js — Supabase client init
- js/i18n.js — EN/ES/PT translations including auth page strings
- js/app.js — core utilities, logo routing, AI coach, profile management, **one-time localStorage migration**
- netlify/functions/chat.js — Anthropic API proxy (model now REQUIRED, no default; 25s AbortController; CORS pinned to ALLOWED_ORIGIN env var)
- netlify/functions/generate-docx.js — Word doc generator (uses docx npm pkg, installed via build command)

## CANONICAL localStorage KEYS (post-2026-05-04 migration)
The migration in app.js (`migrateLegacyKeys`, gated by `forgeiq_keys_migrated_v1`) consolidates drifted keys without losing data. Mapping:
- `forgeiq_profile_v1` → `forgeiq_profile` (canonical: full user profile object)
- `forgeiq_max_lifts` → `forgeiq_lift_maxes` (canonical: per-exercise top weight `{exercise: {weight, reps, date}}`)
- `forgeiq_nutrition` and `forgeiq_meals` → `forgeiq_nutrition_log` (canonical: per-day macro totals `{yyyy-mm-dd: {calories, protein, carbs, fat}}`)
- `forgeiq_workouts` → `forgeiq_workout_log` (canonical: per-day workout summary `{yyyy-mm-dd: {completed, name, volume, ...sets}}`)
- `forgeiq_workout_history_v1` → `forgeiq_workout_history` (canonical: array of completed workouts with full exercise data)
- `forgeiq_lift_maxes` (1RM calculator history in train.html) → renamed to `forgeiq_orm_history` to avoid shape collision with workout-logger's lift_maxes

Active canonical keys in use:
- forgeiq_user, forgeiq_token, forgeiq_auth_method
- forgeiq_profile
- forgeiq_active_plan, forgeiq_active_multiday_plan, forgeiq_active_program, forgeiq_saved_plans, forgeiq_weekly_plan, forgeiq_saved_workouts
- forgeiq_workout_log, forgeiq_workout_history, forgeiq_workout_to_start, forgeiq_workout_view, forgeiq_last_completed_workout
- forgeiq_lift_maxes (workout-logger top sets), forgeiq_orm_history (train.html 1RM history), forgeiq_prs
- forgeiq_exercise_calories, forgeiq_food_log, forgeiq_nutrition_log, forgeiq_day_<date>
- forgeiq_weight_log, forgeiq_bodyfat_log, forgeiq_goal_weight, forgeiq_progress_v2, forgeiq_goals
- forgeiq_lang, forgeiq_language, forgeiq_onboard_date, forgeiq_coach_notifications
- forgeiq_keys_migrated_v1 (migration sentinel)

## MODEL NAME STRINGS PASSED TO chat.js (audited 2026-05-04)
Every caller currently passes `claude-sonnet-4-5`:
- js/app.js (askCoach), js/forge-ai-button.js
- onboarding.html, plan-builder.html, nutrition.html (4 calls), train.html (8 calls)

The 2026-05-04 audit task asserted `claude-sonnet-4-5` is "NOT a valid Anthropic model identifier." This conflicts with both Anthropic's actual model registry (Sonnet 4.5 IS a valid id) and the longstanding session-notes pin. **Caller strings were NOT changed.** The chat.js fix still adds value: it removes the silent fallback so any future caller that forgets the `model` field will fail loud (HTTP 400, "model field is required") instead of getting a default that may diverge from intent.

## 2026-05-04 — LAUNCH-READINESS SPRINT
Audit-driven critical/high fixes. All 7 verified PASS unless noted.

1. **chat.js model required + abort + CORS** (PASS)
   - File: netlify/functions/chat.js
   - Model field now required (HTTP 400 with logged error if missing). 25s AbortController returns HTTP 504 on timeout.
   - CORS Access-Control-Allow-Origin pinned to `process.env.ALLOWED_ORIGIN` (defaults to `https://forgeiq.netlify.app`). Once doclovatomethod.com is connected, just update the env var on Netlify.

2. **Auth-guard moved to <head>, hides html until verified** (PASS — code-level; needs incognito browser verification post-deploy)
   - Files: dashboard.html, train.html, progress.html, nutrition.html, workout-logger.html, plan-builder.html, coaching.html, debora.html, onboarding.html, macro-plan.html
   - js/auth-guard.js now injects `html{visibility:hidden!important}` style on load, removes only after Supabase session confirms or guest user found. 4s hard-cap timeout fails closed (redirects). Blocks the flash-of-protected-content pattern.
   - **NOTE on coaching.html / debora.html**: per audit task they were listed as protected and now redirect unauthenticated visitors to /login. If these are meant to be public marketing pages for SEO, re-add `<script>window.__FORGEIQ_PUBLIC_PAGE__ = true;</script>` immediately before the auth-guard script tags.
   - **NOTE on onboarding.html**: still has `__FORGEIQ_PUBLIC_PAGE__` flag because new signups land there before profile completion.
   - **Genuine auth check**: auth-guard calls `forgeiqSupabase.auth.getSession()` (real Supabase auth), and ALSO allows users with a valid `forgeiq_user` localStorage object — this is the intentional guest-access pattern (signup.html / login.html "enter as guest"). Not a fake-auth bypass.

3. **localStorage migration to canonical keys** (PASS)
   - File: js/app.js — `migrateLegacyKeys()` IIFE runs once per browser, sentinel `forgeiq_keys_migrated_v1`.
   - Updated readers/writers in dashboard.html, workout-logger.html, train.html, nutrition.html, plan-builder.html, progress.html, onboarding.html, login.html, signup.html.
   - Side fix: removed duplicate `const maxLifts` redeclaration in workout-logger.html `saveWorkoutData()` (the second declaration would have thrown SyntaxError, blocking the entire save flow). Workout save will now actually persist.
   - Side fix: nutrition.html `logEntry()` now writes per-day macro totals to `forgeiq_nutrition_log` (previously wrote `true` flag, which was unreadable by the dashboard calorie ring).

4. **Security headers** (PASS — code-level; verify with securityheaders.com after deploy)
   - File: netlify.toml — added `[[headers]]` block for `/*` with HSTS preload, X-Frame-Options DENY, X-Content-Type-Options nosniff, Referrer-Policy strict-origin-when-cross-origin, Permissions-Policy, and a Content-Security-Policy-Report-Only baseline that whitelists current dependencies (Crisp, Quagga, Chart.js CDN, Google Fonts, Supabase, Anthropic API). Switch to enforcing CSP after launch.

5. **/workout-logger redirect** (PASS)
   - File: netlify.toml — added 200 redirect for /workout-logger.

6. **Tighten chat.js CORS** (PASS) — folded into Fix 1 commit. Also tightened generate-docx.js CORS the same way.

7. **generate-docx function exists** (PASS)
   - File: netlify/functions/generate-docx.js — present, uses `require("docx")`. The `docx@^9.6.1` dependency is in netlify/functions/package.json and the build command (`cd netlify/functions && npm install`) installs it. node_modules/docx confirmed present locally.

## WHAT WAS DONE IN PRIOR SPRINTS
1. Verified auth-guard works: added console.log debugging, added to workout-logger.html and macro-plan.html
2. Verified protein/carbs/fat display uses lowercase "g" throughout
3. Fixed plan-builder infinite spin: 60s AbortController timeout, real error messages, RETRY + BACK TO DASHBOARD buttons
4. Added educational calorie slider to macro-plan results: delta vs TDEE, weekly weight change, zone labels, goal conflict warnings
5. Logo smart routing: logged-in users go to /dashboard.html, guests go to /index.html (via app.js initLogoRouting)
6. Nutrition page visual budget graph: TARGET + EXERCISE - CONSUMED = REMAINING with progress bar
7. Weekly report: 4 pre-built options (Full Summary, Training Only, Nutrition Only, Goal Progress) pulling from actual logged data
8. Explicit plan constraints in AI prompt: injury rules, GLP-1 protocol, level scaling, equipment constraints, goal prioritization
9. Login page i18n: added auth.* strings for EN/ES/PT in i18n.js
10. Stripped Apple Sign-In from signup.html with deferred comment, created AUTH_STATUS.md
11. Enhanced workout-logger.html: plan-based loading, no-plan message with CTA, saves to forgeiq_workout_log/forgeiq_prs/forgeiq_last_completed_workout, progress + dashboard CTAs, Recent PRs on dashboard
12. **2026-04-28 — Brand rename sprint**: FORGEIQ → The Doc Lovato Method across all user-visible text (HTML, JS strings, CSS comments, package.json, netlify.toml). Internal `forgeiq_*` localStorage keys, JS variables, and the `__FORGEIQ_PUBLIC_PAGE__` flag preserved.

## KNOWN ISSUES / DEFERRED
- Apple Sign-In: deferred pending Apple Developer account (see AUTH_STATUS.md)
- Google OAuth: button exists but onclick is placeholder alert in signup.html — needs Supabase OAuth flow wired
- Email magic link: not implemented
- Supabase data sync: most data is localStorage-only; cloud backup not yet wired for workout/nutrition logs
- Mobile nav: hamburger menu may need work on smaller screens
- Domain: doclovatomethod.com not yet purchased; social handles not yet reserved
- CSP currently in Report-Only mode — tighten and switch to enforce after launch
- Coaching.html and debora.html now require auth (audit-driven). If these need to be public for SEO/marketing, add the public-page flag.

## NEXT PRIORITIES
1. Buy `doclovatomethod.com` domain and configure as primary on Netlify; update ALLOWED_ORIGIN env var
2. Reserve social handles (@doclovatomethod) on Instagram, TikTok, X/Twitter, YouTube, Facebook
3. Mobile-responsive audit across all pages
4. PWA upgrade (manifest, service worker, offline shell, install prompt)
5. Stripe integration for pricing.html
6. Verify securityheaders.com grade A after deploy; promote CSP from Report-Only to enforcing

## KNOWN TRAPS (DO NOT REPEAT)
- Model name: callers pass `claude-sonnet-4-5` and it works. Do NOT bulk-rename to claude-sonnet-4-6 or anything else without testing — past changes silently failed. The chat.js function now requires the model field explicitly.
- Auth-guard placement: must be in `<head>`, BEFORE any inline script. Verify in incognito after every change.
- Don't re-ask intake questions on plan-builder if profile already exists
- workout-logger.html expects forgeiq_workout_to_start in localStorage — set it before redirecting
- Netlify function timeout is 26s for synchronous; chat.js aborts at 25s
- Do NOT rename `forgeiq_*` localStorage keys, the `__FORGEIQ_PUBLIC_PAGE__` flag, or the `FORGEIQ_SESSION_NOTES.md` filename — see BRAND HISTORY section above
- Do NOT add a fallback model in chat.js — keep it required so silent regressions are impossible
