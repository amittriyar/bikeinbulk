import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import {
  writeCatalogue,
  SellerCatalogue,
} from '@/lib/catalogueStore';

export const runtime = 'nodejs';

export async function GET() {
  const db = getDb();
  const items = await db.catalogue.findMany({
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(items);
}

export async function POST(req: Request) {
  const db = getDb();
  const body = await req.json();

  // 🔎 DUPLICATE CHECK (PUT HERE)
  const existing = await db.catalogue.findFirst({
    where: {
      modelName: body.modelName,
      oemName: body.oemName,
    },
  });

  if (existing) {
    return NextResponse.json(
      { error: "Duplicate model already exists" },
      { status: 400 }
    );
  }

  // ✅ Create new item only if not duplicate
  const item: SellerCatalogue = {
    id: `cat_${Date.now()}`,
    oemName: body.oemName,
    modelName: body.modelName,
    category: body.category,
    fuelType: body.fuelType,
    engineCapacity: body.engineCapacity ?? '',
    exShowroomPrice: Number(body.exShowroomPrice),
    moq: Number(body.moq),
    status: 'PUBLISHED',
    createdAt: new Date(),
  };

  await writeCatalogue(item);

  return NextResponse.json({ success: true, item });
}
