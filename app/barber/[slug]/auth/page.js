'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '../../../../lib/supabase.js'

export default function ClientAuthPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params?.slug

  const [shop, setShop] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [isLogin, setIsLogin] = useState(true)
  const [error, setError] = useState('')

  const [name, setName] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  useEffect(() => {
    if (!slug) return
    const loadShop = async () => {
      const { data } = await supabase
        .from('barbershops')
        .select('*')
        .eq('slug', slug)
        .maybeSingle()

      if (!data) { setNotFound(true); setLoading(false); return }
      setShop(data)
      setLoading(false)
    }
    loadShop()
  }, [slug])

  const handleRegister = async () => {
    setError('')
    if (!name.trim() || !whatsapp.trim() || !email.trim() || !password.trim()) {
      setError('Preencha todos os campos.')
      return
    }

    const { data, error: signUpError } = await supabase.auth.signUp({ email, password })
    if (signUpError) { setError(signUpError.message); return }

    const user = data.session?.user ?? data.user
    if (!user?.id) { setError('Erro ao criar conta. Tente novamente.'); return }

    const { error: customerError } = await supabase
      .from('customers')
      .insert({ name, whatsapp, email, user_id: user.id, barbershop_id: shop.id })

    if (customerError) { setError('Erro ao salvar seus dados: ' + customerError.message); return }

    router.push(`/barber/${slug}/plans`)
  }

  const handleLogin = async () => {
    setError('')
    if (!email.trim() || !password.trim()) { setError('Preencha todos os campos.'); return }

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError('Email ou senha incorretos.'); return }

    router.push(`/barber/${slug}/plans`)
  }

  const inputStyle = {
    width: '100%', border: '0.5px solid #e5e3dd', borderRadius: '12px',
    padding: '0.75rem 1rem', fontSize: '0.9rem', fontFamily: "'DM Sans', sans-serif",
    color: '#1a1a18', background: '#fff', outline: 'none', transition: 'border-color .2s',
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafaf9' }}>
      <p style={{ fontSize: '0.9rem', color: '#6b6b67', fontFamily: "'DM Sans', sans-serif" }}>Carregando...</p>
    </div>
  )

  if (notFound) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafaf9' }}>
      <p style={{ fontSize: '0.9rem', color: '#6b6b67', fontFamily: "'DM Sans', sans-serif" }}>Barbearia não encontrada.</p>
    </div>
  )

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', sans-serif; background: #fafaf9; color: #1a1a18; }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#fafaf9', display: 'flex', flexDirection: 'column' }}>

        {/* NAVBAR */}
        <header style={{ padding: '1.25rem 2rem', borderBottom: '0.5px solid #e5e3dd', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button
            onClick={() => router.push(`/barber/${slug}`)}
            style={{ fontFamily: "'Instrument Serif', serif", fontSize: '1.1rem', color: '#1a1a18', background: 'none', border: 'none', cursor: 'pointer', letterSpacing: '-0.01em' }}
          >
            {shop.name}
          </button>
        </header>

        {/* CONTEÚDO */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 1.5rem' }}>
          <div style={{ width: '100%', maxWidth: '420px' }}>

            {/* TOPO */}
            <div style={{ marginBottom: '2rem' }}>
              <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: '2rem', fontWeight: 400, letterSpacing: '-0.02em', color: '#1a1a18', marginBottom: '0.4rem' }}>
                {isLogin ? 'Bem-vindo de volta' : 'Criar sua conta'}
              </h1>
              <p style={{ fontSize: '0.9rem', color: '#6b6b67', fontWeight: 300 }}>
                {isLogin
                  ? 'Acesse sua assinatura e agendamentos.'
                  : `Cadastre-se para realizar agendamentos e acessar os planos da ${shop.name}.`}
              </p>
            </div>

            {/* ERRO */}
            {error && (
              <div style={{ background: '#fef2f2', border: '0.5px solid #fca5a5', borderRadius: '12px', padding: '0.75rem 1rem', marginBottom: '1.25rem' }}>
                <p style={{ fontSize: '0.875rem', color: '#dc2626' }}>{error}</p>
              </div>
            )}

            {/* FORM */}
            <div style={{ background: '#fff', border: '0.5px solid #e5e3dd', borderRadius: '16px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

              {!isLogin && (
                <>
                  <div>
                    <label style={{ fontSize: '0.825rem', color: '#6b6b67', display: 'block', marginBottom: '0.4rem' }}>Seu nome</label>
                    <input style={inputStyle} placeholder="Digite seu nome" value={name} onChange={e => setName(e.target.value)}
                      onFocus={e => e.target.style.borderColor = '#2563eb'} onBlur={e => e.target.style.borderColor = '#e5e3dd'} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.825rem', color: '#6b6b67', display: 'block', marginBottom: '0.4rem' }}>WhatsApp</label>
                    <input style={inputStyle} placeholder="(00) 00000-0000" value={whatsapp} onChange={e => setWhatsapp(e.target.value)}
                      onFocus={e => e.target.style.borderColor = '#2563eb'} onBlur={e => e.target.style.borderColor = '#e5e3dd'} />
                  </div>
                </>
              )}

              <div>
                <label style={{ fontSize: '0.825rem', color: '#6b6b67', display: 'block', marginBottom: '0.4rem' }}>Email</label>
                <input style={inputStyle} type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)}
                  onFocus={e => e.target.style.borderColor = '#2563eb'} onBlur={e => e.target.style.borderColor = '#e5e3dd'} />
              </div>

              <div>
                <label style={{ fontSize: '0.825rem', color: '#6b6b67', display: 'block', marginBottom: '0.4rem' }}>Senha</label>
                <input style={inputStyle} type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)}
                  onFocus={e => e.target.style.borderColor = '#2563eb'} onBlur={e => e.target.style.borderColor = '#e5e3dd'}
                  onKeyDown={e => e.key === 'Enter' && (isLogin ? handleLogin() : handleRegister())} />
              </div>

              <button
                onClick={isLogin ? handleLogin : handleRegister}
                style={{ background: '#1a1a18', color: '#fafaf9', border: 'none', padding: '0.85rem', borderRadius: '100px', fontSize: '0.9rem', fontFamily: "'DM Sans', sans-serif", cursor: 'pointer', marginTop: '0.25rem' }}
              >
                {isLogin ? 'Entrar' : 'Criar conta'}
              </button>

            </div>

            {/* ALTERNAR */}
            <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '0.5px solid #e5e3dd', textAlign: 'center' }}>
              <button
                onClick={() => { setIsLogin(!isLogin); setError('') }}
                style={{ fontSize: '0.875rem', color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}
              >
                {isLogin ? 'Ainda não tem conta? Criar conta' : 'Já tem conta? Entrar'}
              </button>
            </div>

          </div>
        </div>

      </div>
    </>
  )
}