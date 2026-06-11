'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Scissors, Sparkles, Mail, Lock, AlertCircle, ChevronRight } from 'lucide-react'
import { supabase } from '../../lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e) => {
    if (e) e.preventDefault()
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
    <div className="min-h-screen bg-[#030303] text-zinc-100 font-sans selection:bg-amber-500/35 selection:text-white flex flex-col justify-between relative overflow-hidden">
      
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-b from-amber-500/10 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-10 w-[300px] h-[300px] bg-blue-500/[0.03] rounded-full blur-3xl pointer-events-none -z-10" />

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
          className="w-full max-w-[420px]"
        >
          {/* Top Info */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-[10px] font-bold text-amber-400 mb-4 tracking-wider uppercase">
              <Sparkles className="w-3 h-3" />
              <span>Painel do Cliente</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-sans">
              Bem-vindo de volta
            </h1>
            <p className="text-xs text-zinc-400 font-light mt-2">
              Acesse o sistema operacional da sua barbearia.
            </p>
          </div>

          {/* Form Card */}
          <div className="p-6 sm:p-8 rounded-2xl border border-zinc-800/80 bg-zinc-950/60 backdrop-blur-md shadow-2xl relative overflow-hidden">
            
            {/* Glow accent */}
            <div className="absolute -right-12 -top-12 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

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
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wide mb-1.5">Email</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    required
                    placeholder="seu@email.com"
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
                    placeholder="••••••••"
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
                {loading ? 'Entrando...' : 'Entrar na Conta'}
                <ChevronRight className="w-4 h-4" />
              </button>
            </form>

            {/* Bottom Register Link */}
            <div className="mt-8 pt-6 border-t border-zinc-900/80 text-center">
              <p className="text-xs text-zinc-400 font-light">
                Ainda não tem conta?{' '}
                <Link href="/#plans" className="text-amber-500 hover:text-amber-400 transition-colors font-medium no-underline">
                  Escolher um plano
                </Link>
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