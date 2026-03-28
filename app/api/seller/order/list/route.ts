import { NextResponse } from "next/server"
import { getDb } from "@/lib/db"

export async function GET(req: Request) {

  const { searchParams } = new URL(req.url)
  const sellerId = searchParams.get("sellerId")
  const rfqId = searchParams.get("rfqId")

  const db = getDb()

  let where: any = {}

  if (sellerId) {
    where.sellerId = sellerId
  }

  if (rfqId) {
    where.rfqId = rfqId
  }

  const orders = await db.order.findMany({
    where,

    // ✅ VERY IMPORTANT — include all fields used in UI
    select: {
      orderId: true,
      buyerId: true,
      sellerId: true,
      sellerName: true,
      rfqId: true,

      items: true,

      unitPrice: true,
      amountPaid: true,

      paymentStatus: true,
      paymentRef: true,
      paymentDate: true,

      status: true,
      deliveryTimeline: true,
    }
  })

  return NextResponse.json(orders)
}