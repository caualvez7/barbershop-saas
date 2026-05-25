'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import DashboardLayout from '../../components/DashboardLayout'

export default function BarbersPage() {
  const [barbers, setBarbers] = useState([])
  const [barbershop, setBarbershop] = useState(null)
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: shop } = await supabase
      .from('barbershops').select('*').eq('user_id', user.id).single()

    if (!shop) return
    setBarbershop(shop)

    const { data } = await supabase
      .from('barbers')
      .select('*')
      .eq('barbershop_id', shop.id)
      .eq('active', true)
      .order('created_at', { ascending: true })

    setBarbers(data || [])
    setLoading(false)
  }

  useEffect(() => { loadData() }, [])

  const handleCreate = async () => {
    if (!name.trim()) { alert('Digite o nome do barbeiro.'); return }

    setSaving(true)

    const { error } = await supabase.from('barbers').insert({
      barbershop_id: barbershop.id,
      name: name.trim(),
      active: true,
    })

    if (error) { alert('Erro ao cadastrar barbeiro.'); setSaving(false); return }

    setName('')
    await loadData()
    setSaving(false)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Deseja remover este barbeiro?')) return

    const { error } = await supabase
      .from('barbers')
      .update({ active: false })
      .eq('id', id)

    if (error) { alert('Erro ao remover barbeiro.'); return }
    setBarbers(prev => prev.filter(b => b.id !== id))
  }

  const inputStyle = {
    width: '100%', border: '0.5px solid #e5e3dd', borderRadius: '12px',
    padding: '0.75rem 1rem', fontSize: '0.9rem', fontFamily: "'DM Sans', sans-serif",
    color: '#1a1a18', background: '#fff', outline: 'none', transition: 'border-color .2s',
  }

  if (loading) return (
    <DashboardLayout>
      <p style={{ color: '#6b6b67', fontSize: '0.9rem' }}>Carregando...</p>
    </DashboardLayout>
  )

  return (
    <DashboardLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', maxWidth: '560px' }}>

        <div>
          <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: '1.75rem', fontWeight: 400, letterSpacing: '-0.02em', color: '#1a1a18', marginBottom: '0.25rem' }}>
            Barbeiros
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#6b6b67', fontWeight: 300 }}>
            {barbers.length} barbeiro{barbers.length !== 1 ? 's' : ''} cadastrado{barbers.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* FORMULÁRIO */}
        <div style={{ background: '#fff', border: '0.5px solid #e5e3dd', borderRadius: '16px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.825rem', color: '#6b6b67', display: 'block', marginBottom: '0.4rem' }}>Nome do barbeiro</label>
            <input
              style={inputStyle}
              placeholder="Ex: João Silva"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
              onFocus={e => e.target.style.borderColor = '#2563eb'}
              onBlur={e => e.target.style.borderColor = '#e5e3dd'}
            />
          </div>
          <button
            onClick={handleCreate}
            disabled={saving}
            style={{ background: '#1a1a18', color: '#fafaf9', border: 'none', padding: '0.85rem', borderRadius: '100px', fontSize: '0.875rem', fontFamily: "'DM Sans', sans-serif", cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.5 : 1 }}
          >
            {saving ? 'Cadastrando...' : 'Adicionar barbeiro'}
          </button>
        </div>

        {/* LISTA */}
        {barbers.length === 0 ? (
          <p style={{ fontSize: '0.875rem', color: '#9e9c96' }}>Nenhum barbeiro cadastrado ainda.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {barbers.map(barber => (
              <div key={barber.id} style={{
                background: '#fff', border: '0.5px solid #e5e3dd', borderRadius: '12px',
                padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 500, color: '#3730a3' }}>
                    {barber.name.charAt(0).toUpperCase()}
                  </div>
                  <p style={{ fontSize: '0.9rem', fontWeight: 500, color: '#1a1a18' }}>{barber.name}</p>
                </div>
                <button
                  onClick={() => handleDelete(barber.id)}
                  style={{ fontSize: '0.8rem', color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}
                >
                  Remover
                </button>
              </div>
            ))}
          </div>
        )}

      </div>
    </DashboardLayout>
  )
}