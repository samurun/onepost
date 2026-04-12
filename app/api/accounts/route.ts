import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { deleteByIdSchema } from "@/lib/validations"

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
  try {
    const body = await req.json()
    const parsed = deleteByIdSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Valid ID is required" },
        { status: 400 }
      )
    }

    await prisma.account.delete({ where: { id: parsed.data.id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { error: "Failed to delete account" },
      { status: 500 }
    )
  }
}
