import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key';

export async function POST(req: Request) {
  const db = getDb();  // initialize once per request

  const body = await req.json();
  const { username, password } = body;

  const user = await db.user.findUnique({
    where: { username },
  });


  if (!user) {
    return NextResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    );
  }

  const valid = await bcrypt.compare(password, user.password);

  if (!valid) {
    return NextResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    );
  }

  const token = jwt.sign(
    {
      userId: user.userId,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: '1d' }
  );

  return NextResponse.json({
    success: true,
    token,
    role: user.role,
  });
}
