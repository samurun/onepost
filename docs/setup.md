# OnePost — Setup Guide

## Prerequisites

- Node.js 18+
- pnpm
- A Facebook Page (for Facebook posting)
- An Instagram Business or Creator account (for Instagram posting)
- A Cloudinary account (for image hosting)

## Quick Start

```bash
cp .env.example .env   # then fill in your credentials
pnpm setup             # install, generate Prisma, push DB, start dev server
```

Open `https://localhost:3000`

## 1. Environment Variables

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | SQLite database path (default: `file:./dev.db`) |
| `FACEBOOK_APP_ID` | Facebook App ID |
| `FACEBOOK_APP_SECRET` | Facebook App Secret |
| `INSTAGRAM_APP_ID` | Instagram App ID |
| `INSTAGRAM_APP_SECRET` | Instagram App Secret |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `NEXT_PUBLIC_APP_URL` | App URL (default: `https://localhost:3000`) |

## 2. Facebook App Setup

1. Go to [Meta Developer Portal](https://developers.facebook.com) and create a new app
2. Add the **Facebook Login for Business** product
3. Go to **App Settings > Basic**:
   - Copy **App ID** → `FACEBOOK_APP_ID`
   - Click **Show** on App Secret → `FACEBOOK_APP_SECRET`
   - Add `localhost` to **App Domains**
   - Add a **Privacy Policy URL** (required for Live mode)
4. Go to **Facebook Login > Settings** (or **Use Cases > Customize > Settings**):
   - Add **Valid OAuth Redirect URI**:
     ```
     https://localhost:3000/api/auth/facebook/callback
     ```
5. Toggle the app to **Live** mode (top of the page)

### Required Facebook Permissions

The app requests these permissions during OAuth:

- `pages_show_list`
- `pages_manage_posts`
- `pages_read_engagement`
- `instagram_basic`
- `instagram_content_publish`
- `business_management`

> Note: For production use, these permissions require **App Review** by Meta.

## 3. Instagram App Setup

Instagram uses a **separate app** from Facebook on the Meta Developer Portal.

1. Go to [Meta Developer Portal](https://developers.facebook.com) and create a **new app** (not a Test App — Test Apps cannot go Live)
2. Add the **Instagram API with Instagram Login** product
3. Go to **App Settings > Basic**:
   - Copy **App ID** → `INSTAGRAM_APP_ID`
   - Click **Show** on App Secret → `INSTAGRAM_APP_SECRET`
   - Add a **Privacy Policy URL**
4. Go to **Use Cases > Customize** (Instagram API):
   - Add **Valid OAuth Redirect URI**:
     ```
     https://localhost:3000/api/auth/instagram/callback
     ```
5. Toggle the app to **Live** mode

### Instagram Account Requirements

- Your Instagram account **must be a Business or Creator account**
  - Instagram > Settings > Account type and tools > Switch to Professional account
- Add yourself as an **Instagram Tester**:
  1. App > **App Roles > Roles** > Add your Instagram account as Instagram Tester
  2. Go to Instagram > **Settings > Website Permissions > Tester Invites** > Accept the invitation
  3. Or visit: `https://www.instagram.com/accounts/manage_access/`

### Required Instagram Permissions

- `instagram_business_basic`
- `instagram_business_content_publish`
- `instagram_business_manage_messages`

## 4. Cloudinary Setup

Instagram API requires images to be publicly accessible URLs. We use Cloudinary for this.

1. Sign up at [Cloudinary](https://cloudinary.com) (free tier: 25GB)
2. Go to **Dashboard** or **Settings > API Keys**
3. Copy:
   - **Cloud Name** → `CLOUDINARY_CLOUD_NAME`
   - **API Key** → `CLOUDINARY_API_KEY`
   - **API Secret** → `CLOUDINARY_API_SECRET`

## 5. Run

```bash
pnpm setup
```

This single command runs: `pnpm install` → `prisma generate` → `prisma db push` → `pnpm dev`

The first time, Next.js will generate a self-signed certificate for HTTPS (required by Instagram OAuth). You may be prompted for your system password.

## 6. Connect Accounts

1. Go to `https://localhost:3000/accounts`
2. Click **Connect Facebook** — log in and grant permissions to your Facebook Page
3. Click **Connect Instagram** — log in and authorize your Business/Creator account
4. Go to **Compose** (`/`) — write your post, attach an image, select platforms, and hit **Publish Now**

## Available Scripts

| Script | Description |
|--------|-------------|
| `pnpm setup` | Install + generate + push DB + start dev server |
| `pnpm dev` | Start dev server (HTTPS, Turbopack) |
| `pnpm build` | Production build |
| `pnpm lint` | ESLint |
| `pnpm format` | Prettier |
| `pnpm typecheck` | TypeScript check |

## Troubleshooting

### Instagram: "An unexpected error has occurred"
- Make sure your Instagram account is a **Business or Creator** account
- Make sure the app is in **Live** mode (not Development)
- Make sure the app is **not a Test App**

### Instagram: "Media ID is not available"
- This is handled automatically — the app polls Instagram until the media is processed before publishing

### Instagram: "Insufficient Developer Role"
- Add yourself as an Instagram Tester in the app and **accept the invitation** from Instagram settings

### Facebook: "Invalid redirect_uri"
- Make sure `https://localhost:3000/api/auth/facebook/callback` is added to **Valid OAuth Redirect URIs** in the Facebook Login settings

### Database: "no such table"
- Run `npx prisma db push` to sync the schema
