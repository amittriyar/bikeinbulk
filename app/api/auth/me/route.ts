import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

export async function GET(req: Request) {
  try {
    const token = req.headers.get('cookie')
      ?.split('; ')
      .find(c => c.startsWith('token='))
      ?.split('=')[1]

    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string
      role: string
    }

    return NextResponse.json({
      authenticated: true,
      userId: decoded.userId,
      role: decoded.role,
    })
  } catch {
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }
}