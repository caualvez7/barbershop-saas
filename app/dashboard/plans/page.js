'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import DashboardLayout from '../../components/DashboardLayout'

const inputStyle = {
  width: '100%', border: '0.5px solid #e5e3dd', borderRadius: '12px',
  padding: '0.75rem 1rem', fontSize: '0.9rem', fontFamily: "'DM Sans', sans-serif",
  color: '#1a1a18', background: '#fff', outline: 'none', transition: 'border-color .2s',
}

export default function PlansPage() {
  const [plans, setPlans] = useState([])
  const [shop, setShop] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // form
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [selectedServices, setSelectedServices] = useState({})
  const [availableServices, setAvailableServices] = useState([])
  // { 'Corte de Cabelo': { benefit_type: 'free' | 'discount', discount_percent: '' } }

  const loadData = async () => {
    await supabase.auth.refreshSession()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: shopData } = await supabase
      .from('barbershops').select('*').eq('user_id', user.id).single()

    setShop(shopData)

    const { data: servicesData } = await supabase
      .from('services')
      .select('*')
      .eq('barbershop_id', shopData.id)

    setAvailableServices(servicesData || [])

    const { data: plansData } = await supabase
      .from('plans')
      .select('*, plan_services(*)')
      .eq('barbershop_id', shopData.id)
      .order('created_at', { ascending: false })

    setPlans(plansData || [])
    setLoading(false)
  }

  useEffect(() => { loadData() }, [])

  // toggle serviço selecionado
    const toggleService = (serviceId, serviceName) => {
      setSelectedServices(prev => {
        if (prev[serviceId]) {
          const updated = { ...prev }
          delete updated[serviceId]
          return updated
        }
        return { ...prev, [serviceId]: { name: serviceName, benefit_type: 'free', discount_percent: '' } }
      })
    }

  // atualiza benefit_type ou discount_percent de um serviço
    const updateServiceBenefit = (serviceId, field, value) => {
      setSelectedServices(prev => ({
        ...prev,
        [serviceId]: {
          ...prev[serviceId],
          [field]: value,
          ...(field === 'benefit_type' && value === 'free' ? { discount_percent: '' } : {}),
        }
      }))
    }

  const handleCreate = async () => {
    if (!name.trim() || !price) {
      alert('Preencha o nome e o preço do plano.')
      return
    }

    if (Object.keys(selectedServices).length === 0) {
      alert('Selecione pelo menos um serviço para o plano.')
      return
    }

    // valida discounts
    for (const [svcName, svc] of Object.entries(selectedServices)) {
      if (svc.benefit_type === 'discount') {
        const pct = Number(svc.discount_percent)
        if (!pct || pct < 1 || pct > 99) {
          alert(`Informe um desconto válido (1–99%) para "${svcName}".`)
          return
        }
      }
    }

    setSaving(true)

    // cria plano
    const { data: planData, error: planError } = await supabase
      .from('plans')
      .insert({ barbershop_id: shop.id, name, price, active: true })
      .select()
      .single()

    if (planError) { alert('Erro ao criar plano.'); setSaving(false); return }

    // insere serviços do plano
    const planServicesRows = Object.entries(selectedServices).map(([svcId, svc]) => ({
      plan_id: planData.id,
      service_name: svc.name,
      benefit_type: svc.benefit_type,
      discount_percent: svc.benefit_type === 'discount' ? Number(svc.discount_percent) : null,
    }))

    const { error: svcError } = await supabase.from('plan_services').insert(planServicesRows)
    if (svcError) { alert('Erro ao salvar serviços do plano.'); setSaving(false); return }

    setName('')
    setPrice('')
    setSelectedServices({})
    await loadData()
    setSaving(false)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Deseja excluir este plano?')) return
    await supabase.from('plans').delete().eq('id', id)
    setPlans(prev => prev.filter(p => p.id !== id))
  }

  if (loading) return (
    <DashboardLayout>
      <p style={{ color: '#6b6b67', fontSize: '0.9rem' }}>Carregando...</p>
    </DashboardLayout>
  )

  return (
    <DashboardLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', maxWidth: '720px' }}>

        {/* TOPO */}
        <div>
          <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: '1.75rem', fontWeight: 400, letterSpacing: '-0.02em', color: '#1a1a18', marginBottom: '0.25rem' }}>
            Planos
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#6b6b67', fontWeight: 300 }}>
            Crie planos de assinatura com benefícios por serviço.
          </p>
        </div>

        {/* FORMULÁRIO */}
        <div style={{ background: '#fff', border: '0.5px solid #e5e3dd', borderRadius: '16px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* NOME */}
          <div>
            <label style={{ fontSize: '0.825rem', color: '#6b6b67', display: 'block', marginBottom: '0.4rem' }}>Nome do plano</label>
            <input
              style={inputStyle} placeholder="Ex: Plano Completo"
              value={name} onChange={e => setName(e.target.value)}
              onFocus={e => e.target.style.borderColor = '#2563eb'}
              onBlur={e => e.target.style.borderColor = '#e5e3dd'}
            />
          </div>

          {/* SERVIÇOS */}
          <div>
            <label style={{ fontSize: '0.825rem', color: '#6b6b67', display: 'block', marginBottom: '0.75rem' }}>
              Serviços incluídos no plano
            </label>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {availableServices.map(service => {
                const isSelected = !!selectedServices[service.id]
                const svc = selectedServices[service.id]

                return (
                  <div key={service.id}>

                    {/* LINHA DO SERVIÇO */}
                    <div
                      onClick={() => toggleService(service.id, service.name)}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '0.75rem 1rem', borderRadius: '12px', cursor: 'pointer',
                        border: isSelected ? '0.5px solid #2563eb' : '0.5px solid #e5e3dd',
                        background: isSelected ? '#eef2ff' : '#fff',
                        transition: 'all .15s',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <div style={{
                          width: '18px', height: '18px', borderRadius: '5px',
                          border: isSelected ? 'none' : '0.5px solid #c8c6bf',
                          background: isSelected ? '#2563eb' : '#fff',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0,
                        }}>
                          {isSelected && <span style={{ color: '#fff', fontSize: '0.7rem', lineHeight: 1 }}>✓</span>}
                        </div>
                        <span style={{ fontSize: '0.875rem', color: '#1a1a18', fontWeight: isSelected ? 500 : 400 }}>
                          {service.name}
                        </span>
                      </div>

                      {isSelected && (
                        <span style={{ fontSize: '0.75rem', color: '#2563eb', fontWeight: 500 }}>
                          {svc.benefit_type === 'free' ? 'Gratuito' : svc.discount_percent ? `${svc.discount_percent}% OFF` : 'Desconto'}
                        </span>
                      )}
                    </div>

                    {/* PAINEL DE BENEFÍCIO — aparece ao selecionar */}
                    {isSelected && (
                      <div
                        onClick={e => e.stopPropagation()}
                        style={{
                          margin: '0.25rem 0 0.25rem 2rem',
                          padding: '0.75rem 1rem',
                          background: '#f5f4f0',
                          borderRadius: '10px',
                          display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap',
                        }}
                      >
                        {/* TOGGLE GRATUITO / DESCONTO */}
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          {['free', 'discount'].map(type => (
                            <button
                              key={type}
                              onClick={() => updateServiceBenefit(service.id, 'benefit_type', type)}
                              style={{
                                padding: '0.3rem 0.75rem', borderRadius: '100px', fontSize: '0.8rem',
                                fontFamily: "'DM Sans', sans-serif", cursor: 'pointer', border: 'none',
                                background: svc.benefit_type === type ? '#1a1a18' : '#e5e3dd',
                                color: svc.benefit_type === type ? '#fafaf9' : '#6b6b67',
                                transition: 'all .15s',
                              }}
                            >
                              {type === 'free' ? 'Gratuito' : 'Desconto'}
                            </button>
                          ))}
                        </div>

                        {/* CAMPO % — só aparece se desconto */}
                        {svc.benefit_type === 'discount' && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <input
                              type="number"
                              placeholder="0"
                              min="1"
                              max="99"
                              value={svc.discount_percent}
                              onChange={e => updateServiceBenefit(service.id, 'discount_percent', e.target.value)}
                              style={{
                                width: '64px', border: '0.5px solid #e5e3dd', borderRadius: '8px',
                                padding: '0.35rem 0.5rem', fontSize: '0.875rem', fontFamily: "'DM Sans', sans-serif",
                                color: '#1a1a18', background: '#fff', outline: 'none', textAlign: 'center',
                              }}
                              onFocus={e => e.target.style.borderColor = '#2563eb'}
                              onBlur={e => e.target.style.borderColor = '#e5e3dd'}
                            />
                            <span style={{ fontSize: '0.825rem', color: '#6b6b67' }}>% OFF</span>
                          </div>
                        )}
                      </div>
                    )}

                  </div>
                )
              })}
            </div>
          </div>

          {/* PREÇO */}
          <div>
            <label style={{ fontSize: '0.825rem', color: '#6b6b67', display: 'block', marginBottom: '0.4rem' }}>Preço mensal (R$)</label>
            <input
              type="number" style={inputStyle} placeholder="Ex: 89.90"
              value={price} onChange={e => setPrice(e.target.value)}
              onFocus={e => e.target.style.borderColor = '#2563eb'}
              onBlur={e => e.target.style.borderColor = '#e5e3dd'}
            />
          </div>

          <button
            onClick={handleCreate}
            disabled={saving}
            style={{
              background: '#1a1a18', color: '#fafaf9', border: 'none', padding: '0.85rem',
              borderRadius: '100px', fontSize: '0.875rem', fontFamily: "'DM Sans', sans-serif",
              cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.5 : 1,
            }}
          >
            {saving ? 'Criando plano...' : 'Criar plano'}
          </button>

        </div>

        {/* LISTA DE PLANOS */}
        {plans.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {plans.map((plan, index) => (
              <div key={plan.id} style={{
                background: '#fff', border: index === 0 ? '1.5px solid #2563eb' : '0.5px solid #e5e3dd',
                borderRadius: '16px', padding: '1.5rem', position: 'relative',
              }}>

                {/* CABEÇALHO */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div>
                    <p style={{ fontSize: '1rem', fontWeight: 500, color: '#1a1a18', marginBottom: '0.25rem' }}>{plan.name}</p>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
                      <span style={{ fontFamily: "'Instrument Serif', serif", fontSize: '1.75rem', color: '#1a1a18' }}>
                        R$ {plan.price}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: '#9e9c96' }}>/mês</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(plan.id)}
                    style={{ fontSize: '0.8rem', color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}
                  >
                    Excluir
                  </button>
                </div>

                {/* SERVIÇOS DO PLANO */}
                {plan.plan_services?.length > 0 && (
                  <div style={{ borderTop: '0.5px solid #e5e3dd', paddingTop: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {plan.plan_services.map(svc => (
                      <span key={svc.id} style={{
                        fontSize: '0.78rem', padding: '0.25rem 0.75rem', borderRadius: '100px', fontWeight: 500,
                        background: svc.benefit_type === 'free' ? '#f0fdf4' : '#eef2ff',
                        color: svc.benefit_type === 'free' ? '#16a34a' : '#3730a3',
                        border: svc.benefit_type === 'free' ? '0.5px solid #86efac' : '0.5px solid #c7d2fe',
                      }}>
                        {svc.service_name} — {svc.benefit_type === 'free' ? 'Gratuito' : `${svc.discount_percent}% OFF`}
                      </span>
                    ))}
                  </div>
                )}

              </div>
            ))}
          </div>
        )}

        {plans.length === 0 && (
          <p style={{ fontSize: '0.875rem', color: '#9e9c96' }}>Nenhum plano criado ainda.</p>
        )}

      </div>
    </DashboardLayout>
  )
}