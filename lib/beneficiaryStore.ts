/* ===============================
   Beneficiary Store (DB-backed)
   =============================== */

import { getDb } from './db';


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
  const db = getDb();
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
  const db = getDb();
  return db.beneficiary.findMany({
    orderBy: { createdAt: 'desc' },
  });
}

export async function getBeneficiaryById(beneficiaryId: string) {
  const db = getDb();
  return db.beneficiary.findUnique({
    where: { beneficiaryId },
  });
}

/* ---------- Order ↔ Beneficiary Mapping ---------- */

export async function mapBeneficiaryToOrder(map: OrderBeneficiaryMap) {
  const db = getDb();
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
  const db = getDb();
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
  const db = getDb();
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