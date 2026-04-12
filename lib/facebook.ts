const GRAPH_API = "https://graph.facebook.com/v21.0"

export const FB_PERMISSIONS = [
  "pages_show_list",
  "pages_manage_posts",
  "pages_read_engagement",
  "instagram_basic",
  "instagram_content_publish",
  "business_management",
].join(",")

export function getFacebookAuthUrl() {
  const params = new URLSearchParams({
    client_id: process.env.FACEBOOK_APP_ID!,
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/facebook/callback`,
    scope: FB_PERMISSIONS,
    response_type: "code",
    state: crypto.randomUUID(),
  })
  return `https://www.facebook.com/v21.0/dialog/oauth?${params}`
}

export async function exchangeCodeForToken(code: string) {
  const params = new URLSearchParams({
    client_id: process.env.FACEBOOK_APP_ID!,
    client_secret: process.env.FACEBOOK_APP_SECRET!,
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/facebook/callback`,
    code,
  })

  const res = await fetch(`${GRAPH_API}/oauth/access_token?${params}`)
  if (!res.ok) throw new Error("Failed to exchange code for token")
  return res.json() as Promise<{
    access_token: string
    token_type: string
    expires_in: number
  }>
}

export async function getLongLivedToken(shortToken: string) {
  const params = new URLSearchParams({
    grant_type: "fb_exchange_token",
    client_id: process.env.FACEBOOK_APP_ID!,
    client_secret: process.env.FACEBOOK_APP_SECRET!,
    fb_exchange_token: shortToken,
  })

  const res = await fetch(`${GRAPH_API}/oauth/access_token?${params}`)
  if (!res.ok) throw new Error("Failed to get long-lived token")
  return res.json() as Promise<{
    access_token: string
    token_type: string
    expires_in: number
  }>
}

export async function getUserPages(accessToken: string) {
  const res = await fetch(
    `${GRAPH_API}/me/accounts?fields=id,name,access_token,picture&access_token=${accessToken}`
  )
  if (!res.ok) throw new Error("Failed to get pages")
  const data = await res.json()
  return data.data as Array<{
    id: string
    name: string
    access_token: string
    picture?: { data?: { url?: string } }
  }>
}

export async function getInstagramAccounts(
  pageId: string,
  pageAccessToken: string
) {
  const res = await fetch(
    `${GRAPH_API}/${pageId}?fields=instagram_business_account{id,name,username,profile_picture_url}&access_token=${pageAccessToken}`
  )
  if (!res.ok) return null
  const data = await res.json()
  return data.instagram_business_account as {
    id: string
    name?: string
    username?: string
    profile_picture_url?: string
  } | null
}

// --- Posting functions ---

export async function postToFacebookPage(
  pageId: string,
  pageAccessToken: string,
  message: string,
  mediaUrl?: string,
  mediaType: "image" | "video" = "image"
) {
  // Determine endpoint based on media type
  let endpoint: string
  let body: Record<string, string>

  if (mediaUrl && mediaType === "video") {
    // Video post — uses /videos endpoint with file_url
    // Facebook automatically displays vertical videos as Reels
    endpoint = `${GRAPH_API}/${pageId}/videos`
    body = {
      file_url: mediaUrl,
      description: message,
      access_token: pageAccessToken,
    }
  } else if (mediaUrl) {
    // Image post
    endpoint = `${GRAPH_API}/${pageId}/photos`
    body = { message, url: mediaUrl, access_token: pageAccessToken }
  } else {
    // Text-only post
    endpoint = `${GRAPH_API}/${pageId}/feed`
    body = { message, access_token: pageAccessToken }
  }

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error?.message || "Failed to post to Facebook")
  }
  return res.json()
}
