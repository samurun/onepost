import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

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
    const { id, content, platforms, mediaUrls } = (await req.json()) as {
      id?: string
      content: string
      platforms: string[]
      mediaUrls?: string[]
    }

    if (id) {
      const draft = await prisma.post.update({
        where: { id },
        data: {
          content,
          platforms: JSON.stringify(platforms),
          mediaUrls: mediaUrls ? JSON.stringify(mediaUrls) : null,
        },
      })
      return NextResponse.json(draft)
    }

    const draft = await prisma.post.create({
      data: {
        content,
        platforms: JSON.stringify(platforms),
        mediaUrls: mediaUrls ? JSON.stringify(mediaUrls) : null,
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
