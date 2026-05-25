'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'

const navItems = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    href: '/dashboard/barbers',
    label: 'Barbeiros',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    href: '/dashboard/services',
    label: 'Serviços',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      </svg>
    ),
  },
  {
    href: '/dashboard/appointments',
    label: 'Agendamentos',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    href: '/dashboard/plans',
    label: 'Planos',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2" />
        <line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    ),
  },
  {
    href: '/dashboard/settings',
    label: 'Configurações',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
]

// ícone toggle igual à imagem enviada
function SidebarToggleIcon({ collapsed }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="18" rx="4" />
      <line x1="9" y1="3" x2="9" y2="21" />
      {collapsed ? (
        <>
          <circle cx="5" cy="8" r="0.8" fill="currentColor" stroke="none" />
          <circle cx="5" cy="12" r="0.8" fill="currentColor" stroke="none" />
        </>
      ) : (
        <>
          <circle cx="5" cy="8" r="0.8" fill="currentColor" stroke="none" />
          <circle cx="5" cy="12" r="0.8" fill="currentColor" stroke="none" />
        </>
      )}
    </svg>
  )
}

export default function DashboardLayout({ children }) {
  const router = useRouter()
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

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
          display: flex;
          align-items: center;
          gap: 0.65rem;
          padding: 0.5rem 0.85rem;
          border-radius: 10px;
          font-size: 0.875rem;
          color: #6b6b67;
          text-decoration: none;
          transition: all .15s;
          font-weight: 400;
          white-space: nowrap;
          overflow: hidden;
        }
        .nav-link:hover { background: #f5f4f0; color: #1a1a18; }
        .nav-link.active { background: #f5f4f0; color: #1a1a18; font-weight: 500; }
        .nav-link .nav-label {
          transition: opacity .2s, width .2s;
        }
        .sidebar { transition: width .2s ease; overflow: hidden; }
        .toggle-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: #6b6b67;
          padding: 0.25rem;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color .15s, background .15s;
        }
        .toggle-btn:hover { color: #1a1a18; background: #f5f4f0; }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#fafaf9', display: 'flex', flexDirection: 'column' }}>

        {/* HEADER */}
        <header style={{
          height: '60px', borderBottom: '0.5px solid #e5e3dd',
          background: 'rgba(250,250,249,0.92)', backdropFilter: 'blur(12px)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 1.75rem', position: 'sticky', top: 0, zIndex: 100,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>

            <Link href="/" style={{ fontFamily: "'Instrument Serif', serif", fontSize: '1.2rem', color: '#1a1a18', textDecoration: 'none', letterSpacing: '-0.01em' }}>
              Barber<span style={{ color: '#2563eb' }}>ShopBR</span>
            </Link>

          </div>

          <button
            onClick={handleLogout}
            style={{ background: 'none', border: 'none', fontSize: '0.875rem', color: '#6b6b67', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", transition: 'color .2s' }}
            onMouseEnter={e => e.target.style.color = '#1a1a18'}
            onMouseLeave={e => e.target.style.color = '#6b6b67'}
          >
            Sair
          </button>
        </header>

        <div style={{ display: 'flex', flex: 1 }}>

          {/* SIDEBAR */}
          <aside
            className="sidebar"
            style={{
              width: collapsed ? '60px' : '220px',
              borderRight: '0.5px solid #e5e3dd',
              background: '#fff',
              padding: collapsed ? '1.5rem 0.5rem' : '1.5rem 1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.25rem',
              position: 'sticky',
              top: '60px',
              height: 'calc(100vh - 60px)',
              overflowY: 'auto',
              overflowX: 'hidden',
            }}
          >
              {/* TOGGLE */}
            <div style={{ display: 'flex', justifyContent: collapsed ? 'center' : 'flex-end', marginBottom: '0.75rem' }}>
              <button className="toggle-btn" onClick={() => setCollapsed(!collapsed)}>
                <SidebarToggleIcon collapsed={collapsed} />
              </button>
            </div>
            
            {navItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-link ${pathname === item.href ? 'active' : ''}`}
                style={{ justifyContent: collapsed ? 'center' : 'flex-start', padding: collapsed ? '0.6rem' : '0.5rem 0.85rem' }}
                title={collapsed ? item.label : undefined}
              >
                <span style={{ flexShrink: 0 }}>{item.icon}</span>
                {!collapsed && (
                  <span className="nav-label">{item.label}</span>
                )}
              </Link>
            ))}
          </aside>

          {/* CONTEÚDO */}
          <main style={{ flex: 1, padding: '2rem', maxWidth: '100%', overflowX: 'hidden' }}>
            {children}
          </main>

        </div>

      </div>
    </>
  )
}