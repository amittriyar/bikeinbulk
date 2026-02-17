import { NextResponse } from 'next/server';
import { readSellerCatalogue } from '@/lib/catalogueStore';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const oem = searchParams.get('oem') || undefined;

  const catalogue = await readSellerCatalogue(oem);
return NextResponse.json(catalogue);

}