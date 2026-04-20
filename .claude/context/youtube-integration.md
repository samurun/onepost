# YouTube Integration

## Status: ✅ Complete

YouTube Data API v3 integration — upload videos (regular + Shorts) with resumable upload protocol.

## OAuth Flow

- Auth URL: `https://accounts.google.com/o/oauth2/auth`
- Token endpoint: `https://oauth2.googleapis.com/token`
- Scopes: `youtube.upload`, `youtube.readonly`, `userinfo.profile`
- Access type: `offline` with `prompt: consent` (forces refresh token)
- Token expiry: **1 hour** — auto-refreshed via `refreshToken` in post API
- Redirect: `/api/auth/youtube/callback`

## Upload Flow

1. Download video from Cloudinary URL (60s timeout)
2. Initiate resumable upload via `POST /upload/youtube/v3/videos?uploadType=resumable`
3. Upload binary via `PUT` to the returned `location` URL
4. Response contains video `id`

## Key Points

- **Video only** — YouTube only accepts video uploads, preview shows warning if no video
- **Shorts** — when Reel mode selected, `#Shorts` appended to title + `shorts.isShort` metadata
- **Privacy** — 3 levels: `public`, `unlisted`, `private`
- **Category** — hardcoded to `22` (People & Blogs)
- **Title** — separate input field in Platform Settings, max 100 chars
- **Description** — uses shared content/caption field

## Env Vars

```
YOUTUBE_CLIENT_ID=...
YOUTUBE_CLIENT_SECRET=...
```

## Files

- `lib/youtube.ts` — OAuth + resumable upload
- `app/api/auth/youtube/route.ts` — auth redirect
- `app/api/auth/youtube/callback/route.ts` — callback + token storage
- `components/preview/youtube-preview.tsx` — video-only preview
- `components/compose/settings/youtube-settings.tsx` — title + privacy
