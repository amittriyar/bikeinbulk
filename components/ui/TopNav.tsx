'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import GCLogo from '@/components/GCLogo'
export default function TopNav() {
  const router = useRouter()

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
  }

  return (
    <nav className="bg-gradient-to-r from-indigo-700 to-blue-700 text-white px-8 py-4 flex items-center justify-between shadow-md">

      {/* LEFT - LOGO */}
      <Link href="/" className="hover:opacity-90 transition">
        <GCLogo />
      </Link>
      {/* RIGHT - NAV */}
      <div className="flex items-center gap-8 text-sm font-medium">
        <Link href="/buyers" className="hover:text-gray-200 transition">
          Buyers
        </Link>

        <Link href="/sellersdashboard" className="hover:text-gray-200 transition">
          Sellers
        </Link>

        <button
          onClick={handleLogout}
          className="bg-white text-indigo-700 px-4 py-1.5 rounded-full font-semibold hover:bg-gray-200 transition"
        >
          Logout
        </button>
      </div>
    </nav>
  )
}