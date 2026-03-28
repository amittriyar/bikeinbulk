'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'Invalid credentials');
        return;
      }

      if (data.role === 'SELLER') {
        router.push('/sellersdashboard');
      } else if (data.role === 'BUYER') {
        router.push('/buyers');
      } else {
        router.push('/');
      }

    } catch {
      setError('Something went wrong. Please try again.');
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

      {/* RIGHT LOGIN FORM */}
      <div className="flex items-center justify-center bg-gray-50">

        <form
          onSubmit={handleLogin}
          className="bg-white p-10 rounded-xl shadow-xl w-full max-w-md"
        >

          <h2 className="text-2xl font-bold mb-6 text-center text-gray-900">
            GiftConnect Login
          </h2>

          {error && (
            <p className="text-red-600 text-sm mb-4 text-center">
              {error}
            </p>
          )}

          <label className="block text-sm font-medium text-gray-700 mb-1">
            Username
          </label>

          <input
            type="text"
            className="w-full border border-gray-300 px-3 py-2 mb-4 rounded focus:ring-2 focus:ring-indigo-500 text-gray-900"
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>

          <input
            type="password"
            className="w-full border border-gray-300 px-3 py-2 mb-6 rounded focus:ring-2 focus:ring-indigo-500 text-gray-900"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 text-white w-full py-2 rounded hover:bg-indigo-700 transition font-semibold"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>

          <div className="mt-6 text-center text-sm text-gray-600">
            Don’t have an account?{' '}
            <span
              onClick={() => router.push('/signup')}
              className="text-indigo-600 cursor-pointer hover:underline font-medium"
            >
              Sign up
            </span>
          </div>

        </form>

      </div>
    </div>
  );
}