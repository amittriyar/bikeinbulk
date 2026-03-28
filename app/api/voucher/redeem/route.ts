import { getDb } from "@/lib/db"

export async function POST(req: Request) {

  try {
    const { voucherId } = await req.json()
    const db = getDb()

    const voucher = await db.voucher.findUnique({
      where: { voucherId }
    })

    if (!voucher) {
      return new Response("Invalid voucher", { status: 404 })
    }

    /* ===============================
       VALIDATIONS
    =============================== */

    if (voucher.status === "REDEEMED") {
      return new Response("Voucher already redeemed", { status: 400 })
    }

    if (voucher.status !== "ACTIVE") {
      return new Response("Voucher not active", { status: 400 })
    }

    if (voucher.expiryDate && new Date(voucher.expiryDate) < new Date()) {
      return new Response("Voucher expired", { status: 400 })
    }

    /* ===============================
       REDEEM
    =============================== */

    const updated = await db.voucher.update({
      where: { voucherId },
      data: {
        status: "REDEEMED",
        redeemedAt: new Date()
      }
    })

    return Response.json({
      success: true,
      message: "Voucher redeemed successfully",
      voucher: updated
    })

  } catch (e) {
    console.error(e)
    return new Response("Redemption failed", { status: 500 })
  }
}