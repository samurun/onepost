import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { deleteByIdSchema } from "@/lib/validations"
import { getSessionUser } from "@/lib/supabase/server"

export async function GET() {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const accounts = await prisma.account.findMany({
    where: { userId: user.id },
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
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const body = await req.json()
    const parsed = deleteByIdSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Valid ID is required" },
        { status: 400 }
      )
    }

    const result = await prisma.account.deleteMany({
      where: { id: parsed.data.id, userId: user.id },
    })
    if (result.count === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { error: "Failed to delete account" },
      { status: 500 }
    )
  }
}
