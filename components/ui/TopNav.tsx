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
      const res = await fetch('/api/auth/me')
      if (res.ok) {
        setAuthenticated(true)
      } else {
        setAuthenticated(false)
      }
    }

    checkAuth()
  }, [])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  return (
  <nav className="bg-gradient-to-r from-indigo-700 to-blue-700 text-white px-8 py-4 shadow-md">
    <div className="max-w-6xl mx-auto flex justify-between items-center">

      <Link href="/" className="flex items-center">
        <GCLogo />
      </Link>

      {authenticated && (
        <button
          onClick={handleLogout}
          className="bg-white text-indigo-700 px-4 py-1.5 rounded-full font-semibold hover:bg-gray-200 transition"
        >
          Logout
        </button>
      )}

    </div>
  </nav>
)
}