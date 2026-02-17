import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET(req: Request) {
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