import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET() {
  const accounts = await prisma.account.findMany({
    select: {
      id: true,
      platform: true,
      name: true,
      platformId: true,
      avatarUrl: true,
      tokenExpiry: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(accounts)
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json()

  await prisma.account.delete({ where: { id } })

  return NextResponse.json({ success: true })
}
