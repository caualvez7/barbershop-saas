'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase.js'
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

  const { barbershop } = useDashboard()
  const [loading, setLoading] = useState(true)

  // Estados dos Filtros
  const [timeFilter, setTimeFilter] = useState('month') // 'month' | 'year' | 'custom'
  const [selectedMonth, setSelectedMonth] = useState(5) // Junho (0-indexed: 5)
  const [selectedYear, setSelectedYear] = useState('2026')
  const [startDate, setStartDate] = useState('2026-06-01')
  const [endDate, setEndDate] = useState('2026-06-30')

  // Dados Ativos (Gerados/Simulados com base nos filtros)
  const [reportData, setReportData] = useState(null)
  
  // Estado para Tooltips dos Gráficos
  const [lineChartHoverIndex, setLineChartHoverIndex] = useState(null)
  const [donutHoverIndex, setDonutHoverIndex] = useState(null)

  // Função para gerar dados analíticos simulados dependendo dos filtros selecionados
  const generateData = () => {
    // Semente simples baseada nos valores dos filtros para manter os dados reprodutíveis ao alternar
    let seed = 1
    if (timeFilter === 'month') {
      seed = (selectedMonth + 1) * (selectedYear === '2026' ? 1.5 : 1)
    } else if (timeFilter === 'year') {
      seed = selectedYear === '2026' ? 15.0 : 10.0
    } else {
      const startMs = new Date(startDate).getTime()
      const endMs = new Date(endDate).getTime()
      const diffDays = Math.max(1, Math.round((endMs - startMs) / (1000 * 60 * 60 * 24)))
      seed = (diffDays / 30) * 1.2
    }

    // Fator multiplicador de variação
    const mul = (val) => Math.round(val * seed * 100) / 100
    const mulInt = (val) => Math.round(val * seed)

    // 1. CARDS DE KPI (Valores Base para Junho de 2026 com seed = 1.5 aprox)
    const kpis = {
      revenue: {
        value: mul(32613.33),
        change: 12.4,
        isPositive: true,
        label: 'Faturamento Total'
      },
      appointments: {
        value: mulInt(561),
        change: 8.5,
        isPositive: true,
        label: 'Total Atendimentos'
      },
      ticket: {
        value: mul(58.13),
        change: 3.6,
        isPositive: true,
        label: 'Ticket Médio'
      },
      productsSold: {
        value: mulInt(104),
        change: 18.2,
        isPositive: true,
        label: 'Produtos Vendidos'
      },
      commissions: {
        value: mul(9784.00),
        change: 10.5,
        isPositive: true,
        label: 'Comissões Pagas'
      },
      subscriptions: {
        value: mulInt(32),
        change: 15.0,
        isPositive: true,
        label: 'Novos Assinantes'
      }
    }

    // 2. EVOLUÇÃO DE FATURAMENTO (Gráfico de Linha/Área)
    // Gerar 10 pontos de dados ao longo do período
    const revenueLabels = []
    const revenueCurrent = []
    const revenuePrevious = []

    if (timeFilter === 'year') {
      // Por meses
      MONTHS.forEach((m, idx) => {
        revenueLabels.push(m.slice(0, 3))
        revenueCurrent.push(mul(3000 + Math.sin(idx) * 1200 + idx * 300))
        revenuePrevious.push(mul(2500 + Math.sin(idx) * 1000 + idx * 200))
      })
    } else {
      // Por dias/semanas
      const totalPoints = 12
      for (let i = 1; i <= totalPoints; i++) {
        revenueLabels.push(`Dia ${Math.round((i / totalPoints) * 30)}`)
        revenueCurrent.push(mul(800 + Math.sin(i * 1.5) * 450 + (i % 3 === 0 ? 300 : 0)))
        revenuePrevious.push(mul(700 + Math.sin(i * 1.5) * 350))
      }
    }

    // 3. DISTRIBUIÇÃO DE RECEITA (Donut)
    const distribution = [
      { name: 'Serviços', value: mul(21200.00), percentage: 65, color: COLORS.accent },
      { name: 'Produtos', value: mul(6520.00), percentage: 20, color: COLORS.success },
      { name: 'Planos', value: mul(4893.33), percentage: 15, color: COLORS.info }
    ]

    // 4. ATENDIMENTOS E COMISSÕES POR BARBEIRO
    const barbers = [
      {
        name: 'Carlinhos Visagista',
        photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
        appointments: mulInt(140),
        revenue: mul(8120.00),
        commissionPercent: 40,
        commissionValue: mul(3248.00),
        ticket: mul(58.00),
        ranking: 1,
        isTopPerformer: true
      },
      {
        name: 'Luana Andrade',
        photo: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=200&auto=format&fit=crop',
        appointments: mulInt(130),
        revenue: mul(7800.00),
        commissionPercent: 45,
        commissionValue: mul(3510.00),
        ticket: mul(60.00),
        ranking: 2,
        isTopPerformer: false
      },
      {
        name: 'Felipe Silva',
        photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
        appointments: mulInt(120),
        revenue: mul(6600.00),
        commissionPercent: 35,
        commissionValue: mul(2310.00),
        ticket: mul(55.00),
        ranking: 3,
        isTopPerformer: false
      },
      {
        name: 'Mateus Costa',
        photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop',
        appointments: mulInt(105),
        revenue: mul(6090.00),
        commissionPercent: 35,
        commissionValue: mul(2131.50),
        ticket: mul(58.00),
        ranking: 4,
        isTopPerformer: false
      },
      {
        name: 'Thiago Ramos',
        photo: 'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?q=80&w=200&auto=format&fit=crop',
        appointments: mulInt(66),
        revenue: mul(4003.33),
        commissionPercent: 30,
        commissionValue: mul(1201.00),
        ticket: mul(60.65),
        ranking: 5,
        isTopPerformer: false
      }
    ]

    // 5. RELATÓRIO DE VENDAS DE PRODUTOS
    const products = [
      { name: 'Pomada Matte Modeladora Strong', sold: mulInt(38), unitPrice: 79.90, revenue: mul(3036.20), share: 46.5 },
      { name: 'Shampoo Carbon Cabelo & Barba', sold: mulInt(30), unitPrice: 59.90, revenue: mul(1797.00), share: 27.5 },
      { name: 'Condicionador Hidratante Silk', sold: mulInt(22), unitPrice: 49.90, revenue: mul(1097.80), share: 16.8 },
      { name: 'Óleo de Barba Maciez Suprema', sold: mulInt(14), unitPrice: 39.90, revenue: mul(558.60), share: 8.6 }
    ]

    // 6. PLANOS ASSINADOS
    const plans = [
      { name: 'Clube Gold VIP', activeCount: mulInt(18), revenue: mul(2160.00), growth: 15.4, color: COLORS.accent },
      { name: 'Clube Standard', activeCount: mulInt(10), revenue: mul(800.00), growth: 8.2, color: COLORS.success },
      { name: 'Clube Premium Beard', activeCount: mulInt(4), revenue: mul(600.00), growth: 20.0, color: COLORS.info }
    ]

    setReportData({
      kpis,
      revenueChart: {
        labels: revenueLabels,
        current: revenueCurrent,
        previous: revenuePrevious
      },
      distribution,
      barbers,
      products,
      plans
    })
  }

  // Função para carregar dados reais e consolidar estatísticas
  const loadRealReportData = async () => {
    if (!barbershop) return
    try {
      setLoading(true)
      let startStr = ''
      let endStr = ''
      if (timeFilter === 'month') {
        const year = selectedYear
        const month = String(selectedMonth + 1).padStart(2, '0')
        startStr = `${year}-${month}-01`
        endStr = `${year}-${month}-31`
      } else if (timeFilter === 'year') {
        startStr = `${selectedYear}-01-01`
        endStr = `${selectedYear}-12-31`
      } else {
        startStr = startDate
        endStr = endDate
      }

      // 1. Buscar Agendamentos
      const { data: appts } = await supabase
        .from('appointments')
        .select('*, services(name, price), barbers(name, photo_url)')
        .eq('barbershop_id', barbershop.id)
        .gte('date', startStr)
        .lte('date', endStr)

      // 2. Buscar Vendas de Produtos
      const { data: sales } = await supabase
        .from('product_sales')
        .select('*, products(name, brand, price)')
        .eq('barbershop_id', barbershop.id)
        .gte('created_at', `${startStr}T00:00:00`)
        .lte('created_at', `${endStr}T23:59:59`)

      // 3. Buscar Assinaturas de Planos
      const { data: subs } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('barbershop_id', barbershop.id)
        .gte('created_at', `${startStr}T00:00:00`)
        .lte('created_at', `${endStr}T23:59:59`)

      // 4. Buscar barbeiros e serviços
      const [barbersRes, servicesRes] = await Promise.all([
        supabase.from('barbers').select('*').eq('barbershop_id', barbershop.id),
        supabase.from('services').select('*').eq('barbershop_id', barbershop.id)
      ])

      const totalRealRecords = (appts?.length || 0) + (sales?.length || 0) + (subs?.length || 0)
      if (totalRealRecords === 0) {
        generateData()
        return
      }

      // Se houver dados reais, calculamos:
      const revenueFromServices = (appts || [])
        .filter(a => a.status === 'Concluído' || a.status === 'Confirmado')
        .reduce((sum, a) => sum + Number(a.services?.price || 0), 0)
        
      const revenueFromProducts = (sales || [])
        .reduce((sum, s) => sum + Number(s.price_at_purchase || 0) * (s.quantity || 1), 0)
        
      const revenueFromPlans = (subs || [])
        .filter(sub => sub.status === 'active')
        .reduce((sum, s) => sum + Number(s.price || 99.90), 0)

      const totalRevenue = revenueFromServices + revenueFromProducts + revenueFromPlans
      const totalApptsCount = appts?.length || 0
      const avgTicket = totalApptsCount > 0 ? (revenueFromServices / totalApptsCount) : 0
      const totalProductsSold = (sales || []).reduce((sum, s) => sum + (s.quantity || 1), 0)
      const totalCommissions = (appts || [])
        .filter(a => a.status === 'Concluído')
        .reduce((sum, a) => {
          const commPercent = 35
          return sum + (Number(a.services?.price || 0) * commPercent) / 100
        }, 0)
      const newSubsCount = subs?.length || 0

      const kpis = {
        revenue: { value: totalRevenue, change: 12.4, isPositive: true, label: 'Faturamento Total' },
        appointments: { value: totalApptsCount, change: 8.5, isPositive: true, label: 'Total Atendimentos' },
        ticket: { value: avgTicket, change: 3.6, isPositive: true, label: 'Ticket Médio' },
        productsSold: { value: totalProductsSold, change: 18.2, isPositive: true, label: 'Produtos Vendidos' },
        commissions: { value: totalCommissions, change: 10.5, isPositive: true, label: 'Comissões Pagas' },
        subscriptions: { value: newSubsCount, change: 15.0, isPositive: true, label: 'Novos Assinantes' }
      }

      // Gráfico de linha
      const revenueLabels = []
      const revenueCurrent = []
      const revenuePrevious = []

      if (timeFilter === 'year') {
        MONTHS.forEach((m, idx) => {
          revenueLabels.push(m.slice(0, 3))
          const monthAppts = (appts || []).filter(a => {
            const d = new Date(a.date + 'T12:00:00')
            return d.getMonth() === idx && (a.status === 'Concluído' || a.status === 'Confirmado')
          })
          const monthSales = (sales || []).filter(s => {
            const d = new Date(s.created_at)
            return d.getMonth() === idx
          })
          const mRev = monthAppts.reduce((sum, a) => sum + Number(a.services?.price || 0), 0) +
                       monthSales.reduce((sum, s) => sum + Number(s.price_at_purchase || 0) * (s.quantity || 1), 0)
          revenueCurrent.push(mRev)
          revenuePrevious.push(mRev * 0.85)
        })
      } else {
        const daysCount = timeFilter === 'month' ? 30 : 12
        for (let i = 1; i <= daysCount; i++) {
          revenueLabels.push(`Dia ${i}`)
          const dayAppts = (appts || []).filter(a => {
            const dayNum = parseInt(a.date.split('-')[2])
            return dayNum === i && (a.status === 'Concluído' || a.status === 'Confirmado')
          })
          const daySales = (sales || []).filter(s => {
            const dayNum = new Date(s.created_at).getDate()
            return dayNum === i
          })
          const dRev = dayAppts.reduce((sum, a) => sum + Number(a.services?.price || 0), 0) +
                       daySales.reduce((sum, s) => sum + Number(s.price_at_purchase || 0) * (s.quantity || 1), 0)
          revenueCurrent.push(dRev)
          revenuePrevious.push(dRev * 0.85)
        }
      }

      const distribution = [
        { name: 'Serviços', value: revenueFromServices, percentage: totalRevenue > 0 ? Math.round((revenueFromServices / totalRevenue) * 100) : 0, color: COLORS.accent },
        { name: 'Produtos', value: revenueFromProducts, percentage: totalRevenue > 0 ? Math.round((revenueFromProducts / totalRevenue) * 100) : 0, color: COLORS.success },
        { name: 'Planos', value: revenueFromPlans, percentage: totalRevenue > 0 ? Math.round((revenueFromPlans / totalRevenue) * 100) : 0, color: COLORS.info }
      ]

      const realBarbers = (barbersRes.data || []).map((barber, idx) => {
        const barberAppts = (appts || []).filter(a => a.barber_id === barber.id)
        const completedAppts = barberAppts.filter(a => a.status === 'Concluído')
        const bRev = completedAppts.reduce((sum, a) => sum + Number(a.services?.price || 0), 0)
        const bComm = (bRev * (barber.commission || 35)) / 100
        const bTicket = completedAppts.length > 0 ? (bRev / completedAppts.length) : 0

        return {
          name: barber.name,
          photo: barber.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
          appointments: completedAppts.length,
          revenue: bRev,
          commissionPercent: barber.commission || 35,
          commissionValue: bComm,
          ticket: bTicket,
          ranking: idx + 1,
          isTopPerformer: false
        }
      })

      realBarbers.sort((a, b) => b.revenue - a.revenue)
      if (realBarbers.length > 0) {
        realBarbers[0].isTopPerformer = true
      }

      const productSalesMap = {}
      (sales || []).forEach(s => {
        const pName = s.products?.name || 'Produto Não Cadastrado'
        if (!productSalesMap[pName]) {
          productSalesMap[pName] = { name: pName, sold: 0, unitPrice: Number(s.price_at_purchase || 0), revenue: 0 }
        }
        productSalesMap[pName].sold += s.quantity || 1
        productSalesMap[pName].revenue += Number(s.price_at_purchase || 0) * (s.quantity || 1)
      })
      const realProducts = Object.values(productSalesMap).sort((a, b) => b.sold - a.sold)

      const planSubsMap = {}
      (subs || []).forEach(sub => {
        const pName = sub.plan_name || 'Plano Clássico'
        if (!planSubsMap[pName]) {
          planSubsMap[pName] = { name: pName, activeCount: 0, revenue: 0, growth: 0, color: COLORS.accent }
        }
        planSubsMap[pName].activeCount += 1
        planSubsMap[pName].revenue += Number(sub.price || 99.90)
      })
      const realPlans = Object.values(planSubsMap).sort((a, b) => b.revenue - a.revenue)

      setReportData({
        kpis,
        revenueChart: {
          labels: revenueLabels,
          current: revenueCurrent,
          previous: revenuePrevious
        },
        distribution,
        barbers: realBarbers.length > 0 ? realBarbers : (reportData?.barbers || []),
        products: realProducts.length > 0 ? realProducts : (reportData?.products || []),
        plans: realPlans.length > 0 ? realPlans : (reportData?.plans || [])
      })
    } catch (err) {
      console.error('Erro no processamento do relatório real:', err)
      generateData()
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRealReportData()
  }, [barbershop, timeFilter, selectedMonth, selectedYear, startDate, endDate])

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
    { key: 'revenue', icon: DollarSign, isCurrency: true, color: COLORS.accent },
    { key: 'appointments', icon: Scissors, isCurrency: false, color: COLORS.info },
    { key: 'ticket', icon: TrendingUp, isCurrency: true, color: COLORS.success },
    { key: 'productsSold', icon: Package, isCurrency: false, color: COLORS.accent },
    { key: 'commissions', icon: Award, isCurrency: true, color: COLORS.danger },
    { key: 'subscriptions', icon: CreditCard, isCurrency: false, color: COLORS.info }
  ]

  // Métricas auxiliares para gráfico de linha
  const maxRevenueVal = Math.max(...reportData.revenueChart.current, ...reportData.revenueChart.previous)
  const lineChartPoints = reportData.revenueChart.current.length

  // Coordenadas para SVG da Linha (Evolução)
  const getSvgCoordinates = (dataArr, width = 500, height = 180) => {
    const padding = 15
    const chartHeight = height - padding * 2
    return dataArr.map((val, idx) => {
      const x = (idx / (dataArr.length - 1)) * width
      const y = padding + (chartHeight - (val / maxRevenueVal) * chartHeight)
      return { x, y }
    })
  }

  const currentPoints = getSvgCoordinates(reportData.revenueChart.current)
  const previousPoints = getSvgCoordinates(reportData.revenueChart.previous)

  const currentPath = currentPoints.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const previousPath = previousPoints.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')

  const currentAreaPath = currentPoints.length > 0 
    ? `${currentPath} L ${currentPoints[currentPoints.length - 1].x} 180 L ${currentPoints[0].x} 180 Z` 
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
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-2.5 py-1 bg-zinc-900/60 border border-zinc-900 hover:border-zinc-800 rounded-xl text-zinc-300 focus:outline-none focus:border-amber-500 cursor-pointer"
                />
                <span>até</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
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

                {/* Gridlines horizontais */}
                {[0, 0.25, 0.5, 0.75, 1].map((r, idx) => {
                  const y = 15 + r * 150
                  return (
                    <line 
                      key={idx} 
                      x1="0" 
                      y1={y} 
                      x2="500" 
                      y2={y} 
                      stroke={isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.04)'} 
                      strokeWidth="1" 
                    />
                  )
                })}

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
                    y1="0"
                    x2={currentPoints[lineChartHoverIndex].x}
                    y2="180"
                    stroke="rgba(245, 158, 11, 0.3)"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                  />
                )}
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

            {/* Marcadores do eixo X */}
            <div className="flex justify-between px-2 pt-2 border-t border-zinc-900/30 text-[9px] font-bold text-zinc-500 uppercase tracking-widest">
              {reportData.revenueChart.labels.filter((_, idx) => idx % (timeFilter === 'year' ? 2 : 3) === 0).map((label, idx) => (
                <span key={idx}>{label}</span>
              ))}
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
                {reportData.distribution.map((item, idx) => {
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
