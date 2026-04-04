'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const router = useRouter();
  const [companyName, setCompanyName] = useState('')
  const [companyAddress, setCompanyAddress] = useState('')
  const [gstNumber, setGstNumber] = useState('')
  const [panNumber, setPanNumber] = useState('')
  const [bankAccount, setBankAccount] = useState('')
  const [ifscCode, setIfscCode] = useState('')
  const [contactPerson, setContactPerson] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [parentSellerId, setParentSellerId] = useState('')
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'BUYER' | 'SELLER' | 'RESELLER'>('BUYER');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
          role: role.toUpperCase(),

          companyName,
          companyAddress,
          gstNumber,
          panNumber,
          bankAccount,
          ifscCode,
          contactPerson,
          phoneNumber,

          parentSellerId
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Signup failed');
        setLoading(false);
        return;
      }

      router.push('/login');
    } catch {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (

    <div className="min-h-screen grid md:grid-cols-2">

      {/* LEFT BRAND PANEL */}
      <div className="bg-gradient-to-br from-indigo-700 to-blue-700 text-white flex flex-col justify-center p-12">

        <div className="mb-10">
          <div className="w-10 h-10 rounded-full bg-white text-indigo-700 flex items-center justify-center font-bold">
            GC
          </div>

          <h1 className="text-3xl font-bold mt-4">
            GiftConnect
          </h1>
        </div>

        <h2 className="text-4xl font-bold mb-6 leading-tight">
          Enterprise Platform for Vehicle Incentive Programs
        </h2>

        <p className="text-lg opacity-90 max-w-md">
          Structured marketplace for corporate vehicle programs,
          demand aggregation, competitive bidding, voucher issuance,
          redemption tracking and reseller settlement.
        </p>

      </div>

      {/* RIGHT FORM */}
      <div className="flex items-center justify-center bg-gray-50">

        <form
          onSubmit={handleSignup}
          className="bg-white p-10 rounded-xl shadow-xl w-full max-w-md"
        >

          <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Create Account
          </h1>

          {error && (
            <div className="mb-4 text-red-600 text-sm text-center">
              {error}
            </div>
          )}

          <label className="block text-sm font-medium text-gray-700 mb-1">
            Username
          </label>

          <input
            type="text"
            className="w-full border border-gray-300 px-3 py-2 mb-4 rounded focus:ring-2 focus:ring-indigo-500 text-gray-900"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>

          <input
            type="password"
            className="w-full border border-gray-300 px-3 py-2 mb-4 rounded focus:ring-2 focus:ring-indigo-500 text-gray-900"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <input placeholder="Company Name" onChange={e => setCompanyName(e.target.value)} />
          <input placeholder="Company Address" onChange={e => setCompanyAddress(e.target.value)} />
          <input placeholder="GST Number" onChange={e => setGstNumber(e.target.value)} />
          <input placeholder="PAN Number" onChange={e => setPanNumber(e.target.value)} />
          <input placeholder="Bank Account" onChange={e => setBankAccount(e.target.value)} />
          <input placeholder="IFSC Code" onChange={e => setIfscCode(e.target.value)} />
          <input placeholder="Contact Person" onChange={e => setContactPerson(e.target.value)} />
          <input placeholder="Phone Number" onChange={e => setPhoneNumber(e.target.value)} />
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Account Type
          </label>

          <select
            className="w-full border border-gray-300 px-3 py-2 mb-6 rounded focus:ring-2 focus:ring-indigo-500 text-gray-900"
            value={role}
            onChange={(e) =>
              setRole(e.target.value as 'BUYER' | 'SELLER' | 'RESELLER')

            }

          >
            <option value="BUYER">Buyer</option>
            <option value="SELLER">Seller</option>
            <option value="RESELLER">Reseller</option>

          </select>
          {role === "RESELLER" && (
            <input
              className="border p-2 w-full mb-3"
              placeholder="Parent Seller ID"
              onChange={e => setParentSellerId(e.target.value)}
            />
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition font-semibold"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>

          <p className="text-center text-sm text-gray-600 mt-6">
            Already have an account?{' '}
            <a href="/login" className="text-indigo-600 font-medium hover:underline">
              Login
            </a>
          </p>

        </form>

      </div>
    </div>
  );
}