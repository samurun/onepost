const GRAPH_API = "https://graph.instagram.com"

export function getInstagramAuthUrl() {
  const params = new URLSearchParams({
    client_id: process.env.INSTAGRAM_APP_ID!,
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/instagram/callback`,
    response_type: "code",
    scope: "instagram_business_basic,instagram_business_content_publish,instagram_business_manage_messages",
  })
  return `https://www.instagram.com/oauth/authorize?${params}`
}

export async function exchangeInstagramCode(code: string) {
  const body = new URLSearchParams({
    client_id: process.env.INSTAGRAM_APP_ID!,
    client_secret: process.env.INSTAGRAM_APP_SECRET!,
    grant_type: "authorization_code",
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/instagram/callback`,
    code,
  })

  const res = await fetch("https://api.instagram.com/oauth/access_token", {
    method: "POST",
    body,
  })

  if (!res.ok) {
    const error = await res.json()
    console.error("IG token exchange error:", error)
    throw new Error("Failed to exchange Instagram code")
  }

  return res.json() as Promise<{
    access_token: string
    user_id: number
  }>
}

export async function getInstagramLongLivedToken(shortToken: string) {
  const params = new URLSearchParams({
    grant_type: "ig_exchange_token",
    client_secret: process.env.INSTAGRAM_APP_SECRET!,
    access_token: shortToken,
  })

  const res = await fetch(`${GRAPH_API}/access_token?${params}`)

  if (!res.ok) throw new Error("Failed to get long-lived IG token")

  return res.json() as Promise<{
    access_token: string
    token_type: string
    expires_in: number
  }>
}

export async function getInstagramProfile(accessToken: string) {
  const params = new URLSearchParams({
    fields: "user_id,username,name,profile_picture_url,account_type",
    access_token: accessToken,
  })

  const res = await fetch(`${GRAPH_API}/v22.0/me?${params}`)

  if (!res.ok) throw new Error("Failed to get IG profile")

  return res.json() as Promise<{
    user_id: string
    username: string
    name?: string
    profile_picture_url?: string
    account_type: string
  }>
}

async function waitForMediaReady(
  containerId: string,
  accessToken: string,
  maxAttempts = 10
) {
  for (let i = 0; i < maxAttempts; i++) {
    const res = await fetch(
      `${GRAPH_API}/v22.0/${containerId}?fields=status_code&access_token=${accessToken}`
    )
    const data = await res.json()
    if (data.status_code === "FINISHED") return
    if (data.status_code === "ERROR") {
      throw new Error("Instagram media processing failed")
    }

    // Wait 2 seconds before checking again
    await new Promise((resolve) => setTimeout(resolve, 2000))
  }
  throw new Error("Instagram media processing timed out")
}

export async function postToInstagram(
  igUserId: string,
  accessToken: string,
  caption: string,
  mediaUrl: string,
  mediaType: "image" | "video" = "image"
) {
  // Step 1: Create media container
  const containerParams = new URLSearchParams({
    caption,
    access_token: accessToken,
  })

  if (mediaType === "video") {
    // Instagram deprecated media_type=VIDEO — all videos must use REELS
    containerParams.set("media_type", "REELS")
    containerParams.set("video_url", mediaUrl)
  } else {
    containerParams.set("image_url", mediaUrl)
  }

  const containerRes = await fetch(
    `${GRAPH_API}/v22.0/${igUserId}/media`,
    {
      method: "POST",
      body: containerParams,
    }
  )

  const containerData = await containerRes.json()
  if (!containerRes.ok || containerData.error) {
    console.error("IG media container error:", JSON.stringify(containerData))
    throw new Error(containerData.error?.message || "Failed to create IG media container")
  }

  const containerId = containerData.id

  // Step 2: Wait for media to be ready (videos/reels need more time)
  const isVideo = mediaType === "video"
  await waitForMediaReady(containerId, accessToken, isVideo ? 30 : 10)

  // Step 3: Publish
  const publishParams = new URLSearchParams({
    creation_id: containerId,
    access_token: accessToken,
  })

  const publishRes = await fetch(
    `${GRAPH_API}/v22.0/${igUserId}/media_publish`,
    {
      method: "POST",
      body: publishParams,
    }
  )

  const publishData = await publishRes.json()
  if (!publishRes.ok || publishData.error) {
    console.error("IG publish error:", JSON.stringify(publishData))
    throw new Error(publishData.error?.message || "Failed to publish to Instagram")
  }

  return publishData
}
