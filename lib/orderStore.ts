import { getDb } from './db';


export type Order = {
  orderId: string;
  buyerId: string;
  sellerId: string | null;
  sellerName: string | null;
  rfqId: string | null;
  bidId: string | null;
  items: any;
  totalQty?: number;
  orderValue?: number;
  unitPrice?: number | null;
  moq?: number | null;            // ✅ make optional
  deliveryTimeline?: string | null;
  validityDays?: number | null;
  status: string;
  createdAt: Date;
};


/* ===============================
   WRITE – Create Order
================================= */

export async function writeOrder(
  
  order: Omit<Order, 'createdAt'>
) {
  const db = getDb();
  return db.order.create({
    data: {
      orderId: order.orderId,
      buyerId: order.buyerId,
      sellerId: order.sellerId ?? null,
      sellerName: order.sellerName ?? null,
      rfqId: order.rfqId ?? null,
      bidId: order.bidId ?? null,
      unitPrice: order.unitPrice ?? null,
      moq: order.moq ?? null,
      deliveryTimeline: order.deliveryTimeline ?? null,
      validityDays: order.validityDays ?? null,
      status: order.status ?? 'PLACED',
      items: Array.isArray(order.items) ? order.items : [],
      createdAt: new Date(),
    },
  });
}


/* ===============================
   READ – All Orders
================================= */

export async function readOrders(): Promise<Order[]> {
  const db = getDb();
  return db.order.findMany({
    orderBy: { createdAt: 'desc' },
  });
}