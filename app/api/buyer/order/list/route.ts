import { NextResponse } from 'next/server';
import { readOrders } from '@/lib/orderStore';

export const runtime = 'nodejs';

type Order = {
  buyerId: string;
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const buyerId = searchParams.get('buyerId');

  const orders = await readOrders();  // ✅ await here

  const filtered = orders.filter(
    (o: Order) => o.buyerId === buyerId
  );

  return NextResponse.json(filtered);
}