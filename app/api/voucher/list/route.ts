import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';


export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const orderId = searchParams.get('orderId')

  const vouchers = await db.voucher.findMany({
    where: orderId ? { orderId } : {},
    include: {
      beneficiary: true,
      reseller: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return NextResponse.json(vouchers)
}