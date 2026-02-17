'use client';

import Link from 'next/link';
import GCLogo from '@/components/GCLogo';

export default function TopNav() {
  return (
    <nav className="bg-indigo-700 text-white px-6 py-4 flex items-center gap-6">
      
      {/* GC LOGO */}
      <Link href="/" className="flex items-center gap-2">
        <GCLogo />
      </Link>

      {/* NAV LINKS */}
      <Link href="/" className="hover:underline">
        Home
      </Link>

      <Link href="/buyers" className="hover:underline">
        Buyers
      </Link>

      <Link href="/sellersdashboard" className="hover:underline">
        Sellers
      </Link>

      {/* RIGHT ACTIONS */}
      <div className="ml-auto flex gap-4 items-center">
        <Link href="/login" className="hover:underline">
          Login
        </Link>

        <Link
          href="/signup"
          className="bg-white text-indigo-700 px-3 py-1 rounded hover:bg-indigo-100"
        >
          Sign Up
        </Link>
      </div>
    </nav>
  );
}