import { getDb } from "@/lib/db"

export async function GET() {
  const db = getDb()

  const data = await db.redemption.findMany({
    orderBy: { redeemedAt: "desc" }
  })

  return Response.json(data)
}