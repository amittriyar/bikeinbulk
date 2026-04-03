import { getDb } from "@/lib/db"
import { generateReceipt } from "@/lib/documents/generateReceipt"

export const runtime = "nodejs"

export async function GET(req: Request) {

  const { searchParams } = new URL(req.url)
  const orderId = searchParams.get("orderId")

  if (!orderId) {
    return new Response("Missing orderId", { status: 400 })
  }

  const db = getDb()

  const order = await db.order.findUnique({
    where: { orderId }
  })

  if (!order) {
    return new Response("Order not found", { status: 404 })
  }

  if (order.paymentStatus !== "RECEIPT_ISSUED") {
    return new Response("Receipt not released yet", { status: 403 })
  }

  const rawItems = (order.items ?? []) as any[]

  let items: any[] = []

  rawItems.forEach((model: any) => {
    const locations = model.locations || []

    locations.forEach((loc: any) => {
      items.push({
        model: model.modelName || model.model,
        city: loc.city || "-",
        qty: Number(loc.qty || 0),
        unitPrice: Number(loc.quotedPrice || loc.unitPrice || 0)
      })
    })
  })

  const total = items.reduce(
    (sum, item) => sum + item.qty * item.unitPrice,
    0
  )

  const data = {
    receiptNo: `RCPT-${order.orderId}`,
    orderId: order.orderId,
    date: new Date().toLocaleDateString(),

    buyer: { name: order.buyerId || "Buyer" },
    seller: { name: order.sellerName || "Seller" },

    paymentRef: order.paymentRef || "NA",
    items,
    total
  }

  const pdf = await generateReceipt(data)

  return new Response(Buffer.from(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=receipt-${orderId}.pdf`
    }
  })
}