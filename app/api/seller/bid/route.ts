import { NextResponse } from 'next/server'
import { appendBidToRFQ } from '@/lib/rfqStore'

export const runtime = 'nodejs'

export async function POST(req: Request) {

  const body = await req.json()

  /* ---------- CALCULATE TOTAL VALUE ---------- */

  let totalValue = 0

  if (Array.isArray(body.locationQuotes)) {

    totalValue = body.locationQuotes.reduce((sum: number, model: any) => {

      const modelTotal = (model.locations || []).reduce(
        (s: number, loc: any) =>
          s + Number(loc.qty || 0) * Number(loc.quotedPrice || 0),
        0
      )

      return sum + modelTotal

    }, 0)
  }

  /* ---------- CREATE BID OBJECT ---------- */

  const bid = {

    bidId: `BID-${Date.now()}`,

    rfqId: body.rfqId,

    sellerId: body.sellerId || 'SELLER_001',

    sellerName: body.sellerName || 'Demo Seller',

    moq: body.moq || 100,

    deliveryTimeline: body.deliveryTimeline || '30 days',

    validityDays: body.validityDays || 15,

    remarks: body.remarks || '',

    /* 🔥 IMPORTANT PART */

    locationQuotes: body.locationQuotes || [],

    /* 🔥 computed total */

    totalValue,

    createdAt: new Date().toISOString(),

  }

  /* ---------- SAVE BID ---------- */

  await appendBidToRFQ(body.rfqId, bid)

  return NextResponse.json({ success: true, bid })

}