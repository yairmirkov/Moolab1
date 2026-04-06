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
    -   **Multimedia**: Dual-track audio (study beats + speech synthesis), ElevenLabs TTS integration for explanations and radio shows, and dynamically generated avatars.
-   **Gamified Learning**:
    -   **Charismatic Tutor Intervention**: AI-generated explanations for incorrect answers, presented in a non-punitive manner with speech synthesis.
    -   **Module System**: Content is organized into 12 modules, advancing every 3 boss wins.
    -   **Boss Quizzes**: Integrated quizzes that advance modules and track streaks.
-   **Localization**:
    -   **IP Geolocation**: Auto-detects user's country via `ipapi.co` for localized content.
    -   **Bilingual System**: Full support for English and Latin American Spanish (UI, Gemini prompts, voice synthesis, radio tips, landing pages). Content is 70% global, 30% localized based on detected country.
-   **Onboarding**: A 3-step sign-up flow for learners (name, birth year) and parents (parent name, child name, child birth year).
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
-   **Avatars**: DiceBear (`adventurer` style)
-   **Video Content**: Pexels (for background videos)
-   **Payment Processors (Planned)**: Stripe, PayPal (badges displayed on landing page)