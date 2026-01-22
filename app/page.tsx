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
            <button variant="ghost" className="text-white hover:bg-white/10" onClick={() => window.location.href='/login'}>
              Login
            </button>
            <button className="bg-white text-indigo-700 hover:bg-indigo-100" onClick={() => window.location.href='/signup'}>
              Sign Up
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-36 px-6 overflow-hidden">
        {/* Background Art */}
        <div className="absolute -top-20 -left-32 w-96 h-96 bg-indigo-500 rounded-full opacity-30 animate-pulse"></div>
        <div className="absolute top-10 right-0 w-80 h-80 bg-blue-400 rounded-full opacity-20 animate-spin-slow"></div>
        <div className="relative max-w-5xl mx-auto text-center z-10">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 drop-shadow-lg">
            GiftConnect – Unified Voucher Platform
          </h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto mb-8 drop-shadow-sm">
            Issue, manage and redeem digital value vouchers across OEMs, dealers, and corporates – for two-wheeler and four-wheeler ecosystems.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <button size="lg" className="bg-white text-indigo-700 hover:scale-105 transform transition">
              For OEMs →
            </button>
            <button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-indigo-700 hover:scale-105 transform transition" onClick={() => window.location.href='/buyers'}>
              Corporate Gifting
            </button>
          </div>
        </div>
      </section>

      {/* SEARCH + CATEGORY TABS */}
      <section className="py-16 px-6 -mt-20 relative z-20">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8 flex justify-center">
            <input
              type="text"
              placeholder="Search OEMs, products, vouchers…"
              className="w-full md:w-1/2 px-5 py-3 rounded-full border border-gray-300 bg-white text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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

          {/* BUSINESS ACTIVITIES */}
          <div className="grid md:grid-cols-3 gap-10 mb-16">
            {['Digital Gift Cards & Vouchers','Channel & Sales Incentives','Consumer Promotions','Closed-loop Voucher Technology','Corporate & B2B Gifting','Analytics & Settlement'].map((item, i) => (
              <div key={i} className="shadow-xl rounded-3xl hover:scale-105 transform transition duration-500">
                <div className="p-10 text-center">
                  <h3 className="text-xl font-semibold">{item}</h3>
                </div>
              </div>
            ))}
          </div>

          {/* CTA BUTTON */}
          <div className="text-center">
            <button size="lg" className="bg-indigo-600 text-white hover:bg-indigo-700" onClick={() => window.location.href='/buyers'}>
              Explore OEMs & Product Catalogue (For Corporates)
            </button>
          </div>
        </div>
      </section>

      {/* ABOUT, BUSINESS, CONTACT */}
      <section className="py-20 px-6 bg-gray-100">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-10 items-start">
          {/* ABOUT US */}
          <div className="bg-white shadow-2xl rounded-3xl p-10">
            <h2 className="text-3xl font-bold mb-6">About Us</h2>
            <p className="text-lg text-gray-700 mb-4">
              GiftConnect streamlines digital vouchers and incentives for OEMs, dealers, and corporates.
            </p>
            <p className="text-lg text-gray-700 mb-4">
              <strong>Amit Verma</strong> is a senior sales leader with 20+ years of experience in institutional sales, channel management, and OEM partnerships.
            </p>
            <p className="text-lg text-gray-700">
              Founder: Amit Verma <br />
              Mobile: 8826462828 <br />
              Email: amittryl@gmail.com
            </p>
          </div>

          {/* BUSINESS ACTIVITIES */}
          <div className="bg-white shadow-2xl rounded-3xl p-10">
            <h2 className="text-3xl font-bold mb-6">Our Business Activities</h2>
            <ul className="space-y-3 text-lg text-gray-700">
              <li>Digital Gift Cards & Vouchers</li>
              <li>Channel & Sales Incentives</li>
              <li>Consumer Promotions</li>
              <li>Closed-loop Voucher Technology</li>
              <li>Corporate & B2B Gifting</li>
              <li>Analytics & Settlement</li>
            </ul>
          </div>

          {/* CONTACT US */}
          <div className="bg-white shadow-2xl rounded-3xl p-10">
            <h2 className="text-3xl font-bold mb-6">Get In Touch with Us</h2>
            <form className="space-y-6">
              <input type="text" placeholder="Company Name" className="w-full border border-gray-300 rounded-lg p-3" />
              <input type="text" placeholder="Contact Person" className="w-full border border-gray-300 rounded-lg p-3" />
              <input type="email" placeholder="Email Address" className="w-full border border-gray-300 rounded-lg p-3" />
              <input type="tel" placeholder="Mobile Number" className="w-full border border-gray-300 rounded-lg p-3" />
              <textarea placeholder="Message / Requirements" className="w-full border border-gray-300 rounded-lg p-3"></textarea>
              <button type="submit" size="lg" className="bg-indigo-600 text-white hover:bg-indigo-700 w-full">Submit</button>
            </form>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-indigo-700 to-blue-700 text-white py-20 px-6 relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6 drop-shadow-lg">Ready to Digitize Vehicle Incentives?</h2>
          <p className="mb-10 text-lg drop-shadow-sm">Launch a pilot with selected dealers in under 30 days.</p>
          <button size="lg" className="bg-white text-indigo-700 hover:scale-105 transform transition">Schedule Demo</button>
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
