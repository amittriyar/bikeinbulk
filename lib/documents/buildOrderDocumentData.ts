import { getDb } from "@/lib/db"

export async function buildOrderDocumentData(orderId: string) {

  const db = getDb()

  const order = await db.order.findFirst({
    where: { orderId }
  })

  if (!order) throw new Error("Order not found")

  // ✅ FIX 1: safe casting
  const orderItems = Array.isArray(order.items) ? order.items as any[] : []

  // ✅ FIX 2: flatten properly
  const items = orderItems.flatMap((i: any) =>
    (i.locations || []).map((l: any) => ({
      model: i.modelName,
      city: l.city,
      qty: Number(l.qty || 0),
      unitPrice: Number(l.quotedPrice || 0)
    }))
  )

  // ✅ FIX 3: typed reduce
  const total = items.reduce(
    (sum: number, i: any) => sum + (i.qty * i.unitPrice),
    0
  )

  return {
    invoiceNo: `PI-${order.orderId}`,
    rfqId: order.rfqId,
    orderId: order.orderId,

    seller: {
      name: order.sellerName,
      id: order.sellerId
    },

    buyer: {
      name: "Buyer Pvt Ltd",
      gst: "NA"
    },

    items,
    total,
    date: new Date().toLocaleDateString()
  }
}