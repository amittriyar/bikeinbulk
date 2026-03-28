import { getDb } from "@/lib/db"
import { generatePDF } from "@/lib/documents/generatePDF"
import { voucherHTML } from "@/lib/documents/templates/voucher"

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

        const data = {
            voucherId: voucher.voucherId,
            orderId: voucher.orderId,

            amount: Math.round(voucher.value || 0),

            date: new Date(voucher.createdAt).toLocaleDateString(),

            expiryDate: voucher.expiryDate
                ? new Date(voucher.expiryDate).toLocaleDateString()
                : "90 Days from Issue",

            // ✅ FIXED
            buyerName: voucher.order?.buyerId || "Corporate Client",

            // ✅ FIXED
            beneficiary: {
                name: voucher.beneficiary?.name || "NA",
                mobile: voucher.beneficiary?.mobile || "NA"
            },

            // ✅ FIXED
            reseller: voucher.reseller
                ? {
                    companyName: voucher.reseller.companyName,
                    city: voucher.reseller.city,
                    state: voucher.reseller.state
                }
                : null,

            status: voucher.status
        }
        const html = await voucherHTML(data)
        const pdf = await generatePDF(html)

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