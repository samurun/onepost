import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { postToFacebookPage } from "@/lib/facebook"
import { postToInstagram } from "@/lib/instagram"
import { uploadToYouTube, refreshYouTubeToken } from "@/lib/youtube"
import { uploadToTikTok, refreshTikTokToken } from "@/lib/tiktok"
import { extractErrorMessage } from "@/lib/utils"
import { createPostSchema } from "@/lib/validations"
import { getSessionUser } from "@/lib/supabase/server"

type PostResult = { success: boolean; error?: string; postId?: string }
type KeyedResult = [string, PostResult]

export async function POST(req: NextRequest) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const parsed = createPostSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues.map((i) => i.message).join(", ") },
      { status: 400 }
    )
  }

  const {
    content,
    platforms,
    mediaUrls,
    mediaTypes,
    videoMode,
    youtubeTitle,
    youtubeDescription,
    tiktokCaption,
    privacy,
    tiktokPrivacy,
  } = parsed.data
  const firstMediaType = mediaTypes?.[0] ?? "image"

  const hasAnyText =
    content || youtubeTitle || youtubeDescription || tiktokCaption
  if (!hasAnyText && (!mediaUrls || mediaUrls.length === 0)) {
    return NextResponse.json(
      { error: "Content or media is required" },
      { status: 400 }
    )
  }

  const settings = {
    youtubeTitle,
    youtubeDescription,
    tiktokCaption,
    videoMode,
    privacy,
    tiktokPrivacy,
  }

  // Create post record
  const post = await prisma.post.create({
    data: {
      userId: user.id,
      content: content || "",
      mediaUrls: mediaUrls ?? undefined,
      platforms,
      status: "draft",
      settings,
    },
  })

  // Wrap one platform's work so it always resolves to KeyedResult[]
  // (errors become failure results, not thrown rejections).
  const platformTasks: Promise<KeyedResult[]>[] = []

  if (platforms.includes("facebook")) {
    platformTasks.push(
      (async (): Promise<KeyedResult[]> => {
        const accounts = await prisma.account.findMany({
          where: { platform: "facebook", userId: user.id },
        })
        return Promise.all(
          accounts.map(async (account): Promise<KeyedResult> => {
            const key = `facebook_${account.platformId}`
            try {
              const result = await postToFacebookPage(
                account.platformId,
                account.accessToken,
                content,
                mediaUrls?.[0],
                firstMediaType
              )
              return [
                key,
                { success: true, postId: result.id || result.post_id },
              ]
            } catch (err) {
              return [key, { success: false, error: extractErrorMessage(err) }]
            }
          })
        )
      })()
    )
  }

  if (platforms.includes("instagram")) {
    if (!mediaUrls || mediaUrls.length === 0) {
      platformTasks.push(
        Promise.resolve([
          [
            "instagram",
            {
              success: false,
              error: "Instagram requires at least one image or video",
            },
          ],
        ])
      )
    } else {
      platformTasks.push(
        (async (): Promise<KeyedResult[]> => {
          const accounts = await prisma.account.findMany({
            where: { platform: "instagram", userId: user.id },
          })
          return Promise.all(
            accounts.map(async (account): Promise<KeyedResult> => {
              const key = `instagram_${account.platformId}`
              try {
                const result = await postToInstagram(
                  account.platformId,
                  account.accessToken,
                  content,
                  mediaUrls[0],
                  firstMediaType
                )
                return [key, { success: true, postId: result.id }]
              } catch (err) {
                return [
                  key,
                  { success: false, error: extractErrorMessage(err) },
                ]
              }
            })
          )
        })()
      )
    }
  }

  if (platforms.includes("youtube")) {
    const videoUrl = mediaUrls?.find((_, i) => mediaTypes?.[i] === "video")
    if (!videoUrl) {
      platformTasks.push(
        Promise.resolve([
          [
            "youtube",
            { success: false, error: "YouTube requires a video" },
          ],
        ])
      )
    } else {
      platformTasks.push(
        (async (): Promise<KeyedResult[]> => {
          const accounts = await prisma.account.findMany({
            where: { platform: "youtube", userId: user.id },
          })
          return Promise.all(
            accounts.map(async (account): Promise<KeyedResult> => {
              const key = `youtube_${account.platformId}`
              try {
                let accessToken = account.accessToken
                if (
                  account.tokenExpiry &&
                  new Date(account.tokenExpiry) < new Date()
                ) {
                  if (!account.refreshToken) {
                    throw new Error(
                      "YouTube token expired — please reconnect"
                    )
                  }
                  const refreshed = await refreshYouTubeToken(
                    account.refreshToken
                  )
                  accessToken = refreshed.access_token
                  await prisma.account.update({
                    where: { id: account.id },
                    data: {
                      accessToken,
                      tokenExpiry: new Date(
                        Date.now() + refreshed.expires_in * 1000
                      ),
                    },
                  })
                }

                const isShorts = videoMode === "reel"
                let title = youtubeTitle || "Untitled"
                if (isShorts && !title.includes("#Shorts")) {
                  title = `${title} #Shorts`
                }

                const result = await uploadToYouTube(
                  accessToken,
                  title,
                  youtubeDescription ?? "",
                  videoUrl,
                  privacy || "public",
                  isShorts
                )
                return [key, { success: true, postId: result.id }]
              } catch (err) {
                return [
                  key,
                  { success: false, error: extractErrorMessage(err) },
                ]
              }
            })
          )
        })()
      )
    }
  }

  if (platforms.includes("tiktok")) {
    const videoUrl = mediaUrls?.find((_, i) => mediaTypes?.[i] === "video")
    if (!videoUrl) {
      platformTasks.push(
        Promise.resolve([
          ["tiktok", { success: false, error: "TikTok requires a video" }],
        ])
      )
    } else {
      platformTasks.push(
        (async (): Promise<KeyedResult[]> => {
          const accounts = await prisma.account.findMany({
            where: { platform: "tiktok", userId: user.id },
          })
          return Promise.all(
            accounts.map(async (account): Promise<KeyedResult> => {
              const key = `tiktok_${account.platformId}`
              try {
                let accessToken = account.accessToken
                if (
                  account.tokenExpiry &&
                  new Date(account.tokenExpiry) < new Date()
                ) {
                  if (!account.refreshToken) {
                    throw new Error(
                      "TikTok token expired — please reconnect"
                    )
                  }
                  const refreshed = await refreshTikTokToken(
                    account.refreshToken
                  )
                  accessToken = refreshed.access_token
                  await prisma.account.update({
                    where: { id: account.id },
                    data: {
                      accessToken,
                      refreshToken: refreshed.refresh_token,
                      tokenExpiry: new Date(
                        Date.now() + refreshed.expires_in * 1000
                      ),
                    },
                  })
                }

                const result = await uploadToTikTok(
                  accessToken,
                  tiktokCaption || content || "Untitled",
                  videoUrl,
                  tiktokPrivacy || "SELF_ONLY"
                )
                return [key, { success: true, postId: result.publish_id }]
              } catch (err) {
                return [
                  key,
                  { success: false, error: extractErrorMessage(err) },
                ]
              }
            })
          )
        })()
      )
    }
  }

  // Fan out across all platforms + all accounts in parallel.
  const settled = await Promise.all(platformTasks)
  const results: Record<string, PostResult> = Object.fromEntries(settled.flat())

  const allSuccess = Object.values(results).every((r) => r.success)
  const anySuccess = Object.values(results).some((r) => r.success)

  await prisma.post.update({
    where: { id: post.id },
    data: {
      status: allSuccess ? "published" : anySuccess ? "partial" : "failed",
      results,
      publishedAt: anySuccess ? new Date() : null,
    },
  })

  return NextResponse.json({
    postId: post.id,
    results,
    status: allSuccess ? "published" : anySuccess ? "partial" : "failed",
  })
}
