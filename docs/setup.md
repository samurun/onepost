# OnePost — Setup Guide

## Prerequisites

- Node.js 18+
- pnpm
- A Facebook Page (for Facebook posting)
- An Instagram Business or Creator account (for Instagram posting)
- A YouTube channel (for YouTube posting)
- A Cloudinary account (for media hosting)

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
| `YOUTUBE_CLIENT_ID` | Google OAuth Client ID |
| `YOUTUBE_CLIENT_SECRET` | Google OAuth Client Secret |
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

### Instagram Video Notes

- Instagram deprecated `media_type=VIDEO` — all videos are posted as **Reels** automatically
- The Reel/Video toggle in the compose form only affects YouTube (Shorts vs regular video)

## 4. YouTube / Google Cloud Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com) and create a new project
2. Go to **APIs & Services > Library** → enable **YouTube Data API v3**
3. Go to **APIs & Services > Credentials** → **Create Credentials > OAuth client ID**
   - Application type: **Web application**
   - **Authorized JavaScript origins**: `https://localhost:3000`
   - **Authorized redirect URIs**: `https://localhost:3000/api/auth/youtube/callback`
4. Copy **Client ID** → `YOUTUBE_CLIENT_ID` and **Client Secret** → `YOUTUBE_CLIENT_SECRET`
5. Go to **APIs & Services > OAuth consent screen**:
   - Set up the consent screen (External)
   - Add scopes: `youtube.upload`, `youtube.readonly`, `userinfo.profile`
   - Add your Google account as a **Test user**

> Note: During development, Google shows an "unverified app" warning. Click **Advanced > Go to app (unsafe)** to continue. For production, submit the app for Google verification.

## 5. Cloudinary Setup

Instagram and YouTube APIs require media to be publicly accessible URLs. We use Cloudinary for this. Media files upload directly from the browser to Cloudinary using signed uploads (no server-side buffering, no timeout issues).

1. Sign up at [Cloudinary](https://cloudinary.com) (free tier: 25GB)
2. Go to **Dashboard** or **Settings > API Keys**
3. Copy:
   - **Cloud Name** → `CLOUDINARY_CLOUD_NAME`
   - **API Key** → `CLOUDINARY_API_KEY`
   - **API Secret** → `CLOUDINARY_API_SECRET`

## 6. Run

```bash
pnpm setup
```

This single command runs: `pnpm install` → `prisma generate` → `prisma db push` → `pnpm dev`

The first time, Next.js will generate a self-signed certificate for HTTPS (required by Instagram OAuth). You may be prompted for your system password.

## 7. Connect Accounts

1. Go to `https://localhost:3000/accounts`
2. Click **Connect Facebook** — log in and grant permissions to your Facebook Page
3. Click **Connect Instagram** — log in and authorize your Business/Creator account
4. Click **Connect YouTube** — log in with Google and authorize your YouTube channel
5. Go to **Compose** (`/`) — write your post, attach media, select platforms, and hit **Publish Now**

### Video Posting

- Upload a video file (MP4, MOV, etc.) in the compose form
- Choose **Reel** or **Video** mode using the toggle that appears
- **Instagram**: Always posted as Reels (Instagram deprecated regular video)
- **Facebook**: Video posts via `/{page-id}/videos` — vertical videos auto-display as Reels
- **YouTube**: Reel mode → Shorts (`#Shorts` appended to title), Video mode → regular upload
- YouTube has a separate **title field** that appears when YouTube is selected

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

### Instagram: "media_type VIDEO not supported"
- This is already handled — the app uses `media_type=REELS` for all video uploads

### Facebook: "Invalid redirect_uri"
- Make sure `https://localhost:3000/api/auth/facebook/callback` is added to **Valid OAuth Redirect URIs** in the Facebook Login settings

### YouTube: "access_denied" (Error 403)
- Add your Google account as a **Test user** in OAuth consent screen settings

### YouTube: "unverified app" warning
- Click **Advanced > Go to app (unsafe)** — this is normal during development

### YouTube: Token expired
- The app auto-refreshes YouTube tokens using the stored refresh token
- If refresh fails, reconnect YouTube from the Accounts page

### Database: "no such table"
- Run `npx prisma db push` to sync the schema
