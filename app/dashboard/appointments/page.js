'use client'

import { useEffect, useState, useRef } from 'react'
import { supabaseBarber as supabase } from '../../../lib/supabase-barber'
import { useRouter } from 'next/navigation'
import DashboardLayout, { useTheme, useDashboard } from '../../components/DashboardLayout.jsx'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, DollarSign, Clock, CheckCircle2, User, Search, Filter } from 'lucide-react'

export default function AppointmentsPage() {
  const router = useRouter()
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const { barbershop, loading: layoutLoading } = useDashboard()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [today, setToday] = useState('')
  const [activeTab, setActiveTab] = useState('Todos')
  const [searchQuery, setSearchQuery] = useState('')

  const isMountedRef = useRef(true)
  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  useEffect(() => {
    if (layoutLoading) return
    if (!barbershop) {
      if (isMountedRef.current) setLoading(false)
      const timer = setTimeout(() => {
        if (isMountedRef.current) router.push('/login')
      }, 3000)
      return () => clearTimeout(timer)
    }

    const loadData = async () => {
      try {
        setLoading(true)
        const todayDate = new Date().toISOString().split('T')[0]
        if (isMountedRef.current) setToday(todayDate)

        // Buscar todos os agendamentos do dia atual para ter uma visão completa
        const { data, error } = await supabase
          .from('appointments')
          .select('*, services(name, price)')
          .eq('barbershop_id', barbershop.id)
          .eq('date', todayDate)
          .order('time', { ascending: true })

        if (!isMountedRef.current) return

        if (!error) setAppointments(data || [])
      } catch (err) {
        console.error('Erro ao carregar agendamentos:', err)
      } finally {
        if (isMountedRef.current) {
          setLoading(false)
        }
      }
    }
    loadData()
  }, [barbershop, layoutLoading, router])

  const formatDate = (dateStr) => {
    const [year, month, day] = dateStr.split('-')
    return new Date(year, month - 1, day).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  // Filtragem
  const filteredAppointments = appointments.filter(item => {
    const matchesSearch = item.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (item.services?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
    
    if (activeTab === 'Todos') return matchesSearch
    return matchesSearch && item.status === activeTab
  })

  // Estatísticas
  const totalAtendimentos = appointments.length
  const concluidosCount = appointments.filter(item => item.status === 'Concluído').length
  const faturamentoHoje = appointments
    .filter(item => item.status === 'Concluído' || item.status === 'Confirmado')
    .reduce((acc, item) => acc + Number(item.services?.price || 0), 0)

  const styles = {
    card: isDark 
      ? 'border-zinc-900 bg-[#0c0c0e]/50 backdrop-blur-xl shadow-xl' 
      : 'border-zinc-200/80 bg-white shadow-md',
    row: isDark 
      ? 'bg-[#09090b]/40 border-zinc-900/60 hover:bg-zinc-900/30' 
      : 'bg-white border-zinc-200/80 hover:bg-zinc-50 shadow-sm',
    tabActive: 'bg-amber-500/10 border-amber-500/20 text-amber-500 font-bold',
    tabInactive: isDark ? 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/30' : 'text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100/60',
    input: isDark 
      ? 'bg-zinc-900/30 border-zinc-900 focus:border-zinc-800 text-zinc-200 placeholder-zinc-500' 
      : 'bg-white border-zinc-200 focus:border-zinc-300 text-zinc-900 placeholder-zinc-400 shadow-sm'
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col gap-6 max-w-4xl mx-auto">
          <div className="h-10 w-64 bg-zinc-900/60 animate-pulse rounded-lg" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-28 bg-[#0c0c0e]/40 border border-zinc-900 rounded-2xl animate-pulse" />
            ))}
          </div>
          <div className="h-72 bg-[#0c0c0e]/40 border border-zinc-900 rounded-2xl animate-pulse" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 max-w-4xl mx-auto pb-10">
        
        {/* TOPO */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className={`text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-zinc-900'}`}>
              Agendamentos do Dia
            </h1>
            <p className="text-zinc-500 text-xs mt-0.5">
              {today ? formatDate(today) : ''}
            </p>
          </div>
        </div>

        {/* ESTATÍSTICAS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Atendimentos hoje', value: totalAtendimentos, icon: Calendar, color: 'text-amber-500' },
            { label: 'Concluídos hoje', value: concluidosCount, icon: CheckCircle2, color: 'text-emerald-500' },
            { label: 'Faturamento do dia', value: `R$ ${faturamentoHoje.toFixed(2)}`, icon: DollarSign, color: 'text-yellow-500' },
          ].map((card, i) => {
            const Icon = card.icon
            return (
              <div key={i} className={`p-5 rounded-2xl border flex items-center justify-between transition-all duration-300 ${styles.card}`}>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">{card.label}</p>
                  <p className={`text-xl font-bold mt-1.5 ${isDark ? 'text-white' : 'text-zinc-900'}`}>{card.value}</p>
                </div>
                <div className={`p-2.5 rounded-xl ${isDark ? 'bg-zinc-950/60 border border-zinc-900' : 'bg-zinc-50 border border-zinc-100 shadow-sm'}`}>
                  <Icon size={18} className={card.color} />
                </div>
              </div>
            )
          })}
        </div>

        {/* CONTROLES E BUSCA */}
        <div className={`p-4 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${styles.card}`}>
          {/* Tabs Filtro */}
          <div className="flex flex-wrap gap-1.5">
            {['Todos', 'Pendente', 'Confirmado', 'Concluído', 'Cancelado'].map(tab => {
              const isActive = activeTab === tab
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`text-xs px-3 py-1.5 rounded-xl border transition-all ${
                    isActive ? styles.tabActive : styles.tabInactive + ' border-transparent'
                  }`}
                >
                  {tab === 'Todos' ? 'Todos' : tab}
                </button>
              )
            })}
          </div>

          {/* Campo Busca */}
          <div className="relative">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
            <input 
              type="text" 
              placeholder="Pesquisar cliente ou serviço..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className={`pl-9 pr-4 py-1.5 text-xs rounded-xl border outline-none w-full md:w-60 focus:md:w-72 transition-all duration-300 ${styles.input}`}
            />
          </div>
        </div>

        {/* LISTAGEM */}
        <div className={`p-6 rounded-2xl border ${styles.card}`}>
          <h2 className={`text-base font-bold mb-4 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
            Histórico do Dia
          </h2>

          <div className="flex flex-col gap-3">
            <AnimatePresence mode="popLayout">
              {filteredAppointments.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12 flex flex-col items-center justify-center"
                >
                  <Calendar size={32} className="text-zinc-600 mb-2" />
                  <p className="text-sm text-zinc-500 font-medium">Nenhum agendamento encontrado</p>
                  <p className="text-xs text-zinc-600">Não há registros para a combinação de filtros selecionada.</p>
                </motion.div>
              ) : (
                filteredAppointments.map((item, idx) => (
                  <motion.div 
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3, delay: idx * 0.03 }}
                    className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${styles.row}`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-500 p-[1px] shadow-sm flex-shrink-0">
                        <div className={`w-full h-full rounded-[9px] flex items-center justify-center text-xs font-bold ${
                          isDark ? 'bg-zinc-950 text-white' : 'bg-white text-zinc-800'
                        }`}>
                          <User size={14} className="text-zinc-400" />
                        </div>
                      </div>
                      <div className="min-w-0">
                        <p className={`text-sm font-bold truncate ${isDark ? 'text-zinc-200' : 'text-zinc-800'}`}>
                          {item.customer_name}
                        </p>
                        <p className="text-xs text-zinc-500 truncate mt-0.5">
                          {item.services?.name || 'Serviço não definido'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-5 flex-shrink-0">
                      <div className="flex items-center gap-2">
                        <Clock size={12} className="text-zinc-500" />
                        <span className={`text-xs font-bold font-mono ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                          {item.time}
                        </span>
                      </div>

                      {/* Status */}
                      <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${
                        item.status === 'Confirmado' || item.status === 'Concluído'
                          ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/10'
                          : item.status === 'Cancelado'
                          ? 'bg-red-500/10 text-red-500 border-red-500/10'
                          : 'bg-amber-500/10 text-amber-500 border-amber-500/10'
                      }`}>
                        {item.status}
                      </span>

                      {/* Preço */}
                      <span className="text-sm font-bold bg-gradient-to-r from-amber-500 to-yellow-500 bg-clip-text text-transparent">
                        R$ {Number(item.services?.price || 0).toFixed(2)}
                      </span>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>

      </div>
    </DashboardLayout>
  )
}