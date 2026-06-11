'use client'

import { useEffect, useState, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'
import DashboardLayout, { useTheme, useDashboard } from '../components/DashboardLayout.jsx'
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

// --- HELPER: ANIMATED COUNTER ---
function AnimatedCounter({ value, duration = 1.2 }) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    const isCurrency = typeof value === 'string' && value.includes('R$')
    const numericTarget = isCurrency 
      ? parseFloat(value.replace('R$', '').replace(/\./g, '').replace(',', '.').trim()) 
      : parseInt(value)

    if (isNaN(numericTarget)) {
      setDisplayValue(value)
      return
    }

    let start = 0
    const end = numericTarget
    const increment = end / (duration * 60)
    let current = start

    const timer = setInterval(() => {
      current += increment
      if (current >= end) {
        clearInterval(timer)
        setDisplayValue(value)
      } else {
        if (isCurrency) {
          setDisplayValue(
            'R$ ' + Math.round(current).toLocaleString('pt-BR', { minimumFractionDigits: 2 })
          )
        } else {
          setDisplayValue(Math.round(current))
        }
      }
    }, 1000 / 60)

    return () => clearInterval(timer)
  }, [value, duration])

  return <span>{displayValue}</span>
}

// --- HELPER: CARD KPI INTERATIVO ---
function KPICard({ title, value, trend, sparklinePoints, icon: Icon, accentColor }) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [coords, setCoords] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setCoords({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }

  const pathD = sparklinePoints.reduce((acc, point, i) => {
    const x = (i / (sparklinePoints.length - 1)) * 100
    const y = point
    return acc + (i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`)
  }, '')

  const areaD = `${pathD} L 100 40 L 0 40 Z`

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`p-5 rounded-2xl border relative overflow-hidden group transition-all duration-300 shadow-xl ${
        isDark 
          ? 'border-zinc-900 bg-[#0c0c0e]/50 backdrop-blur-xl hover:border-zinc-800/80' 
          : 'border-zinc-200/80 bg-white hover:border-zinc-300 shadow-md hover:shadow-lg'
      }`}
    >
      {/* Glow Effect */}
      {isHovered && (
        <div 
          className="absolute -inset-[1px] rounded-2xl pointer-events-none z-10 opacity-60 transition-opacity duration-300"
          style={{
            background: `radial-gradient(120px circle at ${coords.x}px ${coords.y}px, ${accentColor}15, transparent 80%)`,
            border: `1px solid ${accentColor}25`
          }}
        />
      )}

      {/* Sparkline Chart Background */}
      <div className="absolute bottom-0 left-0 right-0 h-11 opacity-25 group-hover:opacity-40 transition-opacity duration-500 pointer-events-none select-none">
        <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
          <defs>
            <linearGradient id={`spark-grad-${title}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={accentColor} stopOpacity="0.25" />
              <stop offset="100%" stopColor={accentColor} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={areaD} fill={`url(#spark-grad-${title})`} />
          <path d={pathD} fill="none" stroke={accentColor} strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </div>

      <div className="flex justify-between items-start mb-3 relative z-20">
        <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">{title}</p>
        <div className={`p-2 rounded-xl border transition-colors ${
          isDark ? 'bg-zinc-950/60 border-zinc-900 group-hover:border-zinc-800' : 'bg-zinc-50 border-zinc-200 group-hover:border-zinc-300'
        }`}>
          <Icon size={14} className="text-zinc-400 group-hover:text-amber-500 transition-colors" />
        </div>
      </div>

      <div className="flex justify-between items-baseline relative z-20">
        <h3 className={`text-2xl font-bold tracking-tight font-sans ${isDark ? 'text-white' : 'text-zinc-900'}`}>
          <AnimatedCounter value={value} />
        </h3>
        <span className="text-[10px] font-semibold text-emerald-500 px-1.5 py-0.5 bg-emerald-500/10 rounded-md border border-emerald-500/10 shadow-sm">
          {trend}
        </span>
      </div>
    </motion.div>
  )
}

// --- HELPER: MAIN ANALYTICS CHART ---
function AnalyticsChart({ chartData }) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [hoveredIndex, setHoveredIndex] = useState(null)
  const containerRef = useRef(null)

  const handleMouseMove = (e) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const xPercent = x / rect.width
    const xVal = xPercent * 300
    const index = Math.max(0, Math.min(6, Math.round(xVal / 50)))
    setHoveredIndex(index)
  }

  // Construct dynamic SVG path coords
  const points = chartData.map((d) => `${d.x} ${d.y}`)
  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p}`).join(' ')
  const areaD = `${pathD} L 300 120 L 0 120 Z`

  return (
    <div className={`p-5 rounded-2xl border flex flex-col justify-between h-full shadow-xl ${
      isDark ? 'border-zinc-900 bg-[#0c0c0e]/50 backdrop-blur-xl' : 'border-zinc-200/80 bg-white shadow-md'
    }`}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <p className={`text-xs font-semibold ${isDark ? 'text-zinc-300' : 'text-zinc-800'}`}>Receita dos Últimos 7 Dias</p>
          <p className="text-[10px] text-zinc-500">Acompanhamento de fluxo de faturamento</p>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/10">
          <TrendingUp size={10} />
          <span>Faturamento Real</span>
        </div>
      </div>

      <div 
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredIndex(null)}
        className="h-44 w-full relative flex items-end cursor-crosshair select-none"
      >
        <svg className="w-full h-full absolute inset-0 overflow-visible" viewBox="0 0 300 120" preserveAspectRatio="none">
          <defs>
            <linearGradient id="main-chart-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity={isDark ? 0.25 : 0.15} />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
            </linearGradient>
          </defs>
          
          {/* Grid lines */}
          <line x1="0" y1="30" x2="300" y2="30" stroke={isDark ? "#18181b" : "#e5e3dd"} strokeDasharray="3,3" />
          <line x1="0" y1="60" x2="300" y2="60" stroke={isDark ? "#18181b" : "#e5e3dd"} strokeDasharray="3,3" />
          <line x1="0" y1="90" x2="300" y2="90" stroke={isDark ? "#18181b" : "#e5e3dd"} strokeDasharray="3,3" />
          
          {/* Gradient area */}
          <path d={areaD} fill="url(#main-chart-grad)" />
          
          {/* Line path */}
          <path
            d={pathD}
            fill="none"
            stroke="url(#main-line-grad)"
            strokeWidth="2.5"
            strokeLinecap="round"
            className="drop-shadow-[0_4px_12px_rgba(245,158,11,0.25)]"
          />

          <linearGradient id="main-line-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#fbbf24" />
          </linearGradient>

          {/* Hover tracker line */}
          {hoveredIndex !== null && chartData[hoveredIndex] && (
            <line
              x1={chartData[hoveredIndex].x}
              y1="0"
              x2={chartData[hoveredIndex].x}
              y2="120"
              stroke={isDark ? "rgba(245, 158, 11, 0.35)" : "rgba(217, 119, 6, 0.4)"}
              strokeWidth="1.5"
              strokeDasharray="4,4"
            />
          )}

          {/* Snapped glow rings */}
          {hoveredIndex !== null && chartData[hoveredIndex] && (
            <>
              <circle
                cx={chartData[hoveredIndex].x}
                cy={chartData[hoveredIndex].y}
                r="8"
                className="fill-amber-500/20 stroke-none animate-ping"
                style={{ transformOrigin: `${chartData[hoveredIndex].x}px ${chartData[hoveredIndex].y}px` }}
              />
              <circle
                cx={chartData[hoveredIndex].x}
                cy={chartData[hoveredIndex].y}
                r="5.5"
                className="fill-amber-500 stroke-white stroke-2 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]"
              />
            </>
          )}
        </svg>

        {/* Floating tooltip element */}
        <AnimatePresence>
          {hoveredIndex !== null && chartData[hoveredIndex] && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ 
                opacity: 1, 
                y: 0, 
                scale: 1,
                left: `${(chartData[hoveredIndex].x / 300) * 100}%`,
                top: `${(chartData[hoveredIndex].y / 120) * 100}%`
              }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 450, damping: 28 }}
              style={{
                position: 'absolute',
                transform: 'translate(-50%, -100%) translateY(-14px)',
                pointerEvents: 'none',
                zIndex: 50
              }}
              className={`border rounded-xl p-3 shadow-2xl backdrop-blur-md min-w-[130px] ${
                isDark ? 'bg-[#09090b]/95 border-amber-500/30 text-zinc-100' : 'bg-white/95 border-amber-500/20 text-zinc-900 shadow-lg'
              }`}
            >
              <p className="text-[8px] font-bold text-zinc-500 uppercase tracking-wider font-mono">
                {chartData[hoveredIndex].label}
              </p>
              <div className="flex flex-col mt-1">
                <span className="text-[8px] text-zinc-400 leading-none">Faturamento</span>
                <span className="text-xs font-bold text-amber-500 font-sans leading-normal">
                  {chartData[hoveredIndex].revenue}
                </span>
                <span className="text-[8px] text-blue-500 font-semibold mt-0.5">
                  {chartData[hoveredIndex].appointments} agendamentos
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Labels below chart */}
        <div className={`w-full flex justify-between text-[8px] text-zinc-600 font-mono mt-1 pt-2 border-t pointer-events-none select-none ${
          isDark ? 'border-zinc-900' : 'border-zinc-200/80'
        }`}>
          {chartData.map((d, idx) => (
            <span 
              key={idx} 
              className={`transition-colors duration-200 ${
                hoveredIndex === idx ? (isDark ? 'text-amber-400 font-bold' : 'text-amber-600 font-bold') : ''
              }`}
            >
              {d.date}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

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
  
  const { barbershop } = useDashboard()
  const [loading, setLoading] = useState(true)
  const [appointments, setAppointments] = useState([])
  const [barbers, setBarbers] = useState([])
  const [services, setServices] = useState([])

  const rollingDays = getRollingDays()

  const [selectedDayTab, setSelectedDayTab] = useState(() => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const dateVal = String(today.getDate()).padStart(2, '0')
    return `${year}-${month}-${dateVal}`
  })

  useEffect(() => {
    if (!barbershop) return

    const loadData = async () => {
      try {
        setLoading(true)
        const [apptRes, barbersRes, servicesRes] = await Promise.all([
          supabase.from('appointments').select('*, services(name, price), barbers(name)').eq('barbershop_id', barbershop.id).order('time', { ascending: true }),
          supabase.from('barbers').select('*').eq('barbershop_id', barbershop.id).eq('active', true),
          supabase.from('services').select('*').eq('barbershop_id', barbershop.id)
        ])

        setAppointments(apptRes.data || [])
        setBarbers(barbersRes.data || [])
        setServices(servicesRes.data || [])
      } catch (err) {
        console.error('Erro ao carregar dados do dashboard:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [barbershop])

  const updateAppointmentStatus = async (id, status) => {
    const { error } = await supabase.from('appointments').update({ status }).eq('id', id)
    if (error) { 
      alert('Erro ao atualizar agendamento no Supabase.')
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

  // 1. Monthly Revenue faturamento
  const currentMonthRevenue = currentMonthAppts
    .filter(appt => appt.status === 'Concluído' || appt.status === 'Confirmado')
    .reduce((acc, appt) => acc + Number(appt.services?.price || 0), 0)

  const prevMonthRevenue = prevMonthAppts
    .filter(appt => appt.status === 'Concluído' || appt.status === 'Confirmado')
    .reduce((acc, appt) => acc + Number(appt.services?.price || 0), 0)

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

  // 3. Active Customers counts and trend
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

  // 4. New Customers counts and trend
  const customerFirstDates = {}
  appointments.forEach(appt => {
    const name = appt.customer_name
    if (!customerFirstDates[name] || appt.date < customerFirstDates[name]) {
      customerFirstDates[name] = appt.date
    }
  })
  const currentNewCustomers = Object.values(customerFirstDates)
    .filter(date => date.startsWith(currentMonthPrefix)).length
  const prevNewCustomers = Object.values(customerFirstDates)
    .filter(date => date.startsWith(prevMonthPrefix)).length
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
    return appointments
      .filter(appt => appt.date === dateStr && (appt.status === 'Concluído' || appt.status === 'Confirmado'))
      .reduce((acc, appt) => acc + Number(appt.services?.price || 0), 0)
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
    return Object.entries(customerFirstDates).filter(([_, firstDate]) => firstDate === dateStr).length
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
    const revenueVal = dayAppts
      .filter(appt => appt.status === 'Concluído' || appt.status === 'Confirmado')
      .reduce((acc, appt) => acc + Number(appt.services?.price || 0), 0)
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
            title="Clientes Ativos" 
            value={currentActiveCustomers} 
            trend={customersTrend} 
            sparklinePoints={customersSparkline} 
            icon={Users} 
            accentColor="#10B981" 
          />
          <KPICard 
            title="Novos Clientes" 
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
    </DashboardLayout>
  )
}