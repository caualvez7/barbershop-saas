'use client'

import Link from 'next/link'

export default function Navbar() {
  return (
    <header className="w-full border-b bg-white/80 backdrop-blur sticky top-0 z-50">

      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* LOGO */}
        <Link
          href=""
          className="text-xl font-bold text-slate-900"
        >
          BarberShop<span className="text-blue-600">BR</span>
        </Link>

        {/* LINKS */}
        <nav className="hidden md:flex items-center gap-6">

          <button
            onClick={() => {
              document
                .getElementById('plans')
                ?.scrollIntoView({ behavior: 'smooth' })
            }}
            className="text-slate-600 hover:text-slate-900 transition"
          >
            Planos
          </button>

          <Link
            href="/login"
            className="text-slate-600 hover:text-slate-900 transition"
          >
            Login
          </Link>

          <button
            onClick={() => {
              document
                .getElementById('plans')
                ?.scrollIntoView({ behavior: 'smooth' })
            }}
            className="bg-blue-600 hover:bg-blue-700 transition text-white px-4 py-2 rounded-xl"
          >
            Começar agora
          </button>

        </nav>

      </div>

    </header>
  )
}