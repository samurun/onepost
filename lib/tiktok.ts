const TIKTOK_AUTH = "https://www.tiktok.com/v2/auth"
const TIKTOK_API = "https://open.tiktokapis.com/v2"

const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/tiktok/callback`

export function getTikTokAuthUrl() {
  const params = new URLSearchParams({
    client_key: process.env.TIKTOK_CLIENT_KEY!,
    redirect_uri: REDIRECT_URI,
    response_type: "code",
    scope: "user.info.basic,video.publish",
    state: crypto.randomUUID(),
  })
  return `${TIKTOK_AUTH}/authorize/?${params}`
}

export async function exchangeTikTokCode(code: string) {
  const res = await fetch(`${TIKTOK_API}/oauth/token/`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_key: process.env.TIKTOK_CLIENT_KEY!,
      client_secret: process.env.TIKTOK_CLIENT_SECRET!,
      code,
      grant_type: "authorization_code",
      redirect_uri: REDIRECT_URI,
    }),
  })

  if (!res.ok) {
    const error = await res.json()
    console.error("TikTok token exchange error:", error)
    throw new Error("TikTok: failed to exchange code for token")
  }

  return res.json() as Promise<{
    access_token: string
    expires_in: number
    open_id: string
    refresh_token: string
    refresh_expires_in: number
    token_type: string
  }>
}

export async function refreshTikTokToken(refreshToken: string) {
  const res = await fetch(`${TIKTOK_API}/oauth/token/`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_key: process.env.TIKTOK_CLIENT_KEY!,
      client_secret: process.env.TIKTOK_CLIENT_SECRET!,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  })

  if (!res.ok) throw new Error("TikTok: failed to refresh token")

  return res.json() as Promise<{
    access_token: string
    expires_in: number
    refresh_token: string
    open_id: string
  }>
}

export async function getTikTokUserInfo(accessToken: string) {
  const res = await fetch(
    `${TIKTOK_API}/user/info/?fields=open_id,display_name,avatar_url`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  )

  if (!res.ok) throw new Error("TikTok: failed to get user info")

  const data = await res.json()
  const user = data.data?.user

  if (!user) throw new Error("TikTok: no user data returned")

  return {
    openId: user.open_id as string,
    displayName: user.display_name as string,
    avatarUrl: user.avatar_url as string | undefined,
  }
}

export async function getCreatorInfo(accessToken: string) {
  const res = await fetch(
    `${TIKTOK_API}/post/publish/creator_info/query/`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json; charset=UTF-8",
      },
    }
  )

  if (!res.ok) throw new Error("TikTok: failed to get creator info")

  const data = await res.json()
  return data.data as {
    creator_avatar_url: string
    creator_username: string
    creator_nickname: string
    privacy_level_options: string[]
    comment_disabled: boolean
    duet_disabled: boolean
    stitch_disabled: boolean
    max_video_post_duration_sec: number
  }
}

type TikTokPrivacy =
  | "PUBLIC_TO_EVERYONE"
  | "MUTUAL_FOLLOW_FRIENDS"
  | "FOLLOWER_OF_CREATOR"
  | "SELF_ONLY"

export async function uploadToTikTok(
  accessToken: string,
  title: string,
  videoUrl: string,
  privacyLevel: TikTokPrivacy = "SELF_ONLY",
  options?: {
    disableComment?: boolean
    disableDuet?: boolean
    disableStitch?: boolean
  }
) {
  // Download video from Cloudinary (60s timeout)
  const videoRes = await fetch(videoUrl, {
    signal: AbortSignal.timeout(60_000),
  })
  if (!videoRes.ok) throw new Error("TikTok: failed to download video from URL")
  const videoBlob = await videoRes.blob()
  if (videoBlob.size === 0) throw new Error("TikTok: downloaded video is empty")

  // Step 1: Initialize upload
  const initRes = await fetch(
    `${TIKTOK_API}/post/publish/video/init/`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json; charset=UTF-8",
      },
      body: JSON.stringify({
        post_info: {
          title,
          privacy_level: privacyLevel,
          disable_comment: options?.disableComment ?? false,
          disable_duet: options?.disableDuet ?? false,
          disable_stitch: options?.disableStitch ?? false,
        },
        source_info: {
          source: "FILE_UPLOAD",
          video_size: videoBlob.size,
          chunk_size: videoBlob.size,
          total_chunk_count: 1,
        },
      }),
    }
  )

  if (!initRes.ok) {
    const error = await initRes.json()
    console.error("TikTok upload init error:", error)
    throw new Error(
      error.error?.message || "TikTok: failed to initialize upload"
    )
  }

  const initData = await initRes.json()
  const uploadUrl = initData.data?.upload_url

  if (!uploadUrl) throw new Error("TikTok: no upload URL returned")

  // Step 2: Upload video
  const uploadRes = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": videoBlob.type || "video/mp4",
      "Content-Range": `bytes 0-${videoBlob.size - 1}/${videoBlob.size}`,
    },
    body: videoBlob,
  })

  if (!uploadRes.ok) {
    const error = await uploadRes.text()
    console.error("TikTok upload error:", error)
    throw new Error("TikTok: failed to upload video")
  }

  return {
    publish_id: initData.data?.publish_id as string,
  }
}
