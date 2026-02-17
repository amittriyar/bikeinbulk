import { NextResponse } from 'next/server';
import {
  writeCatalogue,
  SellerCatalogue,
} from '@/lib/catalogueStore';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const body = await req.json();

  const item: SellerCatalogue = {
    id: `cat_${Date.now()}`,
    oemName: body.oemName,
    modelName: body.modelName,
    category: body.category,
    fuelType: body.fuelType,
    engineCapacity: body.engineCapacity ?? '',
    exShowroomPrice: Number(body.exShowroomPrice),
    moq: Number(body.moq),
    status: 'PUBLISHED', // ✅ now a literal, not string
    createdAt: new Date(),

  };

  await writeCatalogue(item);


  return NextResponse.json({ success: true, item });
}