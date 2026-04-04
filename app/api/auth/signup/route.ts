import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import bcrypt from 'bcrypt'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  try {
    const db = getDb()
    const body = await req.json()

    const {
      username,
      password,
      role,

      companyName,
      companyAddress,
      gstNumber,
      panNumber,
      bankAccount,
      ifscCode,
      contactPerson,
      phoneNumber,

      parentSellerId
    } = body

    if (!username || !password || !role) {
      return NextResponse.json(
        { success: false, message: 'Missing fields' },
        { status: 400 }
      )
    }

    const allowedRoles = ['BUYER', 'SELLER', 'RESELLER'] as const

    if (!allowedRoles.includes(role)) {
      return NextResponse.json(
        { success: false, message: 'Invalid role' },
        { status: 400 }
      )
    }

    const existing = await db.user.findUnique({
      where: { username },
    })

    if (existing) {
      return NextResponse.json(
        { success: false, message: 'User already exists' },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    /* ===============================
       STATUS LOGIC
    =============================== */
    let status = "ACTIVE"
    let approvalExpiry = null

    if (role === "RESELLER") {
      status = "PENDING"
      approvalExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    }

    const userId = `USER_${Date.now()}`

    const user = await db.user.create({
      data: {
        userId,
        username,
        password: hashedPassword,
        role,

        companyName,
        companyAddress,
        gstNumber,
        panNumber,
        bankAccount,
        ifscCode,
        contactPerson,
        phoneNumber,

        status,
        approvalExpiry
      }
    })

    /* ===============================
       CREATE RESELLER
    =============================== */
    if (role === "RESELLER") {
      await db.reseller.create({
        data: {
          resellerCode: userId,
          userId,
          parentSellerId: parentSellerId || "",
          oemName: "DEFAULT",
          companyName: companyName || username,
          pincode: "000000",
          status: "PENDING"
        }
      })
    }

    return NextResponse.json({
      success: true,
      userId: user.userId,
      role: user.role
    })

  } catch (error) {
    console.error("Signup error:", error)

    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}