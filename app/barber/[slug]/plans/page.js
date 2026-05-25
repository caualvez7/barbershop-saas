'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '../../../../lib/supabase'

export default function PlansPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params?.slug

  const [shop, setShop] = useState(null)
  const [customer, setCustomer] = useState(null)
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(null)

  useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push(`/barber/${slug}/auth`); return }

      const { data: shopData } = await supabase
        .from('barbershops').select('*').eq('slug', slug).single()

      const { data: plansData } = await supabase
        .from('plans')
        .select('*, plan_services(*)')
        .eq('barbershop_id', shopData.id)
        .eq('active', true)

      const { data: customerData } = await supabase
        .from('customers').select('*').eq('user_id', user.id).single()

      setShop(shopData)
      setPlans(plansData || [])
      setCustomer(customerData)
      setLoading(false)
    }
    if (slug) loadData()
  }, [slug])

  const handleSubscribe = async (plan) => {
    setSaving(plan.id)

    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30)

    const { error } = await supabase.from('subscriptions').insert({
      customer_id: customer.id,
      barbershop_id: shop.id,
      plan_name: plan.name,
      price: plan.price,
      status: 'pending',
      starts_at: new Date(),
      expires_at: expiresAt,
    })

    if (error) { alert('Erro ao criar assinatura.'); setSaving(null); return }

    router.push(`/barber/${slug}/scheduling`)
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafaf9' }}>
      <p style={{ fontSize: '0.9rem', color: '#6b6b67', fontFamily: "'DM Sans', sans-serif" }}>Carregando...</p>
    </div>
  )

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', sans-serif; background: #fafaf9; color: #1a1a18; }
        .plan-card { background: #fff; border: 0.5px solid #e5e3dd; border-radius: 16px; padding: 1.75rem; position: relative; transition: border-color .2s; }
        .plan-card:hover { border-color: #2563eb; }
        .plan-card.featured { border: 1.5px solid #2563eb; }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#fafaf9' }}>

        {/* NAVBAR */}
        <header style={{ padding: '1.25rem 2rem', borderBottom: '0.5px solid #e5e3dd', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button
            onClick={() => router.push(`/barber/${slug}`)}
            style={{ fontFamily: "'Instrument Serif', serif", fontSize: '1.1rem', color: '#1a1a18', background: 'none', border: 'none', cursor: 'pointer', letterSpacing: '-0.01em' }}
          >
            {shop?.name}
          </button>
          <button
            onClick={() => router.push(`/barber/${slug}/scheduling`)}
            style={{ background: 'none', border: 'none', fontSize: '0.875rem', color: '#9e9c96', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", textDecoration: 'underline' }}
          >
            Pular por agora
          </button>
        </header>

        <div style={{ padding: '4rem 2rem', maxWidth: '900px', margin: '0 auto' }}>

          {/* TOPO */}
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <p style={{ fontSize: '0.78rem', color: '#9e9c96', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              Planos exclusivos
            </p>
            <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 400, letterSpacing: '-0.02em', color: '#1a1a18', marginBottom: '0.75rem' }}>
              Escolha seu plano
            </h1>
            <p style={{ fontSize: '0.95rem', color: '#6b6b67', fontWeight: 300 }}>
              Assine e tenha acesso aos benefícios exclusivos da {shop?.name}.
            </p>
          </div>

          {/* PLANOS */}
          {plans.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', background: '#fff', border: '0.5px solid #e5e3dd', borderRadius: '16px' }}>
              <p style={{ fontSize: '0.9rem', color: '#9e9c96' }}>Nenhum plano disponível no momento.</p>
              <button
                onClick={() => router.push(`/barber/${slug}/scheduling`)}
                style={{ marginTop: '1.5rem', background: '#1a1a18', color: '#fafaf9', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '100px', fontSize: '0.875rem', fontFamily: "'DM Sans', sans-serif", cursor: 'pointer' }}
              >
                Ir para agendamento
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
              {plans.map((plan, index) => (
                <div key={plan.id} className={`plan-card ${index === 1 ? 'featured' : ''}`}>

                  {index === 1 && (
                    <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: '#2563eb', color: '#fff', fontSize: '0.75rem', padding: '0.25rem 0.85rem', borderRadius: '100px', whiteSpace: 'nowrap' }}>
                      Mais popular
                    </div>
                  )}

                  <p style={{ fontSize: '0.85rem', color: '#6b6b67', fontWeight: 500, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {plan.name}
                  </p>
                  <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: '2.5rem', color: '#1a1a18', lineHeight: 1, marginBottom: '0.25rem' }}>
                    R$ {plan.price}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#9e9c96', marginBottom: '1.25rem' }}>/mês</div>

                  <hr style={{ border: 'none', borderTop: '0.5px solid #e5e3dd', marginBottom: '1.25rem' }} />

                  {/* SERVIÇOS DO PLANO */}
                  {plan.plan_services?.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1.5rem' }}>
                      {plan.plan_services.map(svc => (
                        <div key={svc.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '0.825rem', color: '#4a4a47', fontWeight: 300 }}>{svc.service_name}</span>
                          <span style={{
                            fontSize: '0.72rem', fontWeight: 500, padding: '0.15rem 0.6rem', borderRadius: '100px',
                            background: svc.benefit_type === 'free' ? '#f0fdf4' : '#eef2ff',
                            color: svc.benefit_type === 'free' ? '#16a34a' : '#3730a3',
                            border: svc.benefit_type === 'free' ? '0.5px solid #86efac' : '0.5px solid #c7d2fe',
                          }}>
                            {svc.benefit_type === 'free' ? 'Grátis' : `${svc.discount_percent}% OFF`}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    onClick={() => handleSubscribe(plan)}
                    disabled={saving === plan.id}
                    style={{
                      width: '100%', padding: '0.75rem', borderRadius: '100px',
                      fontSize: '0.875rem', fontFamily: "'DM Sans', sans-serif",
                      cursor: saving === plan.id ? 'not-allowed' : 'pointer',
                      opacity: saving === plan.id ? 0.6 : 1,
                      background: index === 1 ? '#2563eb' : '#1a1a18',
                      color: '#fafaf9', border: 'none', transition: 'opacity .2s',
                    }}
                  >
                    {saving === plan.id ? 'Processando...' : 'Assinar agora'}
                  </button>

                </div>
              ))}
            </div>
          )}

          {/* PULAR */}
          <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
            <button
              onClick={() => router.push(`/barber/${slug}/scheduling`)}
              style={{ background: 'none', border: 'none', fontSize: '0.875rem', color: '#9e9c96', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}
            >
              Continuar sem plano por agora →
            </button>
          </div>

        </div>

      </div>
    </>
  )
}