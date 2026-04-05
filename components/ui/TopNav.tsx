'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import GCLogo from '@/components/GCLogo'

export default function TopNav() {
  const [authenticated, setAuthenticated] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me')
        const data = await res.json()

        setAuthenticated(data?.authenticated === true)
      } catch {
        setAuthenticated(false)
      }
    }

    checkAuth()
  }, [])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
  }

  return (
    <>
      {/* ✅ FIXED NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-gradient-to-r from-indigo-700/90 to-blue-700/90 text-white shadow-md">
        <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-100 py-4">
          <div className="px-6">

            <div className="bg-gray-350 border rounded-2xl px-6 py-3 shadow-sm flex justify-between items-center">

              {/* LEFT - LOGO (UNCHANGED FUNCTIONALITY) */}
              <Link href="/" className="flex items-center gap-3">

                {/* Indigo pill for visibility */}
                <div className="bg-indigo-600 text-white px-3 py-1.5 rounded-full flex items-center">
                  <GCLogo />
                </div>
              </Link>

              {/* CENTER (UNCHANGED LOGIC) */}
              <div className="flex justify-center gap-4 flex-wrap">

                <button
                  onClick={() => router.push('/sellersdashboard')}
                  className="px-5 py-2 rounded-full bg-indigo-600 text-white text-sm font-semibold 
                     hover:bg-indigo-700 transition"
                >
                  For OEMs →
                </button>

                <button
                  onClick={() => router.push('/buyers')}
                  className="px-5 py-2 rounded-full border border-gray-300 text-gray-700 text-sm font-semibold 
                     hover:bg-gray-100 transition"
                >
                  Corporate Gifting
                </button>

              </div>

              {/* RIGHT (UNCHANGED LOGIC) */}
              <div className="flex items-center gap-3 text-sm font-medium">

                {!authenticated ? (
                  <>
                    <Link
                      href="/login"
                      className="text-gray-700 px-3 py-1.5 rounded-full hover:bg-gray-100 transition"
                    >
                      Login
                    </Link>

                    <Link
                      href="/signup"
                      className="bg-indigo-600 text-white px-4 py-1.5 rounded-full font-semibold hover:bg-indigo-700 transition"
                    >
                      Sign Up
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href="/sellersdashboard"
                      className="text-gray-700 px-3 py-1.5 rounded-full hover:bg-gray-100 transition"
                    >
                      Dashboard
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="bg-indigo-600 text-white px-4 py-1.5 rounded-full font-semibold hover:bg-indigo-700 transition"
                    >
                      Logout
                    </button>
                  </>
                )}

              </div>

            </div>
          </div>
        </nav>
      </nav>

      {/* ✅ SPACER (VERY IMPORTANT) */}
      <div className="h-16"></div>
    </>
  )
}