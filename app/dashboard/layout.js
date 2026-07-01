'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabaseBarber as supabase } from '../../lib/supabase-barber.js'
import { ThemeContext, DashboardContext } from '../components/DashboardLayout.jsx'

export default function DashboardRootLayout({ children }) {
  const router = useRouter()
  const [theme, setTheme] = useState('dark')
  const [session, setSession] = useState(null)
  const [barbershop, setBarbershop] = useState(null)
  const [loading, setLoading] = useState(true)

  const barbershopRef = useRef(barbershop)
  useEffect(() => {
    barbershopRef.current = barbershop
  }, [barbershop])

  useEffect(() => {
    const saved = localStorage.getItem('dashboard-theme')
    if (saved) {
      setTheme(saved)
    }
  }, [])

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    localStorage.setItem('dashboard-theme', next)
  }

  useEffect(() => {
    const loadSession = async () => {
      try {
        // Garante que a sessão local está ativa (dispara auto-refresh do token se necessário)
        const { data: { session: currentSession } } = await supabase.auth.getSession()

        // Em seguida, valida de forma segura a integridade do usuário no servidor do Supabase
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
          router.push('/login')
          return
        }

        setSession(currentSession)

        const { data: shopData, error: shopError } = await supabase
          .from('barbershops')
          .select('id, name, owner_name, email, plan, created_at, user_id, slug, phone, commercial_email')
          .eq('user_id', user.id)
          .single()

        if (shopError || !shopData) {
          console.warn('Usuário não possui barbearia cadastrada. Fazendo logout de segurança...')
          await supabase.auth.signOut()
          setSession(null)
          setBarbershop(null)
          router.push('/login?error=no_shop')
          return
        }

        setBarbershop(shopData)
      } catch (err) {
        console.error('Erro ao carregar sessão no layout:', err)
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }
    loadSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      if (event === 'SIGNED_OUT') {
        setSession(null)
        setBarbershop(null)
        router.push('/login')
      } else if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && currentSession) {
        setSession(currentSession)
        try {
          const { data: shopData, error: shopError } = await supabase
            .from('barbershops')
            .select('id, name, owner_name, email, plan, created_at, user_id, slug, phone, commercial_email')
            .eq('user_id', currentSession.user.id)
            .single()

          if (shopError || !shopData) {
            console.warn('Usuário sem barbearia associada no evento. Fazendo logout...')
            await supabase.auth.signOut()
            setSession(null)
            setBarbershop(null)
            router.push('/login?error=no_shop')
            return
          }

          if (shopData?.id !== barbershopRef.current?.id) {
            setBarbershop(shopData)
          }
        } catch (err) {
          console.error('Erro ao sincronizar barbearia após mudança de auth:', err)
        }
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030303] flex flex-col items-center justify-center gap-4">
        <div className="w-8 h-8 rounded-full border border-t-amber-500 border-zinc-900 animate-spin" />
        <p className="text-zinc-650 text-xs font-mono tracking-wider uppercase">Carregando painel...</p>
      </div>
    )
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <DashboardContext.Provider value={{ session, barbershop, loading }}>
        {children}
      </DashboardContext.Provider>
    </ThemeContext.Provider>
  )
}
