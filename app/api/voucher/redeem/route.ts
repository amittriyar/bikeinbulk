import { getDb } from "@/lib/db"

export async function POST(req: Request) {
  const { voucherId, dealerId } = await req.json()
  try {
    const { voucherId } = await req.json()
    const db = getDb()

    const voucher = await db.voucher.findUnique({
      where: { voucherId }
    })

    if (!voucher) {
      return Response.json({
        success: false,
        message: "Invalid voucher"
      }, { status: 404 })
    }

    /* ===============================
       VALIDATIONS
    =============================== */

    if (voucher.status === "REDEEMED") {
      return Response.json({
        success: false,
        message: "Voucher already redeemed"
      }, { status: 400 })
    }

    if (voucher.status !== "ACTIVE") {
      return Response.json({
        success: false,
        message: "Voucher not active"
      }, { status: 400 })
    }

    if (voucher.expiryDate && new Date(voucher.expiryDate) < new Date()) {
      return Response.json({
        success: false,
        message: "Voucher expired"
      }, { status: 400 })
    }
    /* ===============================
       DEALER AUTH CHECK
    =============================== */

    if (!dealerId) {
      return Response.json({
        success: false,
        message: "Unauthorized"
      }, { status: 401 })
    }

    if (voucher.mappedResellerId !== dealerId) {
      return Response.json({
        success: false,
        message: "This voucher is not assigned to your dealership"
      }, { status: 403 })
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
    /* ===============================
       SAVE REDEMPTION RECORD
    =============================== */
    await db.redemption.create({
      data: {
        voucherId,
        amount: voucher.value,
        dealerId: voucher.mappedResellerId || "UNKNOWN",
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