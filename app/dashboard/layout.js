'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase.js'
import { ThemeContext, DashboardContext } from '../components/DashboardLayout.jsx'

export default function DashboardRootLayout({ children }) {
  const router = useRouter()
  const [theme, setTheme] = useState('dark')
  const [session, setSession] = useState(null)
  const [barbershop, setBarbershop] = useState(null)
  const [loading, setLoading] = useState(true)

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
        const { data: { session: currentSession } } = await supabase.auth.getSession()
        if (!currentSession) {
          router.push('/login')
          return
        }
        setSession(currentSession)

        const { data: shopData } = await supabase
          .from('barbershops')
          .select('*')
          .eq('user_id', currentSession.user.id)
          .single()

        setBarbershop(shopData)
      } catch (err) {
        console.error('Erro ao carregar sessão no layout:', err)
      } finally {
        setLoading(false)
      }
    }
    loadSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      if (event === 'SIGNED_OUT') {
        router.push('/login')
      } else if (event === 'SIGNED_IN' && currentSession) {
        setSession(currentSession)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router])

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
