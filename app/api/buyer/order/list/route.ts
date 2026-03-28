import { getDb } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const buyerId = searchParams.get("buyerId");

  if (!buyerId) {
    return NextResponse.json([]);
  }

  const db = getDb();

  /* ===============================
     FETCH ORDERS
  =============================== */
  const orders = await db.order.findMany({
    where: { buyerId },
    select: {
      orderId: true,
      rfqId: true,
      buyerId: true,
      sellerName: true,
      status: true,

      unitPrice: true,
      amountPaid: true,

      paymentStatus: true,
      paymentRef: true,
      paymentDate: true,

      items: true
    }
  });

  /* ===============================
     FETCH ALL CATALOGUES (1 QUERY ONLY)
  =============================== */
  const catalogues = await db.catalogue.findMany({
    select: {
      id: true,
      modelName: true
    }
  });

  /* ===============================
     CREATE LOOKUP MAP (FAST)
  =============================== */
  const catalogueMap = new Map(
    catalogues.map((c) => [c.id, c.modelName])
  );

  /* ===============================
     ENRICH ORDERS
  =============================== */
  const enrichedOrders = orders.map((order: any) => ({
    ...order,
    items: (order.items || []).map((item: any) => ({
      ...item,
      modelName:
        catalogueMap.get(item.catalogueId) ||
        item.modelName ||   // fallback if already stored
        "Unknown Model"
    }))
  }));

  /* ===============================
     RESPONSE
  =============================== */
  return NextResponse.json(enrichedOrders);
}