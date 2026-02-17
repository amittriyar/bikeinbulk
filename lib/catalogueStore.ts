/* ===============================
   Catalogue Store (DB-backed)
   =============================== */

import { db } from './db';

export type SellerCatalogue = {
  id: string;
  oemName: string;
  modelName: string;
  category: string | null;
  fuelType: string | null;
  engineCapacity: string | null;
  exShowroomPrice: number;
  moq: number;
  status: string;        // ✅ changed to string
  createdAt: Date;
};


/* ---------- READ ---------- */

export async function readCatalogues(): Promise<SellerCatalogue[]> {
  return db.catalogue.findMany({
    orderBy: { createdAt: 'desc' },
  });
}

export async function readCatalogue(id: string): Promise<SellerCatalogue | null> {
  return db.catalogue.findUnique({
    where: { id },
  });
}

export async function readSellerCatalogue(oemName?: string): Promise<SellerCatalogue[]> {
  return db.catalogue.findMany({
    where: oemName ? { oemName } : undefined,
    orderBy: { createdAt: 'desc' },
  });
}

/* ---------- WRITE ---------- */

export async function writeCatalogue(item: SellerCatalogue) {
  await db.catalogue.create({
    data: {
      ...item,
      exShowroomPrice: Number(item.exShowroomPrice),
      moq: Number(item.moq),
    },
  });
}

export async function writeAllCatalogues(items: SellerCatalogue[]) {
  await db.catalogue.deleteMany();

  for (const item of items) {
    await db.catalogue.create({
      data: {
        ...item,
        exShowroomPrice: Number(item.exShowroomPrice),
        moq: Number(item.moq),
      },
    });
  }
}