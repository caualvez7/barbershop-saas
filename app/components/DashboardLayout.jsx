'use client'

import Link from 'next/link'

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-50">

      {/* TOPO */}
      <header className="h-16 border-b bg-white flex items-center justify-between px-6 sticky top-0 z-50">

        <Link
          href="/"
          className="text-xl font-bold text-slate-900"
        >
          BarberShop<span className="text-blue-600">BR</span>
        </Link>

        <button className="text-sm text-slate-500 hover:text-slate-900">
          Sair
        </button>

      </header>

      <div className="flex">

        {/* SIDEBAR */}
        <aside className="w-64 min-h-[calc(100vh-64px)] border-r bg-white p-6 hidden md:block">

          <nav className="flex flex-col gap-2">

            <Link
              href="/dashboard"
              className="px-4 py-2 rounded-xl hover:bg-slate-100 text-black transition"
            >
              Dashboard
            </Link>

            <Link
              href="/dashboard/services"
              className="px-4 py-2 rounded-xl hover:bg-slate-100 text-black transition"
            >
              Serviços
            </Link>

            <Link
              href="/dashboard/appointments"
              className="px-4 py-2 rounded-xl hover:bg-slate-100 text-black transition"
            >
              Agendamentos
            </Link>

            <Link 
            href="/dashboard/plans"
            className="px-4 py-2 rounded-xl hover:bg-slate-100 text-black transition"
            >
              Planos
            </Link>

            <Link
              href="/dashboard/settings"
              className="px-4 py-2 rounded-xl hover:bg-slate-100 text-black transition"
            >
              Configurações
            </Link>

          </nav>

        </aside>

        {/* CONTEÚDO */}
        <main className="flex-1 p-6">
          {children}
        </main>

      </div>

    </div>
  )
}