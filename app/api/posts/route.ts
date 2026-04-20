import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { deleteByIdSchema } from "@/lib/validations"

export async function GET() {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(posts)
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = deleteByIdSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Valid ID is required" },
        { status: 400 }
      )
    }

    await prisma.post.delete({ where: { id: parsed.data.id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { error: "Failed to delete post" },
      { status: 500 }
    )
  }
}
