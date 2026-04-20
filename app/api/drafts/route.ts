import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { saveDraftSchema } from "@/lib/validations"
import { getSessionUser } from "@/lib/supabase/server"

export async function GET() {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const drafts = await prisma.post.findMany({
      where: { status: "draft", userId: user.id },
      orderBy: { updatedAt: "desc" },
    })
    return NextResponse.json(drafts)
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch drafts" },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const body = await req.json()
    const parsed = saveDraftSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues.map((i) => i.message).join(", ") },
        { status: 400 }
      )
    }

    const {
      id,
      content,
      platforms,
      mediaUrls,
      youtubeTitle,
      youtubeDescription,
      tiktokCaption,
      videoMode,
      privacy,
      tiktokPrivacy,
    } = parsed.data

    const settings = {
      youtubeTitle,
      youtubeDescription,
      tiktokCaption,
      videoMode,
      privacy,
      tiktokPrivacy,
    }

    if (id) {
      // updateMany ensures we only update drafts owned by the caller.
      const result = await prisma.post.updateMany({
        where: { id, userId: user.id },
        data: {
          content,
          platforms,
          mediaUrls: mediaUrls ?? undefined,
          settings,
        },
      })
      if (result.count === 0) {
        return NextResponse.json({ error: "Not found" }, { status: 404 })
      }
      const draft = await prisma.post.findUnique({ where: { id } })
      return NextResponse.json(draft)
    }

    const draft = await prisma.post.create({
      data: {
        userId: user.id,
        content,
        platforms,
        mediaUrls: mediaUrls ?? undefined,
        status: "draft",
        settings,
      },
    })

    return NextResponse.json(draft)
  } catch (err) {
    console.error("[drafts] save error:", err)
    return NextResponse.json(
      { error: "Failed to save draft" },
      { status: 500 }
    )
  }
}
