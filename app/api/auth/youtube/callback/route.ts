import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { exchangeYouTubeCode, getYouTubeChannel } from "@/lib/youtube"

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code")
  const error = req.nextUrl.searchParams.get("error")

  if (error || !code) {
    return NextResponse.redirect(
      new URL("/accounts?error=auth_denied", req.url)
    )
  }

  try {
    const { access_token, refresh_token, expires_in } =
      await exchangeYouTubeCode(code)

    const channel = await getYouTubeChannel(access_token)

    const tokenExpiry = expires_in
      ? new Date(Date.now() + expires_in * 1000)
      : new Date(Date.now() + 3600 * 1000) // fallback 1 hour

    await prisma.account.upsert({
      where: {
        platform_platformId: {
          platform: "youtube",
          platformId: channel.id,
        },
      },
      update: {
        name: channel.title,
        accessToken: access_token,
        refreshToken: refresh_token || undefined,
        tokenExpiry,
        avatarUrl: channel.thumbnailUrl,
      },
      create: {
        platform: "youtube",
        platformId: channel.id,
        name: channel.title,
        accessToken: access_token,
        refreshToken: refresh_token,
        tokenExpiry,
        avatarUrl: channel.thumbnailUrl,
      },
    })

    return NextResponse.redirect(new URL("/accounts?success=true", req.url))
  } catch (err) {
    console.error("YouTube OAuth error:", err)
    return NextResponse.redirect(
      new URL("/accounts?error=auth_failed", req.url)
    )
  }
}
