'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import DashboardLayout from '../components/DashboardLayout.jsx'
import Link from 'next/link'

export default function Dashboard() {
  const [barbershop, setBarbershop] = useState(null)
  const [loading, setLoading] = useState(true)
  const [appointments, setAppointments] = useState([])

  const updateAppointmentStatus = async (id, status) => {
    const { error } = await supabase.from('appointments').update({ status }).eq('id', id)
    if (error) { alert('Erro ao atualizar agendamento.'); return }
    setAppointments(prev => prev.filter(item => item.id !== id))
  }

  useEffect(() => {
    const loadData = async () => {
      await supabase.auth.refreshSession()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      const { data: shopData, error } = await supabase
        .from('barbershops').select('*').eq('user_id', user.id).single()

      if (error || !shopData) { setLoading(false); return }
      setBarbershop(shopData)

      const { data: apptData } = await supabase
        .from('appointments')
        .select('*, services(name), barbers(name)')
        .eq('barbershop_id', shopData.id)
        .eq('status', 'Pendente')
        .order('date', { ascending: true })

      setAppointments(apptData || [])
      setLoading(false)
    }
    loadData()
  }, [])

  if (loading) return <DashboardLayout><p style={{ color: '#6b6b67', fontSize: '0.9rem' }}>Carregando...</p></DashboardLayout>

  return (
    <DashboardLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', maxWidth: '900px' }}>

        {/* TOPO */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: '1.75rem', fontWeight: 400, letterSpacing: '-0.02em', color: '#1a1a18', marginBottom: '0.25rem' }}>
              {barbershop?.name}
            </h1>
            <p style={{ fontSize: '0.875rem', color: '#6b6b67', fontWeight: 300 }}>Bem-vindo ao painel da sua barbearia.</p>
          </div>
          <Link href={`/barber/${barbershop?.slug}`} style={{
            background: '#1a1a18', color: '#fafaf9', textDecoration: 'none',
            padding: '0.55rem 1.1rem', borderRadius: '100px', fontSize: '0.875rem',
            fontFamily: "'DM Sans', sans-serif",
          }}>
            Ver minha página
          </Link>
        </div>

        {/* ALERTA PLANO BASIC */}
        {barbershop?.plan === 'basic' && (
          <div style={{ background: '#fffbeb', border: '0.5px solid #fcd34d', borderRadius: '12px', padding: '0.85rem 1rem' }}>
            <p style={{ fontSize: '0.875rem', color: '#92400e' }}>
              Seu plano atual permite até 3 serviços cadastrados.{' '}
              <Link href="/#plans" style={{ color: '#2563eb', textDecoration: 'none' }}>Fazer upgrade</Link>
            </p>
          </div>
        )}

        {/* CARDS DE RESUMO */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
          {[
            { label: 'Plano atual', value: barbershop?.plan, capitalize: true },
            { label: 'Agendamentos pendentes', value: appointments.length },
            { label: 'Página pública', value: `/barber/${barbershop?.slug}`, small: true, blue: true },
          ].map((card, i) => (
            <div key={i} style={{ background: '#fff', border: '0.5px solid #e5e3dd', borderRadius: '16px', padding: '1.25rem' }}>
              <p style={{ fontSize: '0.78rem', color: '#9e9c96', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{card.label}</p>
              <p style={{
                fontSize: card.small ? '0.8rem' : '1.5rem',
                fontWeight: card.small ? 400 : 500,
                color: card.blue ? '#2563eb' : '#1a1a18',
                textTransform: card.capitalize ? 'capitalize' : 'none',
                wordBreak: 'break-all',
              }}>
                {card.value}
              </p>
            </div>
          ))}
        </div>

        {/* AÇÕES RÁPIDAS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
          {[
            { href: '/dashboard/services', title: 'Serviços', desc: 'Gerencie os serviços da sua barbearia.' },
            { href: '/dashboard/appointments', title: 'Agendamentos', desc: 'Veja os atendimentos concluídos hoje.' },
            { href: '/dashboard/plans', title: 'Planos', desc: 'Gerencie os planos de assinatura.' },
            { href: '/dashboard/barbers', title: 'Barbeiros', desc: 'Gerencie os barbeiros da sua barbearia.' },
            { href: '/dashboard/settings', title: 'Configurações', desc: 'Personalize sua barbearia.' },
          ].map(item => (
            <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
              <div style={{ background: '#fff', border: '0.5px solid #e5e3dd', borderRadius: '16px', padding: '1.25rem', cursor: 'pointer', transition: 'border-color .2s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#1a1a18'}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#e5e3dd'}
              >
                <p style={{ fontSize: '0.95rem', fontWeight: 500, color: '#1a1a18', marginBottom: '0.35rem' }}>{item.title}</p>
                <p style={{ fontSize: '0.825rem', color: '#6b6b67', fontWeight: 300 }}>{item.desc}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* AGENDAMENTOS PENDENTES */}
        <div style={{ background: '#fff', border: '0.5px solid #e5e3dd', borderRadius: '16px', padding: '1.5rem' }}>
          <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: '1.25rem', fontWeight: 400, color: '#1a1a18', marginBottom: '1.25rem' }}>
            Agendamentos pendentes
          </h2>

          {appointments.length === 0 ? (
            <p style={{ fontSize: '0.875rem', color: '#9e9c96' }}>Nenhum agendamento pendente.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {appointments.map(item => (
                <div key={item.id} style={{
                  border: '0.5px solid #e5e3dd', borderRadius: '12px', padding: '1rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem',
                }}>
                  <div>
                    <p style={{ fontSize: '0.9rem', fontWeight: 500, color: '#1a1a18', marginBottom: '0.2rem' }}>{item.customer_name}</p>
                    <p style={{ fontSize: '0.8rem', color: '#6b6b67', fontWeight: 300 }}>{item.services?.name}{item.barbers?.name ? ` com ${item.barbers.name}` : ''} · {item.date} às {item.time}</p>  
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', background: '#eef2ff', color: '#3730a3', padding: '0.25rem 0.75rem', borderRadius: '100px' }}>
                      Pendente
                    </span>
                    <button
                      onClick={() => updateAppointmentStatus(item.id, 'Concluído')}
                      style={{ fontSize: '0.8rem', color: '#16a34a', background: '#f0fdf4', border: '0.5px solid #86efac', padding: '0.3rem 0.75rem', borderRadius: '100px', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}
                    >
                      Concluir
                    </button>
                    <button
                      onClick={() => updateAppointmentStatus(item.id, 'Cancelado')}
                      style={{ fontSize: '0.8rem', color: '#dc2626', background: '#fef2f2', border: '0.5px solid #fca5a5', padding: '0.3rem 0.75rem', borderRadius: '100px', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </DashboardLayout>
  )
}