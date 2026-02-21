import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { authenticateUser } from '@/lib/authStore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { username, password } = body;

    // 🔹 Basic validation
    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // 🔹 Authenticate user
    const result = await authenticateUser(username, password);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.message },
        { status: 401 }
      );
    }

    // 🔹 Ensure JWT secret exists
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // 🔹 Create token
    const token = jwt.sign(
      {
        userId: result.userId,
        role: result.role,
      },
      secret,
      { expiresIn: '1d' }
    );

    // 🔹 Prepare response
    const response = NextResponse.json({
      success: true,
      role: result.role,
      userId: result.userId,
    });

    // 🔹 Set cookie (works locally + in Vercel)
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // 🔥 critical
      sameSite: 'lax', // slightly safer than strict for redirects
      path: '/',
      maxAge: 60 * 60 * 24, // 1 day
    });

    return response;

  } catch (error) {
    console.error('Login error:', error);

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}