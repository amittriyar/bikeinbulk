import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';


export async function GET(req: Request) {

  const db = getDb(); // ✅ Initialize INSIDE handler
  const { searchParams } = new URL(req.url)
  const orderId = searchParams.get('orderId')
  const voucherId = searchParams.get('voucherId')
  const sellerId = searchParams.get('sellerId')
  const vouchers = await db.voucher.findMany({
    where: {
      ...(orderId ? { orderId } : {}),
      ...(voucherId ? { voucherId } : {}),
      ...(sellerId ? { sellerId } : {})   // ✅ ADD THIS
    },
    include: {
      beneficiary: true,
      reseller: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return NextResponse.json(vouchers)
}