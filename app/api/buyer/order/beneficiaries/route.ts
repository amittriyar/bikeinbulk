import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const runtime = 'nodejs';

/* ================= GET ================= */

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const buyerId = searchParams.get('buyerId');

  if (!buyerId) {
    return NextResponse.json([], { status: 200 });
  }

  const data = await db.orderBeneficiary.findMany({
    where: {
      order: {
        buyerId: buyerId
      }
    },
    include: {
      beneficiary: true,
      reseller: true
    }
  });

  return NextResponse.json(data);
}



/* ================= POST ================= */

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.orderId || !body.sellerId) {
      return NextResponse.json(
        { error: 'Missing orderId or sellerId' },
        { status: 400 }
      );
    }

    // 1️⃣ Create Beneficiary
    const beneficiary = await db.beneficiary.create({
      data: {
        beneficiaryId: `BEN-${Date.now()}`,
        name: body.name,
        mobile: body.mobile,
        email: body.email,
        city: body.city,
        pincode: body.pincode,
      }
    });

    // 2️⃣ Find reseller by pincode
    let reseller = await db.reseller.findFirst({
      where: {
        pincode: body.pincode,
        status: 'Active'
      }
    });

    // 3️⃣ Create OrderBeneficiary mapping
    await db.orderBeneficiary.create({
      data: {
        orderId: body.orderId,
        sellerId: body.sellerId,
        beneficiaryId: beneficiary.beneficiaryId,
        voucherStatus: reseller ? 'MAPPED' : 'NO_RESELLER',
        mappedResellerId: reseller ? reseller.resellerCode : null
      }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Error adding beneficiary' },
      { status: 500 }
    );
  }
}