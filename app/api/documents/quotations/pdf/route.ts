import { NextResponse } from "next/server"
import { generateQuotation } from "@/lib/documents/generateQuotation"
import { buildQuotationData } from "@/lib/rfqStore"

export async function GET(req: Request) {

  const { searchParams } = new URL(req.url)

  const rfqId = searchParams.get("rfqId")

  if (!rfqId) {
    return NextResponse.json(
      { error: "RFQ ID missing" },
      { status: 400 }
    )
  }

  const data = await buildQuotationData(rfqId)

  const pdf = await generateQuotation(data)

  return new Response(Buffer.from(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename=quotation-${rfqId}.pdf`
    }
  })
}