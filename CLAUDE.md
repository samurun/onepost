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

OnePost is a cross-platform social media posting app. Users compose a post once and publish it to Facebook, Instagram, YouTube, and TikTok simultaneously.

**Stack:** Next.js 16 (App Router, Turbopack), React 19, Tailwind CSS v4, shadcn/ui, Prisma 7 (PostgreSQL via Supabase + @prisma/adapter-pg), Cloudinary, Zod.

### Key data flow

1. User composes post in `app/page.tsx` (client component managing shared state)
2. Media files upload directly to Cloudinary from browser via signed upload (`POST /api/upload` returns signed params, client uploads to Cloudinary API)
3. Post sent to `POST /api/post` which fans out to platform APIs in `lib/facebook.ts`, `lib/instagram.ts`, `lib/youtube.ts`, and `lib/tiktok.ts`
4. Instagram requires polling for media readiness before publishing (exponential backoff in `lib/instagram.ts`)
5. YouTube uses resumable upload API — downloads video from Cloudinary URL server-side, then uploads to YouTube
6. TikTok uses Content Posting API — FILE_UPLOAD method with init + PUT binary (**currently in progress**)
7. Posts can be saved as drafts via `POST /api/drafts` with media URLs preserved
8. User can choose Reel or Video mode when posting videos (toggle in compose form)
9. Platform-specific settings (YouTube title/privacy, TikTok privacy) are in a collapsible "Platform Settings" section with tabs
10. Platform selector only shows connected accounts (fetched via shared `useAccounts()` context)

### OAuth flows

- **Facebook:** `GET /api/auth/facebook` → Facebook OAuth → `/api/auth/facebook/callback` → stores Page tokens. Posts via Facebook Page (not personal profile). Uses Graph API v21.0.
- **Instagram:** `GET /api/auth/instagram` → Instagram OAuth → `/api/auth/instagram/callback` → stores user token. Separate app from Facebook. Uses Graph API v22.0. Requires Business/Creator account.
- **YouTube:** `GET /api/auth/youtube` → Google OAuth → `/api/auth/youtube/callback` → stores access + refresh tokens. Uses YouTube Data API v3. Tokens are short-lived (1 hour) and auto-refresh via `refreshToken`.
- **TikTok:** `GET /api/auth/tiktok` → TikTok OAuth v2 → `/api/auth/tiktok/callback` → stores access + refresh tokens. Uses Content Posting API. Tokens expire in ~2 hours and auto-refresh. **Unaudited apps can only post as SELF_ONLY (private).**

Facebook and Instagram exchange short-lived tokens for long-lived tokens. YouTube and TikTok use refresh tokens for persistent access.

### Database

Prisma with PostgreSQL (Supabase via @prisma/adapter-pg). Connection config in `prisma.config.ts` — uses `DIRECT_URL` for migrations/push (port 5432), `DATABASE_URL` for runtime (port 6543, pgbouncer). Two models:
- `Account` — platform credentials (tokens, refreshToken, platform IDs). Unique on `[platform, platformId]`. Indexed on `platform`.
- `Post` — post history with native `Json` fields for `mediaUrls`, `platforms`, and `results`. Supports `draft`, `published`, `partial`, `failed`, `scheduled` statuses. Indexed on `status` and `createdAt`.

Prisma client generated to `generated/prisma/` — import from `../generated/prisma/client` (not `@prisma/client`).

### Component structure

```
types/index.ts              — shared types (MediaFile, VideoMode, Privacy, TikTokPrivacy, AccountInfo, PostResult)

lib/
  platforms.ts              — Platform type + PLATFORMS config + PLATFORM_CHAR_LIMITS (single source of truth)
  validations.ts            — Zod schemas for all API routes
  utils.ts                  — cn(), isVideoUrl(), timeAgo(), extractErrorMessage()

hooks/
  use-accounts.tsx          — shared AccountsProvider + useAccounts() context (deduplicates fetch)

components/
  compose/
    platform-selector.tsx   — platform pill buttons (only shows connected platforms)
    media-upload.tsx        — drag & drop + media grid + upload spinner
    char-counter.tsx        — circular progress + count
    platform-settings.tsx   — collapsible section with platform tabs
    settings/
      youtube-settings.tsx  — YouTube title + privacy selector
      tiktok-settings.tsx   — TikTok privacy selector (4 levels)
  compose-form.tsx          — assembles compose sub-components + video mode toggle + platform settings

  preview/
    facebook-preview.tsx    — FB post mockup
    instagram-preview.tsx   — IG post mockup + carousel
    youtube-preview.tsx     — YT video mockup (video-only, shows warning if no video)
    tiktok-preview.tsx      — TT vertical preview with carousel support
  preview-panel.tsx         — tabs + assembles previews (lazy renders active tab only)

  sidebar.tsx               — nav sidebar with account status (auto-collapses on mobile)
  icons.tsx                 — custom Facebook/Instagram/YouTube/TikTok SVG icons (not in lucide-react)
  ui/                       — shadcn/ui primitives
```

### Platform-specific notes

- Instagram API **requires** a publicly accessible media URL (hence Cloudinary)
- Instagram API uses **form-encoded** POST bodies, not JSON
- Instagram deprecated `media_type=VIDEO` — all video uploads use `media_type=REELS`
- Instagram polling uses **exponential backoff** (2s → 4s → 8s, capped at 16s)
- Reel/Video toggle only affects YouTube (Shorts vs regular video); Instagram always uses REELS
- Facebook API posts to Pages only, not personal profiles
- Facebook video uses `/{page-id}/videos` endpoint with `file_url` — vertical videos auto-display as Reels
- YouTube upload uses resumable upload protocol (initiate → upload binary)
- YouTube Shorts: when Reel mode is selected, `#Shorts` is appended to title + `shorts.isShort` metadata
- YouTube **only accepts video** — preview shows "Video required" warning if no video uploaded
- YouTube tokens expire in 1 hour — auto-refreshed via `refreshToken` in post API
- TikTok uses Content Posting API with FILE_UPLOAD method (init → PUT binary)
- TikTok **unaudited apps** can only post as `SELF_ONLY` (private) — needs TikTok audit for public
- TikTok tokens expire in ~2 hours — auto-refreshed via `refreshToken`
- TikTok supports carousel (multiple images/videos) in preview
- Media uploads go directly from browser to Cloudinary (signed upload) — not through Next.js server
- Instagram posting logic lives only in `lib/instagram.ts` (not duplicated in `lib/facebook.ts`)
- Video download has **60s timeout** (`AbortSignal.timeout`) for both YouTube and TikTok

## Code style

- Prettier: no semicolons, double quotes, 2-space indent, trailing commas (es5)
- Tailwind CSS v4 with `cn()` utility from `lib/utils.ts`
- Use canonical Tailwind classes (e.g. `w-60` not `w-[240px]`, `bg-linear-to-tr` not `bg-gradient-to-tr`)
- Use `isVideoUrl()` from `lib/utils.ts` for video URL detection (not inline regex)
- Use `extractErrorMessage()` from `lib/utils.ts` for error handling in catch blocks
- Use `timeAgo()` from `lib/utils.ts` for relative time display
- Platform config from `lib/platforms.ts` — never hardcode platform arrays/limits in components
- All API routes validated with Zod schemas from `lib/validations.ts`
- Destructive actions (delete post, disconnect account) require AlertDialog confirmation
- Typography: use `…` not `...`, curly quotes, loading states end with `…`
- Never use `transition-all` — list properties explicitly
- Decorative icons need `aria-hidden="true"`, icon-only buttons need `aria-label`
