import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcrypt';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const body = await req.json();

  const { username, password, role } = body;

  if (!username || !password || !role) {
    return NextResponse.json(
      { error: 'Username, password and role are required' },
      { status: 400 }
    );
  }

  // Check if user already exists
  const existing = await db.user.findUnique({
    where: { username },
  });

  if (existing) {
    return NextResponse.json(
      { error: 'User already exists' },
      { status: 400 }
    );
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await db.user.create({
    data: {
      userId: `USR-${Date.now()}`,
      username,
      password: hashedPassword,
      role,
    },
  });

  return NextResponse.json({
    success: true,
    userId: user.userId,
    role: user.role,
  });
}