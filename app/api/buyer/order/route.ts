import { NextResponse } from 'next/server';
import { writeOrder } from '@/lib/orderStore';
import { getRFQById } from '@/lib/rfqStore';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const rfq = await getRFQById(body.rfqId);

    if (!rfq) {
      return NextResponse.json(
        { error: 'RFQ not found' },
        { status: 400 }
      );
    }

    

    const items = Array.isArray(rfq.items) ? rfq.items : [];

const totalQty = items.reduce(
  (sum: number, i: any) =>
    sum + Number(i?.requestedQty || 0),
  0
);


    const orderValue =
      totalQty * Number(body.unitPrice);

    const order = {
      orderId: `ORD-${Date.now()}`,
      buyerId: body.buyerId,
      sellerId: body.sellerId,
      sellerName: body.sellerName,
      rfqId: body.rfqId,
      bidId: body.bidId,

      items: body.items || [],

      totalQty: body.totalQty || body.moq || 0,

      orderValue:
        body.orderValue ||
        (body.unitPrice && body.moq
          ? body.unitPrice * body.moq
          : 0),

      unitPrice: body.unitPrice,
      deliveryTimeline: body.deliveryTimeline,
      validityDays: body.validityDays,

      status: 'PLACED',
    };


    await writeOrder(order);

    return NextResponse.json({
      success: true,
      order,
    });

  } catch (err) {
    console.error('ORDER CREATE ERROR:', err);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}