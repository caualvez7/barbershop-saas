'use client'

import Link from 'next/link'

export default function Navbar({ onCTAClick }) {
  const scrollToPlans = () => {
    document.getElementById('plans')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <header style={{
      width: '100%', borderBottom: '0.5px solid #e5e3dd',
      background: 'rgba(250,250,249,0.92)', backdropFilter: 'blur(12px)',
      position: 'sticky', top: 0, zIndex: 100,
    }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 2rem', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

        <Link href="/" style={{ fontFamily: "'Instrument Serif', serif", fontSize: '1.35rem', color: '#1a1a18', textDecoration: 'none', letterSpacing: '-0.01em' }}>
          Barber<span style={{ color: '#2563eb' }}>ShopBR</span>
        </Link>

        <nav style={{ display: 'flex', alignItems: 'center', gap: '1.75rem' }}>

          <button onClick={scrollToPlans} style={{ background: 'none', border: 'none', fontSize: '0.875rem', color: '#6b6b67', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif' " }}>
            Planos
          </button>

          <Link href="/login" style={{ fontSize: '0.875rem', color: '#6b6b67', textDecoration: 'none' }}>
            Entrar
          </Link>

          <button
            onClick={onCTAClick}
            style={{ background: '#1a1a18', color: '#fafaf9', border: 'none', padding: '0.55rem 1.25rem', borderRadius: '100px', fontSize: '0.875rem', fontFamily: "'DM Sans', sans-serif", cursor: 'pointer' }}
          >
            Começar agora
          </button>

        </nav>

      </div>
    </header>
  )
}