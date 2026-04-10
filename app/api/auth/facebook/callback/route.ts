import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import {
  exchangeCodeForToken,
  getLongLivedToken,
  getUserPages,
  getInstagramAccounts,
} from "@/lib/facebook"

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code")
  const error = req.nextUrl.searchParams.get("error")

  if (error || !code) {
    return NextResponse.redirect(
      new URL("/accounts?error=auth_denied", req.url)
    )
  }

  try {
    // 1. Exchange code for short-lived token
    const { access_token: shortToken } = await exchangeCodeForToken(code)

    // 2. Get long-lived token
    const { access_token: longToken, expires_in } =
      await getLongLivedToken(shortToken)

    const tokenExpiry = expires_in
      ? new Date(Date.now() + expires_in * 1000)
      : new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) // fallback 60 days

    // 3. Get user's Facebook Pages
    const pages = await getUserPages(longToken)

    if (pages.length === 0) {
      return NextResponse.redirect(
        new URL("/accounts?error=no_pages", req.url)
      )
    }

    // 4. Save each page as a Facebook account + check for Instagram
    for (const page of pages) {
      // Save Facebook Page
      await prisma.account.upsert({
        where: {
          platform_platformId: {
            platform: "facebook",
            platformId: page.id,
          },
        },
        update: {
          name: page.name,
          accessToken: page.access_token,
          tokenExpiry,
          avatarUrl: page.picture?.data?.url,
        },
        create: {
          platform: "facebook",
          platformId: page.id,
          name: page.name,
          accessToken: page.access_token,
          tokenExpiry,
          avatarUrl: page.picture?.data?.url,
        },
      })

      // Check for linked Instagram Business Account
      const igAccount = await getInstagramAccounts(page.id, page.access_token)
      if (igAccount) {
        await prisma.account.upsert({
          where: {
            platform_platformId: {
              platform: "instagram",
              platformId: igAccount.id,
            },
          },
          update: {
            name: igAccount.username || igAccount.name || "Instagram",
            accessToken: page.access_token, // IG uses the Page token
            tokenExpiry,
            avatarUrl: igAccount.profile_picture_url,
          },
          create: {
            platform: "instagram",
            platformId: igAccount.id,
            name: igAccount.username || igAccount.name || "Instagram",
            accessToken: page.access_token,
            tokenExpiry,
            avatarUrl: igAccount.profile_picture_url,
          },
        })
      }
    }

    return NextResponse.redirect(new URL("/accounts?success=true", req.url))
  } catch (err) {
    console.error("Facebook OAuth error:", err)
    return NextResponse.redirect(
      new URL("/accounts?error=auth_failed", req.url)
    )
  }
}
