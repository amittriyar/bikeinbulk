'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SignupPage() {
  const router = useRouter()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'BUYER' | 'SELLER' | 'RESELLER'>('BUYER')

  const [companyName, setCompanyName] = useState('')
  const [companyAddress, setCompanyAddress] = useState('')
  const [gstNumber, setGstNumber] = useState('')
  const [panNumber, setPanNumber] = useState('')
  const [bankAccount, setBankAccount] = useState('')
  const [ifscCode, setIfscCode] = useState('')
  const [contactPerson, setContactPerson] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [parentSellerId, setParentSellerId] = useState('')

  const [state, setState] = useState('')
  const [city, setCity] = useState('')
  const [pincode, setPincode] = useState('')

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const inputClass =
    "w-full border border-gray-300 px-3 py-2 rounded focus:ring-2 focus:ring-indigo-500 text-gray-900"

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
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

          parentSellerId,
          state,
          city,
          pincode
        })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || 'Signup failed')
        return
      }

      router.push('/login')
    } catch {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }
  const fetchLocationFromPincode = async (pin: string) => {
    if (pin.length !== 6) return

    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`)
      const data = await res.json()

      if (data[0].Status === "Success") {
        const postOffice = data[0].PostOffice[0]

        setState(postOffice.State)
        setCity(postOffice.District)
      } else {
        setState('')
        setCity('')
      }
    } catch {
      setState('')
      setCity('')
    }
  }
  return (
    <div className="min-h-screen grid md:grid-cols-2">

      {/* LEFT BRAND PANEL */}
      {/* LEFT BRAND PANEL */}
      {/* LEFT BRAND PANEL */}
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

      {/* RIGHT FORM */}
      <div className="flex items-center justify-center bg-gray-50">

        <form
          onSubmit={handleSignup}
          className="bg-white p-8 rounded-xl shadow-xl w-full max-w-2xl"
        >

          <h2 className="text-2xl font-bold mb-6 text-center">
            Create Account
          </h2>

          {error && (
            <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
          )}

          {/* ACCOUNT */}
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Account Details</h3>
            <input placeholder="Username" className={inputClass + " mb-3"} onChange={e => setUsername(e.target.value)} />
            <input type="password" placeholder="Password" className={inputClass} onChange={e => setPassword(e.target.value)} />
          </div>

          {/* COMPANY */}
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Company Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <input placeholder="Company Name" className={inputClass} onChange={e => setCompanyName(e.target.value)} />
              <input placeholder="Company Address" className={inputClass} onChange={e => setCompanyAddress(e.target.value)} />
              <input placeholder="GST Number" className={inputClass} onChange={e => setGstNumber(e.target.value)} />
              <input placeholder="PAN Number" className={inputClass} onChange={e => setPanNumber(e.target.value)} />
            </div>
          </div>

          {/* BANK */}
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Banking Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <input placeholder="Bank Account" className={inputClass} onChange={e => setBankAccount(e.target.value)} />
              <input placeholder="IFSC Code" className={inputClass} onChange={e => setIfscCode(e.target.value)} />
            </div>
          </div>

          {/* CONTACT */}
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Contact Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <input placeholder="Contact Person" className={inputClass} onChange={e => setContactPerson(e.target.value)} />
              <input placeholder="Phone Number" className={inputClass} onChange={e => setPhoneNumber(e.target.value)} />
            </div>
          </div>

          {/* ROLE */}
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Account Type</h3>
            <select className={inputClass} value={role} onChange={e => setRole(e.target.value as any)}>
              <option value="BUYER">Buyer</option>
              <option value="SELLER">Seller</option>
              <option value="RESELLER">Reseller</option>
            </select>
          </div>

          {/* RESELLER EXTRA */}
          {role === "RESELLER" && (
            <div className="mb-6 grid grid-cols-2 gap-4">
              <input placeholder="Parent Seller ID" className={inputClass} onChange={e => setParentSellerId(e.target.value)} />
              <input
                placeholder="State"
                className={inputClass}
                value={state}
                readOnly
              />

              <input
                placeholder="City"
                className={inputClass}
                value={city}
                readOnly
              />
              <input
                placeholder="Pincode"
                className={inputClass}
                value={pincode}
                onChange={(e) => {
                  const pin = e.target.value
                  setPincode(pin)
                  fetchLocationFromPincode(pin)
                }}
              />
            </div>
          )}

          {/* BUTTON */}
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded font-semibold hover:bg-indigo-700"
          >
            {loading ? "Creating..." : "Create Account"}
          </button>

          {/* LOGIN LINK */}
          <p className="text-center text-sm text-gray-600 mt-6">
            Already have an account?{' '}
            <a href="/login" className="text-indigo-600 font-medium hover:underline">
              Login
            </a>
          </p>

        </form>
      </div>
    </div>
  )
}