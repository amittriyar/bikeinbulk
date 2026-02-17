import { NextResponse } from 'next/server';
import { listVouchers } from '@/lib/voucherStore';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sellerId = searchParams.get('sellerId');

  const all = await listVouchers() as any[];

  const filtered = sellerId
    ? all.filter((v: any) => v.sellerId === sellerId)
    : all;

  return NextResponse.json(filtered);
}