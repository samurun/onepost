import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET() {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(posts)
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json()

  await prisma.post.delete({ where: { id } })

  return NextResponse.json({ success: true })
}
