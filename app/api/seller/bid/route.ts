import { NextResponse } from 'next/server';
import { appendBidToRFQ } from '@/lib/rfqStore';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const body = await req.json();

  const bid = {
    bidId: `BID-${Date.now()}`,
    rfqId: body.rfqId,
    sellerId: body.sellerId || 'SELLER_001',
    sellerName: body.sellerName || 'Demo Seller',
    quotedUnitPrice: body.quotedUnitPrice || 100000,
    moq: body.moq || 100,
    deliveryTimeline: body.deliveryTimeline || '30 days',
    validityDays: body.validityDays || 15,
    createdAt: new Date().toISOString(),
  };

  // 🔑 THIS is the missing bridge
  await appendBidToRFQ(body.rfqId, bid);


  return NextResponse.json({ success: true, bid });
}