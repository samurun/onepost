import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { exchangeTikTokCode, getTikTokUserInfo } from "@/lib/tiktok"

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code")
  const error = req.nextUrl.searchParams.get("error")

  if (error || !code) {
    return NextResponse.redirect(
      new URL("/accounts?error=auth_denied", req.url)
    )
  }

  try {
    const { access_token, refresh_token, expires_in, open_id } =
      await exchangeTikTokCode(code)

    const user = await getTikTokUserInfo(access_token)

    const tokenExpiry = expires_in
      ? new Date(Date.now() + expires_in * 1000)
      : new Date(Date.now() + 7200 * 1000) // fallback 2 hours

    await prisma.account.upsert({
      where: {
        platform_platformId: {
          platform: "tiktok",
          platformId: open_id,
        },
      },
      update: {
        name: user.displayName,
        accessToken: access_token,
        refreshToken: refresh_token || undefined,
        tokenExpiry,
        avatarUrl: user.avatarUrl,
      },
      create: {
        platform: "tiktok",
        platformId: open_id,
        name: user.displayName,
        accessToken: access_token,
        refreshToken: refresh_token,
        tokenExpiry,
        avatarUrl: user.avatarUrl,
      },
    })

    return NextResponse.redirect(new URL("/accounts?success=true", req.url))
  } catch (err) {
    console.error("TikTok OAuth error:", err)
    return NextResponse.redirect(
      new URL("/accounts?error=auth_failed", req.url)
    )
  }
}
