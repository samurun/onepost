import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { postToFacebookPage } from "@/lib/facebook"
import { postToInstagram } from "@/lib/instagram"

export async function POST(req: NextRequest) {
  const { content, platforms, mediaUrls } = (await req.json()) as {
    content: string
    platforms: string[] // ["facebook", "instagram"]
    mediaUrls?: string[]
  }

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
          mediaUrls?.[0]
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
        error: "Instagram requires at least one image",
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
            mediaUrls[0]
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

  // Update post status
  const allSuccess = Object.values(results).every((r) => r.success)
  const anySuccess = Object.values(results).some((r) => r.success)

  await prisma.post.update({
    where: { id: post.id },
    data: {
      status: allSuccess ? "published" : anySuccess ? "published" : "failed",
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
