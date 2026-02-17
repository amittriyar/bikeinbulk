import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';


export async function GET(req: Request) {
  const db = getDb(); // ✅ Lazy initialization
  const { searchParams } = new URL(req.url);
  const sellerId = searchParams.get('sellerId');

  if (!sellerId) {
    return NextResponse.json([], { status: 200 });
  }

  const data = await db.orderBeneficiary.findMany({
    where: {
      sellerId: sellerId
    },
    include: {
      beneficiary: true,
      order: true
    }
  });

  return NextResponse.json(data);
}