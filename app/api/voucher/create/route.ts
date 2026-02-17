import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { orderId, sellerId, value, validityDays } = await req.json();

    if (!orderId || !sellerId || !value) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // 1️⃣ Fetch ONLY MAPPED beneficiaries
    const orderBeneficiaries = await db.orderBeneficiary.findMany({
      where: {
        orderId,
        voucherStatus: 'MAPPED'
      }
    });

    if (orderBeneficiaries.length === 0) {
      return NextResponse.json(
        { error: 'No mapped beneficiaries found' },
        { status: 400 }
      );
    }

    const createdVouchers = [];

    for (const entry of orderBeneficiaries) {

      // 2️⃣ Create Voucher using already mapped reseller
      const voucher = await db.voucher.create({
        data: {
          voucherId: `VCH-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          orderId,
          beneficiaryId: entry.beneficiaryId,
          sellerId,
          mappedResellerId: entry.mappedResellerId!,  // ✅ use stored mapping
          value: Number(value),
          expiryDate: new Date(
            Date.now() + (validityDays || 30) * 24 * 60 * 60 * 1000
          ),
          status: 'ACTIVE',
          paymentStatus: 'PENDING'
        }
      });

      // 3️⃣ Mark as ISSUED
      await db.orderBeneficiary.update({
        where: { id: entry.id },
        data: { voucherStatus: 'ISSUED' }
      });

      createdVouchers.push(voucher);
    }

    return NextResponse.json({
      success: true,
      count: createdVouchers.length,
      vouchers: createdVouchers
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Voucher creation failed' },
      { status: 500 }
    );
  }
}