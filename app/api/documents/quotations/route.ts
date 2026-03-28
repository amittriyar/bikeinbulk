import { generateQuotation } from "@/lib/documents/quotations"
import { getDb } from "@/lib/db"
async function viewQuotation(r: any) {

  const res = await fetch("/api/documents/quotation", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ rfqId: r.rfqId })
  });

  const blob = await res.blob();

  const url = window.URL.createObjectURL(blob);

  window.open(url, "_blank");
}
export async function GET(req: Request) {

  const { searchParams } = new URL(req.url)
  const rfqId = searchParams.get("rfqId")

  if (!rfqId) {
    return new Response("RFQ ID missing", { status: 400 })
  }

  const db = await getDb()

  const rfq = await db.rFQ.findUnique({
    where: { rfqId }
  })

  if (!rfq) {
    return new Response("RFQ not found", { status: 404 })
  }

  const items:any = rfq.items
  const bids:any = rfq.bids

  const item = items?.[0]
  const bid = bids?.[0]

  const pdfBytes = await generateQuotation({
    rfqId: rfq.rfqId,
    seller: bid?.sellerName,
    buyer: rfq.buyerId,
    model: item?.modelName,
    qty: item?.requestedQty,
    price: bid?.quotedUnitPrice
  })

  return new Response(Buffer.from(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf"
    }
  })
}
export async function POST(req: Request) {

  try {

    const { rfqId } = await req.json()

    const db = await getDb()

    const rfq = await db.rFQ.findUnique({
      where: { rfqId }
    })

    if (!rfq) {
      return new Response("RFQ not found", { status: 404 })
    }

    const items:any = rfq.items
    const bids:any = rfq.bids

    const item = items?.[0]
    const bid = bids?.[0]

    const pdfBytes = await generateQuotation({
      rfqId: rfq.rfqId,
      seller: bid?.sellerName || "Seller",
      buyer: rfq.buyerId,
      model: item?.modelName || "Model",
      qty: item?.requestedQty || 0,
      price: bid?.quotedUnitPrice || 0
    })

    return new Response(Buffer.from(pdfBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=Quotation-${rfqId}.pdf`
      }
    })

  } catch (error) {

    console.error(error)

    return new Response(
      JSON.stringify({ error: "Failed to generate quotation" }),
      { status: 500 }
    )

  }

}