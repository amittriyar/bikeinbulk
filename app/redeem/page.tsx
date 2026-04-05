'use client'

import { Suspense, useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

function RedeemContent() {
  const params = useSearchParams()
  const router = useRouter()
  const voucherId = params.get("voucherId")

  const [voucher, setVoucher] = useState<any>(null)
  const [dealerId, setDealerId] = useState<string | null>(null)
  const [status, setStatus] = useState("")
  const [loading, setLoading] = useState(false)
  const [loadingVoucher, setLoadingVoucher] = useState(true)

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (!data.authenticated) {
          router.push("/login")
          return
        }

        if (data.role !== "RESELLER") {
          router.push("/")
          return
        }

        setDealerId(data.userId)
      })
  }, [router])

  useEffect(() => {
    if (!voucherId) return

    fetch(`/api/voucher/list?voucherId=${voucherId}`)
      .then(res => res.json())
      .then(data => {
        if (data.length > 0) {
          setVoucher(data[0])
        } else {
          setStatus("❌ Voucher not found")
        }
      })
      .finally(() => setLoadingVoucher(false))
  }, [voucherId])

  const redeem = async () => {
    if (!voucherId || !dealerId) return

    setLoading(true)

    try {
      const res = await fetch("/api/voucher/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voucherId, dealerId })
      })

      const data = await res.json()

      if (!res.ok) {
        setStatus(data.message || "Error")
        return
      }

      setStatus("SUCCESS")
    } finally {
      setLoading(false)
    }
  }

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
      <div className="flex items-center justify-center bg-gray-50 px-4">

        <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">

          <h2 className="text-xl font-bold text-center mb-4">
            Voucher Redemption
          </h2>

          {loadingVoucher ? (
            <p className="text-center">Loading...</p>
          ) : voucher ? (
            <div className="border rounded-xl p-4 mb-4">

              <p className="text-sm text-gray-500 mb-2">
                Voucher ID
              </p>
              <p className="font-semibold mb-3">{voucherId}</p>

              <div className="flex justify-between text-sm mb-2">
                <span>Value</span>
                <span className="font-semibold">₹{voucher.value}</span>
              </div>

              <div className="flex justify-between text-sm mb-2">
                <span>Status</span>
                <span className="text-indigo-600 font-medium">
                  {voucher.status}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span>Expiry</span>
                <span>
                  {new Date(voucher.expiryDate).toLocaleDateString()}
                </span>
              </div>

            </div>
          ) : null}

          <button
            onClick={redeem}
            disabled={loading || !dealerId}
            className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-3 rounded-xl font-semibold hover:scale-105 transition"
          >
            {loading ? "Processing..." : "Redeem Voucher"}
          </button>

          {status && (
            <p className={`text-center mt-4 font-medium ${status === "SUCCESS" ? "text-green-600" : "text-red-500"
              }`}>
              {status === "SUCCESS"
                ? "✅ Voucher Redeemed Successfully"
                : status}
            </p>
          )}

        </div>

      </div>

    </div>
  )
}

export default function RedeemPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RedeemContent />
    </Suspense>
  )
}