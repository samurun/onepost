# OnePost

Compose once, publish everywhere — Facebook, Instagram, YouTube, TikTok.

## Features

- Compose a single post and publish to multiple platforms simultaneously
- Live preview showing how your post will look on each platform
- Media upload via Cloudinary (required for Instagram API)
- Instagram carousel preview for multiple images
- OAuth integration for Facebook Pages and Instagram Business/Creator accounts
- Draft system — save posts and edit later
- Post history with status tracking
- Dark mode support

## Tech Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **UI:** React 19, Tailwind CSS v4, shadcn/ui
- **Database:** Prisma 7 + SQLite (libsql adapter)
- **Media:** Cloudinary
- **APIs:** Facebook Graph API v21.0, Instagram Graph API v22.0

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

See [docs/setup.md](docs/setup.md) for full setup instructions including Facebook App, Instagram App, and Cloudinary configuration.

## Project Structure

```
app/
  page.tsx                 — Compose page (main)
  accounts/page.tsx        — Connect/disconnect accounts
  posts/page.tsx           — Post history
  api/
    auth/facebook/         — Facebook OAuth flow
    auth/instagram/        — Instagram OAuth flow
    accounts/              — GET/DELETE connected accounts
    post/                  — Publish to platforms
    posts/                 — Post history CRUD
    drafts/                — Save/update drafts
    upload/                — Media upload (Cloudinary)

components/
  compose/                 — Platform selector, media upload, char counter
  compose-form.tsx         — Compose form assembly
  preview/                 — Facebook & Instagram post previews
  preview-panel.tsx        — Preview panel with tabs
  sidebar.tsx              — Navigation sidebar
  icons.tsx                — Custom platform SVG icons
  ui/                      — shadcn/ui primitives

lib/
  db.ts                    — Prisma client
  facebook.ts              — Facebook Graph API
  instagram.ts             — Instagram Graph API

types/
  index.ts                 — Shared TypeScript types
```

## License

Private
