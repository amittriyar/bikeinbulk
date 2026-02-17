/* ===============================
   Beneficiary Store (DB-backed)
   =============================== */

import { db } from './db';

export type Beneficiary = {
  beneficiaryId: string;
  name: string;
  mobile: string;
  email?: string;
  city?: string;
  pincode?: string;
};

export type OrderBeneficiaryMap = {
  orderId: string;
  sellerId?: string;
  beneficiaryId: string;
  voucherStatus: 'PENDING' | 'ISSUED' | 'REDEEMED';
};

/* ---------- Beneficiary CRUD ---------- */

export async function addBeneficiary(b: Beneficiary) {
  await db.beneficiary.create({
    data: {
      beneficiaryId: b.beneficiaryId,
      name: b.name,
      mobile: b.mobile,
      email: b.email,
      city: b.city,
      pincode: b.pincode,
    },
  });

  return b;
}

export async function listBeneficiaries() {
  return db.beneficiary.findMany({
    orderBy: { createdAt: 'desc' },
  });
}

export async function getBeneficiaryById(beneficiaryId: string) {
  return db.beneficiary.findUnique({
    where: { beneficiaryId },
  });
}

/* ---------- Order ↔ Beneficiary Mapping ---------- */

export async function mapBeneficiaryToOrder(map: OrderBeneficiaryMap) {
  await db.orderBeneficiary.create({
    data: {
      orderId: map.orderId,
      sellerId: map.sellerId,
      beneficiaryId: map.beneficiaryId,
      voucherStatus: map.voucherStatus,
    },
  });

  return map;
}

export async function listOrderBeneficiaries(orderId?: string) {
  return db.orderBeneficiary.findMany({
    where: orderId ? { orderId } : undefined,
    orderBy: { createdAt: 'desc' },
  });
}

export async function updateVoucherStatus(
  orderId: string,
  beneficiaryId: string,
  status: OrderBeneficiaryMap['voucherStatus']
) {
  await db.orderBeneficiary.updateMany({
    where: {
      orderId,
      beneficiaryId,
    },
    data: {
      voucherStatus: status,
    },
  });
}