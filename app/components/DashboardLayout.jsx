'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '../../lib/supabase'

const navItems = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/dashboard/barbers', label: 'Barbeiros' },
  { href: '/dashboard/services', label: 'Serviços' },
  { href: '/dashboard/appointments', label: 'Agendamentos' },
  { href: '/dashboard/plans', label: 'Planos' },
  { href: '/dashboard/settings', label: 'Configurações' },
]

export default function DashboardLayout({ children }) {
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', sans-serif; background: #fafaf9; color: #1a1a18; }
        .nav-link {
          display: block; padding: 0.5rem 0.85rem; border-radius: 10px;
          font-size: 0.875rem; color: #6b6b67; text-decoration: none;
          transition: all .15s; font-weight: 400;
        }
        .nav-link:hover { background: #f5f4f0; color: #1a1a18; }
        .nav-link.active { background: #f5f4f0; color: #1a1a18; font-weight: 500; }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#fafaf9', display: 'flex', flexDirection: 'column' }}>

        <header style={{
          height: '60px', borderBottom: '0.5px solid #e5e3dd',
          background: 'rgba(250,250,249,0.92)', backdropFilter: 'blur(12px)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 1.75rem', position: 'sticky', top: 0, zIndex: 100,
        }}>
          <Link href="/" style={{ fontFamily: "'Instrument Serif', serif", fontSize: '1.2rem', color: '#1a1a18', textDecoration: 'none', letterSpacing: '-0.01em' }}>
            Barber<span style={{ color: '#2563eb' }}>ShopBR</span>
          </Link>
          <button
            onClick={handleLogout}
            style={{ background: 'none', border: 'none', fontSize: '0.875rem', color: '#6b6b67', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}
            onMouseEnter={e => e.target.style.color = '#1a1a18'}
            onMouseLeave={e => e.target.style.color = '#6b6b67'}
          >
            Sair
          </button>
        </header>

        <div style={{ display: 'flex', flex: 1 }}>
          <aside style={{
            width: '220px', borderRight: '0.5px solid #e5e3dd',
            background: '#fff', padding: '1.5rem 1rem',
            display: 'flex', flexDirection: 'column', gap: '0.25rem',
            position: 'sticky', top: '60px', height: 'calc(100vh - 60px)',
            overflowY: 'auto',
          }}>
            {navItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-link ${pathname === item.href ? 'active' : ''}`}
              >
                {item.label}
              </Link>
            ))}
          </aside>

          <main style={{ flex: 1, padding: '2rem', maxWidth: '100%', overflowX: 'hidden' }}>
            {children}
          </main>
        </div>

      </div>
    </>
  )
}