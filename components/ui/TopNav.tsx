'use client';

import Link from 'next/link';
import GCLogo from '@/components/GCLogo';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function TopNav() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const res = await fetch('/api/auth/me');
      const data = await res.json();

      if (data.authenticated) {
        setUser(data.user);
      }
    };

    checkAuth();
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    router.push('/login');
  };

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

      {/* RIGHT SIDE */}
      <div className="ml-auto flex gap-4 items-center relative">
        
        {!user ? (
          <>
            <Link href="/login" className="hover:underline">
              Login
            </Link>

            <Link
              href="/signup"
              className="bg-white text-indigo-700 px-3 py-1 rounded hover:bg-indigo-100"
            >
              Sign Up
            </Link>
          </>
        ) : (
          <div>
            <button
              onClick={() => setOpen(!open)}
              className="bg-white/10 px-4 py-2 rounded hover:bg-white/20"
            >
              Account ▾
            </button>

            {open && (
              <div className="absolute right-0 mt-2 w-40 bg-white text-black rounded shadow-lg">
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </nav>
  );
}
