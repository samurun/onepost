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

OnePost is a cross-platform social media posting app. Users compose a post once and publish it to Facebook and Instagram simultaneously.

**Stack:** Next.js 16 (App Router, Turbopack), React 19, Tailwind CSS v4, shadcn/ui, Prisma 7 (SQLite via libsql adapter), Cloudinary.

### Key data flow

1. User composes post in `app/page.tsx` (client component managing shared state)
2. Media files upload to Cloudinary via `POST /api/upload` → returns public URL
3. Post sent to `POST /api/post` which fans out to platform APIs in `lib/facebook.ts` and `lib/instagram.ts`
4. Instagram requires polling for media readiness before publishing (handled in `lib/instagram.ts`)
5. Posts can be saved as drafts via `POST /api/drafts` and edited later

### OAuth flows

- **Facebook:** `GET /api/auth/facebook` → Facebook OAuth → `/api/auth/facebook/callback` → stores Page tokens. Posts via Facebook Page (not personal profile). Uses Graph API v21.0.
- **Instagram:** `GET /api/auth/instagram` → Instagram OAuth → `/api/auth/instagram/callback` → stores user token. Separate app from Facebook. Uses Graph API v22.0. Requires Business/Creator account.

Both flows exchange short-lived tokens for long-lived tokens and store them in the `Account` table.

### Database

Prisma with SQLite (libsql adapter). Two models:
- `Account` — platform credentials (tokens, platform IDs). Unique on `[platform, platformId]`.
- `Post` — post history with JSON fields for `mediaUrls`, `platforms`, and `results`. Supports `draft`, `published`, `failed`, `scheduled` statuses.

Prisma client generated to `generated/prisma/` — import from `../generated/prisma/client` (not `@prisma/client`).

### Component structure

```
types/index.ts              — shared types (MediaFile, AccountInfo, PostResult)

components/
  compose/
    platform-selector.tsx   — platform pill buttons + config
    media-upload.tsx        — drag & drop + media grid
    char-counter.tsx        — circular progress + count
  compose-form.tsx          — assembles compose sub-components

  preview/
    facebook-preview.tsx    — FB post mockup
    instagram-preview.tsx   — IG post mockup + carousel
  preview-panel.tsx         — tabs + assembles previews

  sidebar.tsx               — nav sidebar with account status
  icons.tsx                 — custom Facebook/Instagram SVG icons (not in lucide-react)
  ui/                       — shadcn/ui primitives
```

### Platform-specific notes

- Instagram API **requires** a publicly accessible image URL (hence Cloudinary)
- Instagram API uses **form-encoded** POST bodies, not JSON
- Facebook API posts to Pages only, not personal profiles
- Facebook Login also grants access to linked Instagram Business accounts via `lib/facebook.ts`, but the app uses a separate Instagram OAuth flow via `lib/instagram.ts`

## Code style

- Prettier: no semicolons, double quotes, 2-space indent, trailing commas (es5)
- Tailwind CSS v4 with `cn()` utility from `lib/utils.ts`
- Use canonical Tailwind classes (e.g. `w-60` not `w-[240px]`, `bg-linear-to-tr` not `bg-gradient-to-tr`)
