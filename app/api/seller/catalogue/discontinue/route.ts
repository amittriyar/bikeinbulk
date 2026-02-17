import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';


export async function POST(req: Request) {
  const db = getDb();
  const { id } = await req.json();

  await db.catalogue.update({
    where: { id },
    data: {
      status: 'DRAFT',
    },
  });

  return NextResponse.json({ success: true });
}