'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Scanner } from '@yudiel/react-qr-scanner'

export default function ScannerPage() {
  const router = useRouter()
  const [dealerId, setDealerId] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (!data.authenticated) {
          router.push('/login')
          return
        }

        if (data.role !== "RESELLER") {
          alert("Only dealers allowed")
          router.push('/')
          return
        }

        setDealerId(data.userId)
      })
  }, [router])

  return (
    <div className="min-h-screen grid md:grid-cols-2">

      {/* ================= LEFT PANEL ================= */}
      <div className="relative bg-[#0f172a] text-white flex flex-col justify-center px-16 py-20 overflow-hidden">

        {/* 🔥 Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-blue-500/10"></div>

        {/* 🔷 BRAND */}
        <div className="relative z-10 mb-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white text-indigo-700 flex items-center justify-center font-bold">
            GC
          </div>
          <span className="text-lg font-semibold tracking-wide">
            GiftConnect
          </span>
        </div>

        {/* 🔥 HEADLINE */}
        <h2 className="relative z-10 text-4xl font-extrabold mb-6 leading-tight max-w-lg">
          Digital Voucher Flow
          <span className="block text-indigo-400">
            Simplified for OEM Ecosystem
          </span>
        </h2>

        {/* 🔹 SUBTEXT */}
        <p className="relative z-10 text-white/70 mb-12 max-w-md">
          A structured flow connecting corporates, OEMs and dealers
          with seamless voucher issuance and redemption tracking.
        </p>

        {/* 🔁 FLOWCHART */}
        <div className="relative z-10 flex flex-col gap-6">

          {/* STEP 1 */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center text-xl">
              🏢
            </div>
            <span>Corporate places bulk order</span>
          </div>

          <div className="ml-6 h-6 border-l border-white/30"></div>

          {/* STEP 2 */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center text-xl">
              🏭
            </div>
            <span>OEM allocates vehicles</span>
          </div>

          <div className="ml-6 h-6 border-l border-white/30"></div>

          {/* STEP 3 */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center text-xl">
              🏪
            </div>
            <span>Dealer / Reseller mapped</span>
          </div>

          <div className="ml-6 h-6 border-l border-white/30"></div>

          {/* STEP 4 */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center text-xl">
              🎟
            </div>
            <span>Voucher issued digitally</span>
          </div>

          <div className="ml-6 h-6 border-l border-white/30"></div>

          {/* STEP 5 */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center text-xl">
              💰
            </div>
            <span>Redemption & settlement</span>
          </div>

        </div>

      </div>

      {/* ================= RIGHT PANEL ================= */}
      <div className="flex items-center justify-center px-4 bg-gray-50">

        <div className="bg-white shadow-2xl rounded-2xl p-6 w-full max-w-md text-center">

          <h1 className="text-2xl font-bold mb-2">
            Scan Voucher
          </h1>

          <p className="text-gray-500 mb-6 text-sm">
            Point your camera at QR code
          </p>

          <div className="rounded-xl overflow-hidden border">
            <Scanner
              onScan={(result) => {
                if (result && result[0]?.rawValue) {
                  router.push(result[0].rawValue)
                }
              }}
              onError={(err) => console.error(err)}
            />
          </div>

        </div>

      </div>

    </div>
  )
}