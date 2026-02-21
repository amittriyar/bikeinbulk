import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import bcrypt from 'bcrypt';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const db = getDb();
  const body = await req.json();

  const { username, password, role } = body;

  if (!username || !password || !role) {
    return NextResponse.json(
      { success: false, message: 'Missing fields' },
      { status: 400 }
    );
  }

  const existing = await db.user.findUnique({
    where: { username },
  });

  if (existing) {
    return NextResponse.json(
      { success: false, message: 'User already exists' },
      { status: 400 }
    );
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await db.user.create({
    data: {
      userId: `USER_${Date.now()}`,
      username,
      password: hashedPassword,
      role,
    },
  });

  return NextResponse.json({ success: true, user });
}
