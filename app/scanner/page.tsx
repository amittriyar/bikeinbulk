'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Scanner } from '@yudiel/react-qr-scanner'

export default function ScannerPage() {
  const router = useRouter()
  const [dealerId, setDealerId] = useState<string | null>(null)

  /* ===============================
     AUTH CHECK
  =============================== */
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
    <div className="min-h-screen flex flex-col items-center justify-center p-4">

      <h1 className="text-2xl font-bold mb-6">
        Scan Voucher
      </h1>

      <div className="w-full max-w-md">
        <Scanner
          onScan={(result) => {
            if (result && result[0]?.rawValue) {
              const qrText = result[0].rawValue

              // ✅ redirect to redeem page
              router.push(qrText)
            }
          }}
          onError={(err) => {
            console.error(err)
          }}
        />
      </div>

    </div>
  )
}