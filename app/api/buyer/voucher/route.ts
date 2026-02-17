import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const db = getDb(); // ✅ Initialize INSIDE handler

  const { searchParams } = new URL(req.url);
  const buyerId = searchParams.get('buyerId');

  if (!buyerId) return NextResponse.json([]);

  const vouchers = await db.voucher.findMany({
    where: {
      order: {
        buyerId
      }
    },
    include: {
      beneficiary: true,
      reseller: true,
      order: true
    },
    orderBy: { createdAt: 'desc' }
  });

  return NextResponse.json(vouchers);
}
