import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const { id } = await req.json();

  await db.catalogue.update({
    where: { id },
    data: {
      status: 'DRAFT',
    },
  });

  return NextResponse.json({ success: true });
}