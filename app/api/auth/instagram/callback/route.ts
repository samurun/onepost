import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import {
  exchangeInstagramCode,
  getInstagramLongLivedToken,
  getInstagramProfile,
} from "@/lib/instagram"
import { getSessionUser } from "@/lib/supabase/server"

export async function GET(req: NextRequest) {
  const user = await getSessionUser()
  if (!user) {
    return NextResponse.redirect(
      new URL("/sign-in?next=/accounts", req.url)
    )
  }

  const code = req.nextUrl.searchParams.get("code")
  const error = req.nextUrl.searchParams.get("error")

  if (error || !code) {
    return NextResponse.redirect(
      new URL("/accounts?error=auth_denied", req.url)
    )
  }

  try {
    // 1. Exchange code for short-lived token
    const { access_token: shortToken } = await exchangeInstagramCode(code)

    // 2. Get long-lived token
    const { access_token: longToken, expires_in } =
      await getInstagramLongLivedToken(shortToken)

    // 3. Get profile info — use this ID for API calls
    const profile = await getInstagramProfile(longToken)
    const igUserId = profile.user_id

    // 4. Save account (use profile user_id, not token exchange user_id)
    await prisma.account.upsert({
      where: {
        userId_platform_platformId: {
          userId: user.id,
          platform: "instagram",
          platformId: igUserId,
        },
      },
      update: {
        name: profile.username || profile.name || "Instagram",
        accessToken: longToken,
        tokenExpiry: new Date(Date.now() + expires_in * 1000),
        avatarUrl: profile.profile_picture_url || null,
      },
      create: {
        userId: user.id,
        platform: "instagram",
        platformId: igUserId,
        name: profile.username || profile.name || "Instagram",
        accessToken: longToken,
        tokenExpiry: new Date(Date.now() + expires_in * 1000),
        avatarUrl: profile.profile_picture_url || null,
      },
    })

    return NextResponse.redirect(new URL("/accounts?success=true", req.url))
  } catch (err) {
    console.error("Instagram OAuth error:", err)
    return NextResponse.redirect(
      new URL("/accounts?error=auth_failed", req.url)
    )
  }
}
