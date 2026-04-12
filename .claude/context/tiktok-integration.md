# TikTok Integration — In Progress

## Status: 🚧 WIP

TikTok Content Posting API integration is partially complete. The code is written but **not yet tested end-to-end** because TikTok developer app audit is pending.

## What's Done

- `lib/tiktok.ts` — OAuth flow (auth URL, token exchange, refresh, user info, creator info, video upload)
- `app/api/auth/tiktok/` — auth redirect + callback routes
- `app/api/post/route.ts` — TikTok posting section with token refresh
- `components/preview/tiktok-preview.tsx` — TikTok-style vertical preview with carousel
- `components/compose/settings/tiktok-settings.tsx` — privacy level selector (4 options)
- Platform config, types, icons, validation schemas all include TikTok

## What Needs Testing / May Need Fixes

- **OAuth flow** — TikTok OAuth v2 endpoint URLs and parameter format may differ from docs
- **Token exchange** — response shape (`open_id` field) needs verification
- **Video upload** — FILE_UPLOAD method (init → PUT) untested; Content-Range header format may need adjustment
- **Creator info query** — response structure needs verification
- **Unaudited limitation** — all posts will be SELF_ONLY (private) until TikTok approves the app audit

## TikTok API Key Points

- Base URL: `https://open.tiktokapis.com/v2`
- Auth URL: `https://www.tiktok.com/v2/auth/authorize/`
- Scopes needed: `user.info.basic`, `video.publish`
- Rate limit: **6 requests/min** per user token
- Token expiry: ~2 hours (refresh token available)
- Privacy levels: `PUBLIC_TO_EVERYONE`, `MUTUAL_FOLLOW_FRIENDS`, `FOLLOWER_OF_CREATOR`, `SELF_ONLY`
- Unaudited apps: limited to 5 users/day, SELF_ONLY privacy only

## Env Vars

```
TIKTOK_CLIENT_KEY=...
TIKTOK_CLIENT_SECRET=...
```

Already present in `.env`.
