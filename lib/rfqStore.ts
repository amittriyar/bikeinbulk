/* ===============================
   RFQ Store (DB-backed with Prisma)
   =============================== */

import { getDb } from './db';


export type RFQItem = {
  // MODEL RFQ
  catalogueId?: string;
  modelName?: string;

  // BUDGET RFQ
  fuelType?: string;
  vehicleType?: string;
  minSpec?: string;
  maxSpec?: string;
  minBudget?: string;
  maxBudget?: string;

  requestedQty?: number;
  locations?: {
    city: string;
    qty: number;
  }[];
};

export type RFQ = {
  rfqId: string;
  buyerId: string;
  rfqType: 'MODEL' | 'BUDGET';
  items: RFQItem[];
  status: 'OPEN' | 'RESPONDED' | 'CLOSED';
  bids?: any[];
  createdAt: string;
};

/**
 * WRITE – Create RFQ
 */
export async function writeRFQ(rfq: RFQ) {
  const db = getDb();
  await db.rFQ.create({
    data: {
      rfqId: rfq.rfqId,
      buyerId: rfq.buyerId,
      rfqType: rfq.rfqType,
      items: rfq.items,
      status: rfq.status,
      bids: [],   // 🔥 Add this if missing
    },
  });

}

/**
 * READ – Buyer RFQs
 */
export async function listBuyerRFQs(buyerId: string) {
  const db = getDb();
  return db.rFQ.findMany({
    where: { buyerId },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * READ – Seller RFQs
 */
export async function listSellerRFQs() {
  const db = getDb();
  return db.rFQ.findMany({
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * READ – Single RFQ
 */
export async function getRFQById(rfqId: string) {
  const db = getDb();
  return db.rFQ.findUnique({
    where: { rfqId },
  });
}

/**
 * UPDATE – Append seller bid to RFQ
 */
export async function appendBidToRFQ(rfqId: string, bid: any) {
  const db = getDb();
  const rfq = await db.rFQ.findUnique({
    where: { rfqId },
  });

  if (!rfq) {
    console.warn('RFQ not found for bid:', rfqId);
    return;
  }

  const existingBids = (rfq.bids as any[]) || [];
  existingBids.push(bid);

  await db.rFQ.update({
    where: { rfqId },
    data: {
      bids: [...existingBids],  // 🔥 Important fix
      status: 'RESPONDED',
    },
  });

}