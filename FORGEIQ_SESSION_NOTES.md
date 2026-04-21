# FORGEIQ SESSION NOTES
Last updated: 2026-04-21

## TECH STACK
- Flat HTML + Netlify Functions (Node.js) + Supabase (auth/data) + Anthropic SDK
- All AI calls route through /.netlify/functions/chat
- Model string: claude-sonnet-4-5 (NEVER claude-sonnet-4-6 — silent-fail bug)
- localStorage keys: forgeiq_profile, forgeiq_active_plan, forgeiq_active_multiday_plan, forgeiq_workout_log, forgeiq_nutrition_log, forgeiq_exercise_calories, forgeiq_last_completed_workout, forgeiq_prs, forgeiq_max_lifts, forgeiq_user, forgeiq_workout_history, forgeiq_food_log
- Repo: github.com/milovato2002-glitch/FORGEIQ (private, master)
- Deployed: forgeiq.netlify.app

## BRAND
- Colors: navy #1F4E79, mid-blue #2E75B6, accent orange #C55A11, app bg #0a1628, nav #0e1e36, card #142444, gold #f0a500
- Fonts: Bebas Neue (headings), Barlow Condensed, Barlow

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

## KNOWN ISSUES / DEFERRED
- Apple Sign-In: deferred pending Apple Developer account (see AUTH_STATUS.md)
- Google OAuth: button exists but onclick is placeholder alert in signup.html — needs Supabase OAuth flow wired
- Email magic link: not implemented
- Supabase data sync: most data is localStorage-only; cloud backup not yet wired for workout/nutrition logs
- Mobile nav: hamburger menu may need work on smaller screens

## NEXT PRIORITIES
1. Wire Google OAuth properly in signup.html (Supabase signInWithOAuth)
2. Sync localStorage data to Supabase tables (workout_log, nutrition_log, progress)
3. Add Stripe integration for pricing.html
4. Mobile-responsive audit across all pages

## KNOWN TRAPS (DO NOT REPEAT)
- Model name regression: always claude-sonnet-4-5, never anything else
- Auth-guard must be verified by actually loading a protected page in incognito after every commit that touches it
- Don't re-ask intake questions on plan-builder if profile already exists
- workout-logger.html expects forgeiq_workout_to_start in localStorage — set it before redirecting
- Netlify function timeout is 26s for synchronous; plan generation can hit this limit
