import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { saveDraftSchema } from "@/lib/validations"

export async function GET() {
  try {
    const drafts = await prisma.post.findMany({
      where: { status: "draft" },
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
  try {
    const body = await req.json()
    const parsed = saveDraftSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues.map((i) => i.message).join(", ") },
        { status: 400 }
      )
    }

    const { id, content, platforms, mediaUrls } = parsed.data

    if (id) {
      const draft = await prisma.post.update({
        where: { id },
        data: {
          content,
          platforms,
          mediaUrls: mediaUrls ?? undefined,
        },
      })
      return NextResponse.json(draft)
    }

    const draft = await prisma.post.create({
      data: {
        content,
        platforms,
        mediaUrls: mediaUrls ?? undefined,
        status: "draft",
      },
    })

    return NextResponse.json(draft)
  } catch {
    return NextResponse.json(
      { error: "Failed to save draft" },
      { status: 500 }
    )
  }
}
