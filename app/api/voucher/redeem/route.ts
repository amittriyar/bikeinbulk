import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { voucherId, resellerCode } = await req.json();

  if (!voucherId || !resellerCode) {
    return NextResponse.json(
      { error: 'Voucher ID and Reseller Code required' },
      { status: 400 }
    );
  }

  const voucher = await db.voucher.findUnique({
    where: { voucherId }
  });

  if (!voucher) {
    return NextResponse.json(
      { error: 'Voucher not found' },
      { status: 404 }
    );
  }

  if (voucher.status !== 'ACTIVE') {
    return NextResponse.json(
      { error: 'Voucher not active' },
      { status: 400 }
    );
  }

  if (voucher.mappedResellerId !== resellerCode) {
    return NextResponse.json(
      { error: 'Invalid reseller for this voucher' },
      { status: 403 }
    );
  }

  if (new Date(voucher.expiryDate) < new Date()) {
    return NextResponse.json(
      { error: 'Voucher expired' },
      { status: 400 }
    );
  }

  await db.voucher.update({
    where: { voucherId },
    data: {
      status: 'REDEEMED',
      redeemedAt: new Date(),
      paymentStatus: 'SETTLEMENT_PENDING'
    }
  });

  return NextResponse.json({
    success: true,
    voucherId,
    status: 'REDEEMED'
  });
}