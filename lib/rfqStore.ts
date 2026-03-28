/* ===============================
   RFQ Store (DB-backed with Prisma)
   =============================== */

import { getDb } from './db';


/* ===============================
   Seller Bid Types
   =============================== */

export type LocationQuote = {
  city: string
  qty: number
  quotedPrice: number
}

export type ModelQuote = {
  modelName: string
  locations: LocationQuote[]
}

export type SellerBid = {
  bidId: string
  rfqId: string
  sellerId: string
  sellerName: string
  locationQuotes: ModelQuote[]
  totalValue: number
  moq?: number
  deliveryTimeline?: string
  validityDays?: number
  remarks?: string
  createdAt: string
}


/* ===============================
   RFQ Item
   =============================== */

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
export async function buildQuotationData(rfqId: string) {

  const rfq = await getRFQById(rfqId)

  if (!rfq) throw new Error("RFQ not found")

  const bids = (rfq.bids as SellerBid[]) || []

  if (!bids.length) throw new Error("No bids received")

  // L1 seller
  const winningBid = bids.sort((a, b) => a.totalValue - b.totalValue)[0]

  const items: any[] = []

  winningBid.locationQuotes.forEach(model => {

    model.locations.forEach(loc => {

      items.push({
        model: model.modelName,
        city: loc.city,
        qty: loc.qty,
        unitPrice: loc.quotedPrice
      })

    })

  })

  return {
    quotationNo: "QT-" + Date.now(),
    rfqId: rfq.rfqId,
    date: new Date().toLocaleDateString(),
    validityDays: winningBid.validityDays || 30,

    buyer: {
      name: "Corporate Buyer", // replace later with buyer table
      gst: "NA"
    },

    seller: {
      name: winningBid.sellerName,
      gst: "NA"
    },

    items
  }

}