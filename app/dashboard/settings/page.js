'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import DashboardLayout from '../../components/DashboardLayout'

const DAYS = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Segunda-feira' },
  { value: 2, label: 'Terça-feira' },
  { value: 3, label: 'Quarta-feira' },
  { value: 4, label: 'Quinta-feira' },
  { value: 5, label: 'Sexta-feira' },
  { value: 6, label: 'Sábado' },
]

export default function SettingsPage() {
  const [barbershop, setBarbershop] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savingHours, setSavingHours] = useState(false)
  const [successInfo, setSuccessInfo] = useState(false)
  const [successHours, setSuccessHours] = useState(false)

  // campos info
  const [name, setName] = useState('')
  const [ownerName, setOwnerName] = useState('')
  const [phone, setPhone] = useState('')
  const [commercialEmail, setCommercialEmail] = useState('')

  // horários
  const [hours, setHours] = useState(
    DAYS.map(d => ({ day_of_week: d.value, is_open: false, open_time: '09:00', close_time: '19:00' }))
  )

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: shop } = await supabase
      .from('barbershops').select('*').eq('user_id', user.id).single()

    if (!shop) return
    setBarbershop(shop)
    setName(shop.name || '')
    setOwnerName(shop.owner_name || '')
    setPhone(shop.phone || '')
    setCommercialEmail(shop.commercial_email || '')

    const { data: hoursData } = await supabase
      .from('business_hours')
      .select('*')
      .eq('barbershop_id', shop.id)

    if (hoursData && hoursData.length > 0) {
      setHours(DAYS.map(d => {
        const existing = hoursData.find(h => h.day_of_week === d.value)
        return existing
          ? { day_of_week: d.value, is_open: existing.is_open, open_time: existing.open_time, close_time: existing.close_time }
          : { day_of_week: d.value, is_open: false, open_time: '09:00', close_time: '19:00' }
      }))
    }

    setLoading(false)
  }

  useEffect(() => { loadData() }, [])

  const updateHour = (dayValue, field, value) => {
    setHours(prev => prev.map(h =>
      h.day_of_week === dayValue ? { ...h, [field]: value } : h
    ))
  }

  const handleSaveInfo = async () => {
    if (!name.trim() || !ownerName.trim()) { alert('Nome da barbearia e proprietário são obrigatórios.'); return }

    setSaving(true)

    const { error } = await supabase
      .from('barbershops')
      .update({ name, owner_name: ownerName, phone, commercial_email: commercialEmail })
      .eq('id', barbershop.id)

    if (error) { alert('Erro ao salvar informações.'); setSaving(false); return }

    setSuccessInfo(true)
    setTimeout(() => setSuccessInfo(false), 3000)
    setSaving(false)
  }

  const handleSaveHours = async () => {
    setSavingHours(true)

    // upsert — insere ou atualiza cada dia
    const rows = hours.map(h => ({
      barbershop_id: barbershop.id,
      day_of_week: h.day_of_week,
      is_open: h.is_open,
      open_time: h.open_time,
      close_time: h.close_time,
    }))

    const { error } = await supabase
      .from('business_hours')
      .upsert(rows, { onConflict: 'barbershop_id,day_of_week' })

    if (error) { alert('Erro ao salvar horários.'); setSavingHours(false); return }

    setSuccessHours(true)
    setTimeout(() => setSuccessHours(false), 3000)
    setSavingHours(false)
  }

  const inputStyle = {
    width: '100%', border: '0.5px solid #e5e3dd', borderRadius: '12px',
    padding: '0.75rem 1rem', fontSize: '0.9rem', fontFamily: "'DM Sans', sans-serif",
    color: '#1a1a18', background: '#fff', outline: 'none', transition: 'border-color .2s',
  }

  const timeInputStyle = {
    border: '0.5px solid #e5e3dd', borderRadius: '8px',
    padding: '0.4rem 0.6rem', fontSize: '0.825rem', fontFamily: "'DM Sans', sans-serif",
    color: '#1a1a18', background: '#fff', outline: 'none', width: '90px',
  }

  if (loading) return (
    <DashboardLayout>
      <p style={{ color: '#6b6b67', fontSize: '0.9rem' }}>Carregando...</p>
    </DashboardLayout>
  )

  return (
    <DashboardLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '620px' }}>

        <div>
          <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: '1.75rem', fontWeight: 400, letterSpacing: '-0.02em', color: '#1a1a18', marginBottom: '0.25rem' }}>
            Configurações
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#6b6b67', fontWeight: 300 }}>
            Gerencie as informações e funcionamento da sua barbearia.
          </p>
        </div>

        {/* INFORMAÇÕES */}
        <div style={{ background: '#fff', border: '0.5px solid #e5e3dd', borderRadius: '16px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: '1.1rem', fontWeight: 400, color: '#1a1a18' }}>
            Informações da barbearia
          </h2>

          {[
            { label: 'Nome da barbearia', value: name, set: setName, placeholder: 'Ex: Barbearia Master' },
            { label: 'Nome do proprietário', value: ownerName, set: setOwnerName, placeholder: 'Ex: João Silva' },
            { label: 'Telefone', value: phone, set: setPhone, placeholder: '(00) 00000-0000' },
            { label: 'Email comercial', value: commercialEmail, set: setCommercialEmail, placeholder: 'contato@barbearia.com' },
          ].map(field => (
            <div key={field.label}>
              <label style={{ fontSize: '0.825rem', color: '#6b6b67', display: 'block', marginBottom: '0.4rem' }}>{field.label}</label>
              <input
                style={inputStyle}
                placeholder={field.placeholder}
                value={field.value}
                onChange={e => field.set(e.target.value)}
                onFocus={e => e.target.style.borderColor = '#2563eb'}
                onBlur={e => e.target.style.borderColor = '#e5e3dd'}
              />
            </div>
          ))}

          {successInfo && (
            <div style={{ background: '#f0fdf4', border: '0.5px solid #86efac', borderRadius: '10px', padding: '0.65rem 1rem' }}>
              <p style={{ fontSize: '0.825rem', color: '#16a34a' }}>✓ Informações salvas com sucesso.</p>
            </div>
          )}

          <button
            onClick={handleSaveInfo}
            disabled={saving}
            style={{ background: '#1a1a18', color: '#fafaf9', border: 'none', padding: '0.85rem', borderRadius: '100px', fontSize: '0.875rem', fontFamily: "'DM Sans', sans-serif", cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.5 : 1 }}
          >
            {saving ? 'Salvando...' : 'Salvar informações'}
          </button>

        </div>

        {/* HORÁRIOS */}
        <div style={{ background: '#fff', border: '0.5px solid #e5e3dd', borderRadius: '16px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          <div>
            <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: '1.1rem', fontWeight: 400, color: '#1a1a18', marginBottom: '0.25rem' }}>
              Horário de funcionamento
            </h2>
            <p style={{ fontSize: '0.825rem', color: '#6b6b67', fontWeight: 300 }}>
              Ative os dias e defina o horário de abertura e fechamento.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {DAYS.map(day => {
              const h = hours.find(x => x.day_of_week === day.value)
              return (
                <div key={day.value} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '0.75rem 1rem', borderRadius: '12px', flexWrap: 'wrap', gap: '0.75rem',
                  border: h.is_open ? '0.5px solid #2563eb' : '0.5px solid #e5e3dd',
                  background: h.is_open ? '#eef2ff' : '#fff',
                  transition: 'all .15s',
                }}>

                  {/* TOGGLE + NOME */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: '140px' }}>
                    <div
                      onClick={() => updateHour(day.value, 'is_open', !h.is_open)}
                      style={{
                        width: '36px', height: '20px', borderRadius: '100px', cursor: 'pointer',
                        background: h.is_open ? '#2563eb' : '#e5e3dd',
                        position: 'relative', transition: 'background .2s', flexShrink: 0,
                      }}
                    >
                      <div style={{
                        width: '14px', height: '14px', borderRadius: '50%', background: '#fff',
                        position: 'absolute', top: '3px', transition: 'left .2s',
                        left: h.is_open ? '19px' : '3px',
                      }} />
                    </div>
                    <span style={{ fontSize: '0.875rem', color: '#1a1a18', fontWeight: h.is_open ? 500 : 400 }}>
                      {day.label}
                    </span>
                  </div>

                  {/* HORÁRIOS */}
                  {h.is_open ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input
                        type="time"
                        value={h.open_time}
                        onChange={e => updateHour(day.value, 'open_time', e.target.value)}
                        style={timeInputStyle}
                      />
                      <span style={{ fontSize: '0.8rem', color: '#9e9c96' }}>até</span>
                      <input
                        type="time"
                        value={h.close_time}
                        onChange={e => updateHour(day.value, 'close_time', e.target.value)}
                        style={timeInputStyle}
                      />
                    </div>
                  ) : (
                    <span style={{ fontSize: '0.8rem', color: '#9e9c96' }}>Fechado</span>
                  )}

                </div>
              )
            })}
          </div>

          {successHours && (
            <div style={{ background: '#f0fdf4', border: '0.5px solid #86efac', borderRadius: '10px', padding: '0.65rem 1rem' }}>
              <p style={{ fontSize: '0.825rem', color: '#16a34a' }}>✓ Horários salvos com sucesso.</p>
            </div>
          )}

          <button
            onClick={handleSaveHours}
            disabled={savingHours}
            style={{ background: '#1a1a18', color: '#fafaf9', border: 'none', padding: '0.85rem', borderRadius: '100px', fontSize: '0.875rem', fontFamily: "'DM Sans', sans-serif", cursor: savingHours ? 'not-allowed' : 'pointer', opacity: savingHours ? 0.5 : 1 }}
          >
            {savingHours ? 'Salvando...' : 'Salvar horários'}
          </button>

        </div>

      </div>
    </DashboardLayout>
  )
}