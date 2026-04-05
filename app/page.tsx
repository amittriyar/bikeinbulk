'use client'

import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="bg-white overflow-hidden">

      {/* ================= HERO ================= */}
      <section className="relative pt-32 pb-28 px-6 text-center overflow-hidden">

        {/* 🔥 BACKGROUND GLOW */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-indigo-300/30 blur-3xl rounded-full"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-300/30 blur-3xl rounded-full"></div>

        <div className="relative max-w-5xl mx-auto">

          <p className="mb-4 text-sm bg-indigo-100 text-indigo-700 inline-block px-4 py-1 rounded-full">
            India’s Unified Voucher Platform
          </p>

          <h1 className="text-5xl font-extrabold leading-tight mb-6 text-gray-900">
            Powering Digital Voucher Flow
            <br />
            <span className="text-indigo-600">
              Across OEM Ecosystem
            </span>
          </h1>

          <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto">
            Issue, track and redeem vehicle-linked vouchers across OEMs,
            dealers and corporates — with complete transparency and control.
          </p>

          <div className="flex justify-center gap-4">
            <Link
              href="/signup"
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:scale-105 transition"
            >
              Get Started
            </Link>

            <Link
              href="#demo"
              className="border border-gray-300 px-6 py-3 rounded-lg hover:bg-gray-50 transition"
            >
              Request Demo
            </Link>
          </div>

        </div>
      </section>


      {/* ================= FLOATING FLOW ================= */}
      <section className="py-20 px-6 max-w-6xl mx-auto">

        <h2 className="text-3xl font-bold text-center mb-16">
          How It Works
        </h2>

        <div className="grid md:grid-cols-5 gap-8 text-center">

          {[
            ["🏢", "Corporate Order"],
            ["🏭", "OEM Allocation"],
            ["🏪", "Dealer Mapping"],
            ["🎟", "Voucher Issued"],
            ["💰", "Redemption"],
          ].map(([icon, text], i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition hover:-translate-y-2"
            >
              <div className="text-3xl mb-3">{icon}</div>
              <p className="font-medium">{text}</p>
            </div>
          ))}

        </div>

      </section>


      {/* ================= DASHBOARD PREVIEW ================= */}
      <section className="bg-gray-50 py-20 px-6 text-center">

        <h2 className="text-3xl font-bold mb-6">
          Complete Visibility & Control
        </h2>

        <p className="text-gray-600 mb-12">
          Manage RFQs, orders, vouchers and redemption in one unified dashboard
        </p>

        <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-2xl p-6">

          {/* FAKE DASHBOARD UI */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="bg-indigo-100 p-4 rounded">RFQs</div>
            <div className="bg-blue-100 p-4 rounded">Orders</div>
            <div className="bg-green-100 p-4 rounded">Vouchers</div>
          </div>

          <div className="bg-gray-100 h-40 rounded flex items-center justify-center text-gray-400">
            Dashboard Preview
          </div>

        </div>

      </section>


      {/* ================= FEATURES ================= */}
      <section className="py-20 px-6 max-w-6xl mx-auto">

        <h2 className="text-3xl font-bold text-center mb-12">
          Why GiftConnect
        </h2>

        <div className="grid md:grid-cols-3 gap-6">

          <Feature title="Smart RFQ System" desc="Competitive bidding across dealers." />
          <Feature title="Voucher Lifecycle" desc="Track issuance to redemption." />
          <Feature title="Secure Redemption" desc="QR-based validation system." />
          <Feature title="Reseller Mapping" desc="Assign dealers efficiently." />
          <Feature title="Bulk Operations" desc="Upload and manage at scale." />
          <Feature title="Settlement Tracking" desc="End-to-end reconciliation." />

        </div>

      </section>


      {/* ================= DEMO SECTION ================= */}
      <section id="demo" className="bg-indigo-600 text-white py-20 px-6 text-center">

        <h2 className="text-3xl font-bold mb-4">
          See GiftConnect in Action
        </h2>

        <p className="mb-6">
          Book a demo and experience how your entire voucher ecosystem transforms
        </p>

        <button className="bg-white text-indigo-600 px-6 py-3 rounded-lg font-semibold">
          Request Demo
        </button>

      </section>


      {/* ================= FOOTER ================= */}
      <footer className="text-center py-6 text-gray-500 text-sm">
        © 2026 GiftConnect. All rights reserved.
      </footer>

    </div>
  )
}


/* ================= COMPONENT ================= */

function Feature({ title, desc }: any) {
  return (
    <div className="bg-white p-6 rounded-xl border hover:shadow-lg transition hover:-translate-y-1">
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{desc}</p>
    </div>
  )
}