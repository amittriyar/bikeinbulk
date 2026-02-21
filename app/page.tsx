'use client';

import React from "react";
import GCLogo from '@/components/GCLogo'
export default function HomePage() {
  return (
    <div className="min-h-screen font-sans bg-gray-50">

      {/* TOP NAV */}
      <header className="bg-gradient-to-r from-indigo-700 to-blue-700 text-white px-8 py-4 shadow-md">
        <div className="max-w-6xl mx-auto flex justify-between items-center">

          {/* LEFT - LOGO */}
          <GCLogo />

          {/* RIGHT - AUTH */}
          <div className="flex items-center gap-6 text-sm font-medium">
            <button
              onClick={() => window.location.href = '/login'}
              className="hover:text-gray-200 transition"
            >
              Login
            </button>

            <button
              onClick={() => window.location.href = '/signup'}
              className="bg-white text-indigo-700 px-4 py-1.5 rounded-full font-semibold hover:bg-gray-200 transition"
            >
              Sign Up
            </button>
          </div>

        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative bg-gradient-to-b from-indigo-50 to-white py-36 px-6 overflow-hidden">

        {/* Soft transparent shapes */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-200 rounded-full opacity-30 blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-200 rounded-full opacity-20 blur-3xl"></div>

        <div className="relative max-w-5xl mx-auto text-center z-10">

          {/* Premium Badge */}
          <div className="inline-block mb-6 px-4 py-1 rounded-full bg-indigo-100 text-indigo-700 text-sm font-semibold">
            India’s Unified Closed-Loop Voucher Platform
          </div>

          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-indigo-700 to-blue-600 bg-clip-text text-transparent">
              Unified Digital Voucher
            </span>
            <br />
            Platform for OEM Ecosystem
          </h1>

          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed">
            Issue, manage and redeem digital value vouchers across OEMs,
            dealers and corporates — purpose-built for India’s
            two-wheeler and four-wheeler industry.
          </p>

          <div className="flex justify-center gap-6 flex-wrap">

            <button
              onClick={() => window.location.href = '/sellersdashboard'}
              className="px-10 py-4 rounded-full bg-indigo-600 text-white font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
            >
              For OEMs →
            </button>

            <button
              onClick={() => window.location.href = '/buyers'}
              className="px-10 py-4 rounded-full border-2 border-indigo-600 text-indigo-700 font-semibold hover:bg-indigo-50 hover:scale-105 transition-all duration-300"
            >
              Corporate Gifting
            </button>

          </div>

        </div>
      </section>

      {/* SEARCH + TABS */}
      <section className="py-16 px-6 -mt-20 relative z-20">
        <div className="max-w-5xl mx-auto">

          <div className="mb-12 flex justify-center">
            <input
              type="text"
              placeholder="Search OEMs, products, vouchers…"
              className="w-full md:w-1/2 px-6 py-4 rounded-full border border-gray-200 shadow-lg backdrop-blur-md bg-white/80 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
            />
          </div>

          <div className="flex justify-center mb-10">
            <div className="bg-white rounded-full shadow-lg flex overflow-hidden">
              <button className="px-6 py-3 text-sm font-semibold bg-indigo-600 text-white">2W / 4W OEMs</button>
              <button className="px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-100">Dealers</button>
              <button className="px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-100">Corporates</button>
            </div>
          </div>

          <h2 className="text-4xl font-bold text-center mb-16">
            Built for the Two-Wheeler and Four-Wheeler Ecosystem
          </h2>

          <div className="grid md:grid-cols-3 gap-10 mb-16">
            {[
              "Digital Gift Cards & Vouchers",
              "Channel & Sales Incentives",
              "Consumer Promotions",
              "Closed-loop Voucher Technology",
              "Corporate & B2B Gifting",
              "Analytics & Settlement"
            ].map((item, i) => (
              <div key={i} className="bg-white shadow-lg hover:shadow-2xl rounded-3xl p-10 text-center hover:-translate-y-2 transition-all duration-300 border border-gray-100">
                <h3 className="text-xl font-semibold">{item}</h3>
              </div>
            ))}
          </div>

          <div className="text-center">
            <button
              className="px-8 py-4 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition"
              onClick={() => window.location.href = '/buyersnext'}
            >
              Explore OEMs & Product Catalogue
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-6 flex flex-col md:flex-row justify-between items-center">
        <p>© 2026 GiftConnect</p>
        <p>GST-compliant • Closed-loop vouchers • Secure</p>
      </footer>

    </div>
  );
}
