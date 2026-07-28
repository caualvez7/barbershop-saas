'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabaseCustomer as supabase } from '../../../../lib/supabase-customer.js'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Sparkles, 
  Scissors, 
  Check, 
  ArrowRight, 
  ChevronLeft,
  Calendar
} from 'lucide-react'
import ThreeBackground from '../../../components/ThreeBackground'
import '../client-landing.css'

import { getOrCreateCustomerProfile } from '../../../../lib/customer-profile.js'

export default function PlansPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params?.slug

  const [shop, setShop] = useState(null)
  const [customer, setCustomer] = useState(null)
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(null)
  const [currentYear, setCurrentYear] = useState(2026)

  useEffect(() => {
    setCurrentYear(new Date().getFullYear())
  }, [])

  useEffect(() => {
    const loadData = async () => {
      let user = null
      try {
        const { data: { user: fetchedUser } } = await supabase.auth.getUser()
        user = fetchedUser
      } catch (err) {
        console.warn('Erro na busca de sessao:', err)
      }

      if (!user) { 
        router.push(`/barber/${slug}/auth`)
        return 
      }

      const { data: shopData } = await supabase
        .from('barbershops')
        .select('*')
        .eq('slug', slug)
        .single()

      if (!shopData) {
        setLoading(false)
        return
      }

      const { data: plansData } = await supabase
        .from('plans')
        .select('*, plan_services(*)')
        .eq('barbershop_id', shopData.id)
        .eq('active', true)

      const customerData = await getOrCreateCustomerProfile(supabase, user, shopData)

      setShop(shopData)
      setPlans(plansData || [])
      setCustomer(customerData)
      setLoading(false)
    }
    if (slug) loadData()
  }, [slug])

  // Lógica de 3D Card Hover
  const handleMouseMove = (e) => {
    const card = e.currentTarget
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const rotateX = ((centerY - y) / centerY) * 8 // máximo de 8 graus
    const rotateY = ((x - centerX) / centerX) * 8

    card.style.setProperty('--mouse-x', `${x}px`)
    card.style.setProperty('--mouse-y', `${y}px`)
    card.style.setProperty('--rotate-x', `${rotateX}deg`)
    card.style.setProperty('--rotate-y', `${rotateY}deg`)
  }

  const handleMouseLeave = (e) => {
    const card = e.currentTarget
    card.style.setProperty('--rotate-x', '0deg')
    card.style.setProperty('--rotate-y', '0deg')
  }

  const handleSubscribe = async (plan) => {
    if (!customer) {
      alert('Erro ao identificar o cliente. Faça login novamente.')
      return
    }
    setSaving(plan.id)

    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30)

    const { error } = await supabase.from('subscriptions').insert({
      customer_id: customer.id,
      barbershop_id: shop.id,
      plan_name: plan.name,
      price: plan.price,
      status: 'pending',
      starts_at: new Date().toISOString(),
      expires_at: expiresAt.toISOString(),
    })

    if (error) { 
      alert('Erro ao criar assinatura: ' + error.message)
      setSaving(null)
      return 
    }

    router.push(`/barber/${slug}/scheduling`)
  }

  if (loading) return (
    <div className="min-h-screen bg-[#030303] flex flex-col items-center justify-center text-zinc-500 font-sans gap-3">
      <div className="w-8 h-8 rounded-full border border-t-amber-500 border-zinc-800 animate-spin" />
      <p className="text-xs uppercase tracking-widest text-zinc-600 font-bold animate-pulse">Carregando Planos...</p>
    </div>
  )

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
        
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
            <span>{shop?.name}</span>
          </button>

          <button
            onClick={() => router.push(`/barber/${slug}/scheduling`)}
            className="px-4 py-2 border border-zinc-800 rounded-full text-xxs font-bold uppercase tracking-wider text-zinc-400 hover:text-white hover:border-zinc-700 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <span>Pular por agora</span>
            <ArrowRight size={12} />
          </button>
        </header>

        {/* SEÇÃO PRINCIPAL */}
        <main className="flex-1 flex flex-col items-center justify-center px-6 py-28 relative z-10 max-w-5xl mx-auto w-full">
          
          {/* Cabeçalho do Conteúdo */}
          <div className="text-center mb-12 max-w-md">
            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-500">Clubes de Fidelidade</span>
            <h1 className="font-serif-lux text-4xl sm:text-5xl font-normal tracking-tight text-white mt-3 leading-none">
              Escolha o seu plano
            </h1>
            <p className="text-zinc-500 text-xs font-light mt-3 leading-relaxed">
              Assine um plano de recorrência e garanta descontos especiais, cortes ilimitados e prioridade na agenda da {shop?.name}.
            </p>
          </div>

          {/* LISTAGEM DE PLANOS */}
          {plans.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-md glass-panel border border-zinc-900 rounded-3xl p-8 text-center flex flex-col items-center gap-4"
            >
              <Sparkles size={32} className="text-zinc-700 mb-2" />
              <p className="text-zinc-500 text-xs font-light">Nenhum plano de assinatura ativo no momento.</p>
              <button
                onClick={() => router.push(`/barber/${slug}/scheduling`)}
                className="mt-2 px-6 py-3 rounded-full text-xs font-bold text-black bg-gradient-to-r from-amber-500 to-yellow-500 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center gap-1.5 shadow-md"
              >
                <Calendar size={13} />
                <span>Ir para Agendamento</span>
              </button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
              {plans.map((plan, index) => {
                // O segundo plano é definido como recomendado para manter a lógica original (destaque)
                const isRecommended = index === 1 || plans.length === 1
                
                return (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.15, ease: [0.16, 1, 0.3, 1] }}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    className={`premium-card-3d group relative rounded-3xl flex flex-col gap-6 shadow-2xl transition-all cursor-pointer ${
                      isRecommended 
                        ? 'animated-gold-border' 
                        : 'border border-zinc-900 bg-[#0c0c0e]/30'
                    }`}
                    onClick={() => handleSubscribe(plan)}
                  >
                    {/* Glow background interativo */}
                    <div className="premium-card-3d__glow" />

                    {/* Conteúdo do Card */}
                    <div className={`premium-card-3d__content flex flex-col justify-between h-full gap-6 p-6 ${
                      isRecommended ? 'animated-gold-border__inner p-6 bg-[#09090b] rounded-[23px]' : ''
                    }`}>
                      
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                              Plano {plan.name}
                            </span>
                            
                            {isRecommended && (
                              <span className="text-[8px] font-bold text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-sm">
                                <Sparkles size={8} className="animate-pulse" />
                                <span>Mais Popular</span>
                              </span>
                            )}
                          </div>

                          <div className="flex items-baseline gap-1 mt-4">
                            <span className="text-3xl md:text-4xl font-extrabold tracking-tight text-white font-sans">
                              R$ {Number(plan.price).toFixed(2)}
                            </span>
                            <span className="text-xs text-zinc-500">/mês</span>
                          </div>
                        </div>

                        <div className="w-10 h-10 rounded-xl bg-amber-500/5 border border-amber-500/15 flex items-center justify-center text-amber-500">
                          <Sparkles size={16} />
                        </div>
                      </div>

                      {/* Linha Divisória */}
                      <div className="border-b border-zinc-900/60 w-full" />

                      {/* Serviços inclusos no Plano */}
                      {plan.plan_services?.length > 0 ? (
                        <div className="flex flex-col gap-3">
                          <p className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider">Benefícios inclusos:</p>
                          <ul className="flex flex-col gap-2">
                            {plan.plan_services.map(svc => {
                              const isFree = svc.benefit_type === 'free'
                              return (
                                <li key={svc.id} className="flex items-center gap-2 text-xs">
                                  <div className="w-4.5 h-4.5 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0 text-amber-500">
                                    <Check size={9} className="stroke-[3.5px]" />
                                  </div>
                                  <span className="text-zinc-300 font-medium">{svc.service_name}</span>
                                  <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${
                                    isFree 
                                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10' 
                                      : 'bg-amber-500/10 text-amber-500 border border-amber-500/10'
                                  }`}>
                                    {isFree ? 'Grátis' : `${svc.discount_percent}% OFF`}
                                  </span>
                                </li>
                              )
                            })}
                          </ul>
                        </div>
                      ) : (
                        <p className="text-[10px] text-zinc-500">Sem benefícios vinculados a este plano.</p>
                      )}

                      {/* Botão de Assinatura */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleSubscribe(plan)
                        }}
                        disabled={saving === plan.id}
                        className={`w-full py-3 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                          isRecommended
                            ? 'text-black bg-gradient-to-r from-amber-500 to-yellow-500 hover:scale-[1.02] active:scale-[0.98]'
                            : 'text-white bg-zinc-900 border border-zinc-850 hover:bg-zinc-800 hover:scale-[1.02] active:scale-[0.98]'
                        } cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {saving === plan.id ? (
                          <div className="w-4 h-4 rounded-full border border-t-white border-zinc-700 animate-spin" />
                        ) : (
                          <>
                            <span>Assinar agora</span>
                            <ArrowRight size={12} />
                          </>
                        )}
                      </button>

                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}

          {/* Pular para o Agendamento */}
          <div className="text-center mt-12">
            <button
              onClick={() => router.push(`/barber/${slug}/scheduling`)}
              className="text-xs text-zinc-500 hover:text-amber-500 transition-colors bg-transparent border-none cursor-pointer flex items-center gap-1.5 mx-auto font-medium"
            >
              <span>Continuar sem plano por agora</span>
              <ArrowRight size={12} />
            </button>
          </div>

        </main>

        {/* FOOTER */}
        <footer className="py-6 text-center border-t border-white/[0.02] bg-black/30 relative z-10">
          <p className="text-[9px] uppercase font-bold text-zinc-600 tracking-widest">
            &copy; {currentYear} {shop?.name} &bull; Plataforma BarberShopBR
          </p>
        </footer>

      </div>
    </>
  )
}