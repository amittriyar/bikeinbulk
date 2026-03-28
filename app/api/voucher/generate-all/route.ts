import { getDb } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { orderId } = await req.json();
    const db = getDb();

    const order = await db.order.findUnique({
      where: { orderId }
    });

    if (!order) {
      return new Response("Order not found", { status: 404 });
    }

    const mappings = await db.orderBeneficiary.findMany({
      where: { orderId },
      include: { beneficiary: true }
    });

    if (!mappings.length) {
      return new Response("No beneficiaries found", { status: 400 });
    }

    const normalize = (v: any) =>
      String(v || "").trim().toLowerCase();

    const createdVouchers = [];
    const items = (order.items as any[]) || [];

    for (const b of mappings) {

      let voucherValue = 0;

      const mappingCity = normalize(b.city || b.beneficiary?.city);
      const mappingModel = normalize(b.modelName);

      for (const item of items) {
        const itemModel = normalize(item.modelName || item.model);

        for (const loc of (item.locations || [])) {
          const locCity = normalize(loc.city);

          if (itemModel === mappingModel && locCity === mappingCity) {
            voucherValue = Number(
              loc.quotedPrice ?? loc.unitPrice ?? 0
            );
            break;
          }
        }

        if (voucherValue) break;
      }

      // ❌ safer fallback
      if (!voucherValue) {
        console.error("NO MATCH FOUND:", {
          beneficiary: b.beneficiaryId,
          model: mappingModel,
          city: mappingCity
        });
        continue;
      }

      const existing = await db.voucher.findFirst({
        where: {
          orderId,
          beneficiaryId: b.beneficiaryId
        }
      });

      if (existing) continue;

      let resellerId = b.mappedResellerId;

      if (!resellerId && b.beneficiary?.city) {
        const fallback = await db.reseller.findFirst({
          where: {
            city: b.beneficiary.city,
            status: "Active"
          }
        });

        if (fallback) {
          resellerId = fallback.resellerCode;
        }
      }

      const voucher = await db.voucher.create({
        data: {
          voucherId: `VCH-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          orderId,
          beneficiaryId: b.beneficiaryId,
          sellerId: order.sellerId || "",
          mappedResellerId: resellerId || "",

          value: Math.round(voucherValue),

          expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),

          status: resellerId ? "ACTIVE" : "PENDING_RESELLER",
          paymentStatus: "PAID"
        }
      });

      createdVouchers.push(voucher);

      await db.orderBeneficiary.update({
        where: { id: b.id },
        data: { voucherStatus: "ISSUED" }
      });
    }

    return Response.json({
      success: true,
      generated: createdVouchers.length,
      total: mappings.length
    });

  } catch (e) {
    console.error("Voucher generation error:", e);
    return new Response("Internal Server Error", { status: 500 });
  }
}