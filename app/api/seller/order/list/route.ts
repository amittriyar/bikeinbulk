import { NextResponse } from 'next/server';
import { readOrders } from '@/lib/orderStore';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sellerId = searchParams.get('sellerId');
  const rfqId = searchParams.get('rfqId');

  let orders = await readOrders(); // ✅ FIX: add await

  if (sellerId) {
    orders = orders.filter(o => o.sellerId === sellerId);

  }

  if (rfqId) {
    orders = orders.filter(o => o.rfqId === rfqId);

  }

  return NextResponse.json(orders);
}