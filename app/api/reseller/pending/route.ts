import { NextResponse } from "next/server"
import { getDb } from "@/lib/db"

export async function GET() {
  const db = getDb()

  const resellers = await db.user.findMany({
    where: {
      role: "RESELLER",
      status: "PENDING"
    }
  })

  return NextResponse.json(resellers)
}