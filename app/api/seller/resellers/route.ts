import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';


export async function GET() {
  const db = getDb(); // ✅ Initialize INSIDE handler

  try {
    const resellers = await db.reseller.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(resellers);
  } catch (error) {
    console.error(error);
    return NextResponse.json([], { status: 500 });
  }
}


export async function POST(req: Request) {
   const db = getDb(); // ✅ Initialize INSIDE handler
  try {
    const payload = await req.json();

    const resellerCode = String(payload.resellerCode).trim();

    if (!resellerCode) {
      return NextResponse.json(
        { error: 'Reseller Code is required' },
        { status: 400 }
      );
    }

    const existing = await db.reseller.findUnique({
      where: { resellerCode }
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Duplicate Reseller Code' },
        { status: 400 }
      );
    }

    const reseller = await db.reseller.create({
      data: {
        resellerCode,
        oemName: payload.oemName,
        companyName: payload.companyName,
        contactName: payload.contactName,
        mobile: payload.mobile,
        email: payload.email,
        city: payload.city,
        state: payload.state,
        pincode: String(payload.pincode),
        status: payload.status || 'Active'
      }
    });

    return NextResponse.json(reseller);

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Failed to add reseller' },
      { status: 500 }
    );
  }
}
