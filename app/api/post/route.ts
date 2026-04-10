import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { postToFacebookPage } from "@/lib/facebook"
import { postToInstagram } from "@/lib/instagram"
import { uploadToYouTube, refreshYouTubeToken } from "@/lib/youtube"

export async function POST(req: NextRequest) {
  const { content, platforms, mediaUrls, mediaTypes, videoMode, youtubeTitle } =
    (await req.json()) as {
      content: string
      platforms: string[] // ["facebook", "instagram", "youtube"]
      mediaUrls?: string[]
      mediaTypes?: ("image" | "video")[]
      videoMode?: "reel" | "video"
      youtubeTitle?: string
    }

  const firstMediaType = mediaTypes?.[0] ?? "image"

  if (!content && (!mediaUrls || mediaUrls.length === 0)) {
    return NextResponse.json(
      { error: "Content or media is required" },
      { status: 400 }
    )
  }

  if (!platforms || platforms.length === 0) {
    return NextResponse.json(
      { error: "At least one platform is required" },
      { status: 400 }
    )
  }

  // Create post record
  const post = await prisma.post.create({
    data: {
      content: content || "",
      mediaUrls: mediaUrls ? JSON.stringify(mediaUrls) : null,
      platforms: JSON.stringify(platforms),
      status: "draft",
    },
  })

  const results: Record<string, { success: boolean; error?: string; postId?: string }> = {}

  // Post to Facebook
  if (platforms.includes("facebook")) {
    const fbAccounts = await prisma.account.findMany({
      where: { platform: "facebook" },
    })

    for (const account of fbAccounts) {
      try {
        const result = await postToFacebookPage(
          account.platformId,
          account.accessToken,
          content,
          mediaUrls?.[0],
          firstMediaType
        )
        results[`facebook_${account.platformId}`] = {
          success: true,
          postId: result.id || result.post_id,
        }
      } catch (err) {
        results[`facebook_${account.platformId}`] = {
          success: false,
          error: err instanceof Error ? err.message : "Unknown error",
        }
      }
    }
  }

  // Post to Instagram
  if (platforms.includes("instagram")) {
    if (!mediaUrls || mediaUrls.length === 0) {
      results["instagram"] = {
        success: false,
        error: "Instagram requires at least one image or video",
      }
    } else {
      const igAccounts = await prisma.account.findMany({
        where: { platform: "instagram" },
      })

      for (const account of igAccounts) {
        try {
          const result = await postToInstagram(
            account.platformId,
            account.accessToken,
            content,
            mediaUrls[0],
            firstMediaType
          )
          results[`instagram_${account.platformId}`] = {
            success: true,
            postId: result.id,
          }
        } catch (err) {
          results[`instagram_${account.platformId}`] = {
            success: false,
            error: err instanceof Error ? err.message : "Unknown error",
          }
        }
      }
    }
  }

  // Post to YouTube
  if (platforms.includes("youtube")) {
    const videoUrl = mediaUrls?.find((_, i) => mediaTypes?.[i] === "video")
    if (!videoUrl) {
      results["youtube"] = {
        success: false,
        error: "YouTube requires a video",
      }
    } else {
      const ytAccounts = await prisma.account.findMany({
        where: { platform: "youtube" },
      })

      for (const account of ytAccounts) {
        try {
          // Refresh token if expired
          let accessToken = account.accessToken
          if (
            account.tokenExpiry &&
            new Date(account.tokenExpiry) < new Date()
          ) {
            if (!account.refreshToken) {
              throw new Error("YouTube token expired — please reconnect")
            }
            const refreshed = await refreshYouTubeToken(account.refreshToken)
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
            content,
            videoUrl,
            "public",
            isShorts
          )
          results[`youtube_${account.platformId}`] = {
            success: true,
            postId: result.id,
          }
        } catch (err) {
          results[`youtube_${account.platformId}`] = {
            success: false,
            error: err instanceof Error ? err.message : "Unknown error",
          }
        }
      }
    }
  }

  // Update post status
  const allSuccess = Object.values(results).every((r) => r.success)
  const anySuccess = Object.values(results).some((r) => r.success)

  await prisma.post.update({
    where: { id: post.id },
    data: {
      status: allSuccess ? "published" : anySuccess ? "partial" : "failed",
      results: JSON.stringify(results),
      publishedAt: anySuccess ? new Date() : null,
    },
  })

  return NextResponse.json({
    postId: post.id,
    results,
    status: allSuccess ? "published" : anySuccess ? "partial" : "failed",
  })
}
