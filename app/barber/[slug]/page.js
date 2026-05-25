'use client'

import { supabase } from '../../../lib/supabase'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

export default function BarberPage() {
  const [shop, setShop] = useState(null)
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [plans, setPlans] = useState([])
  const [selectedPlan, setSelectedPlan] = useState(null)
  const params = useParams()
  const router = useRouter()
  const slug = params?.slug

  useEffect(() => {
    const loadShop = async () => {
      const { data, error } = await supabase
        .from('barbershops')
        .select('*')
        .eq('slug', slug)
        .single()

      if (error || !data) { setLoading(false); return }
      setShop(data)

      const { data: servicesData } = await supabase
        .from('services')
        .select('*')
        .eq('barbershop_id', data.id)

      setServices(servicesData || [])
      setLoading(false)

      const { data: plansData } = await supabase
        .from('plans')
        .select('*, plan_services(*)')
        .eq('barbershop_id', data.id)
        .eq('active', true)

      setPlans(plansData || [])
    }
    if (slug) loadShop()
  }, [slug])

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafaf9' }}>
      <p style={{ fontSize: '0.9rem', color: '#6b6b67', fontFamily: "'DM Sans', sans-serif" }}>Carregando...</p>
    </div>
  )

  if (!shop) return (
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
        .service-card {
          background: #fff; border: 0.5px solid #e5e3dd; border-radius: 12px;
          padding: 1rem 1.25rem; display: flex; align-items: center; justify-content: space-between;
          transition: border-color .2s;
        }
        .service-card:hover { border-color: #1a1a18; }
        .benefit-item {
          background: #fff; border: 0.5px solid #e5e3dd; border-radius: 16px; padding: 1.5rem;
          transition: border-color .2s;
        }
        .benefit-item:hover { border-color: #1a1a18; }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#fafaf9' }}>

        {/* NAVBAR */}
        <header style={{ height: '60px', borderBottom: '0.5px solid #e5e3dd', background: 'rgba(250,250,249,0.92)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2rem', position: 'sticky', top: 0, zIndex: 100 }}>
          <span style={{ fontFamily: "'Instrument Serif', serif", fontSize: '1.2rem', color: '#1a1a18', letterSpacing: '-0.01em' }}>
            {shop.name}
          </span>
          <button
            onClick={() => router.push(`/barber/${slug}/auth`)}
            style={{ background: '#1a1a18', color: '#fafaf9', border: 'none', padding: '0.5rem 1.1rem', borderRadius: '100px', fontSize: '0.875rem', fontFamily: "'DM Sans', sans-serif", cursor: 'pointer' }}
          >
            Entrar
          </button>
        </header>

        {/* HERO */}
        <section style={{ padding: '5rem 2rem', maxWidth: '720px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#eef2ff', color: '#3730a3', borderRadius: '100px', padding: '0.35rem 0.85rem', fontSize: '0.8rem', fontWeight: 500, marginBottom: '2rem' }}>
            <span style={{ width: '6px', height: '6px', background: '#4f46e5', borderRadius: '50%', display: 'block' }} />
            Agendamento online disponível
          </div>

          <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', fontWeight: 400, lineHeight: 1.15, letterSpacing: '-0.02em', color: '#1a1a18', marginBottom: '1.25rem' }}>
            Bem-vindo à{' '}
            <em style={{ fontStyle: 'italic', color: '#2563eb' }}>{shop.name}</em>
          </h1>

          <p style={{ fontSize: '1rem', color: '#6b6b67', maxWidth: '480px', margin: '0 auto 2.5rem', lineHeight: 1.7, fontWeight: 300 }}>
            Agende seu horário online, assine um plano e tenha prioridade no atendimento.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => router.push(`/barber/${slug}/auth`)}
              style={{ background: '#1a1a18', color: '#fafaf9', border: 'none', padding: '0.75rem 1.75rem', borderRadius: '100px', fontSize: '0.9rem', fontFamily: "'DM Sans', sans-serif", cursor: 'pointer' }}
            >
              Agendar agora
            </button>
            <button
              onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
              style={{ background: 'transparent', color: '#1a1a18', border: '0.5px solid #c8c6bf', padding: '0.75rem 1.75rem', borderRadius: '100px', fontSize: '0.9rem', fontFamily: "'DM Sans', sans-serif", cursor: 'pointer' }}
            >
              Ver serviços
            </button>
          </div>
        </section>

        {/* BENEFÍCIOS */}
        <div style={{ padding: '0 2rem 5rem', maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            {[
              { icon: '✂️', title: 'Cortes ilimitados', desc: 'Frequente sua barbearia sem preocupação com o valor.' },
              { icon: '⚡', title: 'Prioridade no atendimento', desc: 'Clientes assinantes têm preferência na fila.' },
              { icon: '💎', title: 'Benefícios exclusivos', desc: 'Promoções especiais e vantagens únicas para assinantes.' },
            ].map(item => (
              <div key={item.title} className="benefit-item">
                <div style={{ width: '40px', height: '40px', background: '#eef2ff', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', fontSize: '1.1rem' }}>
                  {item.icon}
                </div>
                <p style={{ fontSize: '0.95rem', fontWeight: 500, color: '#1a1a18', marginBottom: '0.35rem' }}>{item.title}</p>
                <p style={{ fontSize: '0.825rem', color: '#6b6b67', fontWeight: 300, lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* SERVIÇOS */}
        {services.length > 0 && (
          <section id="services" style={{ padding: '0 2rem 5rem', maxWidth: '700px', margin: '0 auto' }}>
            <div style={{ borderTop: '0.5px solid #e5e3dd', paddingTop: '4rem' }}>
              <p style={{ fontSize: '0.78rem', color: '#9e9c96', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                Serviços
              </p>
              <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 400, letterSpacing: '-0.02em', color: '#1a1a18', marginBottom: '2rem' }}>
                O que oferecemos
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {services.map(service => (
                  <div key={service.id} className="service-card">
                    <div>
                      <p style={{ fontSize: '0.9rem', fontWeight: 500, color: '#1a1a18', marginBottom: '0.2rem' }}>{service.name}</p>
                      <p style={{ fontSize: '0.8rem', color: '#6b6b67', fontWeight: 300 }}>{service.duration} min</p>
                    </div>
                    <span style={{ fontSize: '0.95rem', fontWeight: 500, color: '#1a1a18' }}>R$ {service.price}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

{/* PLANOS */}
{plans.length > 0 && (
  <section style={{ padding: '0 2rem 5rem', maxWidth: '700px', margin: '0 auto' }}>
    <div style={{ borderTop: '0.5px solid #e5e3dd', paddingTop: '4rem' }}>
      <p style={{ fontSize: '0.78rem', color: '#9e9c96', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
        Planos
      </p>
      <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 400, letterSpacing: '-0.02em', color: '#1a1a18', marginBottom: '2rem' }}>
        Assine e tenha prioridade
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {plans.map((plan, index) => (
          <div key={plan.id} style={{
            background: '#fff',
            border: index === 1 ? '1.5px solid #2563eb' : '0.5px solid #e5e3dd',
            borderRadius: '16px', padding: '1.25rem 1.5rem',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexWrap: 'wrap', gap: '1rem', position: 'relative',
          }}>
            {index === 1 && (
              <div style={{ position: 'absolute', top: '-11px', left: '1.5rem', background: '#2563eb', color: '#fff', fontSize: '0.7rem', padding: '0.2rem 0.75rem', borderRadius: '100px' }}>
                Mais popular
              </div>
            )}
            <div>
              <p style={{ fontSize: '0.95rem', fontWeight: 500, color: '#1a1a18', marginBottom: '0.2rem' }}>{plan.name}</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.2rem' }}>
                <span style={{ fontFamily: "'Instrument Serif', serif", fontSize: '1.5rem', color: '#1a1a18' }}>R$ {plan.price}</span>
                <span style={{ fontSize: '0.78rem', color: '#9e9c96' }}>/mês</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button
                onClick={() => setSelectedPlan(plan)}
                style={{ background: 'none', border: 'none', fontSize: '0.875rem', color: '#2563eb', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", display: 'flex', alignItems: 'center', gap: '0.3rem', padding: 0 }}
              >
                Confira as vantagens <span style={{ fontSize: '1rem' }}>→</span>
              </button>
              <button
                onClick={() => router.push(`/barber/${slug}/auth`)}
                style={{ background: index === 1 ? '#2563eb' : '#1a1a18', color: '#fafaf9', border: 'none', padding: '0.55rem 1.1rem', borderRadius: '100px', fontSize: '0.825rem', fontFamily: "'DM Sans', sans-serif", cursor: 'pointer', whiteSpace: 'nowrap' }}
              >
                Assinar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
)}

{/* MODAL DE PLANO */}
{selectedPlan && (
  <div
    onClick={() => setSelectedPlan(null)}
    style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', zIndex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: '1rem' }}
  >
    <div
      onClick={e => e.stopPropagation()}
      style={{ background: '#fafaf9', borderRadius: '20px', padding: '2rem', width: '100%', maxWidth: '480px', maxHeight: '85vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
    >

      {/* HEADER DO MODAL */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: '0.75rem', color: '#9e9c96', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Plano</p>
          <h3 style={{ fontFamily: "'Instrument Serif', serif", fontSize: '1.6rem', fontWeight: 400, letterSpacing: '-0.02em', color: '#1a1a18' }}>
            {selectedPlan.name}
          </h3>
        </div>
        <button
          onClick={() => setSelectedPlan(null)}
          style={{ background: '#f5f4f0', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', fontSize: '1rem', color: '#6b6b67', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
        >
          ✕
        </button>
      </div>

      {/* SERVIÇOS */}
      <div>
        <p style={{ fontSize: '0.78rem', color: '#9e9c96', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
          Serviços incluídos
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {selectedPlan.plan_services?.length > 0 ? (
            selectedPlan.plan_services.map(svc => (
              <div key={svc.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', background: '#fff', border: '0.5px solid #e5e3dd', borderRadius: '12px' }}>
                <span style={{ fontSize: '0.875rem', color: '#1a1a18', fontWeight: 400 }}>{svc.service_name}</span>
                <span style={{
                  fontSize: '0.75rem', fontWeight: 500, padding: '0.2rem 0.65rem', borderRadius: '100px',
                  background: svc.benefit_type === 'free' ? '#f0fdf4' : '#eef2ff',
                  color: svc.benefit_type === 'free' ? '#16a34a' : '#3730a3',
                  border: svc.benefit_type === 'free' ? '0.5px solid #86efac' : '0.5px solid #c7d2fe',
                }}>
                  {svc.benefit_type === 'free' ? 'Gratuito' : `${svc.discount_percent}% OFF`}
                </span>
              </div>
            ))
          ) : (
            <p style={{ fontSize: '0.875rem', color: '#9e9c96' }}>Nenhum serviço cadastrado neste plano.</p>
          )}
        </div>
      </div>

      {/* PREÇO + CTA */}
      <div style={{ borderTop: '0.5px solid #e5e3dd', paddingTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <p style={{ fontSize: '0.78rem', color: '#9e9c96', marginBottom: '0.2rem' }}>Valor mensal</p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.2rem' }}>
            <span style={{ fontFamily: "'Instrument Serif', serif", fontSize: '2rem', color: '#1a1a18' }}>R$ {selectedPlan.price}</span>
            <span style={{ fontSize: '0.8rem', color: '#9e9c96' }}>/mês</span>
          </div>
        </div>
        <button
          onClick={() => router.push(`/barber/${slug}/auth`)}
          style={{ background: '#1a1a18', color: '#fafaf9', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '100px', fontSize: '0.875rem', fontFamily: "'DM Sans', sans-serif", cursor: 'pointer', whiteSpace: 'nowrap' }}
        >
          Assinar agora
        </button>
      </div>

    </div>
  </div>
)}

        {/* CTA FINAL */}
        <section style={{ padding: '0 2rem 6rem', maxWidth: '700px', margin: '0 auto' }}>
          <div style={{ background: '#1a1a18', borderRadius: '20px', padding: '3rem 2rem', textAlign: 'center' }}>
            <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 400, color: '#fafaf9', letterSpacing: '-0.02em', marginBottom: '0.75rem' }}>
              Faça parte da{' '}
              <em style={{ fontStyle: 'italic', color: '#93c5fd' }}>{shop.name}</em>
            </h2>
            <p style={{ fontSize: '0.9rem', color: '#9e9c96', fontWeight: 300, marginBottom: '2rem', lineHeight: 1.6 }}>
              Crie sua conta, escolha um plano e comece a agendar com prioridade.
            </p>
            <button
              onClick={() => router.push(`/barber/${slug}/auth`)}
              style={{ background: '#fafaf9', color: '#1a1a18', border: 'none', padding: '0.75rem 1.75rem', borderRadius: '100px', fontSize: '0.9rem', fontFamily: "'DM Sans', sans-serif", cursor: 'pointer', fontWeight: 500 }}
            >
              Começar agora
            </button>
          </div>
        </section>

        {/* FOOTER */}
        <footer style={{ padding: '1.5rem 2rem', borderTop: '0.5px solid #e5e3dd', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <span style={{ fontFamily: "'Instrument Serif', serif", fontSize: '1rem', color: '#1a1a18' }}>{shop.name}</span>
          <span style={{ fontSize: '0.78rem', color: '#9e9c96' }}>Agendamentos via BarberShopBR</span>
        </footer>

      </div>
    </>
  )
} 