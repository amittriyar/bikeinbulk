import { getDb } from "@/lib/db"
import { generateVoucher } from "@/lib/documents/generateVoucher"
import QRCode from "qrcode"

export const runtime = "nodejs"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const voucherId = searchParams.get("voucherId")

    if (!voucherId) {
      return new Response("Missing voucherId", { status: 400 })
    }

    const db = getDb()

    const voucher = await db.voucher.findUnique({
      where: { voucherId },
      include: {
        beneficiary: true,
        reseller: true,
        order: true
      }
    })

    if (!voucher) {
      return new Response("Voucher not found", { status: 404 })
    }

    /* ===============================
       QR GENERATION (KEY FIX)
    =============================== */

    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      "https://giftconnects.vercel.app" ||
      "http://localhost:3000";

    const qrData = `${baseUrl}/redeem?voucherId=${voucherId}`
    const qrImage = await QRCode.toDataURL(qrData)

    /* ===============================
       DATA
    =============================== */

    const data = {
      voucherId: voucher.voucherId,
      orderId: voucher.orderId,
      amount: Math.round(voucher.value || 0),
      date: new Date(voucher.createdAt).toLocaleDateString(),

      expiryDate: voucher.expiryDate
        ? new Date(voucher.expiryDate).toLocaleDateString()
        : "90 Days",

      buyerName: voucher.order?.buyerId || "Corporate",

      beneficiary: {
        name: voucher.beneficiary?.name || "NA",
        mobile: voucher.beneficiary?.mobile || "NA"
      },

      reseller: voucher.reseller
        ? {
          companyName: voucher.reseller.companyName,
          city: voucher.reseller.city,
          state: voucher.reseller.state
        }
        : null,

      status: voucher.status,
      qrImage
    }

    const pdf = await generateVoucher(data)

    return new Response(Buffer.from(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=Voucher-${voucherId}.pdf`
      }
    })

  } catch (e) {
    console.error(e)
    return new Response("Error generating voucher", { status: 500 })
  }
}