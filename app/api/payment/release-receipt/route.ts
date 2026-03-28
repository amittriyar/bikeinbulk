import { getDb } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const { orderId } = await req.json()

    if (!orderId) {
      return new Response("Missing orderId", { status: 400 })
    }

    const db = getDb()

    const existing = await db.order.findUnique({
      where: { orderId }
    })

    if (!existing) {
      return new Response("Order not found", { status: 404 })
    }

    // ✅ FORCE STRING (KEY FIX)
    const status = existing.paymentStatus as unknown as string

    /* ===============================
       VALIDATION
    =============================== */

    if (status === "RECEIPT_ISSUED") {
      return Response.json({
        message: "Receipt already released"
      })
    }

    if (status !== "SUBMITTED") {
      return new Response("Payment not submitted yet", { status: 400 })
    }

    /* ===============================
       UPDATE
    =============================== */

    const updated = await db.order.update({
      where: { orderId },
      data: {
        paymentStatus: "RECEIPT_ISSUED",
        status: "PAID"
      }
    })

    return Response.json({
      message: "Receipt released successfully",
      order: updated
    })

  } catch (err) {
    console.error("Release receipt error:", err)
    return new Response("Internal Server Error", { status: 500 })
  }
}