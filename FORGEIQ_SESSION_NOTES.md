# THE DOC LOVATO METHOD — SESSION NOTES
Last updated: 2026-04-28

## BRAND HISTORY
- Rebranded from FORGEIQ to The Doc Lovato Method on 2026-04-28.
- The localStorage keys remain `forgeiq_*` intentionally — renaming them would log out every existing user and orphan their workout/nutrition/PR data. Treat the prefix as a frozen internal namespace.
- The internal `__FORGEIQ_PUBLIC_PAGE__` flag and `forgeiq_*` JS variables were also left intact for the same reason.
- The `doclovatomethod.com` domain has not been purchased yet — site still lives at `forgeiq.netlify.app`. All footer URLs and Netlify config still point there.
- File `FORGEIQ_SESSION_NOTES.md` is intentionally NOT renamed (preserves git history continuity).

## TECH STACK
- Flat HTML + Netlify Functions (Node.js) + Supabase (auth/data) + Anthropic SDK
- All AI calls route through /.netlify/functions/chat
- Model string: claude-sonnet-4-5 (NEVER claude-sonnet-4-6 — silent-fail bug)
- localStorage keys: forgeiq_profile, forgeiq_active_plan, forgeiq_active_multiday_plan, forgeiq_workout_log, forgeiq_nutrition_log, forgeiq_exercise_calories, forgeiq_last_completed_workout, forgeiq_prs, forgeiq_max_lifts, forgeiq_user, forgeiq_workout_history, forgeiq_food_log
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
- coaching.html / debora.html — coach bio pages
- resources.html / glp-hub.html / peptide-library.html — gated content
- book.html / pricing.html — public
- js/auth-guard.js — session gating on all protected pages (with console.log debugging)
- js/supabase-config.js — Supabase client init
- js/i18n.js — EN/ES/PT translations including auth page strings
- js/app.js — core utilities, logo routing, AI coach, profile management
- netlify/functions/chat.js — Anthropic API proxy (claude-sonnet-4-5, 26s limit)

## WHAT WAS DONE THIS SPRINT
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

## NEXT PRIORITIES
1. Buy `doclovatomethod.com` domain and configure as primary on Netlify
2. Reserve social handles (@doclovatomethod) on Instagram, TikTok, X/Twitter, YouTube, Facebook
3. Mobile-responsive audit across all pages
4. PWA upgrade (manifest, service worker, offline shell, install prompt)
5. Stripe integration for pricing.html

## KNOWN TRAPS (DO NOT REPEAT)
- Model name regression: always claude-sonnet-4-5, never anything else
- Auth-guard must be verified by actually loading a protected page in incognito after every commit that touches it
- Don't re-ask intake questions on plan-builder if profile already exists
- workout-logger.html expects forgeiq_workout_to_start in localStorage — set it before redirecting
- Netlify function timeout is 26s for synchronous; plan generation can hit this limit
- Do NOT rename `forgeiq_*` localStorage keys, the `__FORGEIQ_PUBLIC_PAGE__` flag, or the `FORGEIQ_SESSION_NOTES.md` filename — see BRAND HISTORY section above
