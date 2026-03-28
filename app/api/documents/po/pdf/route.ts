import { getDb } from "@/lib/db"
import { generatePDF } from "@/lib/documents/generatePDF"
import { poHTML } from "@/lib/documents/templates/po"

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
       2️⃣ PREPARE DATA (FINAL CLEAN)
    =============================== */

    // 🔥 Cast Prisma JSON safely
    const rawItems = (order.items ?? []) as any[]

    let items: any[] = []

    // 🔥 Flatten nested structure
    rawItems.forEach((model: any) => {
      const locations = model?.locations || []

      locations.forEach((loc: any) => {
        const qty = Number(loc?.qty ?? 0)
        const price = Number(loc?.quotedPrice ?? loc?.unitPrice ?? 0)

        items.push({
          model: model?.modelName || model?.model || "-",
          city: loc?.city || "-",
          qty,
          unitPrice: price
        })
      })
    })

    // 🔥 Safe total calculation
    const total = items.reduce(
      (sum, item) => sum + item.qty * item.unitPrice,
      0
    )

    // 🔥 Final data object
    const data = {
      poNo: order.orderId,
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
       3️⃣ GENERATE PDF
    =============================== */

    const html = poHTML(data)
    const pdf = await generatePDF(html)

    /* ===============================
       4️⃣ RETURN RESPONSE
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