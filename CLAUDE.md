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

OnePost is a cross-platform social media posting app. The UI currently focuses on **Facebook + Instagram**. YouTube and TikTok integrations are fully plumbed on the backend (lib + `/api/post`) and gated behind `ACTIVE_PLATFORMS` in `lib/platforms.ts` — re-enabling is a one-line change once the UX is ready.

**Stack:** Next.js 16 (App Router, Turbopack), React 19, Tailwind CSS v4 + Linear-inspired design tokens, shadcn/ui, Inter Variable (OpenType `cv01`/`ss03`), Prisma 7 (PostgreSQL via Supabase + `@prisma/adapter-pg`), Cloudinary, Zod.

### Key data flow

1. User composes post in `app/page.tsx` (client component managing shared state)
2. Media files upload directly to Cloudinary from browser via signed upload (`POST /api/upload` returns signed params, client uploads to Cloudinary API)
3. Post sent to `POST /api/post` which fans out to platform APIs **in parallel** — each platform × account runs concurrently via `Promise.all` (see `lib/facebook.ts`, `lib/instagram.ts`, `lib/youtube.ts`, `lib/tiktok.ts`)
4. Instagram requires polling for media readiness before publishing (exponential backoff in `lib/instagram.ts`)
5. YouTube uses resumable upload API — downloads video from Cloudinary URL server-side, then uploads to YouTube
6. TikTok uses Content Posting API — FILE_UPLOAD method with init + PUT binary
7. Posts can be saved as drafts via `POST /api/drafts`; `settings` Json column preserves per-platform fields (`youtubeTitle`, `youtubeDescription`, `tiktokCaption`, `videoMode`, `privacy`, `tiktokPrivacy`)
8. Platform selector only shows platforms in `ACTIVE_PLATFORMS` that also have a connected account (fetched via shared `useAccounts()` context)

### OAuth flows

- **Facebook:** `GET /api/auth/facebook` → Facebook OAuth → `/api/auth/facebook/callback` → stores Page tokens. Posts via Facebook Page (not personal profile). Uses Graph API v21.0.
- **Instagram:** `GET /api/auth/instagram` → Instagram OAuth → `/api/auth/instagram/callback` → stores user token. Separate app from Facebook. Uses Graph API v22.0. Requires Business/Creator account.
- **YouTube:** `GET /api/auth/youtube` → Google OAuth → `/api/auth/youtube/callback` → stores access + refresh tokens. Uses YouTube Data API v3. Tokens are short-lived (1 hour) and auto-refresh via `refreshToken`. UI gated.
- **TikTok:** `GET /api/auth/tiktok` → TikTok OAuth v2 → `/api/auth/tiktok/callback` → stores access + refresh tokens. Uses Content Posting API. Tokens expire in ~2 hours and auto-refresh. **Unaudited apps can only post as SELF_ONLY (private).** UI gated.

Facebook and Instagram exchange short-lived tokens for long-lived tokens. YouTube and TikTok use refresh tokens for persistent access.

### Database

Prisma with PostgreSQL (Supabase via `@prisma/adapter-pg`). Connection config in `prisma.config.ts` — uses `DIRECT_URL` for migrations/push (port 5432), `DATABASE_URL` for runtime (port 6543, pgbouncer). Two models:
- `Account` — platform credentials (tokens, refreshToken, platform IDs). Unique on `[platform, platformId]`. Indexed on `platform`.
- `Post` — post history with `Json` fields for `mediaUrls`, `platforms`, `results`, and `settings` (per-platform caption/title/privacy/videoMode). Supports `draft`, `published`, `partial`, `failed`, `scheduled` statuses. Indexed on `status` and `createdAt`.

Prisma client generated to `generated/prisma/` — import from `../generated/prisma/client` (not `@prisma/client`).

### Component structure

```
types/index.ts              — shared types (MediaFile, VideoMode, Privacy, TikTokPrivacy, AccountInfo, PostResult)

lib/
  platforms.ts              — Platform type + PLATFORMS config + PLATFORM_CHAR_LIMITS + ACTIVE_PLATFORMS whitelist
  validations.ts            — Zod schemas for all API routes (createPostSchema + saveDraftSchema accept per-platform fields)
  utils.ts                  — cn(), isVideoUrl(), timeAgo(), extractErrorMessage()

hooks/
  use-accounts.tsx          — shared AccountsProvider + useAccounts() context (deduplicates fetch)

components/
  compose/
    platform-selector.tsx   — platform pill buttons (reads ACTIVE_PLATFORMS, only shows connected)
    media-upload.tsx        — drag & drop + media grid + upload spinner
    char-counter.tsx        — circular progress + count
  compose-form.tsx          — caption textarea + platform selector + media + action buttons

  preview/
    facebook-preview.tsx    — FB post mockup
    instagram-preview.tsx   — IG post mockup + carousel
    youtube-preview.tsx     — YT video mockup (used only when re-enabled)
    tiktok-preview.tsx      — TT vertical preview (used only when re-enabled)
  preview-panel.tsx         — tabs + assembles previews (lazy renders active tab only)

  sidebar.tsx               — nav sidebar with connected-account status (auto-collapses on mobile)
  theme-provider.tsx        — defaults to dark; `d` key toggles theme
  icons.tsx                 — custom Facebook/Instagram/YouTube/TikTok SVG icons (not in lucide-react)
  ui/                       — shadcn/ui primitives (restyled around Linear tokens)
```

### Platform-specific notes

- Instagram API **requires** a publicly accessible media URL (hence Cloudinary)
- Instagram API uses **form-encoded** POST bodies, not JSON
- Instagram deprecated `media_type=VIDEO` — all video uploads use `media_type=REELS`
- Instagram polling uses **exponential backoff** (2s → 4s → 8s, capped at 16s)
- Facebook API posts to Pages only, not personal profiles
- Facebook video uses `/{page-id}/videos` endpoint with `file_url` — vertical videos auto-display as Reels
- YouTube upload uses resumable upload protocol (initiate → upload binary)
- YouTube Shorts: when `videoMode === "reel"`, `#Shorts` is appended to title + `shorts.isShort` metadata
- YouTube **only accepts video** — preview shows "Video required" warning if no video uploaded
- YouTube tokens expire in 1 hour — auto-refreshed via `refreshToken` in post API
- TikTok uses Content Posting API with FILE_UPLOAD method (init → PUT binary)
- TikTok **unaudited apps** can only post as `SELF_ONLY` (private) — needs TikTok audit for public
- TikTok tokens expire in ~2 hours — auto-refreshed via `refreshToken`
- TikTok supports carousel (multiple images/videos) in preview
- Media uploads go directly from browser to Cloudinary (signed upload) — not through Next.js server
- Video download has **60s timeout** (`AbortSignal.timeout`) for both YouTube and TikTok

## Platform integration details

See `.claude/context/` for detailed API docs, OAuth flows, env vars, and design spec:

- [Facebook & Instagram](.claude/context/facebook-instagram-integration.md) — Meta Graph API, separate OAuth apps, container-based IG posting
- [YouTube](.claude/context/youtube-integration.md) — Google OAuth, resumable upload, Shorts support
- [TikTok](.claude/context/tiktok-integration.md) — Content Posting API, needs app audit
- [Supabase migration](.claude/context/supabase-migration.md) — PostgreSQL setup, connection pooling
- [Linear design system](.claude/context/design.md) — palette, typography (Inter cv01/ss03, weight 510), component rules

## Design tokens

- **Palette:** `#08090a` page bg, `#0f1011` sidebar, `#191a1b` card, `#5e6ad2` primary, `#7170ff` accent, `#8a8f98` muted text, semi-transparent white borders (`rgba(255,255,255,0.05)`–`0.08`)
- **Radius:** `--radius: 0.375rem` (6px) is the comfortable default
- **Typography:** Inter Variable with `font-feature-settings: "cv01", "ss03"` enabled globally. Signature weight is **510** — available as `font-ui` utility (and `font-ui-strong` for 590). Do not use `font-bold` (>700) in UI chrome.
- **Surfaces:** never solid muted on dark — use `bg-white/2` through `bg-white/6` for translucent layering. Hover states bump one step (e.g. `bg-white/4` → `bg-white/6`).

## Code style

- Prettier: no semicolons, double quotes, 2-space indent, trailing commas (es5)
- Tailwind CSS v4 with `cn()` utility from `lib/utils.ts`
- Use canonical Tailwind classes (e.g. `w-60` not `w-[240px]`, `bg-linear-to-tr` not `bg-gradient-to-tr`, `bg-white/4` not `bg-white/[0.04]`)
- Use `isVideoUrl()` from `lib/utils.ts` for video URL detection (not inline regex)
- Use `extractErrorMessage()` from `lib/utils.ts` for error handling in catch blocks
- Use `timeAgo()` from `lib/utils.ts` for relative time display
- Platform config from `lib/platforms.ts` — never hardcode platform arrays/limits in components; gate UI with `ACTIVE_PLATFORMS`
- All API routes validated with Zod schemas from `lib/validations.ts`
- `/api/post` fans out with `Promise.all` — keep new platforms following the same `(platformTasks.push(async () => ...))` pattern so they run concurrently
- Destructive actions (delete post, disconnect account) require AlertDialog confirmation
- Typography: use `…` not `...`, curly quotes, loading states end with `…`. Prefer `font-ui` / `font-ui-strong` over `font-medium`/`font-semibold` for UI text.
- Never use `transition-all` — list properties explicitly
- Decorative icons need `aria-hidden="true"`, icon-only buttons need `aria-label`
