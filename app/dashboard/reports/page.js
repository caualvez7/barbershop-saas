'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabaseBarber as supabase } from '../../../lib/supabase-barber.js'
import DashboardLayout, { useTheme, useDashboard } from '../../components/DashboardLayout.jsx'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Scissors,
  ShoppingBag,
  CreditCard,
  Calendar,
  ChevronDown,
  ArrowRight,
  Sparkles,
  Info,
  Award,
  Package,
  Layers,
  ArrowUpRight
} from 'lucide-react'

// Preset de Cores Premium HSL
const COLORS = {
  accent: '#f59e0b', // Amber 500 (Ouro)
  accentGlow: 'rgba(245, 158, 11, 0.15)',
  success: '#10b981', // Emerald 500 (Verde)
  danger: '#f43f5e', // Rose 500 (Vermelho)
  info: '#06b6d4', // Cyan 500 (Azul/Ciano)
  infoBg: 'rgba(6, 182, 212, 0.1)',
  successBg: 'rgba(16, 185, 129, 0.1)',
  dangerBg: 'rgba(244, 63, 94, 0.1)',
}

// Meses do Ano
const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
]

// Lista de Anos
const YEARS = ['2025', '2026']

export default function ReportsPage() {
  const router = useRouter()
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const { barbershop, loading: layoutLoading } = useDashboard()
  const [loading, setLoading] = useState(true)

  // Estados dos Filtros
  const [timeFilter, setTimeFilter] = useState('month') // 'month' | 'year' | 'custom'
  const [selectedMonth, setSelectedMonth] = useState(5) // Junho (0-indexed: 5)
  const [selectedYear, setSelectedYear] = useState('2026')
  const [startDate, setStartDate] = useState('2026-06-01')
  const [endDate, setEndDate] = useState('2026-06-30')
  const [inputStartDate, setInputStartDate] = useState('2026-06-01')
  const [inputEndDate, setInputEndDate] = useState('2026-06-30')

  const isMountedRef = useRef(true)
  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  // Debounce para os inputs de data customizados
  useEffect(() => {
    const timer = setTimeout(() => {
      setStartDate(inputStartDate)
      setEndDate(inputEndDate)
    }, 500)
    return () => clearTimeout(timer)
  }, [inputStartDate, inputEndDate])

  // Dados Ativos (Gerados/Simulados com base nos filtros)
  const [reportData, setReportData] = useState(null)
  
  // Estado para Tooltips dos Gráficos
  const [lineChartHoverIndex, setLineChartHoverIndex] = useState(null)
  const [donutHoverIndex, setDonutHoverIndex] = useState(null)



  // Helper para obter o intervalo de datas do período atual e anterior
  const getPeriodDates = (filter, month, year, start, end) => {
    let currentStart = ''
    let currentEnd = ''
    let previousStart = ''
    let previousEnd = ''

    if (filter === 'month') {
      const m = month + 1
      const y = parseInt(year)
      currentStart = `${y}-${String(m).padStart(2, '0')}-01`
      const lastDay = new Date(y, m, 0).getDate()
      currentEnd = `${y}-${String(m).padStart(2, '0')}-${lastDay}`

      const prevM = m === 1 ? 12 : m - 1
      const prevY = m === 1 ? y - 1 : y
      const prevLastDay = new Date(prevY, prevM, 0).getDate()
      previousStart = `${prevY}-${String(prevM).padStart(2, '0')}-01`
      previousEnd = `${prevY}-${String(prevM).padStart(2, '0')}-${prevLastDay}`
    } else if (filter === 'year') {
      const y = parseInt(year)
      currentStart = `${y}-01-01`
      currentEnd = `${y}-12-31`
      previousStart = `${y - 1}-01-01`
      previousEnd = `${y - 1}-12-31`
    } else {
      currentStart = start
      currentEnd = end
      
      const startDateObj = new Date(start)
      const endDateObj = new Date(end)
      const diffMs = endDateObj - startDateObj
      const diffDays = Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)))

      const prevStartObj = new Date(startDateObj)
      prevStartObj.setDate(prevStartObj.getDate() - diffDays - 1)
      const prevEndObj = new Date(startDateObj)
      prevEndObj.setDate(prevEndObj.getDate() - 1)

      previousStart = prevStartObj.toISOString().split('T')[0]
      previousEnd = prevEndObj.toISOString().split('T')[0]
    }

    return { currentStart, currentEnd, previousStart, previousEnd }
  }

  // Função para carregar dados reais e consolidar estatísticas
  const loadRealReportData = useCallback(async () => {
    if (!barbershop) return
    try {
      setLoading(true)
      const { currentStart, currentEnd, previousStart, previousEnd } = getPeriodDates(
        timeFilter, selectedMonth, selectedYear, startDate, endDate
      )

      const [
        currentApptsRes,
        currentSalesRes,
        currentSubsRes,
        previousApptsRes,
        previousSalesRes,
        previousSubsRes,
        barbersRes,
        servicesRes
      ] = await Promise.all([
        supabase.from('appointments').select('id, status, date, time, barber_id, price, service_id, services(name, price), barbers(name, photo_url)').eq('barbershop_id', barbershop.id).gte('date', currentStart).lte('date', currentEnd),
        supabase.from('product_sales').select('id, product_id, quantity, total_price, payment_status, created_at, products(name, brand, price)').eq('barbershop_id', barbershop.id).gte('created_at', `${currentStart}T00:00:00`).lte('created_at', `${currentEnd}T23:59:59`),
        supabase.from('subscriptions').select('id, plan_name, price, status, created_at').eq('barbershop_id', barbershop.id).gte('created_at', `${currentStart}T00:00:00`).lte('created_at', `${currentEnd}T23:59:59`),
        supabase.from('appointments').select('id, status, date, price, service_id, services(name, price)').eq('barbershop_id', barbershop.id).gte('date', previousStart).lte('date', previousEnd),
        supabase.from('product_sales').select('id, product_id, quantity, total_price, payment_status, created_at, products(name)').eq('barbershop_id', barbershop.id).gte('created_at', `${previousStart}T00:00:00`).lte('created_at', `${previousEnd}T23:59:59`),
        supabase.from('subscriptions').select('id, plan_name, price, status, created_at').eq('barbershop_id', barbershop.id).gte('created_at', `${previousStart}T00:00:00`).lte('created_at', `${previousEnd}T23:59:59`),
        supabase.from('barbers').select('id, name, active, commission_percentage').eq('barbershop_id', barbershop.id),
        supabase.from('services').select('id, name, price, active').eq('barbershop_id', barbershop.id)
      ])

      if (!isMountedRef.current) return

      const appts = currentApptsRes.data || []
      const sales = currentSalesRes.data || []
      const subs = currentSubsRes.data || []
      const prevApptsList = previousApptsRes.data || []
      const prevSalesList = previousSalesRes.data || []
      const prevSubsList = previousSubsRes.data || []

      // Helper para calcular faturamento
      const getRevenueFromServices = (list) => list.filter(a => a.status === 'Concluído' || a.status === 'Confirmado').reduce((sum, a) => sum + Number(a.services?.price || 0), 0)
      const getRevenueFromProducts = (list) => list.filter(s => s.status !== 'cancelled').reduce((sum, s) => sum + Number(s.price_at_purchase || 0) * (s.quantity || 1), 0)
      const getRevenueFromPlans = (list) => list.filter(sub => sub.status === 'active').reduce((sum, s) => sum + Number(s.price || 99.90), 0)

      const revenueFromServices = getRevenueFromServices(appts)
      const revenueFromProducts = getRevenueFromProducts(sales)
      const revenueFromPlans = getRevenueFromPlans(subs)

      const prevRevenueFromServices = getRevenueFromServices(prevApptsList)
      const prevRevenueFromProducts = getRevenueFromProducts(prevSalesList)
      const prevRevenueFromPlans = getRevenueFromPlans(prevSubsList)

      const totalApptsCount = appts.filter(a => a.status === 'Concluído' || a.status === 'Confirmado').length
      const prevApptsCount = prevApptsList.filter(a => a.status === 'Concluído' || a.status === 'Confirmado').length

      const totalProductsSold = sales.filter(s => s.status !== 'cancelled').reduce((sum, s) => sum + (s.quantity || 1), 0)
      const prevProductsSold = prevSalesList.filter(s => s.status !== 'cancelled').reduce((sum, s) => sum + (s.quantity || 1), 0)

      const activeSubsCount = subs.filter(sub => sub.status === 'active').length
      const prevActiveSubsCount = prevSubsList.filter(sub => sub.status === 'active').length

      const calcChange = (curr, prev) => {
        if (prev === 0) return curr > 0 ? 100 : 0
        return ((curr - prev) / prev) * 100
      }

      const kpis = {
        revenueServices: { value: revenueFromServices, change: calcChange(revenueFromServices, prevRevenueFromServices), isPositive: revenueFromServices >= prevRevenueFromServices, label: 'Faturamento de Atendimentos' },
        revenuePlans: { value: revenueFromPlans, change: calcChange(revenueFromPlans, prevRevenueFromPlans), isPositive: revenueFromPlans >= prevRevenueFromPlans, label: 'Faturamento de Planos' },
        revenueProducts: { value: revenueFromProducts, change: calcChange(revenueFromProducts, prevRevenueFromProducts), isPositive: revenueFromProducts >= prevRevenueFromProducts, label: 'Faturamento de Produtos' },
        appointments: { value: totalApptsCount, change: calcChange(totalApptsCount, prevApptsCount), isPositive: totalApptsCount >= prevApptsCount, label: 'Atendimentos Realizados' },
        subscriptions: { value: activeSubsCount, change: calcChange(activeSubsCount, prevActiveSubsCount), isPositive: activeSubsCount >= prevActiveSubsCount, label: 'Planos Assinados' },
        productsSold: { value: totalProductsSold, change: calcChange(totalProductsSold, prevProductsSold), isPositive: totalProductsSold >= prevProductsSold, label: 'Produtos Vendidos' }
      }

      const getDatesInRange = (startDateStr, endDateStr) => {
        const dates = []
        let curr = new Date(startDateStr + 'T12:00:00')
        const end = new Date(endDateStr + 'T12:00:00')
        while (curr <= end) {
          dates.push(curr.toISOString().split('T')[0])
          curr.setDate(curr.getDate() + 1)
        }
        return dates
      }

      const datesList = getDatesInRange(currentStart, currentEnd)
      const revenueLabels = datesList.map(d => {
        const parts = d.split('-')
        return `${parts[2]}/${parts[1]}`
      })

      const revenueCurrent = datesList.map(dateStr => {
        const dayAppts = appts.filter(a => a.date === dateStr)
        const daySales = sales.filter(s => s.created_at && s.created_at.startsWith(dateStr))
        const daySubs = subs.filter(sub => sub.created_at && sub.created_at.startsWith(dateStr))
        return getRevenueFromServices(dayAppts) + getRevenueFromProducts(daySales) + getRevenueFromPlans(daySubs)
      })

      const prevDatesList = getDatesInRange(previousStart, previousEnd)
      const revenuePrevious = datesList.map((_, idx) => {
        const prevDateStr = prevDatesList[idx]
        if (!prevDateStr) return 0
        const dayAppts = prevApptsList.filter(a => a.date === prevDateStr)
        const daySales = prevSalesList.filter(s => s.created_at && s.created_at.startsWith(prevDateStr))
        const daySubs = prevSubsList.filter(sub => sub.created_at && sub.created_at.startsWith(prevDateStr))
        return getRevenueFromServices(dayAppts) + getRevenueFromProducts(daySales) + getRevenueFromPlans(daySubs)
      })

      const totalRevenue = revenueFromServices + revenueFromProducts + revenueFromPlans
      const distribution = [
        { name: 'Serviços', value: revenueFromServices, percentage: totalRevenue > 0 ? Math.round((revenueFromServices / totalRevenue) * 100) : 0, color: COLORS.accent },
        { name: 'Produtos', value: revenueFromProducts, percentage: totalRevenue > 0 ? Math.round((revenueFromProducts / totalRevenue) * 100) : 0, color: COLORS.success },
        { name: 'Planos', value: revenueFromPlans, percentage: totalRevenue > 0 ? Math.round((revenueFromPlans / totalRevenue) * 100) : 0, color: COLORS.info }
      ]

      const barberMap = {}
      ;(barbersRes.data || []).forEach(b => {
        barberMap[b.id] = { id: b.id, name: b.name, photo_url: b.photo_url, completedCount: 0, revenue: 0 }
      })

      appts.filter(a => a.status === 'Concluído').forEach(appt => {
        if (barberMap[appt.barber_id]) {
          barberMap[appt.barber_id].completedCount += 1
          barberMap[appt.barber_id].revenue += Number(appt.services?.price || 0)
        }
      })
      const realBarbers = Object.values(barberMap).sort((a, b) => b.revenue - a.revenue)
      const maxBarberRevenue = Math.max(...realBarbers.map(b => b.revenue), 1)
      realBarbers.forEach(b => {
        b.revenuePercentage = Math.round((b.revenue / maxBarberRevenue) * 100)
      })
      if (realBarbers.length > 0) {
        realBarbers[0].isTopPerformer = true
      }

      const productSalesMap = {};
      sales.filter(s => s.status !== 'cancelled').forEach(s => {
        const pName = s.products?.name || 'Produto Não Cadastrado'
        if (!productSalesMap[pName]) {
          productSalesMap[pName] = { name: pName, sold: 0, unitPrice: Number(s.price_at_purchase || 0), revenue: 0 }
        }
        productSalesMap[pName].sold += s.quantity || 1
        productSalesMap[pName].revenue += Number(s.price_at_purchase || 0) * (s.quantity || 1)
      });
      const realProducts = Object.values(productSalesMap).sort((a, b) => b.sold - a.sold)
      const totalProductsCount = realProducts.reduce((sum, p) => sum + p.sold, 0)
      realProducts.forEach(p => {
        p.share = totalProductsCount > 0 ? Math.round((p.sold / totalProductsCount) * 100) : 0
      })

      const planSubsMap = {};
      subs.filter(s => s.status === 'active').forEach(sub => {
        const pName = sub.plan_name || 'Plano Clássico'
        if (!planSubsMap[pName]) {
          planSubsMap[pName] = { name: pName, activeCount: 0, revenue: 0, growth: 0, color: COLORS.accent }
        }
        planSubsMap[pName].activeCount += 1
        planSubsMap[pName].revenue += Number(sub.price || 99.90)
      });
      const realPlans = Object.values(planSubsMap).sort((a, b) => b.revenue - a.revenue)

      if (!isMountedRef.current) return

      setReportData({
        kpis,
        revenueChart: { labels: revenueLabels, current: revenueCurrent, previous: revenuePrevious },
        distribution,
        barbers: realBarbers,
        products: realProducts,
        plans: realPlans
      })
    } catch (err) {
      console.error(err)
    } finally {
      if (isMountedRef.current) {
        setLoading(false)
      }
    }
  }, [barbershop, timeFilter, selectedMonth, selectedYear, startDate, endDate])

  useEffect(() => {
    if (layoutLoading) return
    if (!barbershop) {
      if (isMountedRef.current) setLoading(false)
      const timer = setTimeout(() => {
        if (isMountedRef.current) router.push('/login')
      }, 3000)
      return () => clearTimeout(timer)
    }
    loadRealReportData()
  }, [barbershop, layoutLoading, loadRealReportData, router])

  if (!reportData) return null

  // Estilos baseados no Tema (Escuro / Claro)
  const styles = {
    card: isDark ? 'bg-[#09090b]/50 border-zinc-900/60 backdrop-blur-md' : 'bg-white border-zinc-200/80 shadow-sm',
    border: isDark ? 'border-zinc-900/60' : 'border-zinc-200/80',
    title: isDark ? 'text-zinc-100 font-sans-lux' : 'text-zinc-900 font-sans-lux',
    subtext: isDark ? 'text-zinc-500' : 'text-zinc-400',
    text: isDark ? 'text-zinc-300' : 'text-zinc-700',
    tableHeader: isDark ? 'bg-zinc-950/40 text-zinc-400 border-zinc-900/50' : 'bg-zinc-50/70 text-zinc-500 border-zinc-200/60',
    tableRowHover: isDark ? 'hover:bg-zinc-900/20' : 'hover:bg-zinc-50/50',
    input: isDark ? 'bg-zinc-950/40 border-zinc-900 focus:border-amber-500/80 text-white' : 'bg-white border-zinc-200 focus:border-amber-500/80 text-zinc-800 placeholder-zinc-400 shadow-sm',
    filterButtonActive: 'bg-amber-500 text-black font-bold shadow-[0_0_12px_rgba(245,158,11,0.2)]',
    filterButtonInactive: isDark ? 'bg-zinc-950/40 border-zinc-900 hover:border-zinc-800 text-zinc-400 hover:text-zinc-200' : 'bg-white border-zinc-250 hover:bg-zinc-50 text-zinc-600 hover:text-zinc-900 shadow-sm',
  }

  const kpisList = [
    { key: 'revenueServices', icon: Scissors, isCurrency: true, color: COLORS.accent },
    { key: 'revenuePlans', icon: CreditCard, isCurrency: true, color: COLORS.info },
    { key: 'revenueProducts', icon: Package, isCurrency: true, color: COLORS.success },
    { key: 'appointments', icon: Calendar, isCurrency: false, color: COLORS.accent },
    { key: 'subscriptions', icon: Users, isCurrency: false, color: COLORS.info },
    { key: 'productsSold', icon: ShoppingBag, isCurrency: false, color: COLORS.success }
  ]

  // Métricas auxiliares para gráfico de linha
  const maxRevenueVal = Math.max(...reportData.revenueChart.current, ...reportData.revenueChart.previous)
  const lineChartPoints = reportData.revenueChart.current.length

  // Coordenadas para SVG da Linha (Evolução)
  const getSvgCoordinates = (dataArr, width = 500, height = 180) => {
    const padding = 15
    const leftMargin = 45
    const chartWidth = width - leftMargin
    const chartHeight = height - padding * 2
    return dataArr.map((val, idx) => {
      const divisor = dataArr.length - 1
      const x = divisor > 0 ? leftMargin + (idx / divisor) * chartWidth : leftMargin + chartWidth / 2
      const y = maxRevenueVal > 0
        ? padding + (chartHeight - (val / maxRevenueVal) * chartHeight)
        : padding + chartHeight
      return { x, y }
    })
  }

  const currentPoints = getSvgCoordinates(reportData.revenueChart.current)
  const previousPoints = getSvgCoordinates(reportData.revenueChart.previous)

  const currentPath = currentPoints.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const previousPath = previousPoints.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')

  const currentAreaPath = currentPoints.length > 0 
    ? `${currentPath} L ${currentPoints[currentPoints.length - 1].x} 165 L ${currentPoints[0].x} 165 Z` 
    : ''

  // Valores acumulados do Donut
  const totalDist = reportData.distribution.reduce((acc, curr) => acc + curr.value, 0)
  let accumulatedPercent = 0

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 relative z-10 font-sans-lux">
        
        {/* SEÇÃO 1: CABEÇALHO & FILTROS */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 pb-2 border-b border-zinc-900/50">
          <div>
            <h1 className={`text-xl font-bold tracking-tight ${styles.title} flex items-center gap-2`}>
              <BarChart3 className="text-amber-500" />
              <span>Relatórios e Performance</span>
            </h1>
            <p className={`text-xs ${styles.subtext} mt-1`}>
              Acompanhe de forma inteligente a saúde financeira e o desempenho operacional do seu salão.
            </p>
          </div>

          {/* Filtros Analíticos */}
          <div className="flex flex-wrap items-center gap-3 bg-zinc-950/20 p-2 rounded-2xl border border-zinc-900/50 backdrop-blur">
            <div className="flex rounded-xl overflow-hidden p-0.5 bg-zinc-900/40 border border-zinc-900">
              <button
                onClick={() => setTimeFilter('month')}
                className={`px-3 py-1.5 rounded-lg text-xxs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  timeFilter === 'month' ? styles.filterButtonActive : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                Mês
              </button>
              <button
                onClick={() => setTimeFilter('year')}
                className={`px-3 py-1.5 rounded-lg text-xxs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  timeFilter === 'year' ? styles.filterButtonActive : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                Ano
              </button>
              <button
                onClick={() => setTimeFilter('custom')}
                className={`px-3 py-1.5 rounded-lg text-xxs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  timeFilter === 'custom' ? styles.filterButtonActive : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                Período
              </button>
            </div>

            {/* Sub-Seletores Condicionais */}
            {timeFilter === 'month' && (
              <div className="flex items-center gap-2">
                <div className="relative">
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                    className="appearance-none pl-3 pr-8 py-1.5 bg-zinc-900/60 border border-zinc-900 hover:border-zinc-800 text-xs text-zinc-300 rounded-xl focus:outline-none focus:border-amber-500 cursor-pointer font-bold"
                  >
                    {MONTHS.map((m, idx) => (
                      <option key={idx} value={idx}>{m}</option>
                    ))}
                  </select>
                  <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                </div>

                <div className="relative">
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="appearance-none pl-3 pr-8 py-1.5 bg-zinc-900/60 border border-zinc-900 hover:border-zinc-800 text-xs text-zinc-300 rounded-xl focus:outline-none focus:border-amber-500 cursor-pointer font-bold"
                  >
                    {YEARS.map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                  <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                </div>
              </div>
            )}

            {timeFilter === 'year' && (
              <div className="relative">
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="appearance-none pl-3 pr-8 py-1.5 bg-zinc-900/60 border border-zinc-900 hover:border-zinc-800 text-xs text-zinc-300 rounded-xl focus:outline-none focus:border-amber-500 cursor-pointer font-bold"
                >
                  {YEARS.map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
                <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
              </div>
            )}

            {timeFilter === 'custom' && (
              <div className="flex items-center gap-2 text-xs text-zinc-500 font-bold font-sans">
                <input
                  type="date"
                  value={inputStartDate}
                  onChange={(e) => setInputStartDate(e.target.value)}
                  className="px-2.5 py-1 bg-zinc-900/60 border border-zinc-900 hover:border-zinc-800 rounded-xl text-zinc-300 focus:outline-none focus:border-amber-500 cursor-pointer"
                />
                <span>até</span>
                <input
                  type="date"
                  value={inputEndDate}
                  onChange={(e) => setInputEndDate(e.target.value)}
                  className="px-2.5 py-1 bg-zinc-900/60 border border-zinc-900 hover:border-zinc-800 rounded-xl text-zinc-300 focus:outline-none focus:border-amber-500 cursor-pointer"
                />
              </div>
            )}
          </div>
        </div>

        {/* SEÇÃO 2: CARDS DE KPI (TOP METRICS) */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {kpisList.map((kpiItem, idx) => {
            const data = reportData.kpis[kpiItem.key]
            const Icon = kpiItem.icon
            const isPos = data.change >= 0
            
            return (
              <motion.div
                key={kpiItem.key}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                className={`border rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden group hover:scale-[1.01] transition-all duration-300 ${styles.card}`}
              >
                {/* Efeito Glow Interno */}
                <div 
                  className="absolute -right-6 -bottom-6 w-14 h-14 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ backgroundColor: kpiItem.color }}
                />

                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-extrabold uppercase tracking-widest text-zinc-550 leading-none">
                    {data.label}
                  </span>
                  <div 
                    className="w-7 h-7 rounded-lg flex items-center justify-center border"
                    style={{ 
                      borderColor: `${kpiItem.color}25`, 
                      backgroundColor: `${kpiItem.color}08`, 
                      color: kpiItem.color 
                    }}
                  >
                    <Icon size={13} className="stroke-[2.5px]" />
                  </div>
                </div>

                <div className="mt-3">
                  <h3 className="text-sm font-extrabold text-white font-mono tracking-tight leading-none">
                    {kpiItem.isCurrency ? 'R$ ' : ''}
                    {Number(data.value).toLocaleString('pt-BR', { minimumFractionDigits: kpiItem.isCurrency ? 2 : 0, maximumFractionDigits: kpiItem.isCurrency ? 2 : 0 })}
                  </h3>

                  <div className="flex items-center gap-1 mt-1.5 font-sans leading-none">
                    <span 
                      className={`inline-flex items-center rounded-full text-[9px] font-bold ${
                        isPos ? 'text-emerald-450' : 'text-rose-400'
                      }`}
                    >
                      {isPos ? '+' : ''}{data.change.toFixed(1)}%
                    </span>
                    <span className="text-[8px] text-zinc-550 font-bold uppercase tracking-wider">vs ant.</span>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* SEÇÃO 3: GRÁFICOS PRINCIPAIS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* GRÁFICO 1: EVOLUÇÃO DO FATURAMENTO (ÁREA & LINHA) */}
          <div className={`border rounded-3xl p-5 lg:col-span-2 flex flex-col justify-between gap-4 ${styles.card}`}>
            <div className="flex items-center justify-between border-b border-zinc-900/50 pb-3">
              <div>
                <h3 className={`text-xs font-extrabold uppercase tracking-widest ${styles.title}`}>Evolução do Faturamento</h3>
                <p className="text-[10px] text-zinc-550 mt-0.5">Evolução diária comparada com a receita do período anterior.</p>
              </div>

              {/* Legenda do Gráfico */}
              <div className="flex items-center gap-3 text-[9px] font-bold uppercase tracking-widest text-zinc-400">
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-0.5 bg-amber-500 rounded" />
                  <span>Atual</span>
                </div>
                <div className="flex items-center gap-1 text-zinc-550">
                  <span className="w-2.5 h-0.5 border-t border-dashed border-zinc-650" />
                  <span>Anterior</span>
                </div>
              </div>
            </div>

            {/* SVG Canvas do Gráfico de Linha/Área */}
            <div className="relative h-48 w-full mt-2 select-none">
              <svg viewBox="0 0 500 180" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                <defs>
                  {/* Gradiente da área ativa */}
                  <linearGradient id="areaGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={COLORS.accent} stopOpacity="0.22" />
                    <stop offset="100%" stopColor={COLORS.accent} stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Helper para renderizar valores no eixo vertical */}
                {(() => {
                  const getVerticalLabel = (r) => {
                    const val = maxRevenueVal * (1 - r)
                    return 'R$ ' + Math.round(val).toLocaleString('pt-BR')
                  }
                  return [0, 0.25, 0.5, 0.75, 1].map((r, idx) => {
                    const y = 15 + r * 150
                    return (
                      <g key={idx}>
                        <text 
                          x="5" 
                          y={y + 3} 
                          fill={isDark ? '#71717a' : '#a1a1aa'} 
                          fontSize="7" 
                          fontWeight="bold"
                          className="font-mono"
                        >
                          {getVerticalLabel(r)}
                        </text>
                        <line 
                          x1="45" 
                          y1={y} 
                          x2="500" 
                          y2={y} 
                          stroke={isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.04)'} 
                          strokeWidth="1" 
                        />
                      </g>
                    )
                  })
                })()}

                {/* Linha vertical do eixo Y */}
                <line 
                  x1="45" 
                  y1="15" 
                  x2="45" 
                  y2="165" 
                  stroke={isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'} 
                  strokeWidth="1" 
                />

                {/* Área preenchida com gradiente (Período Atual) */}
                {currentAreaPath && (
                  <path d={currentAreaPath} fill="url(#areaGlow)" />
                )}

                {/* Linha pontilhada do Período Anterior */}
                {previousPath && (
                  <path 
                    d={previousPath} 
                    fill="none" 
                    stroke={isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.18)'} 
                    strokeWidth="1.5" 
                    strokeDasharray="4 4" 
                  />
                )}

                {/* Linha principal do Período Atual */}
                {currentPath && (
                  <path 
                    d={currentPath} 
                    fill="none" 
                    stroke={COLORS.accent} 
                    strokeWidth="2.5" 
                    strokeLinecap="round" 
                  />
                )}

                {/* Marcadores de nós ativos (bolinhas) */}
                {currentPoints.map((p, idx) => {
                  const isHovered = lineChartHoverIndex === idx
                  return (
                    <g key={idx}>
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r={isHovered ? '6' : '3.5'}
                        fill={isHovered ? '#fff' : COLORS.accent}
                        stroke={COLORS.accent}
                        strokeWidth={isHovered ? '3' : '1'}
                        className="transition-all duration-150 cursor-pointer"
                        onMouseEnter={() => setLineChartHoverIndex(idx)}
                        onMouseLeave={() => setLineChartHoverIndex(null)}
                      />
                    </g>
                  )
                })}

                {/* Guia vertical do hover */}
                {lineChartHoverIndex !== null && currentPoints[lineChartHoverIndex] && (
                  <line
                    x1={currentPoints[lineChartHoverIndex].x}
                    y1="15"
                    x2={currentPoints[lineChartHoverIndex].x}
                    y2="165"
                    stroke="rgba(245, 158, 11, 0.3)"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                  />
                )}

                {/* Marcadores do eixo X dentro do SVG para alinhamento perfeito */}
                {reportData.revenueChart.labels.map((label, idx) => {
                  const step = timeFilter === 'year' ? 2 : 4
                  if (idx % step !== 0 && idx !== reportData.revenueChart.labels.length - 1) return null
                  const p = currentPoints[idx]
                  if (!p) return null
                  return (
                    <text
                      key={idx}
                      x={p.x}
                      y="178"
                      textAnchor="middle"
                      fill={isDark ? '#71717a' : '#a1a1aa'} 
                      fontSize="7" 
                      fontWeight="bold"
                      className="font-mono"
                    >
                      {label}
                    </text>
                  )
                })}
              </svg>

              {/* Tooltip Overlay Dinâmico do Gráfico */}
              <AnimatePresence>
                {lineChartHoverIndex !== null && currentPoints[lineChartHoverIndex] && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    style={{
                      position: 'absolute',
                      left: `${(currentPoints[lineChartHoverIndex].x / 500) * 100}%`,
                      top: `${(currentPoints[lineChartHoverIndex].y / 180) * 100 - 32}%`,
                      transform: 'translateX(-50%)',
                    }}
                    className="bg-black/95 border border-zinc-800 text-[10px] px-2.5 py-1.5 rounded-lg shadow-xl text-center pointer-events-none flex flex-col gap-0.5 min-w-[90px] z-50 text-white font-mono"
                  >
                    <span className="text-zinc-500 font-bold uppercase tracking-wider text-[8px]">
                      {reportData.revenueChart.labels[lineChartHoverIndex]}
                    </span>
                    <span className="font-extrabold text-amber-500 leading-none">
                      R$ {reportData.revenueChart.current[lineChartHoverIndex].toFixed(2)}
                    </span>
                    <span className="text-zinc-500 font-light text-[8px]">
                      Ant: R$ {reportData.revenueChart.previous[lineChartHoverIndex].toFixed(2)}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* GRÁFICO 2: DISTRIBUIÇÃO DE RECEITA (DONUT) */}
          <div className={`border rounded-3xl p-5 flex flex-col justify-between gap-4 ${styles.card}`}>
            <div className="border-b border-zinc-900/50 pb-3">
              <h3 className={`text-xs font-extrabold uppercase tracking-widest ${styles.title}`}>Distribuição de Receita</h3>
              <p className="text-[10px] text-zinc-550 mt-0.5">Partic. de serviços, produtos e mensalidades na receita total.</p>
            </div>

            {/* SVG Donut Canvas */}
            <div className="relative h-36 flex items-center justify-center mt-2">
              <svg width="140" height="140" viewBox="0 0 120 120" className="transform -rotate-90 select-none">
                {/* Donut segments loops */}
                {totalDist === 0 && (
                  <circle
                    cx="60"
                    cy="60"
                    r="40"
                    fill="transparent"
                    stroke={isDark ? '#1f1f23' : '#e4e4e7'}
                    strokeWidth="9"
                  />
                )}
                {totalDist > 0 && reportData.distribution.map((item, idx) => {
                  const radius = 40
                  const circumference = 2 * Math.PI * radius // ~251.32
                  const dashArrayValue = (item.percentage / 100) * circumference
                  const dashOffsetValue = circumference - (accumulatedPercent / 100) * circumference
                  accumulatedPercent += item.percentage

                  const isHovered = donutHoverIndex === idx

                  return (
                    <circle
                      key={idx}
                      cx="60"
                      cy="60"
                      r={radius}
                      fill="transparent"
                      stroke={item.color}
                      strokeWidth={isHovered ? '13' : '9'}
                      strokeDasharray={`${dashArrayValue} ${circumference}`}
                      strokeDashoffset={dashOffsetValue}
                      strokeLinecap="round"
                      className="transition-all duration-200 cursor-pointer"
                      style={{
                        opacity: donutHoverIndex !== null && !isHovered ? 0.35 : 1
                      }}
                      onMouseEnter={() => setDonutHoverIndex(idx)}
                      onMouseLeave={() => setDonutHoverIndex(null)}
                    />
                  )
                })}
              </svg>

              {/* Informação no Centro do Donut */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[8px] font-extrabold uppercase tracking-widest text-zinc-500 leading-none">
                  {donutHoverIndex !== null ? reportData.distribution[donutHoverIndex].name : 'Receita Total'}
                </span>
                <span className="text-xs font-extrabold text-white font-mono mt-1 leading-none">
                  {donutHoverIndex !== null 
                    ? `${reportData.distribution[donutHoverIndex].percentage}%` 
                    : `R$ ${totalDist.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`
                  }
                </span>
                {donutHoverIndex !== null && (
                  <span className="text-[8px] font-mono text-zinc-500 mt-1 leading-none">
                    R$ {reportData.distribution[donutHoverIndex].value.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                  </span>
                )}
              </div>
            </div>

            {/* Legenda/Tabela Lateral */}
            <div className="flex flex-col gap-2 pt-2 border-t border-zinc-900/30">
              {reportData.distribution.map((item, idx) => (
                <div 
                  key={idx} 
                  className={`flex items-center justify-between text-xs py-0.5 px-2 rounded-xl transition-all ${
                    donutHoverIndex === idx ? 'bg-zinc-950/40 text-white' : 'text-zinc-400'
                  }`}
                  onMouseEnter={() => setDonutHoverIndex(idx)}
                  onMouseLeave={() => setDonutHoverIndex(null)}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="font-medium">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-[10px]">
                    <span className="text-zinc-500">R$ {Number(item.value).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</span>
                    <span className="font-extrabold text-white">{item.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* SEÇÃO 4: GRÁFICOS DE DESEMPENHO DE BARBEIROS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* GRÁFICO 3: ATENDIMENTOS POR BARBEIRO (BARRAS VERTICAIS) */}
          <div className={`border rounded-3xl p-5 flex flex-col justify-between gap-4 ${styles.card}`}>
            <div className="border-b border-zinc-900/50 pb-3">
              <h3 className={`text-xs font-extrabold uppercase tracking-widest ${styles.title}`}>Atendimentos por Barbeiro</h3>
              <p className="text-[10px] text-zinc-550 mt-0.5">Performance quantitativa de serviços executados por profissional.</p>
            </div>

            <div className="relative h-44 flex items-end justify-between px-2 pt-4 select-none">
              {/* Gridlines horizontais de fundo */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none z-0 pb-1">
                {[0, 1, 2, 3].map(i => (
                  <div key={i} className="w-full border-t border-zinc-900/30" />
                ))}
              </div>

              {/* Loop das Barras */}
              {reportData.barbers.map((barber, idx) => {
                const maxVal = Math.max(...reportData.barbers.map(b => b.appointments))
                const barHeight = (barber.appointments / maxVal) * 100 // % do container

                return (
                  <div key={idx} className="flex flex-col items-center gap-2 w-12 relative z-10 group">
                    {/* Tooltip Hover no Bar */}
                    <div className="absolute -top-7 scale-0 group-hover:scale-100 transition-transform duration-150 bg-black/95 border border-zinc-800 text-[9px] font-mono font-bold text-amber-500 px-2 py-0.5 rounded-lg shadow-xl z-20 whitespace-nowrap">
                      {barber.appointments} cortes
                    </div>

                    {/* Barra Animada */}
                    <div className="w-7 bg-zinc-950/60 rounded-t-xl overflow-hidden h-32 flex items-end border border-zinc-900">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${barHeight}%` }}
                        transition={{ duration: 0.8, delay: idx * 0.05 }}
                        className="w-full bg-gradient-to-t from-amber-600 via-amber-500 to-yellow-500 hover:opacity-90 transition-opacity rounded-t-[10px]"
                      />
                    </div>

                    {/* Nome Abreviado */}
                    <span className="text-[9px] font-bold text-zinc-450 truncate w-full text-center">
                      {barber.name.split(' ')[0]}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* GRÁFICO 4: COMISSÕES POR BARBEIRO (BARRAS HORIZONTAIS) */}
          <div className={`border rounded-3xl p-5 flex flex-col justify-between gap-4 ${styles.card}`}>
            <div className="border-b border-zinc-900/50 pb-3">
              <h3 className={`text-xs font-extrabold uppercase tracking-widest ${styles.title}`}>Comissões Recebidas por Barbeiro</h3>
              <p className="text-[10px] text-zinc-550 mt-0.5">Distribuição financeira e valores repassados a cada barbeiro.</p>
            </div>

            <div className="flex flex-col gap-4 py-2">
              {reportData.barbers.map((barber, idx) => {
                const maxVal = Math.max(...reportData.barbers.map(b => b.commissionValue))
                const barWidth = (barber.commissionValue / maxVal) * 100

                return (
                  <div key={idx} className="flex flex-col gap-1.5 font-sans">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-white">{barber.name}</span>
                      <span className="font-mono text-[11px] text-amber-500 font-extrabold">
                        R$ {Number(barber.commissionValue).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    {/* Barra Horizontal */}
                    <div className="h-2.5 bg-zinc-950/80 border border-zinc-900 rounded-full overflow-hidden flex items-center">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${barWidth}%` }}
                        transition={{ duration: 0.8, delay: idx * 0.05 }}
                        className="h-full bg-gradient-to-r from-amber-600 to-yellow-500 rounded-full"
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

        </div>

        {/* SEÇÃO 5: TABELA "DESEMPENHO DOS BARBEIROS" */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Award className="text-amber-500" />
            <h2 className={`text-sm font-extrabold uppercase tracking-widest ${styles.title}`}>Desempenho Geral da Equipe</h2>
          </div>

          <div className={`border rounded-3xl overflow-hidden ${styles.card}`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className={`border-b text-[9px] font-bold uppercase tracking-wider ${styles.tableHeader}`}>
                    <th className="p-4 text-center w-14">Rank</th>
                    <th className="p-4">Profissional</th>
                    <th className="p-4 text-center">Atendimentos</th>
                    <th className="p-4 text-right">Faturamento Gerado</th>
                    <th className="p-4 text-center">Comissão %</th>
                    <th className="p-4 text-right">Comissão R$</th>
                    <th className="p-4 text-right">Ticket Médio</th>
                    <th className="p-4 text-center">Destaque</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900/50">
                  {reportData.barbers.map((barber) => (
                    <tr key={barber.ranking} className={`text-xs transition-colors ${styles.tableRowHover}`}>
                      
                      {/* Ranking */}
                      <td className="p-4 text-center font-mono font-extrabold text-zinc-400">
                        {barber.ranking === 1 ? (
                          <span className="text-amber-500 flex items-center justify-center font-extrabold">🏆 1º</span>
                        ) : (
                          <span>{barber.ranking}º</span>
                        )}
                      </td>

                      {/* Profissional */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-zinc-900 border border-zinc-800 overflow-hidden flex-shrink-0">
                            <img src={barber.photo} alt={barber.name} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <p className="font-bold text-white leading-none">{barber.name}</p>
                            <p className="text-[9px] text-zinc-550 uppercase tracking-wider mt-1">Estilista Senior</p>
                          </div>
                        </div>
                      </td>

                      {/* Atendimentos */}
                      <td className="p-4 text-center font-mono font-medium text-white">{barber.appointments}</td>

                      {/* Faturamento Gerado */}
                      <td className="p-4 text-right font-bold text-white">
                        R$ {Number(barber.revenue).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>

                      {/* Comissão % */}
                      <td className="p-4 text-center font-bold text-zinc-400 font-mono">{barber.commissionPercent}%</td>

                      {/* Comissão R$ */}
                      <td className="p-4 text-right font-extrabold text-amber-500 font-mono">
                        R$ {Number(barber.commissionValue).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>

                      {/* Ticket Médio */}
                      <td className="p-4 text-right font-medium text-white">
                        R$ {Number(barber.ticket).toFixed(2)}
                      </td>

                      {/* Destaque */}
                      <td className="p-4 text-center">
                        {barber.ranking === 1 ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[9px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-500 border-amber-500/20">
                            <Sparkles size={10} className="fill-amber-500 text-amber-500 animate-pulse" />
                            <span>Top Performance</span>
                          </span>
                        ) : (
                          <span className="text-[10px] text-zinc-650 italic">-</span>
                        )}
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* SEÇÃO 6: DETALHES DE PRODUTOS & PLANOS (DUAL COLUMNS) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* COLUNA A: RELATÓRIO DE VENDAS DE PRODUTOS */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <ShoppingBag className="text-amber-500" />
              <h3 className={`text-sm font-extrabold uppercase tracking-widest ${styles.title}`}>Vendas de Produtos</h3>
            </div>

            <div className={`border rounded-3xl p-5 flex flex-col justify-between gap-4 ${styles.card}`}>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className={`border-b text-[9px] font-bold uppercase tracking-wider ${styles.tableHeader}`}>
                      <th className="pb-3 pt-1 pl-2">Produto</th>
                      <th className="pb-3 pt-1 text-center">Qtd.</th>
                      <th className="pb-3 pt-1 text-right">Preço Unit.</th>
                      <th className="pb-3 pt-1 text-right">Receita Total</th>
                      <th className="pb-3 pt-1 text-right pr-2">Share</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900/30">
                    {reportData.products.map((p, idx) => (
                      <tr key={idx} className="text-xs">
                        <td className="py-2.5 pl-2 font-bold text-white truncate max-w-[150px]">{p.name}</td>
                        <td className="py-2.5 text-center font-mono font-medium text-white">{p.sold}</td>
                        <td className="py-2.5 text-right text-zinc-400">R$ {p.unitPrice.toFixed(2)}</td>
                        <td className="py-2.5 text-right font-extrabold text-white">R$ {Number(p.revenue).toFixed(2)}</td>
                        <td className="py-2.5 text-right pr-2 font-bold text-emerald-450">{p.share}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* COLUNA B: CLUBES & PLANOS ASSINADOS */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <CreditCard className="text-amber-500" />
              <h3 className={`text-sm font-extrabold uppercase tracking-widest ${styles.title}`}>Planos & Assinaturas</h3>
            </div>

            <div className={`border rounded-3xl p-5 flex flex-col justify-between gap-4 ${styles.card}`}>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className={`border-b text-[9px] font-bold uppercase tracking-wider ${styles.tableHeader}`}>
                      <th className="pb-3 pt-1 pl-2">Nome do Plano</th>
                      <th className="pb-3 pt-1 text-center">Assinaturas Ativas</th>
                      <th className="pb-3 pt-1 text-right">Faturamento Recorrente</th>
                      <th className="pb-3 pt-1 text-right pr-2">Cresc. MoM</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900/30">
                    {reportData.plans.map((plan, idx) => (
                      <tr key={idx} className="text-xs">
                        <td className="py-2.5 pl-2 font-bold text-white flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: plan.color }} />
                          <span>{plan.name}</span>
                        </td>
                        <td className="py-2.5 text-center font-mono font-medium text-white">{plan.activeCount}</td>
                        <td className="py-2.5 text-right font-extrabold text-white">R$ {Number(plan.revenue).toFixed(2)}</td>
                        <td className="py-2.5 text-right pr-2 font-bold text-emerald-450 flex items-center justify-end gap-1">
                          <ArrowUpRight size={12} className="stroke-[2.5px]" />
                          <span>+{plan.growth}%</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>

      </div>
    </DashboardLayout>
  )
}
