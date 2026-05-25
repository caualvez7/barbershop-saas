'use client'

import { useState } from 'react'
import { supabase } from '../../lib/supabase.js'
import { useSearchParams, useRouter } from 'next/navigation'
import { Suspense } from 'react'
import Link from 'next/link'

    function RegisterContent() {
  const searchParams = useSearchParams()
  const plan = searchParams.get('plan') || 'basic'
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [barbershopName, setBarbershopName] = useState('')
  const [ownerName, setOwnerName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const planLabels = { basic: 'Básico — R$29/mês', plus: 'Plus — R$49/mês', premium: 'Premium — R$79/mês' }

  const generateSlug = (name) =>
    name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '').trim()

  const getUniqueSlug = async (baseSlug) => {
    let slug = baseSlug
    let count = 1
    while (true) {
      const { data } = await supabase.from('barbershops').select('id').eq('slug', slug).maybeSingle()
      if (!data) return slug
      slug = `${baseSlug}${count}`
      count++
    }
  }

  const handleRegister = async () => {
    setError('')

    if (!barbershopName.trim() || !ownerName.trim() || !email.trim() || !password.trim()) {
      setError('Preencha todos os campos.')
      return
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.')
      return
    }

    setLoading(true)

    const { data, error: signUpError } = await supabase.auth.signUp({ email, password })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    const user = data.user || data.session?.user

    if (!user) {
      setError('Erro ao criar usuário. Tente novamente.')
      setLoading(false)
      return
    }

    const baseSlug = generateSlug(barbershopName)
    const slug = await getUniqueSlug(baseSlug)

    const { error: insertError } = await supabase
      .from('barbershops')
      .insert({ name: barbershopName, owner_name: ownerName, user_id: user.id, plan, slug })

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    router.push(`/checkout?plan=${plan}`)
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
            <div style={{ marginBottom: '2rem' }}>
              <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: '2rem', fontWeight: 400, letterSpacing: '-0.02em', color: '#1a1a18', marginBottom: '0.4rem' }}>
                Criar sua conta
              </h1>
              <p style={{ fontSize: '0.9rem', color: '#6b6b67', fontWeight: 300 }}>
                Comece a gerenciar sua barbearia hoje.
              </p>
            </div>

            {/* PLANO SELECIONADO */}
            <div style={{ background: '#eef2ff', border: '0.5px solid #c7d2fe', borderRadius: '12px', padding: '0.75rem 1rem', marginBottom: '1.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.825rem', color: '#3730a3', fontWeight: 300 }}>Plano selecionado</span>
              <span style={{ fontSize: '0.825rem', color: '#3730a3', fontWeight: 500 }}>{planLabels[plan] || plan}</span>
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
                <label style={{ fontSize: '0.825rem', color: '#6b6b67', display: 'block', marginBottom: '0.4rem' }}>Nome da barbearia</label>
                <input
                  className="auth-input"
                  placeholder="Ex: Barbearia Master"
                  value={barbershopName}
                  onChange={e => setBarbershopName(e.target.value)}
                />
                {barbershopName && (
                  <p style={{ fontSize: '0.75rem', color: '#9e9c96', marginTop: '0.35rem' }}>
                    Sua página: /barber/{generateSlug(barbershopName)}
                  </p>
                )}
              </div>

              <div>
                <label style={{ fontSize: '0.825rem', color: '#6b6b67', display: 'block', marginBottom: '0.4rem' }}>Nome do proprietário</label>
                <input
                  className="auth-input"
                  placeholder="Ex: João Silva"
                  value={ownerName}
                  onChange={e => setOwnerName(e.target.value)}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.825rem', color: '#6b6b67', display: 'block', marginBottom: '0.4rem' }}>Email</label>
                <input
                  className="auth-input"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.825rem', color: '#6b6b67', display: 'block', marginBottom: '0.4rem' }}>Senha</label>
                <input
                  className="auth-input"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>

              <button className="auth-btn" onClick={handleRegister} disabled={loading} style={{ marginTop: '0.5rem' }}>
                {loading ? 'Criando conta...' : 'Criar conta'}
              </button>

            </div>

            {/* FOOTER */}
            <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '0.5px solid #e5e3dd', textAlign: 'center' }}>
              <p style={{ fontSize: '0.875rem', color: '#6b6b67', fontWeight: 300 }}>
                Já tem conta?{' '}
                <Link href="/login" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 400 }}>
                  Entrar
                </Link>
              </p>
              <p style={{ fontSize: '0.75rem', color: '#9e9c96', marginTop: '0.75rem', fontWeight: 300 }}>
                Ao continuar, você concorda com os termos da plataforma.
              </p>
            </div>

          </div>
        </div>

      </div>
    </>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafaf9' }}>
        <p style={{ fontSize: '0.9rem', color: '#6b6b67', fontFamily: "'DM Sans', sans-serif" }}>Carregando...</p>
      </div>
    }>
      <RegisterContent />
    </Suspense>
  )
}