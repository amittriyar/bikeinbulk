import { getDb } from "@/lib/db"

export async function POST(req: Request) {

  try {
    const body = await req.json()

    const { orderId, paymentRef, amount, paymentDate } = body

    /* ===============================
       VALIDATION
    =============================== */

    if (!orderId) {
      return new Response("Missing orderId", { status: 400 })
    }

    if (!paymentRef) {
      return new Response("Missing paymentRef", { status: 400 })
    }

    if (!amount) {
      return new Response("Missing amount", { status: 400 })
    }

    const db = getDb()

    /* ===============================
       CHECK ORDER EXISTS
    =============================== */

    const existing = await db.order.findUnique({
      where: { orderId }
    })

    if (!existing) {
      return new Response("Order not found", { status: 404 })
    }

    /* ===============================
       🔥 STRICT PROFORMA VALIDATION
    =============================== */

    if (Number(amount) !== Number(existing.unitPrice)) {
      return new Response(
        "Amount must match Proforma exactly",
        { status: 400 }
      )
    }

    /* ===============================
       IDEMPOTENCY CHECK
    =============================== */

    if (
      existing.paymentStatus === "SUBMITTED" ||
      existing.paymentStatus === "RECEIPT_ISSUED"
    ) {
      return Response.json({
        message: "Payment already submitted",
        order: existing
      })
    }

    /* ===============================
       UPDATE ORDER
    =============================== */

    const order = await db.order.update({
      where: { orderId },
      data: {
        paymentStatus: "SUBMITTED",
        paymentRef,
        paymentDate: paymentDate
          ? new Date(paymentDate)
          : new Date(),

        amountPaid: Number(amount),   // ✅ store actual payment

        status: "PLACED" // keep order lifecycle unchanged
      }
    })

    /* ===============================
       SUCCESS RESPONSE
    =============================== */

    return Response.json({
      message: "Payment submitted, waiting for seller approval",
      order
    })

  } catch (e) {
    console.error("Payment error:", e)
    return new Response("Payment failed", { status: 500 })
  }
}