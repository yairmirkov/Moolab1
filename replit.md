# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

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

### Core Logic (NEVER CHANGE)
- `generateCards()` — AI card generation
- State variables (appStarted, ageGroup, currentData, loading, isFetchingMore, isFetchingRef, completedSlides, slideAnswers, quizUnlocked, quizStarted, quizResult)
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
- **Video backgrounds**: 30-entry `videoBank` with keyword-matched Pexels SD videos (ALL SD via `pxVid()` for instant mobile loading). `usedVideoIndices` ref prevents repeats; clears when all used.
- **Per-slide audio**: SoundHelix songs 1–16, each slide gets unique `songNum`. IntersectionObserver-style scroll detection switches audio on slide change.
- **Audio start**: `startAudio()` called directly on age button click (user gesture) to bypass browser autoplay policy.
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
- Sections: Hero ("STOP SCROLLING. START EARNING."), Features (4 cards), Three Identities (Explorer/Hustler/Investor), Parental Command Center, Mastermind Subscription (coming soon), Final CTA
- Uses Tailwind CSS with Mint Fresh emerald palette
- Accepts `onEnterApp` prop; clicking "Launch App" transitions to onboarding with fade-in animation
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
