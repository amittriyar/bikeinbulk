import { NextResponse } from 'next/server';
import { getRFQById } from '@/lib/rfqStore';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const rfqId = searchParams.get('rfqId');

  if (!rfqId) {
    return NextResponse.json([]);
  }

  const rfq = await getRFQById(rfqId);


  return NextResponse.json(rfq?.bids || []);
}