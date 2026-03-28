import { getDb } from "@/lib/db"

export async function POST(req: Request) {

  const { orderId } = await req.json()
  const db = getDb()

  const order = await db.order.update({
    where: { orderId },
    data: {
      paymentStatus: "RECEIPT_ISSUED",
      status: "PAID"
    }
  })

  return Response.json(order)
}