# Moolab

## Overview

**Moolab** — a premium TikTok/Reels-style financial literacy app for kids and teens (ages 8–21). pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## WealthScroll App (artifacts/web-app)

**WealthScroll** — premium TikTok/Reels-style financial literacy app for kids and teens (ages 8–21).

### Architecture
- React + Vite, single-file App.tsx
- Gemini AI (`gemini-2.5-flash`) generates age-appropriate financial lessons with mini-games
- `VITE_GEMINI_API_KEY` env var required

### Persona Engine ("Beloved Professor" System)
- **Kids (8-12) — The Cool Tech-Mentor**: Speaks to them like future founders. Uses Robux economy, YouTuber business models as logic puzzles. Tone: "I'll show you how the world works so you can win."
- **Teens (13-17) — The High-Performance Coach**: Consumer-to-owner transition. Creator economy, digital leverage, building edges. Sharp, authentic, direct — no forced slang.
- **Adults (18-21) — The Wealth Strategist**: Zero fluff. Credit engineering, tax optimization, asset allocation. Elite, sophisticated, MasterClass-level execution.
- Track labels: Tech-Mentor Track / Performance Track / Strategist Track
- Radio tips match persona tone (premium podcast host style — Diary of a CEO / MasterClass)

### Shark Doctrine (Moolab Financial Doctrine)
- `coreDoctrine` constant injected into every Gemini prompt — enforces aggressive, high-leverage wealth building over passive saving
- Four pillars: Calculated Risk & Volatility, Leverage & Asymmetric Upside, Ownership Over Wages, Speed & Execution
- `sharkByAge` scales doctrine per age group:
  - **Kids**: Leverage as game mechanics (loot multipliers), volatility as timing rare drops, ownership as building digital businesses
  - **Teens**: High-velocity side hustles, trend recognition, aggressive profit reinvestment, digital audience compounding
  - **Adults**: Capital leverage, high-volatility assets, aggressive portfolio expansion, real estate leverage, equity building
- Prompt assembly: `${persona} ${coreDoctrine} ${ageShark} ${instructions}`

### Apex Logo System
- Custom inline SVG: ascending bar chart where the tallest bar morphs into an angular shark fin
- Color: Ocean Breeze palette `#2e8bc0` (bright blue) with opacity gradient (0.3 → 0.5 → 0.7 → 0.85), `#145374` (mid-dark blue) for fin
- Pulsing `logoGlow` CSS animation (drop-shadow pulses between 6px and 10px spread, blue glow)
- Brand font: **Inter** (font-black) — clean, modern sans-serif
- Rendered in: LandingPage nav (30px, glow), LandingPage CTA (48px, glow), LandingPage footer (22px), LandingPageES (same), App.tsx HUD (22px, static glow)
- Text "MOOLAB" uses Inter font-black with `#2e8bc0` → `#145374` gradient

### Landing Page Copy (Shark Doctrine)
- Hero badge: "Building Financial Sharks Since Day One"
- Subheadline: "The financial system is designed to keep your kids in the rat race..."
- Anti-pitch warning: "WARNING: THIS IS NOT FOR EVERY FAMILY."
- Feature cards: Shark Mindset, AI-Powered, Boss Battles, Gamification
- Persona cards: MATRIX BREAKER (8-12), TEEN TYCOON (13-17), APEX PREDATOR (18-21)
- Parent section: "Parental War Room"
- Subscription: "Mastermind Arsenal"
- Final CTA: "Raise a Shark Today."
- Footer: "Building the next generation of financial sharks."

### Charismatic Tutor Intervention System
- AI generates `explanation` field for every miniGame and bossQuiz question
- **Mini-game wrong answer**: Shows "INSIGHT UNLOCKED" glassmorphic panel with tap-to-reveal explanation + "Listen" button (speech synthesis). Warm emerald glow, not harsh red.
- **Boss quiz wrong answer**: Shows "HOLD UP — LET'S BREAK THIS DOWN" modal with explanation + listen button + "Got it! Let's keep scrolling" to return to feed. Streak is reset but no harsh fail screen. Removes last completed slide + its answer to allow re-earning.
- `speakExplanation()` helper: reads explanation aloud with music ducking (0.05 during speech, restore to 0.15)
- Answer lock check uses `slideAnswers[card.id] === undefined` (not falsy check) to prevent index-0 replay exploit

### Core Logic (NEVER CHANGE)
- `generateCards()` — AI card generation with explanation field
- State variables (appStarted, ageGroup, currentData, loading, isFetchingMore, isFetchingRef, completedSlides, slideAnswers, quizUnlocked, quizStarted, quizResult, revealedExplanations, bossExplanation)
- `handleScroll` — infinite scroll tripwire
- `handleMiniGame` — answer tracking + XP award (+10 per correct)
- `handleShare` — native/WhatsApp/X sharing
- Quiz scoring logic in boss quiz onClick

### Persistent Gamification
- **xp, streak, level, bossWins** — loaded/saved from `localStorage` via `loadPersisted()`/`savePersisted()` with `ws_` prefix
- **XP awards**: +10 per mini-game correct, +50 per boss win
- **Level up**: auto when `xp >= level * 50`
- **Streak**: +1 per boss win, reset to 0 on boss loss
- **Profile Dashboard**: 💸 button opens overlay with SVG progress ring, XP, streak, boss wins, current module

### Module/Subject System
- `moduleSubjects` array (12 entries): "The Basics", "Budgeting 101", "Smart Saving", etc.
- `moduleNum = Math.floor(bossWins / 3) + 1` — module advances every 3 boss fights
- Subject bar in HUD shows "MODULE X: SUBJECT" with 3-pip progress indicators

### Multimedia Features
- **Video backgrounds**: 53 verified Pexels HD videos with Fisher-Yates shuffle queue (`videoQueue`), per-card stable mapping (`cardVideoMap`), gradient fallbacks
- **Dual-track audio**: `musicRef` (study beats, vol 0.15) + speech synthesis commentary (vol 0.8). Music "ducks" to 0.05 when radio host speaks.
- **Moolab Radio Show**: `triggerRadioHost()` fires every 5 cards scrolled OR after mini-game win. Uses `speechSynthesis` API with preferred natural voices. 10 tips per age group (Kids/Teens/Adults). Non-repeat tip selection via `usedTipsRef`. Shows pulsing "🎙️ LIVE" indicator in HUD during playback.
- **Audio start**: Music starts on session begin (user gesture) to bypass autoplay policy.
- **Avatars**: DiceBear `adventurer` human-style SVG seeded by card title
- **Glassmorphism**: `backdrop-filter: blur(24px)` on mini-game cards + quiz panels
- **Animated blobs**: Per-slide floating color orbs with `blobA`/`blobB` CSS keyframes
- **Slide accents**: `slideAccents` (8 entries) drives per-slide color theming

### Auto-Next Timer
- 10-second countdown (SVG ring) on boss quiz win screen
- `useEffect` on `quizResult === true` fires interval then calls `resetJourney()`
- Countdown pulses when ≤ 3 seconds remaining

### Landing Page
- `src/LandingPage.tsx` — informational marketing page shown first on app load
- Sections: Hero ("STOP SCROLLING. START EARNING."), Features (4 cards), Three Identities (Explorer/Hustler/Investor), Parental Command Center, Mastermind Subscription (coming soon), Parent Login form, Final CTA
- App Store & Google Play download badges in hero and final CTA sections
- Stripe & PayPal trust logos in subscription section and footer
- Parent Login section with email/password form; clicking Sign In triggers `onParentLogin` (routes to parent onboarding step 2)
- Nav bar has "Parent Login" button (desktop) and "Launch App" button
- Uses Tailwind CSS with Ocean Breeze blue palette (`#0c2d48` deep navy, `#145374` mid blue, `#2e8bc0` bright blue, `#b1d4e0` light blue, white)
- Accepts `onEnterApp` and `onParentLogin` props
- `showLanding` state in App.tsx controls visibility; persists per session only (shows on every fresh load)

### Sign-Up / Onboarding Flow
- 3-step onboarding: (0) Welcome splash → (1) Who's signing up? (Kid/Teen vs Parent) → (2) Form
- **Learner path**: name + birth year
- **Parent path**: parent name + child name + child birth year
- Birth year is a `<select>` dropdown (not date input)
- Account type persisted via `ws_acctType`, parent name via `ws_parentName`
- `onboardStep` auto-resumes from saved state on reload (skips to step 2 if account type is saved)
- Age auto-detected from birth year via `getAgeFromYear()` + `getAgeGroup()`

### Parent Dashboard
- **Parent login**: When `accountType === "parent"`, `startSession` skips audio/card generation. App renders `parentDashContent` full-screen instead of learning feed.
- **Kid transparency**: Learner header has a 👪 button that toggles `showParentDash` overlay — same dashboard content, titled "What Your Parent Sees" / "PARENT VIEW"
- Dashboard shows: child profile card (name, age, mode), XP/Boss Wins/Streak stat cards, full module progress list with progress bars, learning insights grid
- Parent has LOG OUT button that clears all localStorage and returns to onboarding
- Kid has ✕ close button to dismiss overlay and return to learning feed

### Age Groups
- `8-12` Explorer — fun/emoji tone
- `13-16` Hustler — Gen-Z slang
- `17+` Investor — Wall Street tone
