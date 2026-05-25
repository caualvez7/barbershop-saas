'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '../../../../lib/supabase'

function generateSlots(openTime, closeTime) {
  const slots = []
  const [openH, openM] = openTime.split(':').map(Number)
  const [closeH, closeM] = closeTime.split(':').map(Number)
  let current = openH * 60 + openM
  const end = closeH * 60 + closeM
  while (current < end) {
    const h = String(Math.floor(current / 60)).padStart(2, '0')
    const m = String(current % 60).padStart(2, '0')
    slots.push(`${h}:${m}`)
    current += 30
  }
  return slots
}

function getNext7Days(businessHours) {
  const days = []
  const today = new Date()
  let checked = 0
  let offset = 0
  while (days.length < 7 && checked < 30) {
    const date = new Date(today)
    date.setDate(today.getDate() + offset)
    const dayOfWeek = date.getDay()
    const hours = businessHours.find(h => h.day_of_week === dayOfWeek)
    if (hours?.is_open) {
      days.push({
        date,
        dateStr: date.toISOString().split('T')[0],
        label: date.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' }),
        open_time: hours.open_time,
        close_time: hours.close_time,
      })
    }
    offset++
    checked++
  }
  return days
}

export default function SchedulingPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params?.slug

  const [shop, setShop] = useState(null)
  const [customer, setCustomer] = useState(null)
  const [services, setServices] = useState([])
  const [barbers, setBarbers] = useState([])
  const [plans, setPlans] = useState([])
  const [subscription, setSubscription] = useState(null)
  const [businessHours, setBusinessHours] = useState([])
  const [bookedSlots, setBookedSlots] = useState([])
  const [loading, setLoading] = useState(true)

  // seleções
  const [selectedBarber, setSelectedBarber] = useState(null)
  const [selectedService, setSelectedService] = useState(null)
  const [selectedDay, setSelectedDay] = useState(null)
  const [selectedTime, setSelectedTime] = useState(null)

  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  // modal plano
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [savingPlan, setSavingPlan] = useState(null)

  useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push(`/barber/${slug}/auth`); return }

      const { data: customerData } = await supabase
        .from('customers').select('*').eq('user_id', user.id).single()

      if (!customerData) { router.push(`/barber/${slug}/auth`); return }

      const { data: shopData } = await supabase
        .from('barbershops').select('*').eq('slug', slug).single()

      if (!shopData) { setLoading(false); return }

      const [
        { data: servicesData },
        { data: barbersData },
        { data: plansData },
        { data: subscriptionData },
        { data: hoursData },
        { data: bookedData },
      ] = await Promise.all([
        supabase.from('services').select('*').eq('barbershop_id', shopData.id),
        supabase.from('barbers').select('*').eq('barbershop_id', shopData.id).eq('active', true),
        supabase.from('plans').select('*, plan_services(*)').eq('barbershop_id', shopData.id).eq('active', true),
        supabase.from('subscriptions').select('*').eq('customer_id', customerData.id).in('status', ['pending', 'active']).maybeSingle(),
        supabase.from('business_hours').select('*').eq('barbershop_id', shopData.id),
        supabase.from('appointments').select('barber_id, date, time').eq('barbershop_id', shopData.id).eq('status', 'Pendente'),
      ])

      setShop(shopData)
      setCustomer(customerData)
      setServices(servicesData || [])
      setBarbers(barbersData || [])
      setPlans(plansData || [])
      setSubscription(subscriptionData)
      setBusinessHours(hoursData || [])
      setBookedSlots(bookedData || [])
      setLoading(false)
    }
    if (slug) loadData()
  }, [slug])

  // dias disponíveis baseados no horário de funcionamento
  const availableDays = businessHours.length > 0 ? getNext7Days(businessHours) : []

  // slots do dia selecionado
  const daySlots = selectedDay
    ? generateSlots(selectedDay.open_time, selectedDay.close_time)
    : []

  // verifica se horário está ocupado para o barbeiro selecionado
  const isSlotBooked = (time) => {
    if (!selectedBarber || !selectedDay) return false
    return bookedSlots.some(
      b => b.barber_id === selectedBarber.id &&
           b.date === selectedDay.dateStr &&
           b.time === time
    )
  }

  const handleScheduling = async () => {
    setError('')
    if (!selectedBarber || !selectedService || !selectedDay || !selectedTime) {
      setError('Selecione o barbeiro, serviço, data e horário.')
      return
    }

    setSaving(true)

    const { error } = await supabase.from('appointments').insert({
      customer_name: customer.name,
      customer_whatsapp: customer.whatsapp,
      service_id: selectedService.id,
      barber_id: selectedBarber.id,
      date: selectedDay.dateStr,
      time: selectedTime,
      status: 'Pendente',
      barbershop_id: shop.id,
    })

    if (error) { setError('Erro ao realizar agendamento.'); setSaving(false); return }

    // adiciona slot como ocupado localmente
    setBookedSlots(prev => [...prev, {
      barber_id: selectedBarber.id,
      date: selectedDay.dateStr,
      time: selectedTime,
    }])

    setSuccess(true)
    setSelectedBarber(null)
    setSelectedService(null)
    setSelectedDay(null)
    setSelectedTime(null)
    setSaving(false)
  }

  const handleSubscribe = async (plan) => {
    setSavingPlan(plan.id)
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

    if (error) { alert('Erro ao criar assinatura.'); setSavingPlan(null); return }
    setSubscription({ plan_name: plan.name })
    setSelectedPlan(null)
    setSavingPlan(null)
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
        .select-card { background: #fff; border: 0.5px solid #e5e3dd; border-radius: 12px; padding: 0.75rem 1rem; cursor: pointer; transition: all .15s; }
        .select-card:hover { border-color: #2563eb; }
        .select-card.active { border: 1.5px solid #2563eb; background: #eef2ff; }
        .slot-btn { border: 0.5px solid #e5e3dd; border-radius: 8px; padding: 0.5rem 0.75rem; font-size: 0.825rem; font-family: 'DM Sans', sans-serif; cursor: pointer; background: #fff; color: #1a1a18; transition: all .15s; }
        .slot-btn:hover:not(:disabled) { border-color: #2563eb; color: #2563eb; }
        .slot-btn.active { background: #2563eb; border-color: #2563eb; color: #fff; }
        .slot-btn:disabled { background: #f5f4f0; color: #c8c6bf; border-color: #e5e3dd; cursor: not-allowed; text-decoration: line-through; }
        .plan-card { background: #fff; border: 0.5px solid #e5e3dd; border-radius: 16px; padding: 1.25rem; cursor: pointer; transition: border-color .2s; position: relative; }
        .plan-card:hover { border-color: #2563eb; }
        .plan-card.featured { border: 1.5px solid #2563eb; }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#fafaf9' }}>

        {/* NAVBAR */}
        <header style={{ height: '60px', borderBottom: '0.5px solid #e5e3dd', background: 'rgba(250,250,249,0.92)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2rem', position: 'sticky', top: 0, zIndex: 100 }}>
          <span style={{ fontFamily: "'Instrument Serif', serif", fontSize: '1.1rem', color: '#1a1a18' }}>{shop.name}</span>
          <button
            onClick={async () => { await supabase.auth.signOut(); router.push(`/barber/${slug}`) }}
            style={{ background: 'none', border: 'none', fontSize: '0.875rem', color: '#9e9c96', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}
          >
            Sair
          </button>
        </header>

        <div style={{ maxWidth: '680px', margin: '0 auto', padding: '2.5rem 2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>

          {/* SAUDAÇÃO */}
          <div>
            <p style={{ fontSize: '0.78rem', color: '#9e9c96', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Bem-vindo de volta</p>
            <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 'clamp(1.6rem, 4vw, 2.2rem)', fontWeight: 400, letterSpacing: '-0.02em', color: '#1a1a18', marginBottom: '0.4rem' }}>
              Olá, <em style={{ fontStyle: 'italic', color: '#2563eb' }}>{customer?.name?.split(' ')[0]}</em> 👋
            </h1>
            <p style={{ fontSize: '0.875rem', color: '#6b6b67', fontWeight: 300 }}>
              {subscription
                ? `Você assina o plano ${subscription.plan_name} na ${shop.name}.`
                : `Agende seu horário ou assine um plano da ${shop.name}.`}
            </p>
          </div>

          {/* ASSINATURA ATIVA */}
          {subscription && (
            <div style={{ background: '#f0fdf4', border: '0.5px solid #86efac', borderRadius: '12px', padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.875rem', color: '#16a34a' }}>✓</span>
              <p style={{ fontSize: '0.875rem', color: '#16a34a', fontWeight: 500 }}>Plano {subscription.plan_name} ativo</p>
            </div>
          )}

          {/* AGENDAMENTO */}
          <div style={{ background: '#fff', border: '0.5px solid #e5e3dd', borderRadius: '16px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: '1.25rem', fontWeight: 400, color: '#1a1a18' }}>
              Agendar horário
            </h2>

            {success && (
              <div style={{ background: '#f0fdf4', border: '0.5px solid #86efac', borderRadius: '12px', padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <p style={{ fontSize: '0.875rem', color: '#16a34a' }}>✓ Agendamento realizado com sucesso!</p>
                <button onClick={() => setSuccess(false)} style={{ background: 'none', border: 'none', fontSize: '0.8rem', color: '#16a34a', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>Novo</button>
              </div>
            )}

            {error && (
              <div style={{ background: '#fef2f2', border: '0.5px solid #fca5a5', borderRadius: '12px', padding: '0.75rem 1rem' }}>
                <p style={{ fontSize: '0.875rem', color: '#dc2626' }}>{error}</p>
              </div>
            )}

            {!success && (
              <>
                {/* BARBEIRO */}
                {barbers.length > 0 && (
                  <div>
                    <label style={{ fontSize: '0.825rem', color: '#6b6b67', display: 'block', marginBottom: '0.75rem' }}>Escolha o barbeiro</label>
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                      {barbers.map(barber => (
                        <div
                          key={barber.id}
                          className={`select-card ${selectedBarber?.id === barber.id ? 'active' : ''}`}
                          onClick={() => { setSelectedBarber(barber); setSelectedDay(null); setSelectedTime(null) }}
                          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', minWidth: '80px' }}
                        >
                          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: selectedBarber?.id === barber.id ? '#2563eb' : '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 500, color: selectedBarber?.id === barber.id ? '#fff' : '#3730a3', transition: 'all .15s' }}>
                            {barber.name.charAt(0).toUpperCase()}
                          </div>
                          <span style={{ fontSize: '0.8rem', fontWeight: selectedBarber?.id === barber.id ? 500 : 400, color: selectedBarber?.id === barber.id ? '#2563eb' : '#1a1a18' }}>
                            {barber.name.split(' ')[0]}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {barbers.length === 0 && (
                  <div style={{ background: '#fffbeb', border: '0.5px solid #fcd34d', borderRadius: '12px', padding: '0.85rem 1rem' }}>
                    <p style={{ fontSize: '0.875rem', color: '#92400e' }}>Nenhum barbeiro cadastrado ainda.</p>
                  </div>
                )}

                {/* SERVIÇO */}
                {selectedBarber && (
                  <div>
                    <label style={{ fontSize: '0.825rem', color: '#6b6b67', display: 'block', marginBottom: '0.75rem' }}>Escolha o serviço</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {services.map(service => (
                        <div
                          key={service.id}
                          className={`select-card ${selectedService?.id === service.id ? 'active' : ''}`}
                          onClick={() => setSelectedService(service)}
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                        >
                          <span style={{ fontSize: '0.875rem', fontWeight: selectedService?.id === service.id ? 500 : 400, color: '#1a1a18' }}>{service.name}</span>
                          <span style={{ fontSize: '0.825rem', color: '#6b6b67' }}>R$ {service.price}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* DATA */}
                {selectedService && availableDays.length > 0 && (
                  <div>
                    <label style={{ fontSize: '0.825rem', color: '#6b6b67', display: 'block', marginBottom: '0.75rem' }}>Escolha a data</label>
                    <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
                      {availableDays.map(day => (
                        <div
                          key={day.dateStr}
                          className={`select-card ${selectedDay?.dateStr === day.dateStr ? 'active' : ''}`}
                          onClick={() => { setSelectedDay(day); setSelectedTime(null) }}
                          style={{ minWidth: '80px', textAlign: 'center', flexShrink: 0 }}
                        >
                          <p style={{ fontSize: '0.75rem', color: selectedDay?.dateStr === day.dateStr ? '#3730a3' : '#9e9c96', marginBottom: '0.2rem', textTransform: 'capitalize' }}>
                            {day.date.toLocaleDateString('pt-BR', { weekday: 'short' })}
                          </p>
                          <p style={{ fontSize: '1rem', fontWeight: 500, color: selectedDay?.dateStr === day.dateStr ? '#2563eb' : '#1a1a18' }}>
                            {day.date.getDate()}
                          </p>
                          <p style={{ fontSize: '0.75rem', color: selectedDay?.dateStr === day.dateStr ? '#3730a3' : '#9e9c96', textTransform: 'capitalize' }}>
                            {day.date.toLocaleDateString('pt-BR', { month: 'short' })}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedService && availableDays.length === 0 && (
                  <div style={{ background: '#fffbeb', border: '0.5px solid #fcd34d', borderRadius: '12px', padding: '0.85rem 1rem' }}>
                    <p style={{ fontSize: '0.875rem', color: '#92400e' }}>Nenhum dia disponível.</p>
                  </div>
                )}

                {/* HORÁRIOS */}
                {selectedDay && (
                  <div>
                    <label style={{ fontSize: '0.825rem', color: '#6b6b67', display: 'block', marginBottom: '0.75rem' }}>
                      Escolha o horário
                      {selectedBarber && <span style={{ color: '#9e9c96', fontWeight: 300 }}> — {selectedBarber.name}</span>}
                    </label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {daySlots.map(slot => {
                        const booked = isSlotBooked(slot)
                        return (
                          <button
                            key={slot}
                            className={`slot-btn ${selectedTime === slot && !booked ? 'active' : ''}`}
                            disabled={booked}
                            onClick={() => setSelectedTime(slot)}
                          >
                            {slot}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* CONFIRMAR */}
                {selectedTime && (
                  <div style={{ borderTop: '0.5px solid #e5e3dd', paddingTop: '1.25rem' }}>
                    <div style={{ background: '#f5f4f0', borderRadius: '12px', padding: '0.85rem 1rem', marginBottom: '1rem' }}>
                      <p style={{ fontSize: '0.825rem', color: '#6b6b67', marginBottom: '0.25rem' }}>Resumo do agendamento</p>
                      <p style={{ fontSize: '0.875rem', fontWeight: 500, color: '#1a1a18' }}>
                        {selectedService?.name} com {selectedBarber?.name}
                      </p>
                      <p style={{ fontSize: '0.825rem', color: '#6b6b67' }}>
                        {selectedDay?.date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })} às {selectedTime}
                      </p>
                    </div>
                    <button
                      onClick={handleScheduling}
                      disabled={saving}
                      style={{ width: '100%', background: '#1a1a18', color: '#fafaf9', border: 'none', padding: '0.85rem', borderRadius: '100px', fontSize: '0.875rem', fontFamily: "'DM Sans', sans-serif", cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.5 : 1 }}
                    >
                      {saving ? 'Agendando...' : 'Confirmar agendamento'}
                    </button>
                  </div>
                )}
              </>
            )}

          </div>

          {/* PLANOS */}
          {!subscription && plans.length > 0 && (
            <div>
              <div style={{ marginBottom: '1.25rem' }}>
                <p style={{ fontSize: '0.78rem', color: '#9e9c96', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Planos disponíveis</p>
                <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: '1.25rem', fontWeight: 400, color: '#1a1a18' }}>
                  Assine e tenha vantagens exclusivas
                </h2>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {plans.map((plan, index) => (
                  <div key={plan.id} className={`plan-card ${index === 1 ? 'featured' : ''}`} onClick={() => setSelectedPlan(plan)}>
                    {index === 1 && (
                      <div style={{ position: 'absolute', top: '-11px', left: '1.25rem', background: '#2563eb', color: '#fff', fontSize: '0.7rem', padding: '0.2rem 0.75rem', borderRadius: '100px' }}>
                        Mais popular
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <p style={{ fontSize: '0.9rem', fontWeight: 500, color: '#1a1a18', marginBottom: '0.2rem' }}>{plan.name}</p>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.2rem' }}>
                          <span style={{ fontFamily: "'Instrument Serif', serif", fontSize: '1.25rem', color: '#1a1a18' }}>R$ {plan.price}</span>
                          <span style={{ fontSize: '0.75rem', color: '#9e9c96' }}>/mês</span>
                        </div>
                      </div>
                      <span style={{ fontSize: '0.825rem', color: '#2563eb' }}>Ver vantagens →</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* MODAL PLANO */}
        {selectedPlan && (
          <div onClick={() => setSelectedPlan(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', zIndex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: '1rem' }}>
            <div onClick={e => e.stopPropagation()} style={{ background: '#fafaf9', borderRadius: '20px', padding: '2rem', width: '100%', maxWidth: '480px', maxHeight: '85vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontSize: '0.75rem', color: '#9e9c96', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Plano</p>
                  <h3 style={{ fontFamily: "'Instrument Serif', serif", fontSize: '1.6rem', fontWeight: 400, color: '#1a1a18' }}>{selectedPlan.name}</h3>
                </div>
                <button onClick={() => setSelectedPlan(null)} style={{ background: '#f5f4f0', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', color: '#6b6b67', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
              </div>

              <div>
                <p style={{ fontSize: '0.78rem', color: '#9e9c96', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Serviços incluídos</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {selectedPlan.plan_services?.length > 0 ? selectedPlan.plan_services.map(svc => (
                    <div key={svc.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', background: '#fff', border: '0.5px solid #e5e3dd', borderRadius: '12px' }}>
                      <span style={{ fontSize: '0.875rem', color: '#1a1a18' }}>{svc.service_name}</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 500, padding: '0.2rem 0.65rem', borderRadius: '100px', background: svc.benefit_type === 'free' ? '#f0fdf4' : '#eef2ff', color: svc.benefit_type === 'free' ? '#16a34a' : '#3730a3', border: svc.benefit_type === 'free' ? '0.5px solid #86efac' : '0.5px solid #c7d2fe' }}>
                        {svc.benefit_type === 'free' ? 'Gratuito' : `${svc.discount_percent}% OFF`}
                      </span>
                    </div>
                  )) : <p style={{ fontSize: '0.875rem', color: '#9e9c96' }}>Nenhum serviço cadastrado.</p>}
                </div>
              </div>

              <div style={{ borderTop: '0.5px solid #e5e3dd', paddingTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <p style={{ fontSize: '0.78rem', color: '#9e9c96', marginBottom: '0.2rem' }}>Valor mensal</p>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.2rem' }}>
                    <span style={{ fontFamily: "'Instrument Serif', serif", fontSize: '2rem', color: '#1a1a18' }}>R$ {selectedPlan.price}</span>
                    <span style={{ fontSize: '0.8rem', color: '#9e9c96' }}>/mês</span>
                  </div>
                </div>
                <button
                  onClick={() => handleSubscribe(selectedPlan)}
                  disabled={savingPlan === selectedPlan.id}
                  style={{ background: '#1a1a18', color: '#fafaf9', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '100px', fontSize: '0.875rem', fontFamily: "'DM Sans', sans-serif", cursor: 'pointer', opacity: savingPlan === selectedPlan.id ? 0.6 : 1 }}
                >
                  {savingPlan === selectedPlan.id ? 'Processando...' : 'Assinar agora'}
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </>
  )
}