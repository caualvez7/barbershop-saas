'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Scissors, Sparkles, User, Mail, Lock, Store, AlertCircle, ChevronRight } from 'lucide-react'
import { supabaseBarber as supabase } from '../../lib/supabase-barber.js'

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
  const [registered, setRegistered] = useState(false)

  const planLabels = { 
    basic: 'Plano Básico — R$29/mês', 
    plus: 'Plano Profissional — R$49/mês', 
    premium: 'Plano Premium — R$79/mês' 
  }

  const generateSlug = (name) =>
    name.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '')
      .trim()

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

  const handleRegister = async (e) => {
    if (e) e.preventDefault()
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

    if (data.session) {
      router.push(`/checkout?plan=${plan}`)
    } else {
      setRegistered(true)
      setLoading(false)
    }
  }

  if (registered) {
    return (
      <div className="min-h-screen bg-[#030303] text-zinc-100 font-sans selection:bg-amber-500/35 selection:text-white flex flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-b from-amber-500/10 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />
        <header className="px-6 py-5 border-b border-zinc-900/60 backdrop-blur-md bg-black/20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 cursor-pointer text-white no-underline">
            <Scissors className="w-5 h-5 text-amber-500 transform rotate-90" />
            <span className="text-md font-bold tracking-tight">Barber<span className="text-amber-500">ShopBR</span></span>
          </Link>
        </header>
        <div className="flex-1 flex items-center justify-center px-4 py-16">
          <motion.div 
            initial={{ opacity: 0, y: 15, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="w-full max-w-[440px] text-center"
          >
            <div className="p-8 rounded-2xl border border-zinc-850 bg-zinc-950/80 backdrop-blur-md shadow-2xl flex flex-col items-center gap-6">
              <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                <Mail size={32} className="animate-pulse" />
              </div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">Verifique seu e-mail</h1>
              <p className="text-zinc-400 text-xs font-light leading-relaxed">
                Enviamos um link de confirmação para <strong className="text-white font-semibold">{email}</strong>. 
                Por favor, verifique sua caixa de entrada (e pasta de spam) e clique no link para ativar sua conta antes de continuar para o pagamento.
              </p>
              <div className="w-full border-b border-zinc-900" />
              <button 
                onClick={() => router.push('/login')}
                className="w-full py-3 rounded-xl text-xs font-bold text-black bg-gradient-to-r from-amber-500 to-yellow-500 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Ir para o Login</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </motion.div>
        </div>
        <footer className="py-6 text-center border-t border-zinc-950 bg-black/10">
          <p className="text-[10px] uppercase font-bold text-zinc-650 tracking-widest">&copy; 2026 BarberShopBR</p>
        </footer>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#030303] text-zinc-100 font-sans selection:bg-amber-500/35 selection:text-white flex flex-col justify-between relative overflow-hidden">
      
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-b from-amber-500/10 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-10 w-[300px] h-[300px] bg-blue-500/[0.03] rounded-full blur-3xl pointer-events-none -z-10" />

      {/* NAVBAR */}
      <header className="px-6 py-5 border-b border-zinc-900/60 backdrop-blur-md bg-black/20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 cursor-pointer text-white no-underline">
          <Scissors className="w-5 h-5 text-amber-500 transform rotate-90" />
          <span className="text-md font-bold tracking-tight">
            Barber<span className="text-amber-500">ShopBR</span>
          </span>
        </Link>
        <Link 
          href="/" 
          className="text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
        >
          Voltar para Home
        </Link>
      </header>

      {/* CONTENT */}
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <motion.div 
          initial={{ opacity: 0, y: 15, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-[440px]"
        >
          {/* Top Info */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-[10px] font-bold text-amber-400 mb-4 tracking-wider uppercase">
              <Sparkles className="w-3 h-3" />
              <span>Plataforma B2B</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-sans">
              Criar sua conta
            </h1>
            <p className="text-xs text-zinc-400 font-light mt-2">
              Cadastre sua barbearia e inicie sua transformação hoje.
            </p>
          </div>

          {/* Form Card */}
          <div className="p-6 sm:p-8 rounded-2xl border border-zinc-800/80 bg-zinc-950/60 backdrop-blur-md shadow-2xl relative overflow-hidden">
            
            {/* Glow accent */}
            <div className="absolute -right-12 -top-12 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

            {/* SELECTED PLAN DISPLAY */}
            <div className="border border-amber-500/20 bg-amber-500/5 rounded-xl px-4 py-3 text-xs flex justify-between items-center mb-6">
              <span className="text-zinc-400">Plano Selecionado</span>
              <span className="text-amber-400 font-bold font-sans">{planLabels[plan] || plan}</span>
            </div>

            {/* ERROR ALERT */}
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl mb-6"
              >
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <p className="text-xs text-red-400 font-medium">{error}</p>
              </motion.div>
            )}

            {/* FORM */}
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wide mb-1.5">Nome da Barbearia</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
                    <Store className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Barbearia Club VIP"
                    value={barbershopName}
                    onChange={e => setBarbershopName(e.target.value)}
                    className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-amber-500 rounded-xl pl-11 pr-4 py-3 text-xs text-white placeholder-zinc-500 outline-none transition-colors"
                  />
                </div>
                {barbershopName && (
                  <p className="text-[10px] text-zinc-500 mt-2 font-mono truncate">
                    URL da sua página: <span className="text-amber-500">/barber/{generateSlug(barbershopName)}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wide mb-1.5">Nome do Proprietário</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="Ex: João Silva"
                    value={ownerName}
                    onChange={e => setOwnerName(e.target.value)}
                    className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-amber-500 rounded-xl pl-11 pr-4 py-3 text-xs text-white placeholder-zinc-500 outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wide mb-1.5">Email</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    required
                    placeholder="seuemail@barbearia.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-amber-500 rounded-xl pl-11 pr-4 py-3 text-xs text-white placeholder-zinc-500 outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wide mb-1.5">Senha</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type="password"
                    required
                    placeholder="Mínimo 6 caracteres"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-amber-500 rounded-xl pl-11 pr-4 py-3 text-xs text-white placeholder-zinc-500 outline-none transition-colors"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading} 
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-xs shadow-lg shadow-amber-500/10 hover:shadow-amber-500/20 transition-all cursor-pointer flex items-center justify-center gap-2 relative overflow-hidden group/btn mt-6"
              >
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover/btn:animate-[shine_0.8s_ease-out] block" />
                {loading ? 'Criando conta...' : 'Criar minha Conta'}
                <ChevronRight className="w-4 h-4" />
              </button>
            </form>

            {/* Bottom Login Link */}
            <div className="mt-8 pt-6 border-t border-zinc-900/80 text-center">
              <p className="text-xs text-zinc-400 font-light">
                Já possui uma conta?{' '}
                <Link href="/login" className="text-amber-500 hover:text-amber-400 transition-colors font-medium no-underline">
                  Entrar
                </Link>
              </p>
              <p className="text-[10px] text-zinc-500 mt-4 leading-relaxed font-light">
                Ao prosseguir, você concorda com nossos termos de serviço e privacidade.
              </p>
            </div>

          </div>
        </motion.div>
      </div>

      {/* FOOTER */}
      <footer className="py-6 border-t border-zinc-900/40 text-center">
        <p className="text-[10px] text-zinc-600 font-light">
          © 2026 BarberShopBR. Todos os direitos reservados.
        </p>
      </footer>

      {/* Global shine utility style */}
      <style jsx global>{`
        @keyframes shine {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#030303] flex items-center justify-center">
        <p className="text-xs text-zinc-500 font-mono">Carregando formulário...</p>
      </div>
    }>
      <RegisterContent />
    </Suspense>
  )
}