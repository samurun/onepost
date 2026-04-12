import { NextResponse } from "next/server"
import { getTikTokAuthUrl } from "@/lib/tiktok"

export async function GET() {
  const url = getTikTokAuthUrl()
  return NextResponse.redirect(url)
}
