import { NextResponse } from 'next/server';
import { listSellerRFQs } from '@/lib/rfqStore';

export const runtime = 'nodejs';

export async function GET() {
  const rfqs = await listSellerRFQs();   // ✅ add await
  return NextResponse.json(rfqs);
}