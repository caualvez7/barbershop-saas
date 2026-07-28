'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { supabaseBarber as supabase } from '../../lib/supabase-barber.js'
import { useRouter } from 'next/navigation'
import DashboardLayout, { useTheme, useDashboard } from '../components/DashboardLayout.jsx'
import Toast from '../components/Toast'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  TrendingUp, 
  Calendar, 
  Users, 
  Scissors, 
  DollarSign, 
  Star, 
  Check, 
  X, 
  ArrowUpRight, 
  Plus, 
  Sparkles,
  Award
} from 'lucide-react'

import KPICard from '../components/dashboard/KPICard'
import AnalyticsChart from '../components/dashboard/AnalyticsChart'
import AnimatedCounter from '../components/dashboard/AnimatedCounter'

// --- HELPER: GENERATE SPARKLINE POINTS ---
function getSparklinePoints(dataArray) {
  const maxVal = Math.max(...dataArray, 0)
  if (maxVal === 0) {
    return [35, 35, 35, 35, 35, 35, 35] // flat baseline
  }
  return dataArray.map(val => {
    return 35 - (val / maxVal) * 25
  })
}

// --- HELPER: ROLLING 7 DAYS CALCULATOR (Today + 6) ---
const weekdays = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB']
function getRollingDays() {
  const days = []
  const today = new Date()
  for (let i = 0; i < 7; i++) {
    const d = new Date()
    d.setDate(today.getDate() + i)
    
    const dayName = weekdays[d.getDay()]
    const dayNum = String(d.getDate()).padStart(2, '0')
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const dateVal = String(d.getDate()).padStart(2, '0')
    const dateStr = `${year}-${month}-${dateVal}`
    
    days.push({
      label: dayName,
      num: dayNum,
      dateStr
    })
  }
  return days
}

export default function Dashboard() {
  const router = useRouter()
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  
  const { barbershop, loading: layoutLoading } = useDashboard()
  const [loading, setLoading] = useState(true)
  const [appointments, setAppointments] = useState([])
  const [barbers, setBarbers] = useState([])
  const [services, setServices] = useState([])
  const [productSales, setProductSales] = useState([])
  const [subscriptions, setSubscriptions] = useState([])
  const [toast, setToast] = useState({ message: '', type: 'error' })

  const rollingDays = getRollingDays()

  const [selectedDayTab, setSelectedDayTab] = useState(() => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const dateVal = String(today.getDate()).padStart(2, '0')
    return `${year}-${month}-${dateVal}`
  })

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const [apptRes, barbersRes, servicesRes, salesRes, subsRes] = await Promise.all([
        supabase.from('appointments').select('id, customer_name, customer_whatsapp, date, time, service_id, barber_id, status, services(name, price), barbers(name)').eq('barbershop_id', barbershop.id).order('time', { ascending: true }),
        supabase.from('barbers').select('id, name, active').eq('barbershop_id', barbershop.id).eq('active', true),
        supabase.from('services').select('id, name, price').eq('barbershop_id', barbershop.id),
        supabase.from('product_sales').select('id, product_id, quantity, price_at_purchase, payment_status, created_at').eq('barbershop_id', barbershop.id),
        supabase.from('subscriptions').select('id, plan_name, price, status, created_at').eq('barbershop_id', barbershop.id)
      ])

      setAppointments(apptRes.data || [])
      setBarbers(barbersRes.data || [])
      setServices(servicesRes.data || [])
      setProductSales(salesRes.data || [])
      setSubscriptions(subsRes.data || [])
    } catch (err) {
      console.error('Erro ao carregar dados do dashboard:', err)
    } finally {
      setLoading(false)
    }
  }, [barbershop])

  useEffect(() => {
    if (layoutLoading) return
    if (!barbershop) {
      setLoading(false)
      const timer = setTimeout(() => router.push('/login'), 3000)
      return () => clearTimeout(timer)
    }
    loadData()

    // Inscrever em atualizações em tempo real para novos agendamentos
    const channel = supabase
      .channel(`dashboard-appts-${barbershop.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments', filter: `barbershop_id=eq.${barbershop.id}` }, () => {
        loadData()
      })
      .subscribe()

    const onFocus = () => loadData()
    window.addEventListener('focus', onFocus)

    return () => {
      supabase.removeChannel(channel)
      window.removeEventListener('focus', onFocus)
    }
  }, [barbershop, layoutLoading, loadData, router])

  const updateAppointmentStatus = async (id, status) => {
    const { error } = await supabase.from('appointments').update({ status }).eq('id', id)
    if (error) { 
      setToast({ message: 'Erro ao atualizar agendamento no Supabase: ' + error.message, type: 'error' })
      return 
    }
    setAppointments(prev => prev.map(item => item.id === id ? { ...item, status } : item))
  }

  // Filter appointments for the selected rolling day (matching full YYYY-MM-DD string)
  const filteredAppts = appointments.filter(appt => appt.date === selectedDayTab)

  // Dynamic calculations for month dates
  const today = new Date()
  const currentYear = today.getFullYear()
  const currentMonth = String(today.getMonth() + 1).padStart(2, '0')
  const currentMonthPrefix = `${currentYear}-${currentMonth}`
  
  const prevMonthDate = new Date()
  prevMonthDate.setMonth(today.getMonth() - 1)
  const prevYear = prevMonthDate.getFullYear()
  const prevMonth = String(prevMonthDate.getMonth() + 1).padStart(2, '0')
  const prevMonthPrefix = `${prevYear}-${prevMonth}`

  // Current vs past month values for metrics
  const currentMonthAppts = appointments.filter(appt => appt.date.startsWith(currentMonthPrefix))
  const prevMonthAppts = appointments.filter(appt => appt.date.startsWith(prevMonthPrefix))

  const currentMonthSales = productSales.filter(s => s.created_at && s.created_at.startsWith(currentMonthPrefix))
  const prevMonthSales = productSales.filter(s => s.created_at && s.created_at.startsWith(prevMonthPrefix))

  const currentMonthSubs = subscriptions.filter(s => s.status === 'active' && s.created_at && s.created_at.startsWith(currentMonthPrefix))
  const prevMonthSubs = subscriptions.filter(s => s.status === 'active' && s.created_at && s.created_at.startsWith(prevMonthPrefix))

  // 1. Monthly Revenue faturamento (Services + Product Sales + Active Subscriptions)
  const currentMonthServiceRev = currentMonthAppts
    .filter(appt => appt.status === 'Concluído' || appt.status === 'Confirmado')
    .reduce((acc, appt) => acc + Number(appt.services?.price || 0), 0)
  const currentMonthProductRev = currentMonthSales
    .reduce((acc, s) => acc + Number(s.price_at_purchase || 0) * (s.quantity || 1), 0)
  const currentMonthSubRev = currentMonthSubs
    .reduce((acc, s) => acc + Number(s.price || 99.90), 0)
  const currentMonthRevenue = currentMonthServiceRev + currentMonthProductRev + currentMonthSubRev

  const prevMonthServiceRev = prevMonthAppts
    .filter(appt => appt.status === 'Concluído' || appt.status === 'Confirmado')
    .reduce((acc, appt) => acc + Number(appt.services?.price || 0), 0)
  const prevMonthProductRev = prevMonthSales
    .reduce((acc, s) => acc + Number(s.price_at_purchase || 0) * (s.quantity || 1), 0)
  const prevMonthSubRev = prevMonthSubs
    .reduce((acc, s) => acc + Number(s.price || 99.90), 0)
  const prevMonthRevenue = prevMonthServiceRev + prevMonthProductRev + prevMonthSubRev

  let revenueTrend = '0%'
  if (prevMonthRevenue > 0) {
    const diff = ((currentMonthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100
    revenueTrend = `${diff >= 0 ? '+' : ''}${diff.toFixed(1)}%`
  } else if (currentMonthRevenue > 0) {
    revenueTrend = '+100%'
  }

  // 2. Appointments counts and trend
  const currentMonthApptsCount = currentMonthAppts.length
  const prevMonthApptsCount = prevMonthAppts.length
  let apptsTrend = '0%'
  if (prevMonthApptsCount > 0) {
    const diff = ((currentMonthApptsCount - prevMonthApptsCount) / prevMonthApptsCount) * 100
    apptsTrend = `${diff >= 0 ? '+' : ''}${diff.toFixed(1)}%`
  } else if (currentMonthApptsCount > 0) {
    apptsTrend = '+100%'
  }

  // 3. Active Customers counts and trend (labeled as Clientes Assinantes)
  const currentActiveCustomers = new Set(
    currentMonthAppts.filter(appt => appt.status !== 'Cancelado').map(appt => appt.customer_name)
  ).size
  const prevActiveCustomers = new Set(
    prevMonthAppts.filter(appt => appt.status !== 'Cancelado').map(appt => appt.customer_name)
  ).size
  let customersTrend = '0%'
  if (prevActiveCustomers > 0) {
    const diff = ((currentActiveCustomers - prevActiveCustomers) / prevActiveCustomers) * 100
    customersTrend = `${diff >= 0 ? '+' : ''}${diff.toFixed(1)}%`
  } else if (currentActiveCustomers > 0) {
    customersTrend = '+100%'
  }

  // 4. New Customer Subscriptions counts and trend (Novos Clientes Assinantes)
  const currentNewCustomers = currentMonthSubs.length
  const prevNewCustomers = prevMonthSubs.length
  let newCustomersTrend = '0%'
  if (prevNewCustomers > 0) {
    const diff = ((currentNewCustomers - prevNewCustomers) / prevNewCustomers) * 100
    newCustomersTrend = `${diff >= 0 ? '+' : ''}${diff.toFixed(1)}%`
  } else if (currentNewCustomers > 0) {
    newCustomersTrend = '+100%'
  }

  // Sparkline history data points (last 7 days)
  const past7Days = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(today.getDate() - i)
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const dt = String(d.getDate()).padStart(2, '0')
    past7Days.push(`${y}-${m}-${dt}`)
  }

  const revenueDailyVals = past7Days.map(dateStr => {
    const serviceVal = appointments
      .filter(appt => appt.date === dateStr && (appt.status === 'Concluído' || appt.status === 'Confirmado'))
      .reduce((acc, appt) => acc + Number(appt.services?.price || 0), 0)
    const productVal = productSales
      .filter(s => s.created_at && s.created_at.startsWith(dateStr))
      .reduce((acc, s) => acc + Number(s.price_at_purchase || 0) * (s.quantity || 1), 0)
    const subVal = subscriptions
      .filter(s => s.status === 'active' && s.created_at && s.created_at.startsWith(dateStr))
      .reduce((acc, s) => acc + Number(s.price || 99.90), 0)
    return serviceVal + productVal + subVal
  })
  const apptsDailyVals = past7Days.map(dateStr => {
    return appointments.filter(appt => appt.date === dateStr).length
  })
  const customersDailyVals = past7Days.map(dateStr => {
    return new Set(
      appointments.filter(appt => appt.date === dateStr && appt.status !== 'Cancelado').map(appt => appt.customer_name)
    ).size
  })
  const newCustomersDailyVals = past7Days.map(dateStr => {
    return subscriptions.filter(s => s.status === 'active' && s.created_at && s.created_at.startsWith(dateStr)).length
  })

  const revenueSparkline = getSparklinePoints(revenueDailyVals)
  const apptsSparkline = getSparklinePoints(apptsDailyVals)
  const customersSparkline = getSparklinePoints(customersDailyVals)
  const newCustomersSparkline = getSparklinePoints(newCustomersDailyVals)

  // Main analytics chart dataset
  const weekdaysShort = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
  const chartData = past7Days.map((dateStr, idx) => {
    const d = new Date(dateStr + 'T12:00:00')
    const shortLabel = `${dateStr.split('-')[2]}/${dateStr.split('-')[1]}`
    const label = d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
    
    const dayAppts = appointments.filter(appt => appt.date === dateStr)
    const daySales = productSales.filter(s => s.created_at && s.created_at.startsWith(dateStr))
    const daySubs = subscriptions.filter(s => s.status === 'active' && s.created_at && s.created_at.startsWith(dateStr))

    const serviceVal = dayAppts
      .filter(appt => appt.status === 'Concluído' || appt.status === 'Confirmado')
      .reduce((acc, appt) => acc + Number(appt.services?.price || 0), 0)
    const productVal = daySales
      .reduce((acc, s) => acc + Number(s.price_at_purchase || 0) * (s.quantity || 1), 0)
    const subVal = daySubs
      .reduce((acc, s) => acc + Number(s.price || 99.90), 0)

    const revenueVal = serviceVal + productVal + subVal
    const apptsCount = dayAppts.length

    return {
      date: shortLabel,
      label,
      revenue: `R$ ${revenueVal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      rawRevenue: revenueVal,
      appointments: apptsCount,
      x: idx * 50
    }
  })

  const maxRevenue = Math.max(...chartData.map(d => d.rawRevenue), 0)
  const chartDataWithY = chartData.map(d => {
    let y = 100
    if (maxRevenue > 0) {
      y = 100 - (d.rawRevenue / maxRevenue) * 70
    }
    return { ...d, y }
  })

  // Team performance rankings
  const teamPerformance = barbers.map(barber => {
    const barberAppts = appointments.filter(appt => appt.barber_id === barber.id)
    const bookingsCount = barberAppts.length
    const revenueVal = barberAppts
      .filter(appt => appt.status === 'Concluído' || appt.status === 'Confirmado')
      .reduce((acc, appt) => acc + Number(appt.services?.price || 0), 0)
      
    return {
      name: barber.name,
      bookings: bookingsCount,
      revenue: `R$ ${revenueVal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      rating: 5.0,
      avatar: barber.name.charAt(0).toUpperCase()
    }
  }).sort((a, b) => b.bookings - a.bookings)

  // Service popularity bar chart
  const maxServiceBookings = Math.max(
    ...services.map(svc => appointments.filter(appt => appt.service_id === svc.id).length),
    0
  )
  const popularServices = services.map((service, idx) => {
    const count = appointments.filter(appt => appt.service_id === service.id).length
    const pct = maxServiceBookings > 0 ? `${(count / maxServiceBookings) * 100}%` : '0%'
    
    let color = 'from-amber-500 to-yellow-500'
    if (idx === 1) color = 'from-amber-500 to-yellow-600'
    else if (idx === 2) color = 'from-yellow-500 to-yellow-600'
    else if (idx >= 3) color = 'from-zinc-400 to-zinc-500 dark:from-zinc-600 dark:to-zinc-700'

    return {
      name: service.name,
      count,
      pct,
      color
    }
  }).sort((a, b) => b.count - a.count)

  // Localized date header label for the scheduler block
  const activeDayObj = rollingDays.find(d => d.dateStr === selectedDayTab) || rollingDays[0]
  const activeDayDate = new Date(activeDayObj.dateStr + 'T12:00:00')
  const monthYearLabel = activeDayDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

  const styles = {
    welcomeBadge: isDark ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' : 'text-amber-600 bg-amber-500/10 border-amber-500/20',
    welcomeLink: isDark ? 'text-zinc-300 hover:text-white bg-zinc-900/50 hover:bg-zinc-900 border-zinc-800 hover:border-zinc-700' : 'text-zinc-700 hover:text-zinc-900 bg-white hover:bg-zinc-50 border-zinc-200 hover:border-zinc-300 shadow-sm',
    tabsContainer: isDark ? 'bg-zinc-950/60 border-zinc-900/60' : 'bg-zinc-100/80 border-zinc-200/80',
    tabActive: isDark ? 'bg-amber-500/10 border-amber-500/20' : 'bg-white border-amber-500/20 shadow-sm',
    tabNumInactive: isDark ? 'text-zinc-400' : 'text-zinc-600',
    headerBadge: isDark ? 'text-zinc-500 bg-zinc-900 border-zinc-800' : 'text-zinc-500 bg-zinc-100 border-zinc-200',
    scheduleCard: isDark ? 'border-zinc-900 bg-[#0c0c0e]/50 shadow-xl' : 'border-zinc-200/80 bg-white shadow-md',
    apptRow: isDark ? 'bg-zinc-900/20 border-zinc-900/80 hover:border-zinc-800/80 hover:bg-zinc-900/30' : 'bg-zinc-50/50 border-zinc-200/80 hover:border-zinc-300/80 hover:bg-zinc-100/30 shadow-sm',
    timeBadge: isDark ? 'text-amber-400 bg-amber-500/10' : 'text-amber-600 bg-amber-500/10',
    teamCard: isDark ? 'border-zinc-900 bg-[#0c0c0e]/50 shadow-xl' : 'border-zinc-200/80 bg-white shadow-md',
    barberItemCard: isDark ? 'border-zinc-900 bg-zinc-950/40 hover:border-zinc-800' : 'border-zinc-200 bg-zinc-50/50 hover:border-zinc-300/80 hover:bg-white shadow-sm',
    barberAvatarInner: isDark ? 'bg-[#0c0c0e] text-white' : 'bg-white text-zinc-800',
    barberRevenue: isDark ? 'text-amber-400' : 'text-amber-600',
    servicesCard: isDark ? 'border-zinc-900 bg-[#0c0c0e]/50 shadow-xl' : 'border-zinc-200/80 bg-white shadow-md',
    progressTrack: isDark ? 'bg-zinc-900 border-zinc-900' : 'bg-zinc-100 border-zinc-200/80',
    progressColor: 'from-amber-500 to-yellow-500'
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col gap-6 max-w-6xl mx-auto">
          {/* Skeleton Loaders */}
          <div className="h-10 w-48 bg-zinc-900/60 animate-pulse rounded-lg" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-28 bg-[#0c0c0e]/40 border border-zinc-900 rounded-2xl animate-pulse" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-72 bg-[#0c0c0e]/40 border border-zinc-900 rounded-2xl animate-pulse" />
            <div className="h-72 bg-[#0c0c0e]/40 border border-zinc-900 rounded-2xl animate-pulse" />
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 max-w-6xl mx-auto pb-10">
        
        {/* WELCOME SECTION */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <span className={isDark ? 'text-white' : 'text-zinc-900'}>{barbershop?.name || 'Dashboard'}</span>
              <span className={`text-xs font-normal border px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm ${styles.welcomeBadge}`}>
                <Sparkles size={10} />
                <span>Premium Admin</span>
              </span>
            </h1>
            <p className="text-zinc-500 text-xs mt-0.5">Visão geral e desempenho operacional da sua barbearia.</p>
          </div>
          <Link 
            href={`/barber/${barbershop?.slug}`}
            target="_blank"
            className={`flex items-center gap-1.5 text-xs border px-4 py-2 rounded-xl transition-all duration-300 ${styles.welcomeLink}`}
          >
            <span>Ver página pública</span>
            <ArrowUpRight size={13} />
          </Link>
        </div>

        {/* ALERTA PLANO BASIC */}
        {barbershop?.plan === 'basic' && (
          <div className="bg-gradient-to-r from-amber-500/5 via-amber-500/10 to-transparent border border-amber-500/20 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
            <p className="text-xs text-amber-500 font-medium">
              Seu plano **Básico** atual permite até 3 serviços cadastrados. Faça o upgrade agora para ter recursos ilimitados!
            </p>
            <Link 
              href="/#plans" 
              className="text-xs font-bold text-zinc-900 bg-amber-400 hover:bg-amber-300 px-3 py-1.5 rounded-lg w-fit transition-colors shadow-md shadow-amber-500/10"
            >
              Fazer upgrade
            </Link>
          </div>
        )}

        {/* TOP KPI CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard 
            title="Faturamento Mensal" 
            value={`R$ ${currentMonthRevenue.toFixed(2)}`} 
            trend={revenueTrend} 
            sparklinePoints={revenueSparkline} 
            icon={DollarSign} 
            accentColor="#f59e0b" 
          />
          <KPICard 
            title="Agendamentos" 
            value={currentMonthApptsCount} 
            trend={apptsTrend} 
            sparklinePoints={apptsSparkline} 
            icon={Calendar} 
            accentColor="#f59e0b" 
          />
          <KPICard 
            title="Clientes Assinantes" 
            value={currentActiveCustomers} 
            trend={customersTrend} 
            sparklinePoints={customersSparkline} 
            icon={Users} 
            accentColor="#10B981" 
          />
          <KPICard 
            title="Novos Clientes Assinantes" 
            value={currentNewCustomers} 
            trend={newCustomersTrend} 
            sparklinePoints={newCustomersSparkline} 
            icon={Users} 
            accentColor="#f59e0b" 
          />
        </div>

        {/* MIDDLE SECTION: SCHEDULE & MAIN CHART */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT: WEEKLY SCHEDULE TABLE */}
          <div className={`p-5 rounded-2xl border flex flex-col gap-5 shadow-xl ${styles.scheduleCard}`}>
            <div className="flex justify-between items-center">
              <div>
                <p className={`text-xs font-semibold ${isDark ? 'text-zinc-300' : 'text-zinc-800'}`}>Agendamentos da Semana</p>
                <p className="text-[10px] text-zinc-500">Selecione o dia e gerencie os horários</p>
              </div>
              <span className={`text-[10px] font-mono border px-2 py-0.5 rounded-lg text-capitalize ${styles.headerBadge}`}>
                {monthYearLabel}
              </span>
            </div>

            {/* Day Selector Tabs */}
            <div className={`flex justify-between border p-1 rounded-xl ${styles.tabsContainer}`}>
              {rollingDays.map(day => {
                const isActive = selectedDayTab === day.dateStr
                return (
                  <button 
                    key={day.dateStr}
                    onClick={() => setSelectedDayTab(day.dateStr)}
                    className="flex-1 py-1.5 flex flex-col items-center justify-center rounded-lg transition-all relative"
                  >
                    {isActive && (
                      <motion.div 
                        layoutId="active-day-tab"
                        className={`absolute inset-0 border rounded-lg z-0 ${styles.tabActive}`}
                        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                      />
                    )}
                    <span className={`text-[8px] font-mono leading-none relative z-10 ${isActive ? 'text-amber-500 font-bold' : 'text-zinc-500'}`}>{day.label}</span>
                    <span className={`text-[11px] font-bold mt-0.5 leading-none relative z-10 ${isActive ? (isDark ? 'text-white' : 'text-amber-600') : styles.tabNumInactive}`}>{day.num}</span>
                  </button>
                )
              })}
            </div>

            {/* Appointments List */}
            <div className="flex-1 flex flex-col gap-2 min-h-[220px] max-h-[320px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-zinc-800">
              <AnimatePresence mode="popLayout">
                {filteredAppts.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex-1 flex flex-col items-center justify-center text-center py-10"
                  >
                    <Calendar size={24} className="text-zinc-600 mb-2" />
                    <p className="text-xs text-zinc-500 font-medium">Sem agendamentos cadastrados</p>
                    <p className="text-[10px] text-zinc-600">Nenhum atendimento marcado para este dia.</p>
                  </motion.div>
                ) : (
                  filteredAppts.map(appt => (
                    <motion.div
                      key={appt.id}
                      layout
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, x: -30 }}
                      transition={{ duration: 0.3 }}
                      className={`flex justify-between items-center p-3 rounded-xl border transition-all gap-4 ${styles.apptRow}`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Time label */}
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${styles.timeBadge}`}>
                          {appt.time}
                        </span>
                        <div className="min-w-0">
                          <p className={`text-[11px] font-bold truncate ${isDark ? 'text-zinc-200' : 'text-zinc-800'}`}>{appt.customer_name}</p>
                          <p className="text-[9px] text-zinc-500 truncate mt-0.5">
                            {appt.services?.name || 'Serviço'} · {appt.barbers?.name || 'Profissional'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3.5 flex-shrink-0">
                        {/* Status Badge */}
                        <span className={`text-[8px] font-semibold px-2 py-0.5 rounded-full border ${
                          appt.status === 'Confirmado' || appt.status === 'Concluído'
                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/10'
                            : appt.status === 'Cancelado'
                            ? 'bg-red-500/10 text-red-500 border-red-500/10'
                            : 'bg-amber-500/10 text-amber-500 border-amber-500/10'
                        }`}>
                          {appt.status}
                        </span>

                        {/* Interactive Action Buttons */}
                        {appt.status === 'Pendente' && (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => updateAppointmentStatus(appt.id, 'Confirmado')}
                              className="w-6 h-6 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 flex items-center justify-center transition-colors cursor-pointer"
                              title="Confirmar Agendamento"
                            >
                              <Check size={12} />
                            </button>
                            <button
                              onClick={() => updateAppointmentStatus(appt.id, 'Cancelado')}
                              className="w-6 h-6 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 flex items-center justify-center transition-colors cursor-pointer"
                              title="Cancelar Agendamento"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* RIGHT: MAIN ANALYTICS CHART */}
          <div className="lg:col-span-2">
            <AnalyticsChart chartData={chartDataWithY} />
          </div>

        </div>

        {/* BOTTOM SECTION: BARBER PERFORMANCE & SERVICES RESERVED */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT: TEAM PERFORMANCE (BARBER RANKING) */}
          <div className={`p-5 rounded-2xl border flex flex-col gap-4 shadow-xl ${styles.teamCard}`}>
            <div>
              <p className={`text-xs font-semibold ${isDark ? 'text-zinc-300' : 'text-zinc-800'}`}>Desempenho da Equipe</p>
              <p className="text-[10px] text-zinc-500">Ranking e avaliações dos barbeiros neste mês</p>
            </div>

            {teamPerformance.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
                <Users size={24} className="text-zinc-600 mb-2" />
                <p className="text-xs text-zinc-500 font-medium">Nenhum profissional cadastrado</p>
                <Link href="/dashboard/barbers" className="text-[10px] text-amber-500 hover:underline mt-1">
                  Cadastrar barbeiros →
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {teamPerformance.slice(0, 3).map((barber, idx) => (
                  <div key={idx} className={`p-4 rounded-xl border flex flex-col items-center text-center relative group ${styles.barberItemCard}`}>
                    {idx === 0 && barber.bookings > 0 && (
                      <span className="absolute top-2.5 right-2.5 text-amber-500 shadow-sm" title="Top Perfomer">
                        <Award size={14} />
                      </span>
                    )}
                    {/* Avatar with Glow ring */}
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-500 p-[1px] mb-3 shadow-md group-hover:scale-105 transition-transform duration-300">
                      <div className={`w-full h-full rounded-[15px] flex items-center justify-center text-sm font-bold ${styles.barberAvatarInner}`}>
                        {barber.avatar}
                      </div>
                    </div>

                    <p className={`text-[11px] font-bold truncate max-w-full ${isDark ? 'text-zinc-200' : 'text-zinc-800'}`}>{barber.name}</p>
                    
                    {/* Stars Rating */}
                    <div className="flex items-center gap-1 mt-1 mb-3">
                      <Star size={10} className="fill-amber-500 text-amber-500" />
                      <span className="text-[9px] font-bold text-amber-500">{barber.rating}</span>
                    </div>

                    <div className="w-full grid grid-cols-2 gap-1 border-t border-zinc-200/40 dark:border-zinc-900/60 pt-3 text-left">
                      <div>
                        <p className="text-[8px] text-zinc-500">Reservas</p>
                        <p className={`text-xs font-bold mt-0.5 ${isDark ? 'text-zinc-300' : 'text-zinc-800'}`}>{barber.bookings}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[8px] text-zinc-500">Receita</p>
                        <p className={`text-xs font-bold mt-0.5 truncate ${styles.barberRevenue}`}>{barber.revenue}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: POPULAR SERVICES */}
          <div className={`p-5 rounded-2xl border flex flex-col gap-4 shadow-xl ${styles.servicesCard}`}>
            <div>
              <p className={`text-xs font-semibold ${isDark ? 'text-zinc-300' : 'text-zinc-800'}`}>Serviços Mais Procurados</p>
              <p className="text-[10px] text-zinc-500">Reservas concluídas por tipo de serviço</p>
            </div>

            {popularServices.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
                <Scissors size={24} className="text-zinc-600 mb-2" />
                <p className="text-xs text-zinc-500 font-medium">Nenhum serviço cadastrado</p>
                <Link href="/dashboard/services" className="text-[10px] text-amber-500 hover:underline mt-1">
                  Cadastrar serviços →
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-3.5 py-1">
                {popularServices.slice(0, 4).map((svc, idx) => (
                  <div key={idx} className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center text-[10px] font-medium">
                      <span className={`font-bold ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>{svc.name}</span>
                      <span className="text-zinc-500">{svc.count} reservas</span>
                    </div>
                    {/* Progress track */}
                    <div className={`h-1.5 w-full rounded-full overflow-hidden ${styles.progressTrack}`}>
                      <div 
                        className={`h-full rounded-full bg-gradient-to-r ${svc.color}`}
                        style={{ width: svc.pct }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
      <Toast 
        message={toast.message} 
        type={toast.type} 
        onClose={() => setToast({ message: '', type: 'error' })} 
      />
    </DashboardLayout>
  )
}