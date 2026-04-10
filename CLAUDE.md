# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm setup        # Install, generate Prisma, push DB, start dev server (one command)
pnpm dev          # Start dev server (HTTPS, Turbopack)
pnpm build        # Production build
pnpm lint         # ESLint
pnpm format       # Prettier
pnpm typecheck    # TypeScript check
npx prisma migrate dev --name <name>  # Create migration
npx prisma generate                   # Regenerate Prisma client
npx prisma db push                    # Push schema without migration
```

## Architecture

OnePost is a cross-platform social media posting app. Users compose a post once and publish it to Facebook, Instagram, and YouTube simultaneously.

**Stack:** Next.js 16 (App Router, Turbopack), React 19, Tailwind CSS v4, shadcn/ui, Prisma 7 (SQLite via libsql adapter), Cloudinary.

### Key data flow

1. User composes post in `app/page.tsx` (client component managing shared state)
2. Media files upload directly to Cloudinary from browser via signed upload (`POST /api/upload` returns signed params, client uploads to Cloudinary API)
3. Post sent to `POST /api/post` which fans out to platform APIs in `lib/facebook.ts`, `lib/instagram.ts`, and `lib/youtube.ts`
4. Instagram requires polling for media readiness before publishing (handled in `lib/instagram.ts`)
5. YouTube uses resumable upload API — downloads video from Cloudinary URL server-side, then uploads to YouTube
6. Posts can be saved as drafts via `POST /api/drafts` with media URLs preserved
7. User can choose Reel or Video mode when posting videos (toggle in compose form)
8. YouTube title is a separate input field, shown when YouTube platform is selected

### OAuth flows

- **Facebook:** `GET /api/auth/facebook` → Facebook OAuth → `/api/auth/facebook/callback` → stores Page tokens. Posts via Facebook Page (not personal profile). Uses Graph API v21.0.
- **Instagram:** `GET /api/auth/instagram` → Instagram OAuth → `/api/auth/instagram/callback` → stores user token. Separate app from Facebook. Uses Graph API v22.0. Requires Business/Creator account.
- **YouTube:** `GET /api/auth/youtube` → Google OAuth → `/api/auth/youtube/callback` → stores access + refresh tokens. Uses YouTube Data API v3. Tokens are short-lived (1 hour) and auto-refresh via `refreshToken`.

Facebook and Instagram exchange short-lived tokens for long-lived tokens. YouTube uses refresh tokens for persistent access.

### Database

Prisma with SQLite (libsql adapter). Two models:
- `Account` — platform credentials (tokens, refreshToken, platform IDs). Unique on `[platform, platformId]`.
- `Post` — post history with JSON fields for `mediaUrls`, `platforms`, and `results`. Supports `draft`, `published`, `partial`, `failed`, `scheduled` statuses.

Prisma client generated to `generated/prisma/` — import from `../generated/prisma/client` (not `@prisma/client`).

### Component structure

```
types/index.ts              — shared types (MediaFile, VideoMode, AccountInfo, PostResult)

lib/
  utils.ts                  — cn() utility + isVideoUrl() helper

components/
  compose/
    platform-selector.tsx   — platform pill buttons + config (FB, IG, YT)
    media-upload.tsx        — drag & drop + media grid + upload spinner
    char-counter.tsx        — circular progress + count
  compose-form.tsx          — assembles compose sub-components + YouTube title + Reel/Video toggle

  preview/
    facebook-preview.tsx    — FB post mockup
    instagram-preview.tsx   — IG post mockup + carousel
    youtube-preview.tsx     — YT video mockup (uses youtubeTitle prop)
  preview-panel.tsx         — tabs + assembles previews

  sidebar.tsx               — nav sidebar with account status
  icons.tsx                 — custom Facebook/Instagram/YouTube SVG icons (not in lucide-react)
  ui/                       — shadcn/ui primitives
```

### Platform-specific notes

- Instagram API **requires** a publicly accessible media URL (hence Cloudinary)
- Instagram API uses **form-encoded** POST bodies, not JSON
- Instagram deprecated `media_type=VIDEO` — all video uploads use `media_type=REELS`
- Reel/Video toggle only affects YouTube (Shorts vs regular video); Instagram always uses REELS
- Facebook API posts to Pages only, not personal profiles
- Facebook video uses `/{page-id}/videos` endpoint with `file_url` — vertical videos auto-display as Reels
- YouTube upload uses resumable upload protocol (initiate → upload binary)
- YouTube Shorts: when Reel mode is selected, `#Shorts` is appended to title + `shorts.isShort` metadata
- YouTube tokens expire in 1 hour — auto-refreshed via `refreshToken` in post API
- Media uploads go directly from browser to Cloudinary (signed upload) — not through Next.js server
- Instagram posting logic lives only in `lib/instagram.ts` (not duplicated in `lib/facebook.ts`)

## Code style

- Prettier: no semicolons, double quotes, 2-space indent, trailing commas (es5)
- Tailwind CSS v4 with `cn()` utility from `lib/utils.ts`
- Use canonical Tailwind classes (e.g. `w-60` not `w-[240px]`, `bg-linear-to-tr` not `bg-gradient-to-tr`)
- Use `isVideoUrl()` from `lib/utils.ts` for video URL detection (not inline regex)
