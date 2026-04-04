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

  /* ===============================
     AUTH CHECK (RESELLER ONLY)
  =============================== */
  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (!data.authenticated) {
          router.push("/login")
          return
        }

        if (data.role !== "RESELLER") {
          alert("Only dealers can redeem vouchers")
          router.push("/")
          return
        }

        setDealerId(data.userId)
      })
      .catch(() => {
        router.push("/login")
      })
  }, [router])

  /* ===============================
     FETCH VOUCHER DETAILS
  =============================== */
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
      .catch(() => {
        setStatus("Error loading voucher")
      })
      .finally(() => {
        setLoadingVoucher(false)
      })
  }, [voucherId])

  /* ===============================
     REDEEM FUNCTION
  =============================== */
  const redeem = async () => {
    if (!voucherId || !dealerId) {
      setStatus("Invalid request")
      return
    }

    setLoading(true)

    try {
      const res = await fetch("/api/voucher/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          voucherId,
          dealerId
        })
      })

      const data = await res.json()

      if (!res.ok) {
        setStatus(data.message || "Error")
        return
      }

      setStatus("✅ Voucher Redeemed Successfully")
    } catch {
      setStatus("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 border rounded text-center">
      <h2 className="text-xl font-bold mb-3">
        Voucher Redemption
      </h2>

      <p className="mb-4">
        Voucher ID: {voucherId}
      </p>

      {loadingVoucher ? (
        <p>Loading voucher...</p>
      ) : voucher ? (
        <div className="mb-4 text-left border p-3 rounded">
          <p><b>Value:</b> ₹{voucher.value}</p>
          <p><b>Status:</b> {voucher.status}</p>
          <p><b>Expiry:</b> {new Date(voucher.expiryDate).toLocaleDateString()}</p>
        </div>
      ) : null}

      <button
        className="bg-green-600 text-white px-4 py-2 rounded"
        onClick={redeem}
        disabled={
          loading ||
          !dealerId ||
          status.includes("Redeemed")
        }
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