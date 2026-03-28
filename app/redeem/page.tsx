'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'

function RedeemContent() {
  const params = useSearchParams()
  const voucherId = params.get("voucherId")

  const [status, setStatus] = useState("")
  const [loading, setLoading] = useState(false)

  const redeem = async () => {
    if (!voucherId) {
      setStatus("Invalid voucher")
      return
    }

    setLoading(true)

    const res = await fetch("/api/voucher/redeem", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ voucherId })
    })

    const text = await res.text()

    if (!res.ok) {
      setStatus(text)
      setLoading(false)
      return
    }

    setStatus("✅ Voucher Redeemed Successfully")
    setLoading(false)
  }

  return (
    <div className="p-6 border rounded text-center">
      <h2 className="text-xl font-bold mb-3">
        Voucher Redemption
      </h2>

      <p className="mb-4">
        Voucher ID: {voucherId}
      </p>

      <button
        className="bg-green-600 text-white px-4 py-2 rounded"
        onClick={redeem}
        disabled={loading}
      >
        {loading ? "Processing..." : "Redeem Voucher"}
      </button>

      <p className="mt-4">{status}</p>
    </div>
  )
}

export default function RedeemPage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Suspense fallback={<div>Loading voucher...</div>}>
        <RedeemContent />
      </Suspense>
    </div>
  )
}