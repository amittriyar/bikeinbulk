/* ===============================
   Voucher Store (DB-backed)
   =============================== */

import { db } from './db';

export type Voucher = {
  voucherId: string;
  orderId: string;
  beneficiaryId: string;
  sellerId: string;
  mappedResellerId: string;
  value: number;
  expiryDate: Date;
  paymentStatus: string;
  status: string;
};


/**
 * Write / Issue a voucher
 */
export async function writeVoucher(voucher: Voucher) {
  await db.voucher.create({
    data: {
      voucherId: voucher.voucherId,
      orderId: voucher.orderId,
      beneficiaryId: voucher.beneficiaryId,
      sellerId: voucher.sellerId,
      mappedResellerId: voucher.mappedResellerId,
      value: voucher.value,
      expiryDate: voucher.expiryDate,
      paymentStatus: voucher.paymentStatus,
      status: voucher.status,
    },
  });

  return voucher;
}


/**
 * Read helpers
 */
export async function listVouchers() {
  return db.voucher.findMany({
    orderBy: { createdAt: 'desc' },
  });
}

export async function getVoucherById(voucherId: string) {
  return db.voucher.findUnique({
    where: { voucherId },
  });
}

/**
 * Update status (redeem / expire)
 */
export async function updateVoucherStatus(
  voucherId: string,
  status: 'ISSUED' | 'REDEEMED' | 'EXPIRED'
) {
  await db.voucher.update({
    where: { voucherId },
    data: {
      status,
      redeemedAt: status === 'REDEEMED' ? new Date() : undefined,
    },
  });
}