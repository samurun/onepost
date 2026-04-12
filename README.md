# OnePost

Compose once, publish everywhere — Facebook, Instagram, YouTube.

## Features

- Compose a single post and publish to multiple platforms simultaneously
- **Reels / Shorts** — upload video and choose Reel or Video mode (YouTube Shorts, Instagram Reels)
- **YouTube title** — separate title field with live preview
- Live preview showing how your post will look on each platform
- Media upload directly to Cloudinary from the browser (signed upload, no server timeout)
- Instagram carousel preview for multiple images
- YouTube video upload with resumable upload API
- OAuth integration for Facebook Pages, Instagram Business/Creator, and YouTube
- Draft system — save posts with media and edit later
- Per-platform publishing status with error details
- Post history with status tracking
- Dark mode support

## Tech Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **UI:** React 19, Tailwind CSS v4, shadcn/ui
- **Database:** Prisma 7 + SQLite (libsql adapter)
- **Media:** Cloudinary (signed client-side upload)
- **APIs:** Facebook Graph API v21.0, Instagram Graph API v22.0, YouTube Data API v3

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

See [docs/setup.md](docs/setup.md) for full setup instructions including Facebook App, Instagram App, YouTube/Google Cloud, and Cloudinary configuration.

## Project Structure

```
app/
  page.tsx                 — Compose page (main)
  accounts/page.tsx        — Connect/disconnect accounts
  posts/page.tsx           — Post history
  api/
    auth/facebook/         — Facebook OAuth flow
    auth/instagram/        — Instagram OAuth flow
    auth/youtube/          — YouTube/Google OAuth flow
    accounts/              — GET/DELETE connected accounts
    post/                  — Publish to platforms
    posts/                 — Post history CRUD
    drafts/                — Save/update drafts
    upload/                — Cloudinary signed upload params

components/
  compose/                 — Platform selector, media upload, char counter
  compose-form.tsx         — Compose form + YouTube title + Reel/Video toggle
  preview/                 — Facebook, Instagram & YouTube post previews
  preview-panel.tsx        — Preview panel with tabs
  sidebar.tsx              — Navigation sidebar
  icons.tsx                — Custom platform SVG icons
  ui/                      — shadcn/ui primitives

lib/
  db.ts                    — Prisma client
  utils.ts                 — cn() + isVideoUrl() utilities
  facebook.ts              — Facebook Graph API (Pages)
  instagram.ts             — Instagram Graph API (Reels + images)
  youtube.ts               — YouTube Data API v3 (resumable upload)

types/
  index.ts                 — Shared TypeScript types
```

## License

Private
