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
    -   **Gamification**: XP, streak, level, and boss win tracking persisted via `localStorage`. SVG progress rings for profile dashboard.
    -   **Visuals**: Video backgrounds from Pexels, glassmorphism effects for cards, animated blob shapes, and per-slide color accents.
    -   **Two-Part Slides**: Mini-game cards render in two phases: context setup and action question.
    -   **Multimedia**: ElevenLabs TTS integration for explanations, radio shows, and podcast dialogue (no background music). Landing page intro MP3s are kept (`/moolab-intro.mp3`, `/moolab-intro-es.mp3`).
-   **Gamified Learning**:
    -   **Charismatic Tutor Intervention**: AI-generated explanations for incorrect answers, presented in a non-punitive manner with speech synthesis.
    -   **Module System**: Content is organized into 12 modules, advancing every 3 boss wins.
    -   **Boss Quizzes**: Integrated quizzes that advance modules and track streaks.
-   **Localization**:
    -   **IP Geolocation**: Auto-detects user's country via `ipapi.co` for localized content.
    -   **Bilingual System**: Full support for English and Latin American Spanish (UI, Gemini prompts, voice synthesis, radio tips, landing pages). Content is 70% global, 30% localized based on detected country.
-   **Authentication Architecture (Parent-First OAuth)**:
    -   **Step 0 (OAuth Gateway)**: Premium splash with "Continue with Apple" and "Continue with Google" buttons (mock OAuth, black/white design) + "Student PIN Access" secondary button. Divider with "OR" separator.
    -   **Step 1 (Command Center)**: Parent enters their name, views existing student profiles (nickname + PIN + country), and can click "Create Student Profile" to add new students.
    -   **Step 4 (Create Student)**: Parent enters student nickname, birth year, country; system auto-generates a random 4-digit PIN. Saves to `ws_family` localStorage as `{parent, students: [{nickname, pin, birthYear, country}]}`.
    -   **Step 3 (Student PIN Login)**: Students enter nickname + 4-digit PIN, matched against `ws_family` state. On match, loads their profile (name, birthYear, country) and routes directly into the feed.
    -   **Step 2 (Legacy Fallback)**: Original form-based onboarding kept for backward compatibility.
-   **Parent Dashboard**: Provides transparency for parents, displaying child's progress, stats, and module completion.
-   **Radio Show Intermissions**: Integrates "radio_highlight" cards with audio content (fun facts, hype) that auto-play when scrolled into view.

## External Dependencies

-   **AI**: Google Gemini (`gemini-2.5-flash`)
-   **Database**: PostgreSQL
-   **ORM**: Drizzle ORM
-   **Validation**: Zod (`zod/v4`), `drizzle-zod`
-   **API Codegen**: Orval
-   **Geolocation**: `ipapi.co`
-   **Text-to-Speech**: ElevenLabs (`eleven_turbo_v2_5` model), with browser `speechSynthesis` as fallback.
-   **Avatars**: Removed — ultra-clean text-forward UI with no character images
-   **Video Content**: Pexels (for background videos)
-   **Payment Processors (Planned)**: Stripe, PayPal (badges displayed on landing page)

## Podcast Clip Slides
- **AI Schema**: Gemini prompt instructs AI to occasionally generate 1 `podcast_clip` card per batch with `type: "podcast_clip"`, `title`, and `dialogue` array of `{speaker, text}` objects (Host/Expert or Presentador/Experto).
- **PodcastClipSlide Component**: Cinematic fullscreen dark slide with blurred video BG, radial gradient overlay, "MOOLAB PODCAST" branding with LIVE indicator during TTS, animated 24-bar mini-visualizer (neon cyan when speaking), and chat-bubble-style dialogue transcript.
- **Dialogue Animation**: `IntersectionObserver` (threshold 0.6) triggers sequential reveal — each dialogue line appears every 1.4s with TTS narration. Host lines align left (neon cyan `#00ffd5`), Expert lines align right (light blue `#6cb4ee`). Active speaking line gets glow border and brighter text.
- **Audio Stop on Scroll-Away**: Both `RadioHighlightSlide` and `PodcastClipSlide` use `IntersectionObserver` exit detection to stop ElevenLabs/browser TTS when user scrolls away.
- **Swipe Indicator**: Pulsing "Swipe to continue" appears after all lines revealed and speaking is done.