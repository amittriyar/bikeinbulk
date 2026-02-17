import { NextResponse } from 'next/server';
import { writeRFQ } from '@/lib/rfqStore';


export const runtime = 'nodejs';

export async function POST(req: Request) {
  const body = await req.json();

  const rfq = {
    rfqId: `RFQ-${Date.now()}`,
    buyerId: body.buyerId,
    rfqType: body.rfqType,
    items: body.items,
    status: 'OPEN' as const,   // ✅ IMPORTANT FIX
    createdAt: new Date().toISOString(),
  };

  await writeRFQ(rfq);

return NextResponse.json({ success: true, rfq });

}