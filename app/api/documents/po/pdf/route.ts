import { getDb } from "@/lib/db"
import { generatePO } from "@/lib/documents/generatePO"

export const runtime = "nodejs"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const orderId = searchParams.get("orderId")

    if (!orderId) {
      return new Response("Missing orderId", { status: 400 })
    }

    const db = getDb()

    /* ===============================
       1️⃣ FETCH ORDER
    =============================== */

    const order = await db.order.findUnique({
      where: { orderId }
    })

    if (!order) {
      return new Response("Order not found", { status: 404 })
    }

    /* ===============================
       2️⃣ PREPARE DATA (SAME LOGIC)
    =============================== */

    const rawItems = (order.items ?? []) as any[]

    let items: any[] = []

    rawItems.forEach((model: any) => {
      const locations = model?.locations || []

      locations.forEach((loc: any) => {
        items.push({
          model: model?.modelName || model?.model || "-",
          city: loc?.city || "-",
          qty: Number(loc?.qty ?? 0),
          unitPrice: Number(loc?.quotedPrice ?? loc?.unitPrice ?? 0)
        })
      })
    })

    const total = items.reduce(
      (sum, item) => sum + item.qty * item.unitPrice,
      0
    )

    const data = {
      poNumber: order.orderId,   // 🔥 IMPORTANT CHANGE
      rfqId: order.rfqId,
      date: new Date(order.createdAt).toLocaleDateString("en-IN"),

      buyer: {
        name: order.buyerId
      },

      seller: {
        name: order.sellerName || "Seller"
      },

      items,
      total
    }

    /* ===============================
       3️⃣ GENERATE PDF (REACT PDF)
    =============================== */

    const pdf = await generatePO(data)

    /* ===============================
       4️⃣ RESPONSE
    =============================== */

    return new Response(Buffer.from(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=PO-${orderId}.pdf`
      }
    })

  } catch (e) {
    console.error("PO PDF error:", e)
    return new Response("Internal Server Error", { status: 500 })
  }
}