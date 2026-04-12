# Facebook & Instagram Integration

## Status: ✅ Complete

Both use Meta Graph API but are **separate OAuth apps** with different endpoints.

---

## Facebook

### OAuth Flow

- Auth URL: `https://www.facebook.com/v21.0/dialog/oauth`
- Graph API: `https://graph.facebook.com/v21.0`
- Permissions: `pages_show_list`, `pages_manage_posts`, `pages_read_engagement`, `instagram_basic`, `instagram_content_publish`, `business_management`
- Token: short-lived → exchanged for **long-lived token** (~60 days)
- Posts via **Facebook Page** (not personal profile)
- Redirect: `/api/auth/facebook/callback`

### Posting Flow

- **Text only** — `POST /{page-id}/feed` with `message`
- **Image** — `POST /{page-id}/photos` with `url` + `message`
- **Video** — `POST /{page-id}/videos` with `file_url` + `description` (vertical = auto Reel)
- Uses JSON body with `access_token` in payload

### Env Vars

```
FACEBOOK_APP_ID=...
FACEBOOK_APP_SECRET=...
```

### Files

- `lib/facebook.ts` — OAuth + posting (text/image/video)
- `app/api/auth/facebook/route.ts` — auth redirect
- `app/api/auth/facebook/callback/route.ts` — callback + Page token storage
- `components/preview/facebook-preview.tsx` — post mockup with media grid

---

## Instagram

### OAuth Flow

- Auth URL: `https://www.instagram.com/oauth/authorize`
- Graph API: `https://graph.instagram.com` (v22.0)
- Scopes: `instagram_business_basic`, `instagram_business_content_publish`, `instagram_business_manage_messages`
- Token: short-lived → exchanged for **long-lived token** via `ig_exchange_token`
- Requires **Business or Creator** account
- Redirect: `/api/auth/instagram/callback`
- **Separate app** from Facebook (different App ID/Secret)

### Posting Flow

1. Create media container — `POST /{ig-user-id}/media` with `caption` + `image_url` or `video_url`
2. Wait for media ready — poll `GET /{container-id}?fields=status_code` with **exponential backoff** (2s→4s→8s, cap 16s)
3. Publish — `POST /{ig-user-id}/media_publish` with `creation_id`
- Uses **form-encoded** POST bodies (not JSON)
- All video uploads use `media_type=REELS` (VIDEO is deprecated)
- **Requires publicly accessible media URL** (hence Cloudinary)

### Env Vars

```
INSTAGRAM_APP_ID=...
INSTAGRAM_APP_SECRET=...
```

### Files

- `lib/instagram.ts` — OAuth + container-based posting with polling
- `app/api/auth/instagram/route.ts` — auth redirect
- `app/api/auth/instagram/callback/route.ts` — callback + token storage
- `components/preview/instagram-preview.tsx` — post mockup with carousel
