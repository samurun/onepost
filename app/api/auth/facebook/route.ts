import { NextResponse } from "next/server"
import { getFacebookAuthUrl } from "@/lib/facebook"

export async function GET() {
  const url = getFacebookAuthUrl()
  return NextResponse.redirect(url)
}
