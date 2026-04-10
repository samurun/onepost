const GOOGLE_AUTH = "https://accounts.google.com/o/oauth2"
const YOUTUBE_API = "https://www.googleapis.com/youtube/v3"
const GOOGLE_API = "https://www.googleapis.com/oauth2/v2"

const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/youtube/callback`

const SCOPES = [
  "https://www.googleapis.com/auth/youtube.upload",
  "https://www.googleapis.com/auth/youtube.readonly",
  "https://www.googleapis.com/auth/userinfo.profile",
].join(" ")

export function getYouTubeAuthUrl() {
  const params = new URLSearchParams({
    client_id: process.env.YOUTUBE_CLIENT_ID!,
    redirect_uri: REDIRECT_URI,
    response_type: "code",
    scope: SCOPES,
    access_type: "offline",
    prompt: "consent",
  })
  return `${GOOGLE_AUTH}/auth?${params}`
}

export async function exchangeYouTubeCode(code: string) {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.YOUTUBE_CLIENT_ID!,
      client_secret: process.env.YOUTUBE_CLIENT_SECRET!,
      redirect_uri: REDIRECT_URI,
      grant_type: "authorization_code",
      code,
    }),
  })

  if (!res.ok) {
    const error = await res.json()
    console.error("YouTube token exchange error:", error)
    throw new Error("Failed to exchange YouTube code")
  }

  return res.json() as Promise<{
    access_token: string
    refresh_token?: string
    expires_in: number
    token_type: string
  }>
}

export async function refreshYouTubeToken(refreshToken: string) {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.YOUTUBE_CLIENT_ID!,
      client_secret: process.env.YOUTUBE_CLIENT_SECRET!,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  })

  if (!res.ok) throw new Error("Failed to refresh YouTube token")

  return res.json() as Promise<{
    access_token: string
    expires_in: number
  }>
}

export async function getYouTubeChannel(accessToken: string) {
  const params = new URLSearchParams({
    part: "snippet",
    mine: "true",
  })

  const res = await fetch(`${YOUTUBE_API}/channels?${params}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (!res.ok) throw new Error("Failed to get YouTube channel")

  const data = await res.json()
  const channel = data.items?.[0]

  if (!channel) throw new Error("No YouTube channel found")

  return {
    id: channel.id as string,
    title: channel.snippet.title as string,
    thumbnailUrl: channel.snippet.thumbnails?.default?.url as string | undefined,
  }
}

export async function uploadToYouTube(
  accessToken: string,
  title: string,
  description: string,
  videoUrl: string,
  privacyStatus: "public" | "unlisted" | "private" = "public",
  isShorts = false
) {
  // Download video from Cloudinary URL
  const videoRes = await fetch(videoUrl)
  if (!videoRes.ok) throw new Error("Failed to fetch video from URL")
  const videoBlob = await videoRes.blob()

  // YouTube resumable upload — Step 1: initiate
  const metadata: Record<string, unknown> = {
    snippet: {
      title: title || "Untitled",
      description,
      categoryId: "22", // People & Blogs
    },
    status: {
      privacyStatus,
      selfDeclaredMadeForKids: false,
      ...(isShorts && { shorts: { isShort: true } }),
    },
  }

  const initRes = await fetch(
    "https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json; charset=UTF-8",
        "X-Upload-Content-Length": String(videoBlob.size),
        "X-Upload-Content-Type": videoBlob.type || "video/mp4",
      },
      body: JSON.stringify(metadata),
    }
  )

  if (!initRes.ok) {
    const error = await initRes.json()
    console.error("YouTube upload init error:", error)
    throw new Error(
      error.error?.message || "Failed to initiate YouTube upload"
    )
  }

  const uploadUrl = initRes.headers.get("location")
  if (!uploadUrl) throw new Error("No upload URL returned from YouTube")

  // Step 2: upload the video
  const uploadRes = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": videoBlob.type || "video/mp4",
      "Content-Length": String(videoBlob.size),
    },
    body: videoBlob,
  })

  if (!uploadRes.ok) {
    const error = await uploadRes.json()
    console.error("YouTube upload error:", error)
    throw new Error(error.error?.message || "Failed to upload video to YouTube")
  }

  return uploadRes.json() as Promise<{
    id: string
    snippet: { title: string }
  }>
}
