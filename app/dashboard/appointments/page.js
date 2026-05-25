'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import DashboardLayout from '../../components/DashboardLayout.jsx'

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [today, setToday] = useState('')

  useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: shop } = await supabase.from('barbershops').select('*').eq('user_id', user.id).single()
      if (!shop) return

      const todayDate = new Date().toISOString().split('T')[0]
      setToday(todayDate)

      const { data, error } = await supabase
        .from('appointments')
        .select('*, services(name, price)')
        .eq('barbershop_id', shop.id)
        .eq('status', 'Concluído')
        .eq('date', todayDate)
        .order('time', { ascending: true })

      if (!error) setAppointments(data || [])
      setLoading(false)
    }
    loadData()
  }, [])

  const formatDate = (dateStr) => {
    const [year, month, day] = dateStr.split('-')
    return new Date(year, month - 1, day).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  const totalFaturamento = appointments.reduce((acc, item) => acc + Number(item.services?.price || 0), 0)

  if (loading) return <DashboardLayout><p style={{ color: '#6b6b67', fontSize: '0.9rem' }}>Carregando...</p></DashboardLayout>

  return (
    <DashboardLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', maxWidth: '800px' }}>

        {/* TOPO */}
        <div>
          <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: '1.75rem', fontWeight: 400, letterSpacing: '-0.02em', color: '#1a1a18', marginBottom: '0.25rem' }}>
            Agendamentos concluídos
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#6b6b67', fontWeight: 300 }}>
            {today ? formatDate(today) : ''}
          </p>
        </div>

        {/* RESUMO */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
          {[
            { label: 'Atendimentos hoje', value: appointments.length },
            { label: 'Faturamento do dia', value: `R$ ${totalFaturamento.toFixed(2)}` },
          ].map((card, i) => (
            <div key={i} style={{ background: '#fff', border: '0.5px solid #e5e3dd', borderRadius: '16px', padding: '1.25rem' }}>
              <p style={{ fontSize: '0.78rem', color: '#9e9c96', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{card.label}</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 500, color: '#1a1a18' }}>{card.value}</p>
            </div>
          ))}
        </div>

        {/* LISTA */}
        <div style={{ background: '#fff', border: '0.5px solid #e5e3dd', borderRadius: '16px', padding: '1.5rem' }}>
          <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: '1.25rem', fontWeight: 400, color: '#1a1a18', marginBottom: '1.25rem' }}>
            Histórico do dia
          </h2>

          {appointments.length === 0 ? (
            <p style={{ fontSize: '0.875rem', color: '#9e9c96' }}>Nenhum atendimento concluído hoje.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {appointments.map(item => (
                <div key={item.id} style={{
                  border: '0.5px solid #e5e3dd', borderRadius: '12px', padding: '1rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem',
                }}>
                  <div>
                    <p style={{ fontSize: '0.9rem', fontWeight: 500, color: '#1a1a18', marginBottom: '0.2rem' }}>{item.customer_name}</p>
                    <p style={{ fontSize: '0.8rem', color: '#6b6b67', fontWeight: 300 }}>{item.services?.name} · {item.time}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '0.75rem', background: '#f0fdf4', color: '#16a34a', padding: '0.25rem 0.75rem', borderRadius: '100px', border: '0.5px solid #86efac' }}>
                      Concluído
                    </span>
                    <span style={{ fontSize: '0.9rem', fontWeight: 500, color: '#1a1a18' }}>
                      R$ {Number(item.services?.price || 0).toFixed(2)}
                    </span>
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