import { getDb } from "@/lib/db"
import { getRFQById } from "@/lib/rfqStore"

export async function buildDocumentData(
  id: string,
  type: "quotation" | "po" | "proforma"
) {

  const db = getDb()

  /* ===============================
     1️⃣ CHECK ORDER (FOR PO + PROFORMA)
  =============================== */

  const order = await db.order.findFirst({
    where: {
      OR: [
        { rfqId: id },
        { orderId: id }
      ]
    }
  })

  /* ===============================
     CASE 1 → ORDER EXISTS
  =============================== */

  if (order) {

 let items: any[] = []

if (type === "proforma") {

  const orderItems: any[] = Array.isArray(order.items)
    ? order.items
    : []

  items = orderItems.flatMap((i: any) =>
    (i.locations || []).map((l: any) => ({
      model: i.modelName,
      city: l.city,
      qty: Number(l.qty || 0),
      unitPrice: Number(l.quotedPrice || 0)
    }))
  )

} else {
  items = Array.isArray(order.items) ? order.items : []
}

  const total = items.reduce(
    (sum: number, i: any) =>
      sum + (i.qty * (i.unitPrice || 0)),
    0
  )

  return {
    invoiceNo: `PI-${order.orderId}`,
    rfqId: order.rfqId,
    orderId: order.orderId,

    seller: {
      name: order.sellerName,
      id: order.sellerId,
      gst: "NA"
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

  /* ===============================
     CASE 2 → RFQ FLOW (QUOTATION)
  =============================== */

  const rfq = await getRFQById(id)

  if (!rfq) throw new Error("RFQ not found")

  const bids = (rfq.bids || []) as any[]

  if (!bids.length) throw new Error("No bids")

  const l1 = bids.sort((a, b) => a.totalValue - b.totalValue)[0]

  return {
    rfqId: id,

    seller: {
      name: l1.sellerName,
      id: l1.sellerId,
      gst: "NA"
    },

    buyer: {
      name: "Buyer Pvt Ltd",
      gst: "NA"
    },

    items: l1.locationQuotes,   // 🔥 unchanged for quotation
    total: l1.totalValue,
    date: new Date().toLocaleDateString()
  }
}