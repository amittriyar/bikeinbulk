import { getDb } from "@/lib/db"
import { generatePDF } from "@/lib/documents/generatePDF"
import { receiptHTML } from "@/lib/documents/templates/receipt"

function amountInWords(num: number) {
  // reuse your existing function here
  return num.toString()
}

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
/* ===============================
   🔥 FLATTEN ITEMS (MANDATORY)
=============================== */

const rawItems = (order.items ?? []) as any[]

let items: any[] = []

rawItems.forEach((model: any) => {
  const locations = model.locations || []

  locations.forEach((loc: any) => {

    const qty = Number(loc.qty || 0)
    const price = Number(loc.quotedPrice || loc.unitPrice || 0)

    items.push({
      model: model.modelName || model.model,
      city: loc.city || "-",
      qty,
      unitPrice: price
    })
  })
})

/* ===============================
   TOTAL CALCULATION
=============================== */

const total = items.reduce(
  (sum, item) => sum + item.qty * item.unitPrice,
  0
)
  const data = {
  receiptNo: `RCPT-${order.orderId}`,
  orderId: order.orderId,
  date: new Date().toLocaleDateString(),

  buyer: {
    name: order.buyerId || "Buyer"
  },

  seller: {
    name: order.sellerName || "Seller"
  },

  paymentRef: order.paymentRef || "NA",

  items,
  total
}

  const html = receiptHTML(data)
  const pdf = await generatePDF(html)

  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=receipt-${orderId}.pdf`
    }
  })
}