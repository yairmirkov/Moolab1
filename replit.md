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
- State variables (appStarted, ageGroup, currentData, etc.)
- `handleScroll` — infinite scroll
- `handleMiniGame` — XP/answer tracking
- `handleShare` — native/WhatsApp/X sharing
- Quiz scoring logic

### Multimedia Features
- **Background images**: Keyword-matched Pexels stock photos per slide (money, saving, investing, etc.)
  - `imageBank` maps finance keywords to Pexels photo IDs
  - `getRelevantImage()` scans card title+desc for best match
- **AI Tutor avatars**: DiceBear `bottts` SVG seeded by card title, shown next to title
- **Background audio**: SoundHelix MP3s mapped by age group in `audioByAge`
  - Audio created via `new Audio()` in useEffect, play/pause via `toggleMute` button
  - Starts muted, user taps 🔇 to enable sound (browser autoplay policy compliant)
- **Glassmorphism**: `backdrop-filter: blur(24px)` on mini-game cards + quiz panels
- **Animated blobs**: Per-slide floating color orbs with `blobA`/`blobB` CSS keyframes
- **Slide accents**: `slideAccents` array provides per-slide color theming

### Age Groups
- `8-12` Explorer — fun/emoji tone
- `13-16` Hustler — Gen-Z slang
- `17-21` Investor — Wall Street tone
