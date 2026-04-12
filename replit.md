# Moolab

## Overview

Moolab is a premium TikTok/Reels-style financial literacy application designed for kids and teens aged 8–21. It aims to educate users on aggressive, high-leverage wealth-building strategies rather than passive saving. The project vision is to cultivate "financial sharks" by providing age-appropriate financial lessons, mini-games, and quizzes, delivered through an engaging, gamified experience. The application leverages AI to personalize content and utilizes a robust multimedia approach, including video backgrounds, dual-track audio, and interactive elements.

## User Preferences

- I prefer clear, concise summaries of project goals and technical decisions.
- Focus on high-level architecture and key features, avoiding minute implementation details unless critical.
- Ensure all sections are properly formatted in Markdown.
- Do not make changes to files or folders without explicit instruction.
- Only output the compressed replit.md content.

## System Architecture

Moolab is built as a pnpm workspace monorepo using TypeScript (v5.9). It utilizes Node.js 24 and pnpm as the package manager. The API is built with Express 5, backed by PostgreSQL and Drizzle ORM, with Zod for validation. API codegen is handled by Orval from an OpenAPI spec, and esbuild is used for bundling.

### Frontend (WealthScroll App)

-   **Framework**: React + Vite.
-   **AI Integration**: Gemini AI (`gemini-2.5-flash`) generates age-appropriate financial lessons and mini-games.
-   **Persona Engine**: Content is tailored for three age groups ("The Cool Tech-Mentor" for 8-12, "The High-Performance Coach" for 13-17, "The Wealth Strategist" for 18-21), ensuring relevant tone and examples.
-   **Financial Doctrine**: A `coreDoctrine` (Shark Doctrine) emphasizing Calculated Risk, Leverage, Ownership, and Speed/Execution is embedded in all AI prompts, scaled by age group.
-   **UI/UX**:
    -   **Branding**: Custom shark-fin wordmark logo, using the Inter font (font-black), with a pulsing glow animation.
    -   **Color Scheme**: Ocean Breeze blue palette (`#0c2d48`, `#145374`, `#2e8bc0`, `#b1d4e0`).
    -   **Gamification**: XP, streak, level, boss wins, and **Moolies** (in-app currency) tracking persisted via `localStorage`. SVG progress rings for profile dashboard. Moolies earned (+50) on Boss Quiz wins. **The Vault** (`TheVault.tsx`) is a rewards center where users spend Moolies on UI customizations (themes, titles, avatar borders, effects). 6 purchasable items with equip/unequip toggle.
    -   **Hub Navigation**: Persistent bottom tab bar (`BottomNav.tsx`) with three tabs: Lab 🧪 (learning feed), Tank 🦈 (portfolio sandbox), Vault 🏦 (reward store). Glassmorphism styling with active glow indicator and Moolies badge on Vault tab. `activeTab` state (`"lab" | "tank" | "vault"`) controls which view is displayed. Feed is hidden via `display:none` when not on Lab tab to prevent background audio/scroll activity. Audio stops on tab switch away from Lab. Nav is hidden during quiz, profile modal, module map, and parent dashboard overlays.
    -   **Visuals**: Video backgrounds from Pexels, glassmorphism effects for cards, animated blob shapes, and per-slide color accents.
    -   **Two-Part Slides**: Mini-game cards render in two phases: context setup and action question.
    -   **Multimedia**: ElevenLabs TTS integration for explanations, radio shows, and podcast dialogue (no background music). Landing page intro MP3s are kept (`/moolab-intro.mp3`, `/moolab-intro-es.mp3`).
-   **Gamified Learning**:
    -   **Charismatic Tutor Intervention**: AI-generated explanations for incorrect answers, presented in a non-punitive manner with speech synthesis.
    -   **Module System**: Content is organized into 12 modules, advancing every 3 boss wins.
    -   **Boss Quizzes**: Integrated quizzes that advance modules and track streaks.
-   **Localization**:
    -   **IP Geolocation**: Auto-detects user's country via `ipapi.co` for localized content.
    -   **Bilingual System**: Full support for English and Latin American Spanish (UI, Gemini prompts, voice synthesis, radio tips, landing pages, all auth/admin pages). Language is determined by `?lang=es` URL param (propagated across all route transitions) with `ws_lang` localStorage fallback. Content is 70% global, 30% localized based on detected country.
    -   **Translation Architecture**: `translations.ts` contains all UI strings keyed by `{en, es}`. `useLang()` hook reads from URL param first, then localStorage. `useLangSuffix()` provides `?lang=es` suffix for route transitions. All page components (Register, Login, Dashboard, AppLogin, Demo, Feed) use the `t()` helper function.
-   **Routing**: React Router (`react-router-dom`) with BrowserRouter. Routes:
    -   `/` — Home/landing page with Get Started, Parent Sign In, Student PIN Access, Demo Mode links
    -   `/register` — Parent email/password registration (creates DB record, redirects to `/dashboard`)
    -   `/login` — Parent sign in (authenticates via API, redirects to `/dashboard`)
    -   `/dashboard` — Parent dashboard: subscription status, child profile management (add/remove children with auto-generated usernames + PINs)
    -   `/app-login` — Kid-friendly PIN login (username + 4-digit PIN, dark Ocean Breeze theme with shark branding)
    -   `/demo` — Testing route: bypasses auth, age group dropdown (8-12, 13-15, 16-18) in top bar, renders Feed directly
    -   `/feed` — Post-child-login feed (loads from `ws_ageGroup` localStorage)
    -   `/legacy` — Original single-page app with built-in onboarding
-   **Authentication Architecture (Database-backed)**:
    -   **Parent Auth**: Email/password registration & login via API (`/api/auth/register`, `/api/auth/login`). Passwords bcrypt-hashed (12 rounds). Express sessions with cookies.
    -   **Child Auth**: Username + 4-digit PIN login via `/api/auth/child-login`. Returns child profile with `ageGroup` for feed personalization.
    -   **AuthContext**: React context provider wrapping all routes. Provides `parent`, `child`, `loginParent`, `registerParent`, `loginChild`, `logout` methods.
    -   **API Client**: `src/api.ts` — fetch wrapper with credentials for session cookies, targeting `/api-server/api` base path.
-   **Database Schema** (`lib/db/src/schema/index.ts`):
    -   **parents**: id (serial PK), email (unique), password_hash, subscription_status (default "free"), created_at
    -   **children**: id (serial PK), parent_id (FK → parents, cascade delete), username (unique, auto-generated), pin (4-digit), display_name, age_group ("8-12"/"13-15"/"16-18"), created_at
-   **Parent Dashboard** (`src/pages/Dashboard.tsx`): Ocean Breeze themed. Subscription card, child profile list with username/PIN display, "Add Child Profile" modal (name + age group dropdown → auto-generates username + PIN). How-it-works guide.
-   **Legacy Command Center** (`CommandCenter.tsx`): Premium white (#F8F9FB) + navy (#001F5B) dashboard with 4 tabs (Overview, Lab Progress, Family Users, Billing). Still available at `/legacy` route.
-   **Concept Breakdown Slides** (`ConceptCard.tsx`): `concept_breakdown` card type with white background + navy (#001F5B) typography. Shows "LAB CONCEPT" badge, large bold term, clear definition, and italicized analogy in a shaded block. Pulsing "Tap to Continue" button auto-scrolls to next slide. AI generates 1-2 per batch to teach Finance 101 terms before testing.
-   **Radio Show Intermissions**: Integrates "radio_highlight" cards with audio content (fun facts, hype) that auto-play when scrolled into view.

## External Dependencies

-   **AI**: Google Gemini (`gemini-2.5-flash`)
-   **Database**: PostgreSQL
-   **ORM**: Drizzle ORM
-   **Validation**: Zod (`zod/v4`), `drizzle-zod`
-   **API Codegen**: Orval
-   **Geolocation**: `ipapi.co`
-   **Text-to-Speech**: ElevenLabs (`eleven_multilingual_v2` model). Bilingual voice map with 5 roles per language (Host, Expert, Guest1, Guest2, Narrator) × 2 languages (EN/ES). Language resolved dynamically: country from `ws_country` checked against Spanish-speaking regions first, then explicit `lang` param, then `ws_lang`. Browser `speechSynthesis` fallback for non-podcast slides only; podcasts log errors on API failure.
-   **Avatars**: Removed — ultra-clean text-forward UI with no character images
-   **Video Content**: Pexels (for background videos)
-   **Payment Processors (Planned)**: Stripe, PayPal (badges displayed on landing page)

## Podcast Clip Slides
- **AI Schema**: Gemini prompt instructs AI to occasionally generate 1 `podcast_clip` card per batch with `type: "podcast_clip"`, `title`, and `dialogue` array of `{speaker, text}` objects (Host/Expert or Presentador/Experto).
- **PodcastClipSlide Component**: Cinematic fullscreen dark slide with blurred video BG, radial gradient overlay, "MOOLAB PODCAST" branding with LIVE indicator during TTS, animated 24-bar mini-visualizer (neon cyan when speaking), and chat-bubble-style dialogue transcript.
- **Sequential Playback Queue**: Replaced interval-based typewriter with async/await state machine. Each dialogue line's full text is revealed instantly, then ElevenLabs audio plays to completion before the next line renders. Uses `AbortController` for clean cancellation.
- **Bilingual Multi-Voice Router**: `speakPodcastLine()` resolves voice language from user's country (Spanish-speaking countries → ES voices, else EN). Maps speaker names to roles via `SPEAKER_TO_ROLE` (Host/Presentador→Host, Expert/Experto→Expert, Guest/Invitado→Guest1/Guest2, Narrator/Narrador→Narrator). Each role has a unique ElevenLabs Voice ID per language. No browser `speechSynthesis` fallback for podcasts.
- **Audio Stop on Scroll-Away**: Both `RadioHighlightSlide` and `PodcastClipSlide` use `IntersectionObserver` exit detection. PodcastClipSlide aborts the entire playback queue via `AbortController.abort()`, immediately pausing and destroying audio instances.
- **Swipe Indicator**: Pulsing "Swipe to continue" appears after all lines revealed and speaking is done.