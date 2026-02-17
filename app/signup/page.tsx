'use client';

import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-semibold mb-4 text-center">
          Sign Up
        </h1>

        <p className="text-sm text-gray-600 mb-6 text-center">
          Account creation will be enabled shortly.
          Please continue with login for now.
        </p>

        <button
          className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
          onClick={() => router.push('/login')}
        >
          Go to Login
        </button>
      </div>
    </div>
  );
}