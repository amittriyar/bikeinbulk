import { NextResponse } from "next/server"
import { generateQuotation } from "@/lib/documents/generateQuotation"
import { getDb } from "@/lib/db"

export const runtime = "nodejs"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const rfqId = searchParams.get("rfqId")

    if (!rfqId) {
      return NextResponse.json({ error: "RFQ ID missing" }, { status: 400 })
    }

    const db = getDb()

    const rfq = await db.rFQ.findUnique({
      where: { rfqId }
    })

    if (!rfq) {
      return NextResponse.json({ error: "RFQ not found" }, { status: 404 })
    }
    console.log("RFQ ITEMS DATA:", rfq.items)
    // ✅ HANDLE STRING / JSON BOTH
    let rawItems: any[] = []

    if (typeof rfq.items === "string") {
      try {
        rawItems = JSON.parse(rfq.items)
      } catch {
        rawItems = []
      }
    } else {
      rawItems = (rfq.items as any[]) || []
    }
    const catalogues = await db.catalogue.findMany()
    const priceMap = new Map(
      catalogues.map(c => [c.modelName, c.exShowroomPrice])
    )
    // ✅ SAFE MAPPING
    const items = rawItems.flatMap((item: any) => {

      const model = item.modelName || "-"

      const price = Number(priceMap.get(model) || 0)

      const locations = item.locations || []

      return locations.map((loc: any) => ({

        model,

        city: loc.city || loc.cityName || "-",

        qty: Number(loc.qty || loc.quantity || 0),

        unitPrice: price   // ✅ FINAL FIX

      }))
    })

    const subtotal = items.reduce(
      (a, b) => a + (b.qty * b.unitPrice),
      0
    )

    const data = {
      quotationNo: `QT-${Date.now()}`,
      rfqId: rfq.rfqId,
      date: new Date().toLocaleDateString(),
      validityDays: 30,

      buyer: {
        name: "Corporate Buyer",
        gst: "NA"
      },

      seller: {
        name: "Seller OEM",
        gst: "NA"
      },

      items,
      subtotal
    }

    const pdfBuffer = await generateQuotation(data)

    // ✅ FINAL RESPONSE FIX
    return new Response(pdfBuffer as any, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename=quotation-${rfqId}.pdf`
      }
    })

  } catch (err) {
    console.error("PDF ERROR:", err)
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 })
  }
}