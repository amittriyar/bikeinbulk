import { buildDocumentData } from "@/lib/documents/buildDocumentData"
import { generatePDF } from "@/lib/documents/generatePDF"
import { proformaHTML } from "@/lib/documents/templates/proforma"

export async function GET(req: Request) {

  try {
    const { searchParams } = new URL(req.url)
    const orderId = searchParams.get("orderId")

    if (!orderId) {
      return new Response("Missing Order ID", { status: 400 })
    }

    // ✅ FIXED
    const data = await buildDocumentData(orderId, "proforma")

    const html = proformaHTML(data)
    const pdf = await generatePDF(html)

    return new Response(Buffer.from(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=proforma-${orderId}.pdf`
      }
    })

  } catch (e) {
    console.error("Proforma error:", e)
    return new Response("Internal Server Error", { status: 500 })
  }
}