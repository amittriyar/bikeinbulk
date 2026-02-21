import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { authenticateUser } from '@/lib/authStore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const body = await req.json();
  const { username, password } = body;

  const result = await authenticateUser(username, password);

  if (!result.success) {
    return NextResponse.json(
      { error: result.message },
      { status: 401 }
    );
  }

  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET not configured');
  }

  const token = jwt.sign(
    {
      userId: result.userId,
      role: result.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );

  const response = NextResponse.json({
  success: true,
  role: result.role,

});

response.cookies.set('token', token, {
  httpOnly: true,
  secure: true,
  sameSite: 'strict',
  path: '/',
  maxAge: 60 * 60 * 24,
});

return response;

}
