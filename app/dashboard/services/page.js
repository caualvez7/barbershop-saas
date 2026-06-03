'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase.js'
import DashboardLayout from '../../components/DashboardLayout.jsx'
import Link from 'next/link'

export default function ServicesPage() {
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [duration, setDuration] = useState('')
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [barbershop, setBarbershop] = useState(null)

  const loadData = async () => {
    await supabase.auth.refreshSession()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: shop } = await supabase.from('barbershops').select('*').eq('user_id', user.id).single()
    if (!shop) return

    setBarbershop(shop)

  const { data, error } = await supabase.from('services').select('*').eq('barbershop_id', shop.id)
    if (!error) setServices(data || [])
    setLoading(false)
  }

  useEffect(() => { loadData() }, [])

  const handleCreate = async () => {
    if (!name.trim() || !price || !duration) { alert('Preencha todos os campos.'); return }
    if (barbershop.plan === 'basic' && services.length >= 3) { alert('Plano básico permite até 3 serviços.'); return }

    setSaving(true)
    const { error } = await supabase.from('services').insert({ name, price, duration, barbershop_id: barbershop.id, user_id: barbershop.user_id })
    if (error) { alert(error.message); setSaving(false); return }

    setName(''); setPrice(''); setDuration('')
    await loadData()
    setSaving(false)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Deseja excluir este serviço?')) return
    const { error } = await supabase.from('services').delete().eq('id', id)
    if (error) { alert('Erro ao excluir serviço.'); return }
    setServices(prev => prev.filter(s => s.id !== id))
  }

  const atLimit = barbershop?.plan === 'basic' && services.length >= 3

  if (loading) return <DashboardLayout><p style={{ color: '#6b6b67', fontSize: '0.9rem' }}>Carregando...</p></DashboardLayout>

  return (
    <DashboardLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', maxWidth: '600px' }}>

        {/* TOPO */}
        <div>
          <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: '1.75rem', fontWeight: 400, letterSpacing: '-0.02em', color: '#1a1a18', marginBottom: '0.25rem' }}>
            Serviços
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#6b6b67', fontWeight: 300 }}>
            {services.length} / {barbershop?.plan === 'basic' ? 3 : '∞'} serviços cadastrados
          </p>
        </div>

        {/* FORMULÁRIO */}
        <div style={{ background: '#fff', border: '0.5px solid #e5e3dd', borderRadius: '16px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {[
            { label: 'Nome do serviço', placeholder: 'Ex: Corte degradê', value: name, set: setName, type: 'text' },
            { label: 'Preço (R$)', placeholder: 'Ex: 35', value: price, set: setPrice, type: 'number' },
            { label: 'Duração (minutos)', placeholder: 'Ex: 30', value: duration, set: setDuration, type: 'number' },
          ].map(field => (
            <div key={field.label}>
              <label style={{ fontSize: '0.825rem', color: '#6b6b67', display: 'block', marginBottom: '0.4rem' }}>{field.label}</label>
              <input
                type={field.type}
                placeholder={field.placeholder}
                value={field.value}
                onChange={e => field.set(e.target.value)}
                style={{ width: '100%', border: '0.5px solid #e5e3dd', borderRadius: '12px', padding: '0.75rem 1rem', fontSize: '0.9rem', fontFamily: "'DM Sans', sans-serif", color: '#1a1a18', background: '#fff', outline: 'none' }}
                onFocus={e => e.target.style.borderColor = '#2563eb'}
                onBlur={e => e.target.style.borderColor = '#e5e3dd'}
              />
            </div>
          ))}

          {atLimit ? (
            <div style={{ background: '#fffbeb', border: '0.5px solid #fcd34d', borderRadius: '12px', padding: '0.85rem 1rem' }}>
              <p style={{ fontSize: '0.875rem', color: '#92400e', marginBottom: '0.25rem' }}>Você atingiu o limite do plano básico.</p>
              <Link href="/#plans" style={{ fontSize: '0.825rem', color: '#2563eb', textDecoration: 'none' }}>Fazer upgrade de plano →</Link>
            </div>
          ) : (
            <button
              onClick={handleCreate}
              disabled={saving}
              style={{ background: '#1a1a18', color: '#fafaf9', border: 'none', padding: '0.85rem', borderRadius: '100px', fontSize: '0.875rem', fontFamily: "'DM Sans', sans-serif", cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.5 : 1, transition: 'opacity .2s' }}
            >
              {saving ? 'Salvando...' : 'Adicionar serviço'}
            </button>
          )}

        </div>

        {/* LISTA */}
        {services.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {services.map(service => (
              <div key={service.id} style={{
                background: '#fff', border: '0.5px solid #e5e3dd', borderRadius: '12px',
                padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <div>
                  <p style={{ fontSize: '0.9rem', fontWeight: 500, color: '#1a1a18', marginBottom: '0.2rem' }}>{service.name}</p>
                  <p style={{ fontSize: '0.8rem', color: '#6b6b67', fontWeight: 300 }}>R$ {service.price} · {service.duration} min</p>
                </div>
                <button
                  onClick={() => handleDelete(service.id)}
                  style={{ fontSize: '0.8rem', color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}
                >
                  Excluir
                </button>
              </div>
            ))}
          </div>
        )}

      </div>
    </DashboardLayout>
  )
}