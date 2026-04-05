import { NextResponse } from "next/server"
import { getDb } from "@/lib/db"

export async function POST(req: Request) {
  const db = getDb()
  const body = await req.json()

  const { userId, action } = body

  if (!userId || !action) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 })
  }

  let status = action === "APPROVE" ? "ACTIVE" : "REJECTED"

  await db.user.update({
    where: { userId },
    data: { status }
  })

  return NextResponse.json({ success: true })
}