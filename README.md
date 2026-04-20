# OnePost

Compose once, publish everywhere — Facebook and Instagram (YouTube + TikTok integrated on the backend, UI coming soon).

## Features

- Compose a single post and publish to Facebook + Instagram in parallel
- Live preview showing how your post will look on each platform
- Media upload directly to Cloudinary from the browser (signed upload, no server timeout)
- Instagram carousel preview for multiple images
- OAuth integration for Facebook Pages and Instagram Business/Creator
- Draft system — save posts with media and edit later
- Per-platform publishing status with error details
- Post history with status tracking
- Linear-inspired dark UI (Inter Variable with `cv01`/`ss03` features)

YouTube (Data API v3, resumable upload, Shorts) and TikTok (Content Posting API) are wired end-to-end in `lib/` + `/api/post` and gated behind an `ACTIVE_PLATFORMS` whitelist in `lib/platforms.ts`.

## Tech Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **UI:** React 19, Tailwind CSS v4, shadcn/ui, Inter Variable
- **Database:** Prisma 7 + PostgreSQL (Supabase via `@prisma/adapter-pg`)
- **Media:** Cloudinary (signed client-side upload)
- **APIs:** Facebook Graph API v21.0, Instagram Graph API v22.0 (YouTube Data API v3, TikTok Content Posting API available)

## Quick Start

```bash
cp .env.example .env   # fill in your credentials
pnpm setup             # install, generate Prisma, push DB, start dev server
```

Open `https://localhost:3000`

## Scripts

| Script | Description |
|--------|-------------|
| `pnpm setup` | Install + generate + push DB + start dev |
| `pnpm dev` | Start dev server (HTTPS, Turbopack) |
| `pnpm build` | Production build |
| `pnpm lint` | ESLint |
| `pnpm format` | Prettier |
| `pnpm typecheck` | TypeScript check |

## Setup Guide

See [`.claude/context/`](.claude/context/) for platform integration details — Facebook & Instagram, YouTube, TikTok, Supabase migration.

## Project Structure

```
app/
  page.tsx                 — Compose page (main)
  accounts/page.tsx        — Connect/disconnect accounts
  posts/page.tsx           — Post history
  api/
    auth/facebook/         — Facebook OAuth flow
    auth/instagram/        — Instagram OAuth flow
    auth/youtube/          — YouTube/Google OAuth flow (gated in UI)
    auth/tiktok/           — TikTok OAuth flow (gated in UI)
    accounts/              — GET/DELETE connected accounts
    post/                  — Publish to platforms in parallel (Promise.all)
    posts/                 — Post history CRUD
    drafts/                — Save/update drafts
    upload/                — Cloudinary signed upload params

components/
  compose/                 — Platform selector, media upload, char counter
  compose-form.tsx         — Compose form (caption + media)
  preview/                 — Facebook, Instagram, YouTube, TikTok post previews
  preview-panel.tsx        — Preview panel with tabs
  sidebar.tsx              — Navigation sidebar
  icons.tsx                — Custom platform SVG icons
  ui/                      — shadcn/ui primitives

lib/
  db.ts                    — Prisma client
  platforms.ts             — PLATFORMS config + ACTIVE_PLATFORMS whitelist
  validations.ts           — Zod schemas for all API routes
  utils.ts                 — cn(), isVideoUrl(), timeAgo(), extractErrorMessage()
  facebook.ts              — Facebook Graph API (Pages)
  instagram.ts             — Instagram Graph API (Reels + images)
  youtube.ts               — YouTube Data API v3 (resumable upload)
  tiktok.ts                — TikTok Content Posting API

types/
  index.ts                 — Shared TypeScript types
```

## License

Private
