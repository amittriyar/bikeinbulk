import { getDb } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const db = getDb()

    const { voucherId, dealerId } = await req.json()

    /* ===============================
       VALIDATE INPUT
    =============================== */
    if (!voucherId || !dealerId) {
      return Response.json(
        { success: false, message: "Missing data" },
        { status: 400 }
      )
    }

    /* ===============================
       FETCH USER
    =============================== */
    const user = await db.user.findUnique({
      where: { userId: dealerId }
    })

    if (!user) {
      return Response.json(
        { success: false, message: "User not found" },
        { status: 404 }
      )
    }

    if (user.role !== "RESELLER") {
      return Response.json(
        { success: false, message: "Only resellers allowed" },
        { status: 403 }
      )
    }

    if (user.status !== "ACTIVE") {
      return Response.json(
        { success: false, message: "Reseller not approved" },
        { status: 403 }
      )
    }

    /* ===============================
       FETCH VOUCHER
    =============================== */
    const voucher = await db.voucher.findUnique({
      where: { voucherId }
    })

    if (!voucher) {
      return Response.json(
        { success: false, message: "Invalid voucher" },
        { status: 404 }
      )
    }

    /* ===============================
       VALIDATIONS
    =============================== */
    if (voucher.status === "REDEEMED") {
      return Response.json(
        { success: false, message: "Already redeemed" },
        { status: 400 }
      )
    }

    if (voucher.status !== "ACTIVE") {
      return Response.json(
        { success: false, message: "Voucher not active" },
        { status: 400 }
      )
    }

    if (voucher.expiryDate && new Date(voucher.expiryDate) < new Date()) {
      return Response.json(
        { success: false, message: "Voucher expired" },
        { status: 400 }
      )
    }

    /* ===============================
       OWNERSHIP CHECK 🔥
    =============================== */
    if (voucher.mappedResellerId !== dealerId) {
      return Response.json(
        { success: false, message: "Not your voucher" },
        { status: 403 }
      )
    }

    /* ===============================
       REDEEM (TRANSACTION)
    =============================== */
    const result = await db.$transaction(async (tx) => {

      const updatedVoucher = await tx.voucher.update({
        where: { voucherId },
        data: {
          status: "REDEEMED",
          redeemedAt: new Date()
        }
      })

      await tx.redemption.create({
        data: {
          voucherId,
          amount: voucher.value,
          dealerId,
          redeemedAt: new Date()
        }
      })

      return updatedVoucher
    })

    return Response.json({
      success: true,
      message: "Voucher redeemed successfully",
      voucher: result
    })

  } catch (e) {
    console.error(e)

    return Response.json(
      { success: false, message: "Redemption failed" },
      { status: 500 }
    )
  }
}