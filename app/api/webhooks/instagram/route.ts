import { NextRequest, NextResponse } from "next/server"

const VERIFY_TOKEN = process.env.INSTAGRAM_WEBHOOK_VERIFY_TOKEN || "onepost_verify_token_2024"

// Webhook verification (GET)
export async function GET(req: NextRequest) {
  const mode = req.nextUrl.searchParams.get("hub.mode")
  const token = req.nextUrl.searchParams.get("hub.verify_token")
  const challenge = req.nextUrl.searchParams.get("hub.challenge")

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 })
  }

  return NextResponse.json({ error: "Forbidden" }, { status: 403 })
}

// Webhook events (POST)
export async function POST(req: NextRequest) {
  const body = await req.json()
  console.log("Instagram webhook event:", JSON.stringify(body, null, 2))
  return NextResponse.json({ received: true })
}
