import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { authenticateUser } from '@/lib/authStore'
import { getDb } from '@/lib/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const db = getDb()

    const body = await req.json()
    const { username, password } = body

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Username and password are required' },
        { status: 400 }
      )
    }

    const result = await authenticateUser(username, password)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.message },
        { status: 401 }
      )
    }

    /* ===============================
       RESELLER VALIDATION
    =============================== */
    if (String(result.role) === "RESELLER") {
      const user = await db.user.findUnique({
        where: { userId: result.userId }
      })

      if (user?.status === "REJECTED") {
        return NextResponse.json(
          { success: false, error: "Account rejected" },
          { status: 403 }
        )
      }

      if (
        user?.status === "PENDING" &&
        user.approvalExpiry &&
        new Date(user.approvalExpiry) < new Date()
      ) {
        return NextResponse.json(
          { success: false, error: "Trial expired. Contact seller" },
          { status: 403 }
        )
      }
    }

    const secret = process.env.JWT_SECRET
    if (!secret) {
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      )
    }

    const token = jwt.sign(
      {
        userId: result.userId,
        role: result.role,
      },
      secret,
      { expiresIn: '1d' }
    )

    const response = NextResponse.json({
      success: true,
      role: result.role,
      userId: result.userId,
    })

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24,
    })

    return response

  } catch (error) {
    console.error('Login error:', error)

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}