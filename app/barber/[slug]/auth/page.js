'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabaseCustomer as supabase } from '../../../../lib/supabase-customer.js'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Scissors, 
  Sparkles, 
  Mail, 
  Lock, 
  User, 
  Phone, 
  ChevronLeft, 
  ArrowRight, 
  AlertCircle,
  Check
} from 'lucide-react'
import ThreeBackground from '../../../components/ThreeBackground'
import '../client-landing.css'

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
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    if (!slug) return
    const loadShop = async () => {
      const { data } = await supabase
        .from('barbershops')
        .select('*')
        .eq('slug', slug)
        .maybeSingle()

      if (!data) { 
        setNotFound(true)
        setLoading(false)
        return 
      }
      setShop(data)
      setLoading(false)
    }
    loadShop()
  }, [slug])

  // Máscara para formatar telefone WhatsApp automaticamente
  const formatWhatsApp = (value) => {
    if (!value) return value
    const phoneNumber = value.replace(/[^\d]/g, '')
    const phoneNumberLength = phoneNumber.length
    if (phoneNumberLength < 3) return phoneNumber
    if (phoneNumberLength < 7) {
      return `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(2)}`
    }
    return `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(2, 7)}-${phoneNumber.slice(7, 11)}`
  }

  const handleWhatsAppChange = (e) => {
    const formatted = formatWhatsApp(e.target.value)
    setWhatsapp(formatted.slice(0, 15)) // limita a 15 caracteres
  }

  const handleRegister = async () => {
    setError('')
    if (!name.trim() || !whatsapp.trim() || !email.trim() || !password.trim()) {
      setError('Preencha todos os campos.')
      return
    }

    try {
      setActionLoading(true)
      const { data, error: signUpError } = await supabase.auth.signUp({ email, password })
      if (signUpError) { 
        setError(signUpError.message)
        setActionLoading(false)
        return 
      }

      const user = data.session?.user ?? data.user
      if (!user?.id) { 
        setError('Erro ao criar conta. Tente novamente.')
        setActionLoading(false)
        return 
      }

      const { error: customerError } = await supabase
        .from('customers')
        .insert({ 
          name, 
          whatsapp, 
          email, 
          user_id: user.id, 
          barbershop_id: shop.id 
        })

      if (customerError) { 
        setError('Erro ao salvar seus dados: ' + customerError.message)
        setActionLoading(false)
        return 
      }

      router.push(`/barber/${slug}/plans`)
    } catch (err) {
      setError('Ocorreu um erro no processamento do cadastro.')
      setActionLoading(false)
    }
  }

  const handleLogin = async () => {
    setError('')
    if (!email.trim() || !password.trim()) { 
      setError('Preencha todos os campos.')
      return 
    }

    try {
      setActionLoading(true)
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) { 
        setError('E-mail ou senha incorretos.')
        setActionLoading(false)
        return 
      }

      router.push(`/barber/${slug}/plans`)
    } catch (err) {
      setError('Ocorreu um erro ao realizar o login.')
      setActionLoading(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-[#030303] flex flex-col items-center justify-center text-zinc-500 font-sans gap-3">
      <div className="w-8 h-8 rounded-full border border-t-amber-500 border-zinc-800 animate-spin" />
      <p className="text-xs uppercase tracking-widest text-zinc-600 font-bold animate-pulse font-sans">Carregando...</p>
    </div>
  )

  if (notFound) return (
    <div className="min-h-screen bg-[#030303] flex flex-col items-center justify-center text-center px-4 font-sans">
      <Scissors size={40} className="text-zinc-700 mb-4 animate-bounce" />
      <h2 className="text-lg font-bold text-white tracking-tight font-serif-lux">Barbearia não encontrada</h2>
      <p className="text-zinc-500 text-xs mt-1 max-w-xs leading-normal font-sans">
        O endereço solicitado não pertence a nenhuma barbearia ativa em nosso sistema.
      </p>
      <button
        onClick={() => router.push('/')}
        className="mt-6 px-5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-full text-xs font-semibold text-zinc-300 hover:bg-zinc-800 transition-all cursor-pointer font-sans"
      >
        Voltar para Home
      </button>
    </div>
  )

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
        
        /* Fontes customizadas no documento */
        .font-serif-lux {
          font-family: 'Instrument Serif', serif;
        }
        .font-sans-lux {
          font-family: 'Plus Jakarta Sans', sans-serif;
        }

        body {
          background-color: #030303;
          margin: 0;
          padding: 0;
        }
      `}</style>

      <div className="font-sans-lux min-h-screen bg-[#030303] text-white overflow-hidden selection:bg-amber-500 selection:text-black antialiased relative flex flex-col justify-between">
        
        {/* BACKGROUND 3D DE PARTÍCULAS DOURADAS (THREE.JS) */}
        <ThreeBackground />

        {/* Ambient Glow de fundo sutil */}
        <div className="ambient-gold-glow absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0" />

        {/* HEADER / NAVBAR */}
        <header className="fixed top-0 left-0 w-full z-50 border-b border-white/[0.03] bg-black/60 backdrop-blur-xl px-6 py-4 md:px-12 flex items-center justify-between">
          <button
            onClick={() => router.push(`/barber/${slug}`)}
            className="font-serif-lux text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-1.5 bg-transparent border-none cursor-pointer hover:opacity-90 transition-opacity"
          >
            <Sparkles size={16} className="text-amber-500 animate-pulse" />
            <span>{shop.name}</span>
          </button>

          <button
            onClick={() => router.push(`/barber/${slug}`)}
            className="px-4 py-2 border border-zinc-800 rounded-full text-xxs font-bold uppercase tracking-wider text-zinc-400 hover:text-white hover:border-zinc-700 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <ChevronLeft size={12} />
            <span>Voltar para o Site</span>
          </button>
        </header>

        {/* CONTEÚDO DE AUTENTICAÇÃO */}
        <main className="flex-1 flex items-center justify-center px-4 py-28 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-[420px] glass-panel border border-zinc-900 rounded-3xl p-6 md:p-8 shadow-2xl relative"
          >
            {/* Tag / Badge */}
            <div className="inline-flex items-center gap-1.5 border border-amber-500/20 bg-amber-500/[0.04] backdrop-blur-md rounded-full px-3 py-1 text-[9px] font-bold uppercase tracking-widest text-amber-500 mb-4">
              <Scissors size={8} className="stroke-[3px]" />
              <span>Acesso ao Cliente</span>
            </div>

            {/* Cabeçalho do formulário */}
            <div className="mb-6">
              <h1 className="font-serif-lux text-3xl font-normal tracking-tight text-white mb-2 leading-none">
                {isLogin ? 'Bem-vindo de volta' : 'Criar sua conta'}
              </h1>
              <p className="text-zinc-500 text-xs font-light leading-relaxed">
                {isLogin
                  ? 'Acesse sua assinatura, histórico e agendamentos.'
                  : `Cadastre-se para realizar agendamentos e acessar os planos de fidelidade da ${shop.name}.`}
              </p>
            </div>

            {/* Exibição de Erros */}
            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-start gap-2 bg-red-950/20 border border-red-900/40 text-red-400 rounded-2xl p-3.5 text-xs mb-4 overflow-hidden"
                >
                  <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                  <p className="leading-normal">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* FORMULÁRIO INTERATIVO COM TRANSIÇÃO */}
            <AnimatePresence mode="wait">
              <motion.div
                key={isLogin ? 'login' : 'register'}
                initial={{ opacity: 0, x: isLogin ? -10 : 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: isLogin ? 10 : -10 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-4"
              >
                {!isLogin && (
                  <>
                    {/* Nome Completo */}
                    <div>
                      <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider mb-1.5 block">Seu nome completo</label>
                      <div className="flex items-center bg-zinc-950/50 border border-zinc-900 focus-within:border-amber-500/80 rounded-xl px-3.5 py-3 transition-colors duration-200 gap-3">
                        <User size={15} className="text-zinc-600" />
                        <input 
                          type="text"
                          placeholder="Digite seu nome completo" 
                          value={name} 
                          onChange={e => setName(e.target.value)}
                          className="bg-transparent border-none outline-none text-white text-xs w-full placeholder:text-zinc-600 font-sans"
                        />
                      </div>
                    </div>

                    {/* WhatsApp */}
                    <div>
                      <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider mb-1.5 block">WhatsApp</label>
                      <div className="flex items-center bg-zinc-950/50 border border-zinc-900 focus-within:border-amber-500/80 rounded-xl px-3.5 py-3 transition-colors duration-200 gap-3">
                        <Phone size={15} className="text-zinc-600" />
                        <input 
                          type="text"
                          placeholder="(00) 00000-0000" 
                          value={whatsapp} 
                          onChange={handleWhatsAppChange}
                          className="bg-transparent border-none outline-none text-white text-xs w-full placeholder:text-zinc-600 font-sans"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Email */}
                <div>
                  <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider mb-1.5 block">Endereço de e-mail</label>
                  <div className="flex items-center bg-zinc-950/50 border border-zinc-900 focus-within:border-amber-500/80 rounded-xl px-3.5 py-3 transition-colors duration-200 gap-3">
                    <Mail size={15} className="text-zinc-600" />
                    <input 
                      type="email" 
                      placeholder="seu@email.com" 
                      value={email} 
                      onChange={e => setEmail(e.target.value)}
                      className="bg-transparent border-none outline-none text-white text-xs w-full placeholder:text-zinc-600 font-sans"
                    />
                  </div>
                </div>

                {/* Senha */}
                <div>
                  <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider mb-1.5 block">Senha de acesso</label>
                  <div className="flex items-center bg-zinc-950/50 border border-zinc-900 focus-within:border-amber-500/80 rounded-xl px-3.5 py-3 transition-colors duration-200 gap-3">
                    <Lock size={15} className="text-zinc-600" />
                    <input 
                      type="password" 
                      placeholder="••••••••" 
                      value={password} 
                      onChange={e => setPassword(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && (isLogin ? handleLogin() : handleRegister())}
                      className="bg-transparent border-none outline-none text-white text-xs w-full placeholder:text-zinc-600 font-sans"
                    />
                  </div>
                </div>

                {/* Botão Principal */}
                <button
                  onClick={isLogin ? handleLogin : handleRegister}
                  disabled={actionLoading}
                  className="w-full py-3.5 mt-2 rounded-full text-xs font-bold text-black bg-gradient-to-r from-amber-500 to-yellow-500 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shadow-[0_0_20px_rgba(245,158,11,0.15)] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading ? (
                    <div className="w-4 h-4 rounded-full border border-t-black border-zinc-900 animate-spin" />
                  ) : (
                    <>
                      {isLogin ? <Check size={13} className="stroke-[3px]" /> : <ArrowRight size={13} />}
                      <span>{isLogin ? 'Entrar na Conta' : 'Criar minha Conta'}</span>
                    </>
                  )}
                </button>
              </motion.div>
            </AnimatePresence>

            {/* Alternar entre telas */}
            <div className="mt-6 pt-5 border-t border-zinc-900 text-center">
              <button
                onClick={() => { setIsLogin(!isLogin); setError('') }}
                className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 hover:text-amber-500 transition-colors bg-transparent border-none cursor-pointer"
              >
                {isLogin ? 'Ainda não tem conta? Criar conta' : 'Já tem uma conta? Entrar'}
              </button>
            </div>
          </motion.div>
        </main>

        {/* FOOTER */}
        <footer className="py-6 text-center border-t border-white/[0.02] bg-black/30 relative z-10">
          <p className="text-[9px] uppercase font-bold text-zinc-600 tracking-widest font-sans">
            &copy; {new Date().getFullYear()} {shop.name} &bull; Plataforma BarberShopBR
          </p>
        </footer>

      </div>
    </>
  )
}