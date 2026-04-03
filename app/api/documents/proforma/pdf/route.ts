import { buildDocumentData } from "@/lib/documents/buildDocumentData"
import { generateProforma } from "@/lib/documents/generateProforma"

export const runtime = "nodejs"

export async function GET(req: Request) {

  try {
    const { searchParams } = new URL(req.url)
    const orderId = searchParams.get("orderId")

    if (!orderId) {
      return new Response("Missing Order ID", { status: 400 })
    }

    /* ===============================
       1️⃣ BUILD DATA
    =============================== */

    const data = await buildDocumentData(orderId, "proforma")

    /* ===============================
       2️⃣ GENERATE PDF (REACT PDF)
    =============================== */

    const pdf = await generateProforma(data)

    /* ===============================
       3️⃣ RESPONSE
    =============================== */

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