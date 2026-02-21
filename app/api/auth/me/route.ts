import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export const runtime = 'nodejs';

const JWT_SECRET = process.env.JWT_SECRET!;

export async function GET(req: Request) {
  const token = req.headers
    .get('cookie')
    ?.split('; ')
    .find(c => c.startsWith('token='))
    ?.split('=')[1];

  if (!token) {
    return NextResponse.json({ authenticated: false });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return NextResponse.json({
      authenticated: true,
      user: decoded,
    });
  } catch {
    return NextResponse.json({ authenticated: false });
  }
}
