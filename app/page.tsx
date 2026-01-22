'use client';

import React from "react";

export default function HomePage() {
  return (
    <div className="min-h-screen font-sans bg-gray-50">

      {/* TOP NAV */}
      <header className="fixed top-0 right-0 left-0 z-50 px-4 py-4 bg-gradient-to-r from-indigo-700 to-blue-700 shadow-md">
        <div className="max-w-5xl mx-auto flex justify-between items-center">

          {/* LOGO */}
          <div className="flex flex-col items-start leading-tight">
            <div className="w-8 h-8 rounded-full bg-white text-indigo-700 flex items-center justify-center font-bold text-sm">
              GC
            </div>
            <span className="text-xs text-white mt-1 tracking-wide">GiftConnect</span>
          </div>

          {/* AUTH BUTTONS */}
          <div className="flex items-center gap-3">
            <button
              className="px-4 py-2 rounded-md text-white hover:bg-white/10 transition"
              onClick={() => window.location.href = '/login'}
            >
              Login
            </button>

            <button
              className="px-4 py-2 rounded-md bg-white text-indigo-700 hover:bg-indigo-100 transition"
              onClick={() => window.location.href = '/signup'}
            >
              Sign Up
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative bg-gradient-to-r from-indigo-600 to-blue-600 text-white pt-36 pb-32 px-6 overflow-hidden">
        <div className="absolute -top-20 -left-32 w-96 h-96 bg-indigo-500 rounded-full opacity-30 animate-pulse"></div>
        <div className="absolute top-10 right-0 w-80 h-80 bg-blue-400 rounded-full opacity-20"></div>

        <div className="relative max-w-5xl mx-auto text-center z-10">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 drop-shadow-lg">
            GiftConnect – Unified Voucher Platform
          </h1>

          <p className="text-xl md:text-2xl max-w-3xl mx-auto mb-8">
            Issue, manage and redeem digital value vouchers across OEMs, dealers, and corporates – for two-wheeler and four-wheeler ecosystems.
          </p>

          <div className="flex justify-center gap-4 flex-wrap">
            <button className="px-8 py-4 rounded-lg bg-white text-indigo-700 hover:scale-105 transition">
              For OEMs →
            </button>

            <button
              className="px-8 py-4 rounded-lg border border-white text-white hover:bg-white hover:text-indigo-700 transition"
              onClick={() => window.location.href = '/buyers'}
            >
              Corporate Gifting
            </button>
          </div>
        </div>
      </section>

      {/* SEARCH + TABS */}
      <section className="py-16 px-6 -mt-20 relative z-20">
        <div className="max-w-5xl mx-auto">

          <div className="mb-8 flex justify-center">
            <input
              type="text"
              placeholder="Search OEMs, products, vouchers…"
              className="w-full md:w-1/2 px-5 py-3 rounded-full border border-gray-300 focus:ring-2 focus:ring-indigo-500"
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
              <div key={i} className="bg-white shadow-xl rounded-3xl p-10 text-center hover:scale-105 transition">
                <h3 className="text-xl font-semibold">{item}</h3>
              </div>
            ))}
          </div>

          <div className="text-center">
            <button
              className="px-8 py-4 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition"
              onClick={() => window.location.href = '/buyers'}
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
