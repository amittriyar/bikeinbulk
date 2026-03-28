import { getRFQById } from "@/lib/rfqStore"
import { getDb } from "@/lib/db"

export async function createOrderFromRFQ(rfqId: string, buyerId: string) {

  const db = getDb()

  const rfq = await getRFQById(rfqId)

  if (!rfq) throw new Error("RFQ not found")

  if (rfq.status === "CLOSED") {
    throw new Error("Order already placed")
  }

  const bids = (rfq.bids || []) as any[]

  if (!bids.length) throw new Error("No bids available")

  /* ===============================
     1️⃣ L1 SELECTION
  =============================== */

  const l1 = bids.sort((a, b) => a.totalValue - b.totalValue)[0]
  console.log("L1 BID:", JSON.stringify(l1, null, 2))
  /* ===============================
     2️⃣ PREVENT DUPLICATE ORDER
  =============================== */

  const existing = await db.order.findFirst({
    where: { rfqId }
  })

  if (existing) return existing

  /* ===============================
     3️⃣ NORMALIZE ITEMS (CRITICAL FIX)
  =============================== */

  const items = (l1.locationQuotes || []).map((mq: any) => {

    const totalQty = (mq.locations || []).reduce(
      (sum: number, loc: any) => sum + Number(loc.qty || 0),
      0
    );

    const unitPrice = mq.locations?.[0]?.quotedPrice || 0;

    const totalPrice = (mq.locations || []).reduce(
      (sum: number, loc: any) =>
        sum + (Number(loc.qty || 0) * Number(loc.quotedPrice || 0)),
      0
    );

    return {
      modelName: mq.modelName,

      // 🔥 FLATTENED STRUCTURE (IMPORTANT)
      requestedQty: totalQty,
      unitPrice: unitPrice,
      totalPrice: totalPrice,

      // keep raw for future (optional)
      locations: mq.locations
    };
  });

  /* ===============================
     4️⃣ CREATE ORDER
  =============================== */

  const order = await db.order.create({
  data: {
    orderId: `ORD-${Date.now()}`,
    buyerId,
    sellerId: l1.sellerId,
    sellerName: l1.sellerName,
    rfqId,
    bidId: l1.bidId,

    items,  // ✅ flattened items (fixed earlier)

    unitPrice: l1.totalValue,   // ✅ USE THIS

    status: "PLACED"
  }
})

  /* ===============================
     5️⃣ LOCK RFQ
  =============================== */

  await db.rFQ.update({
    where: { rfqId },
    data: { status: "CLOSED" }
  })

  return order
}