import { NextResponse } from 'next/server';
import { listBuyerRFQs } from '@/lib/rfqStore';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const buyerId = searchParams.get('buyerId');

  if (!buyerId) {
    return NextResponse.json([], { status: 200 });
  }

  const rfqs = await listBuyerRFQs(buyerId);
return NextResponse.json(rfqs);

}