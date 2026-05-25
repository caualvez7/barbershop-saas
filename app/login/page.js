'use client'

import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async () => {
    setError('')

    if (!email.trim() || !password.trim()) {
      setError('Preencha todos os campos.')
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Email ou senha incorretos.')
      setLoading(false)
      return
    }

    router.push('/dashboard')
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', sans-serif; background: #fafaf9; color: #1a1a18; }
        .auth-input {
          width: 100%; border: 0.5px solid #e5e3dd; border-radius: 12px;
          padding: 0.75rem 1rem; font-size: 0.9rem; font-family: 'DM Sans', sans-serif;
          color: #1a1a18; background: #fff; outline: none; transition: border-color .2s;
        }
        .auth-input:focus { border-color: #2563eb; }
        .auth-btn {
          width: 100%; background: #1a1a18; color: #fafaf9; border: none;
          padding: 0.85rem; border-radius: 100px; font-size: 0.9rem;
          font-family: 'DM Sans', sans-serif; cursor: pointer; transition: opacity .2s;
        }
        .auth-btn:hover { opacity: .85; }
        .auth-btn:disabled { opacity: .5; cursor: not-allowed; }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#fafaf9', display: 'flex', flexDirection: 'column' }}>

        {/* NAVBAR */}
        <header style={{ padding: '1.25rem 2rem', borderBottom: '0.5px solid #e5e3dd' }}>
          <Link href="/" style={{ fontFamily: "'Instrument Serif', serif", fontSize: '1.35rem', color: '#1a1a18', textDecoration: 'none', letterSpacing: '-0.01em' }}>
            Barber<span style={{ color: '#2563eb' }}>ShopBR</span>
          </Link>
        </header>

        {/* CONTEÚDO */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 1.5rem' }}>
          <div style={{ width: '100%', maxWidth: '420px' }}>

            {/* TOPO */}
            <div style={{ marginBottom: '2.5rem' }}>
              <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: '2rem', fontWeight: 400, letterSpacing: '-0.02em', color: '#1a1a18', marginBottom: '0.4rem' }}>
                Bem-vindo de volta
              </h1>
              <p style={{ fontSize: '0.9rem', color: '#6b6b67', fontWeight: 300 }}>
                Acesse o painel da sua barbearia.
              </p>
            </div>

            {/* ERRO */}
            {error && (
              <div style={{ background: '#fef2f2', border: '0.5px solid #fca5a5', borderRadius: '12px', padding: '0.75rem 1rem', marginBottom: '1.25rem' }}>
                <p style={{ fontSize: '0.875rem', color: '#dc2626' }}>{error}</p>
              </div>
            )}

            {/* FORM */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

              <div>
                <label style={{ fontSize: '0.825rem', color: '#6b6b67', display: 'block', marginBottom: '0.4rem' }}>Email</label>
                <input
                  className="auth-input"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.825rem', color: '#6b6b67', display: 'block', marginBottom: '0.4rem' }}>Senha</label>
                <input
                  className="auth-input"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                />
              </div>

              <button className="auth-btn" onClick={handleLogin} disabled={loading} style={{ marginTop: '0.5rem' }}>
                {loading ? 'Entrando...' : 'Entrar'}
              </button>

            </div>

            {/* FOOTER */}
            <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '0.5px solid #e5e3dd', textAlign: 'center' }}>
              <p style={{ fontSize: '0.875rem', color: '#6b6b67', fontWeight: 300 }}>
                Ainda não tem conta?{' '}
                <Link href="/#plans" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 400 }}>
                  Escolher um plano
                </Link>
              </p>
            </div>

          </div>
        </div>

      </div>
    </>
  )
}