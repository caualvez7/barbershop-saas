'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabaseCustomer as supabase } from '../../../../lib/supabase-customer.js'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Sparkles, 
  Scissors, 
  Check, 
  ArrowRight, 
  Calendar,
  MapPin,
  Phone,
  Clock,
  LogOut,
  User,
  ShieldCheck,
  Star,
  Info,
  ShoppingBag,
  CreditCard,
  QrCode,
  Copy,
  CheckCircle2,
  XCircle,
  Loader2
} from 'lucide-react'
import ThreeBackground from '../../../components/ThreeBackground'
import '../client-landing.css'

function generateSlots(openTime, closeTime) {
  const slots = []
  const [openH, openM] = openTime.split(':').map(Number)
  const [closeH, closeM] = closeTime.split(':').map(Number)
  let current = openH * 60 + openM
  const end = closeH * 60 + closeM
  while (current < end) {
    const h = String(Math.floor(current / 60)).padStart(2, '0')
    const m = String(current % 60).padStart(2, '0')
    slots.push(`${h}:${m}`)
    current += 30
  }
  return slots
}

function getNext7Days(businessHours) {
  const days = []
  const today = new Date()
  let checked = 0
  let offset = 0
  while (days.length < 7 && checked < 30) {
    const date = new Date(today)
    date.setDate(today.getDate() + offset)
    const dayOfWeek = date.getDay()
    const hours = businessHours.find(h => h.day_of_week === dayOfWeek)
    if (hours?.is_open) {
      days.push({
        date,
        dateStr: date.toISOString().split('T')[0],
        label: date.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' }),
        open_time: hours.open_time,
        close_time: hours.close_time,
      })
    }
    offset++
    checked++
  }
  return days
}

export default function SchedulingPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params?.slug

  const [shop, setShop] = useState(null)
  const [customer, setCustomer] = useState(null)
  const [services, setServices] = useState([])
  const [barbers, setBarbers] = useState([])
  const [plans, setPlans] = useState([])
  const [subscription, setSubscription] = useState(null)
  const [businessHours, setBusinessHours] = useState([])
  const [bookedSlots, setBookedSlots] = useState([])
  const [loading, setLoading] = useState(true)

  // seleções
  const [selectedBarber, setSelectedBarber] = useState(null)
  const [selectedService, setSelectedService] = useState(null)
  const [selectedDay, setSelectedDay] = useState(null)
  const [selectedTime, setSelectedTime] = useState(null)

  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  // modal plano
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [savingPlan, setSavingPlan] = useState(null)

  // Módulo de Produtos
  const [products, setProducts] = useState([])
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [purchaseQuantity, setPurchaseQuantity] = useState(1)
  const [purchaseSaving, setPurchaseSaving] = useState(false)
  const [purchaseSuccess, setPurchaseSuccess] = useState(false)
  const [purchaseError, setPurchaseError] = useState('')

  // Novos estados para abas e gateway de pagamentos
  const [activeTab, setActiveTab] = useState('scheduling') // 'scheduling' | 'orders'
  const [customerOrders, setCustomerOrders] = useState([])
  const [mockLocalOrders, setMockLocalOrders] = useState([])
  const [purchasePaymentMethod, setPurchasePaymentMethod] = useState('online') // 'online' | 'pickup'
  const [checkoutStep, setCheckoutStep] = useState('select_method') // 'select_method' | 'online_form' | 'online_processing' | 'success'
  const [onlinePaymentType, setOnlinePaymentType] = useState('credit_card') // 'credit_card' | 'pix'
  const [cardName, setCardName] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvv, setCardCvv] = useState('')
  const [pixCopied, setPixCopied] = useState(false)
  const [currentYear, setCurrentYear] = useState(2026)

  useEffect(() => {
    setCurrentYear(new Date().getFullYear())
  }, [])

  const paymentTimerRef = useRef(null)
  const pixTimerRef = useRef(null)

  useEffect(() => {
    let isMounted = true
    const loadData = async () => {
      let user = null
      try {
        const { data: { user: fetchedUser } } = await supabase.auth.getUser()
        if (!isMounted) return
        user = fetchedUser
      } catch (err) {
        if (isMounted) console.warn('Erro na busca de sessao:', err)
      }

      if (!user) { 
        if (isMounted) router.push(`/barber/${slug}/auth`)
        return 
      }

      const { data: shopData } = await supabase
        .from('barbershops').select('*').eq('slug', slug).single()

      if (!isMounted) return

      if (!shopData) { 
        setLoading(false)
        return 
      }

      let { data: customerData } = await supabase
        .from('customers')
        .select('*')
        .eq('user_id', user.id)
        .eq('barbershop_id', shopData.id)
        .maybeSingle()

      if (!isMounted) return

      if (!customerData) {
        const { data: otherProfiles } = await supabase
          .from('customers')
          .select('name, whatsapp')
          .eq('user_id', user.id)
          .limit(1)

        if (!isMounted) return

        const name = otherProfiles?.[0]?.name || user.email?.split('@')[0] || 'Cliente'
        const whatsapp = otherProfiles?.[0]?.whatsapp || ''

        const { data: newCustomer, error: insertError } = await supabase
          .from('customers')
          .insert({
            user_id: user.id,
            barbershop_id: shopData.id,
            name,
            email: user.email,
            whatsapp
          })
          .select()
          .single()

        if (!isMounted) return

        if (!insertError && newCustomer) {
          customerData = newCustomer
        } else {
          // Contingência: Tentar novo SELECT em caso de concorrência ou restrição de chave única
          const { data: fallbackCustomer } = await supabase
            .from('customers')
            .select('*')
            .eq('user_id', user.id)
            .eq('barbershop_id', shopData.id)
            .maybeSingle()

          if (!isMounted) return

          if (fallbackCustomer) {
            customerData = fallbackCustomer
          } else {
            router.push(`/barber/${slug}/auth`)
            return
          }
        }
      }

      if (!isMounted) return

      const [
        { data: servicesData },
        { data: barbersData },
        { data: plansData },
        { data: subscriptionData },
        { data: hoursData },
        { data: bookedData },
        productsResult,
      ] = await Promise.all([
        supabase.from('services').select('*').eq('barbershop_id', shopData.id),
        supabase.from('barbers').select('*').eq('barbershop_id', shopData.id).eq('active', true),
        supabase.from('plans').select('*, plan_services(*)').eq('barbershop_id', shopData.id).eq('active', true),
        supabase.from('subscriptions').select('*').eq('customer_id', customerData.id).in('status', ['pending', 'active']).maybeSingle(),
        supabase.from('business_hours').select('*').eq('barbershop_id', shopData.id),
        supabase.from('appointments').select('barber_id, date, time').eq('barbershop_id', shopData.id).eq('status', 'Pendente'),
        supabase.from('products').select('*').eq('barbershop_id', shopData.id).eq('active', true)
          .then(res => res)
          .catch(err => ({ data: null, error: err }))
      ])

      if (!isMounted) return

      setShop(shopData)
      setCustomer(customerData)
      setServices(servicesData || [])
      setBarbers(barbersData || [])
      setPlans(plansData || [])
      setSubscription(subscriptionData)
      setBusinessHours(hoursData || [])
      setBookedSlots(bookedData || [])

      let productsList = productsResult?.data || []
      if (!productsResult?.data || productsResult.error || productsList.length === 0) {
        console.warn('Produtos indisponíveis no banco, ativando fallback local.')
        let savedLocalProducts = []
        if (typeof window !== 'undefined') {
          const saved = localStorage.getItem(`customer_mock_products_${shopData.slug}`)
          if (saved) {
            try {
              savedLocalProducts = JSON.parse(saved)
            } catch (e) {
              console.error('Erro ao ler mock_products:', e)
            }
          }
        }

        if (savedLocalProducts.length > 0) {
          productsList = savedLocalProducts
        } else {
          productsList = [
            {
              id: 'mock-1',
              name: 'Shampoo Carbon Cabelo & Barba',
              brand: 'L\'Oréal Men Expert',
              volume_ml: 250,
              price: 59.90,
              description: 'Shampoo purificante enriquecido com carvão ativado. Limpa profundamente e elimina impurezas da fibra capilar e dos fios da barba.',
              photo_url: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?q=80&w=600&auto=format&fit=crop',
              active: true
            },
            {
              id: 'mock-2',
              name: 'Condicionador Hidratante Silk',
              brand: 'Keune Haircosmetics',
              volume_ml: 200,
              price: 49.90,
              description: 'Condicionador de nutrição profunda. Deixa os fios macios, maleáveis e fáceis de pentear, com brilho natural incomparável.',
              photo_url: 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?q=80&w=600&auto=format&fit=crop',
              active: true
            },
            {
              id: 'mock-3',
              name: 'Pomada Matte Modeladora Strong',
              brand: 'Redken Brews',
              volume_ml: 100,
              price: 79.90,
              description: 'Pomada modeladora com fixação forte e acabamento matte opaco. Ideal para penteados estruturados com aspect natural.',
              photo_url: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=600&auto=format&fit=crop',
              active: true
            },
            {
              id: 'mock-4',
              name: 'Óleo de Barba Maciez Suprema',
              brand: 'Beard Alchemist',
              volume_ml: 50,
              price: 39.90,
              description: 'Blend de óleos essenciais hidratantes para barbas longas e ressecadas. Amacia instantaneamente os pelos rebeldes.',
              photo_url: 'https://images.unsplash.com/photo-1617897903246-719242758050?q=80&w=600&auto=format&fit=crop',
              active: true
            }
          ]
          if (typeof window !== 'undefined') {
            localStorage.setItem(`customer_mock_products_${shopData.slug}`, JSON.stringify(productsList))
          }
        }
      }
      if (isMounted) setProducts(productsList)

      // Carregar pedidos do cliente logado
      let savedLocalOrders = []
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem(`customer_mock_orders_${slug}`)
        if (saved) {
          try {
            savedLocalOrders = JSON.parse(saved)
            if (isMounted) setMockLocalOrders(savedLocalOrders)
          } catch (e) {
            console.error('Erro ao ler mock_orders:', e)
          }
        }
      }

      try {
        const { data: salesData, error: salesError } = await supabase
          .from('product_sales')
          .select('*')
          .eq('customer_id', customerData.id)
          .order('created_at', { ascending: false })

        if (!isMounted) return

        if (salesError) throw salesError

        if (salesData && salesData.length > 0) {
          const productIds = [...new Set(salesData.map(s => s.product_id).filter(Boolean))]
          const { data: pData } = await supabase.from('products').select('*').in('id', productIds)
          
          if (!isMounted) return

          const pMap = {}
          pData?.forEach(p => { pMap[p.id] = p })

          const mergedSales = salesData.map(s => ({
            ...s,
            product: pMap[s.product_id] || productsList.find(p => p.id === s.product_id) || { name: 'Produto Indisponível', brand: '', price: s.price_at_purchase, photo_url: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?q=80&w=600&auto=format&fit=crop' }
          }))
          
          const localOnly = savedLocalOrders.filter(lo => !mergedSales.some(db => db.id === lo.id))
          if (isMounted) setCustomerOrders([...mergedSales, ...localOnly])
        } else {
          if (isMounted) setCustomerOrders(savedLocalOrders)
        }
      } catch (err) {
        console.warn('Erro ao carregar vendas do banco:', err.message)
        if (isMounted) setCustomerOrders(savedLocalOrders)
      }

      if (isMounted) setLoading(false)
    }
    if (slug) loadData()

    return () => {
      isMounted = false
      if (paymentTimerRef.current) clearTimeout(paymentTimerRef.current)
      if (pixTimerRef.current) clearTimeout(pixTimerRef.current)
    }
  }, [slug])

  // Lógica de 3D Card Hover
  const handleMouseMove = (e) => {
    const card = e.currentTarget
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const rotateX = ((centerY - y) / centerY) * 8 // máx 8 graus
    const rotateY = ((x - centerX) / centerX) * 8

    card.style.setProperty('--mouse-x', `${x}px`)
    card.style.setProperty('--mouse-y', `${y}px`)
    card.style.setProperty('--rotate-x', `${rotateX}deg`)
    card.style.setProperty('--rotate-y', `${rotateY}deg`)
  }

  const handleMouseLeave = (e) => {
    const card = e.currentTarget
    card.style.setProperty('--rotate-x', '0deg')
    card.style.setProperty('--rotate-y', '0deg')
  }

  // dias disponíveis baseados no horário de funcionamento
  const availableDays = businessHours.length > 0 ? getNext7Days(businessHours) : []

  // slots do dia selecionado
  const daySlots = selectedDay
    ? generateSlots(selectedDay.open_time, selectedDay.close_time)
    : []

  // verifica se horário está ocupado para o barbeiro selecionado
  const isSlotBooked = (time) => {
    if (!selectedBarber || !selectedDay) return false
    return bookedSlots.some(
      b => b.barber_id === selectedBarber.id &&
           b.date === selectedDay.dateStr &&
           b.time === time
    )
  }

  const handleScheduling = async () => {
    setError('')
    if (!selectedBarber || !selectedService || !selectedDay || !selectedTime) {
      setError('Selecione o barbeiro, serviço, data e horário.')
      return
    }

    setSaving(true)

    const { error } = await supabase.from('appointments').insert({
      customer_id: customer.id,
      customer_name: customer.name,
      customer_whatsapp: customer.whatsapp,
      service_id: selectedService.id,
      barber_id: selectedBarber.id,
      date: selectedDay.dateStr,
      time: selectedTime,
      status: 'Pendente',
      barbershop_id: shop.id,
    })

    if (error) { 
      setError('Erro ao realizar agendamento: ' + error.message)
      setSaving(false)
      return 
    }

    // adiciona slot como ocupado localmente
    setBookedSlots(prev => [...prev, {
      barber_id: selectedBarber.id,
      date: selectedDay.dateStr,
      time: selectedTime,
    }])

    setSuccess(true)
    setSelectedBarber(null)
    setSelectedService(null)
    setSelectedDay(null)
    setSelectedTime(null)
    setSaving(false)
  }

  const handleSubscribe = async (plan) => {
    setSavingPlan(plan.id)
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30)

    const { error } = await supabase.from('subscriptions').insert({
      customer_id: customer.id,
      barbershop_id: shop.id,
      plan_name: plan.name,
      price: plan.price,
      status: 'pending',
      starts_at: new Date().toISOString(),
      expires_at: expiresAt.toISOString(),
    })

    if (error) { 
      alert('Erro ao criar assinatura: ' + error.message)
      setSavingPlan(null)
      return 
    }
    setSubscription({ plan_name: plan.name })
    setSelectedPlan(null)
    setSavingPlan(null)
  }

  const addOrder = (newOrder) => {
    setCustomerOrders(prev => [newOrder, ...prev])
    const updatedMock = [newOrder, ...mockLocalOrders]
    setMockLocalOrders(updatedMock)
    if (typeof window !== 'undefined') {
      localStorage.setItem(`customer_mock_orders_${slug}`, JSON.stringify(updatedMock))
    }
  }

  const handlePurchaseProduct = async () => {
    if (!customer || !selectedProduct) return
    setPurchaseSaving(true)
    setPurchaseError('')

    const isOnline = purchasePaymentMethod === 'online'
    const statusPayment = isOnline ? 'paid' : 'pending'

    const payload = {
      customer_id: customer.id,
      barbershop_id: shop.id,
      product_id: selectedProduct.id.startsWith('mock-') ? null : selectedProduct.id,
      quantity: purchaseQuantity,
      price_at_purchase: selectedProduct.price,
      status: 'pending',
      payment_method: purchasePaymentMethod,
      payment_status: statusPayment
    }

    const orderId = 'order-' + Date.now()
    const newLocalOrder = {
      id: orderId,
      created_at: new Date().toISOString(),
      customer_id: customer.id,
      barbershop_id: shop.id,
      product_id: selectedProduct.id,
      quantity: purchaseQuantity,
      price_at_purchase: selectedProduct.price,
      status: 'pending',
      payment_method: purchasePaymentMethod,
      payment_status: statusPayment,
      product: selectedProduct
    }

    if (selectedProduct.id.startsWith('mock-')) {
      addOrder(newLocalOrder)
      setPurchaseSaving(false)
      setPurchaseSuccess(true)
      setCheckoutStep('success')
      return
    }

    try {
      const { error } = await supabase.from('product_sales').insert(payload)
      if (error) {
        console.warn('Erro ao registrar venda no banco. Simulando localmente:', error.message)
        addOrder(newLocalOrder)
        setPurchaseSaving(false)
        setPurchaseSuccess(true)
        setCheckoutStep('success')
        return
      }
      addOrder(newLocalOrder)
      setPurchaseSaving(false)
      setPurchaseSuccess(true)
      setCheckoutStep('success')
    } catch (err) {
      console.warn('Erro na conexao. Simulando localmente:', err)
      addOrder(newLocalOrder)
      setPurchaseSaving(false)
      setPurchaseSuccess(true)
      setCheckoutStep('success')
    }
  }

  const handleStartOnlinePayment = () => {
    if (onlinePaymentType === 'credit_card') {
      if (!cardName.trim() || !cardNumber.trim() || !cardExpiry.trim() || !cardCvv.trim()) {
        setPurchaseError('Por favor, preencha todos os campos do cartão.')
        return
      }
    }
    
    setCheckoutStep('online_processing')
    setPurchaseError('')
    
    if (paymentTimerRef.current) {
      clearTimeout(paymentTimerRef.current)
    }
    paymentTimerRef.current = setTimeout(() => {
      handlePurchaseProduct()
    }, 1500)
  }

  const handleConfirmPickup = () => {
    setPurchaseSaving(true)
    handlePurchaseProduct()
  }

  // Ordenar horários comerciais (Segunda a Domingo)
  const sortedHours = [...businessHours].sort((a, b) => {
    const dayA = a.day_of_week === 0 ? 7 : a.day_of_week
    const dayB = b.day_of_week === 0 ? 7 : b.day_of_week
    return dayA - dayB
  })

  const daysFull = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado']

  if (loading) return (
    <div className="min-h-screen bg-[#030303] flex flex-col items-center justify-center text-zinc-500 font-sans gap-3">
      <div className="w-8 h-8 rounded-full border border-t-amber-500 border-zinc-800 animate-spin" />
      <p className="text-xs uppercase tracking-widest text-zinc-600 font-bold animate-pulse">Carregando Dashboard...</p>
    </div>
  )

  if (!shop) return (
    <div className="min-h-screen bg-[#030303] flex flex-col items-center justify-center text-center px-4 font-sans">
      <Scissors size={40} className="text-zinc-700 mb-4 animate-bounce" />
      <h2 className="text-lg font-bold text-white tracking-tight font-serif-lux">Barbearia não encontrada</h2>
      <p className="text-zinc-500 text-xs mt-1 max-w-xs leading-normal font-sans">
        O endereço solicitado não pertence a nenhuma barbearia ativa em nosso sistema.
      </p>
      <button
        onClick={() => router.push('/')}
        className="mt-6 px-5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-full text-xs font-semibold text-zinc-300 hover:bg-zinc-800 transition-all cursor-pointer font-sans"
      >
        Voltar para Home
      </button>
    </div>
  )

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
        
        .font-serif-lux {
          font-family: 'Instrument Serif', serif;
        }
        .font-sans-lux {
          font-family: 'Plus Jakarta Sans', sans-serif;
        }

        body {
          background-color: #030303;
          margin: 0;
          padding: 0;
        }
      `}</style>

      <div className="font-sans-lux min-h-screen bg-[#030303] text-white overflow-x-hidden selection:bg-amber-500 selection:text-black antialiased relative flex flex-col justify-between">
        
        {/* BACKGROUND 3D DE PARTÍCULAS DOURADAS (THREE.JS) */}
        <ThreeBackground />

        {/* Ambient Glow de fundo sutil */}
        <div className="ambient-gold-glow absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0" />
        <div className="ambient-gold-glow absolute bottom-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 z-0" />

        {/* HEADER / NAVBAR */}
        <header className="fixed top-0 left-0 w-full z-50 border-b border-white/[0.03] bg-black/60 backdrop-blur-xl px-6 py-4 md:px-12 flex items-center justify-between">
          <button
            onClick={() => router.push(`/barber/${slug}`)}
            className="font-serif-lux text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-1.5 bg-transparent border-none cursor-pointer hover:opacity-90 transition-opacity"
          >
            <Sparkles size={16} className="text-amber-500 animate-pulse" />
            <span>{shop.name}</span>
          </button>

          <button
            onClick={async () => { await supabase.auth.signOut(); router.push(`/barber/${slug}`) }}
            className="px-4 py-2 border border-zinc-800 rounded-full text-xxs font-bold uppercase tracking-wider text-zinc-400 hover:text-white hover:border-zinc-700 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <LogOut size={12} />
            <span>Sair</span>
          </button>
        </header>

        {/* CONTEÚDO PRINCIPAL */}
        <main className="flex-1 flex flex-col items-center px-4 md:px-6 py-28 relative z-10 max-w-4xl mx-auto w-full gap-8">
          
          {/* Saudação de Entrada */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full"
          >
            <span className="text-[9px] font-bold uppercase tracking-widest text-amber-500">Módulo Cliente</span>
            <h1 className="font-serif-lux text-4xl sm:text-5xl font-normal tracking-tight text-white mt-2 mb-2 leading-none">
              Olá, <em className="font-serif-lux italic text-amber-500 font-normal">{customer?.name?.split(' ')[0]}</em> 👋
            </h1>
            <p className="text-zinc-500 text-xs font-light max-w-md leading-relaxed">
              {subscription
                ? `Você possui o plano ${subscription.plan_name} ativo nesta barbearia.`
                : 'Selecione um barbeiro e agende seu próximo horário de cuidados.'}
            </p>
          </motion.div>

          {/* Banner de Assinatura Ativa */}
          {subscription && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full flex items-center gap-3 bg-emerald-500/[0.04] border border-emerald-500/20 text-emerald-400 rounded-2xl p-4 text-xs"
            >
              <div className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0">
                <ShieldCheck size={12} className="stroke-[3px]" />
              </div>
              <div>
                <span className="font-bold">Assinatura Ativa: </span>
                <span className="font-light">Você tem acesso livre aos benefícios e descontos do clube <strong>{subscription.plan_name}</strong>.</span>
              </div>
            </motion.div>
          )}

          
          {/* SELETOR DE ABAS DO PAINEL CLIENTE */}
          <div className="w-full flex border-b border-zinc-900 pb-px gap-6 overflow-x-auto scrollbar-none">
            <button
              onClick={() => setActiveTab('scheduling')}
              className={`pb-2.5 border-b-2 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 flex-shrink-0 ${
                activeTab === 'scheduling'
                  ? 'border-amber-500 text-amber-500'
                  : 'border-transparent text-zinc-500 hover:text-zinc-400'
              }`}
            >
              <Calendar size={14} />
              <span>Agendamento</span>
            </button>
            <button
              onClick={() => setActiveTab('catalog')}
              className={`pb-2.5 border-b-2 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 flex-shrink-0 ${
                activeTab === 'catalog'
                  ? 'border-amber-500 text-amber-500'
                  : 'border-transparent text-zinc-500 hover:text-zinc-400'
              }`}
            >
              <ShoppingBag size={14} />
              <span>Buscar Produtos</span>
            </button>
            <button
              onClick={() => setActiveTab('my_products')}
              className={`pb-2.5 border-b-2 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 flex-shrink-0 ${
                activeTab === 'my_products'
                  ? 'border-amber-500 text-amber-500'
                  : 'border-transparent text-zinc-500 hover:text-zinc-400'
              }`}
            >
              <User size={14} />
              <span>Meus Produtos ({customerOrders.length})</span>
            </button>
          </div>

          {activeTab === 'scheduling' && (
            <>
{/* PAINEL DE AGENDAMENTO */}
              <motion.div 
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.15 }}
                className="w-full glass-panel border border-zinc-900 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col gap-6"
              >
                <div className="flex items-center gap-2 pb-4 border-b border-zinc-900">
                  <Calendar size={18} className="text-amber-500" />
                  <h2 className="font-serif-lux text-2xl text-white font-normal leading-none">Agendar seu Horário</h2>
                </div>

                {success && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center justify-between gap-3 bg-emerald-500/[0.04] border border-emerald-500/20 text-emerald-400 rounded-2xl p-4 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <Check size={14} className="stroke-[3.5px] text-emerald-400" />
                      <p className="font-medium">✓ Agendamento realizado com sucesso! Aguardamos você.</p>
                    </div>
                    <button 
                      onClick={() => setSuccess(false)}
                      className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 text-emerald-400 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      Novo Agendamento
                    </button>
                  </motion.div>
                )}

                {error && (
                  <div className="flex items-start gap-2 bg-red-950/20 border border-red-900/40 text-red-400 rounded-2xl p-3.5 text-xs">
                    <Info size={14} className="flex-shrink-0 mt-0.5" />
                    <p>{error}</p>
                  </div>
                )}

                {!success && (
                  <div className="flex flex-col gap-6">
                    
                    {/* 1. SELEÇÃO DE BARBEIRO */}
                    {barbers.length > 0 ? (
                      <div className="flex flex-col gap-3">
                        <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">1. Escolha o Profissional</label>
                        <div className="flex gap-4 flex-wrap">
                          {barbers.map(barber => {
                            const isSelected = selectedBarber?.id === barber.id
                            return (
                              <button
                                key={barber.id}
                                onClick={() => { setSelectedBarber(barber); setSelectedService(null); setSelectedDay(null); setSelectedTime(null) }}
                                className={`flex items-center gap-3 bg-zinc-950/40 border rounded-2xl p-3 text-left transition-all cursor-pointer ${
                                  isSelected 
                                    ? 'border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.08)] bg-amber-500/[0.02]' 
                                    : 'border-zinc-900 hover:border-zinc-800'
                                }`}
                              >
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                  isSelected 
                                    ? 'bg-amber-500 text-black' 
                                    : 'bg-zinc-900 text-zinc-400'
                                }`}>
                                  {barber.photo_url ? (
                                    <img src={barber.photo_url} alt={barber.full_name} className="w-full h-full object-cover rounded-full" />
                                  ) : (
                                    <span>{barber.full_name.charAt(0).toUpperCase()}</span>
                                  )}
                                </div>
                                <div>
                                  <p className={`text-xs font-bold ${isSelected ? 'text-amber-500' : 'text-white'}`}>
                                    {barber.full_name.split(' ')[0]}
                                  </p>
                                  <p className="text-[9px] text-zinc-550 uppercase tracking-wider mt-0.5">Visagista</p>
                                </div>
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-amber-500/5 border border-amber-500/20 text-amber-500/90 rounded-2xl p-4 text-xs font-light">
                        Nenhum profissional está disponível para agendamento online no momento.
                      </div>
                    )}

                    {/* 2. SELEÇÃO DE SERVIÇO */}
                    <AnimatePresence>
                      {selectedBarber && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="flex flex-col gap-3 overflow-hidden"
                        >
                          <label className="text-[10px] uppercase font-bold text-zinc-550 tracking-wider">2. Escolha o Serviço</label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {services.map(service => {
                              const isSelected = selectedService?.id === service.id
                              return (
                                <button
                                  key={service.id}
                                  onClick={() => { setSelectedService(service); setSelectedDay(null); setSelectedTime(null) }}
                                  className={`flex items-center justify-between bg-zinc-950/40 border rounded-2xl p-4 text-left transition-all cursor-pointer ${
                                    isSelected 
                                      ? 'border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.08)] bg-amber-500/[0.02]' 
                                      : 'border-zinc-900 hover:border-zinc-800'
                                  }`}
                                >
                                  <div>
                                    <p className={`text-xs font-bold ${isSelected ? 'text-amber-500' : 'text-white'}`}>{service.name}</p>
                                    <p className="text-[9px] text-zinc-550 uppercase tracking-wider mt-0.5">{service.duration} minutos</p>
                                  </div>
                                  <span className="text-xs font-extrabold text-white">R$ {Number(service.price).toFixed(2)}</span>
                                </button>
                              )
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* 3. SELEÇÃO DE DATA */}
                    <AnimatePresence>
                      {selectedService && availableDays.length > 0 && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="flex flex-col gap-3 overflow-hidden"
                        >
                          <label className="text-[10px] uppercase font-bold text-zinc-550 tracking-wider">3. Escolha a Data</label>
                          <div className="flex gap-2.5 overflow-x-auto pb-3 scrollbar-thin scrollbar-thumb-zinc-900 scrollbar-track-transparent">
                            {availableDays.map(day => {
                              const isSelected = selectedDay?.dateStr === day.dateStr
                              return (
                                <button
                                  key={day.dateStr}
                                  onClick={() => { setSelectedDay(day); setSelectedTime(null) }}
                                  className={`flex flex-col items-center justify-center p-3 rounded-2xl min-w-[70px] border transition-all cursor-pointer ${
                                    isSelected 
                                      ? 'bg-gradient-to-b from-amber-500 to-yellow-500 border-amber-500 text-black shadow-md' 
                                      : 'bg-zinc-950/40 border-zinc-900 text-zinc-400 hover:border-zinc-850'
                                  }`}
                                >
                                  <span className={`text-[9px] font-bold uppercase tracking-wider ${isSelected ? 'text-black/85' : 'text-zinc-505'}`}>
                                    {day.date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')}
                                  </span>
                                  <span className={`text-base font-extrabold mt-1 ${isSelected ? 'text-black' : 'text-white'}`}>
                                    {day.date.getDate()}
                                  </span>
                                  <span className={`text-[9px] uppercase tracking-wider mt-0.5 ${isSelected ? 'text-black/85' : 'text-zinc-505'}`}>
                                    {day.date.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}
                                  </span>
                                </button>
                              )
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* 4. SELEÇÃO DE HORÁRIO */}
                    <AnimatePresence>
                      {selectedDay && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="flex flex-col gap-3 overflow-hidden"
                        >
                          <label className="text-[10px] uppercase font-bold text-zinc-550 tracking-wider">4. Horários Disponíveis</label>
                          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                            {daySlots.map(slot => {
                              const booked = isSlotBooked(slot)
                              const isSelected = selectedTime === slot
                              return (
                                <button
                                  key={slot}
                                  disabled={booked}
                                  onClick={() => setSelectedTime(slot)}
                                  className={`py-2 px-3 text-xs border rounded-xl font-bold transition-all ${
                                    booked
                                      ? 'bg-zinc-900/10 border-zinc-950 text-zinc-700 cursor-not-allowed line-through opacity-40'
                                      : isSelected
                                        ? 'bg-gradient-to-r from-amber-500 to-yellow-500 border-amber-500 text-black'
                                        : 'bg-zinc-950/40 border-zinc-900 text-zinc-400 hover:border-amber-500 hover:text-amber-500 cursor-pointer'
                                  }`}
                                >
                                  {slot}
                                </button>
                              )
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* 5. CONFIRMAÇÃO DO AGENDAMENTO */}
                    <AnimatePresence>
                      {selectedTime && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.98 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.98 }}
                          className="border-t border-zinc-900 pt-5 mt-2 flex flex-col gap-4"
                        >
                          <div className="bg-[#0c0c0e]/50 border border-zinc-900 rounded-2xl p-4 flex flex-col gap-1.5">
                            <span className="text-[9px] uppercase font-bold text-zinc-550 tracking-wider">Resumo do Serviço</span>
                            <p className="text-sm font-bold text-white leading-none">
                              {selectedService?.name} <span className="text-zinc-500 font-normal">com</span> {selectedBarber?.full_name}
                            </p>
                            <p className="text-xs text-zinc-400">
                              {selectedDay?.date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })} às <span className="text-amber-500 font-bold">{selectedTime}</span>
                            </p>
                          </div>

                          <button
                            onClick={handleScheduling}
                            disabled={saving}
                            className="w-full py-3.5 rounded-full text-xs font-bold text-black bg-gradient-to-r from-amber-500 to-yellow-500 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shadow-[0_0_20px_rgba(245,158,11,0.15)] flex items-center justify-center gap-2"
                          >
                            {saving ? (
                              <div className="w-4 h-4 rounded-full border border-t-black border-zinc-900 animate-spin" />
                            ) : (
                              <>
                                <Check size={14} className="stroke-[3.5px]" />
                                <span>Confirmar Agendamento</span>
                              </>
                            )}
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>

                  </div>
                )}
              </motion.div>

              {/* SEÇÃO DE PLANOS DISPONÍVEIS */}
              {!subscription && plans.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 25 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.25 }}
                  className="w-full flex flex-col gap-4"
                >
                  <div className="mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-amber-500">Upgrade de Experiência</span>
                    <h2 className="font-serif-lux text-2xl text-white font-normal mt-2 leading-none">
                      Clubes & Vantagens Exclusivas
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
                    {plans.map((plan, index) => {
                      const isRecommended = index === 1 || plans.length === 1
                      return (
                        <div
                          key={plan.id}
                          onMouseMove={handleMouseMove}
                          onMouseLeave={handleMouseLeave}
                          onClick={() => setSelectedPlan(plan)}
                          className={`premium-card-3d group relative rounded-3xl p-5 flex flex-col justify-between shadow-xl cursor-pointer ${
                            isRecommended 
                              ? 'animated-gold-border' 
                              : 'border border-zinc-900 bg-[#0c0c0e]/30'
                          }`}
                        >
                          {/* Glow background interativo */}
                          <div className="premium-card-3d__glow" />

                          {/* Conteúdo com Borda Animada Dourada */}
                          <div className={`premium-card-3d__content flex flex-col justify-between h-full gap-5 ${
                            isRecommended ? 'animated-gold-border__inner p-5 bg-[#09090b] rounded-[23px]' : ''
                          }`}>
                            <div>
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-505">{plan.name}</span>
                                {isRecommended && (
                                  <span className="text-[8px] font-bold text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full flex items-center gap-0.5 animate-pulse">
                                    <span>Recomendado</span>
                                  </span>
                                )}
                              </div>
                              
                              <div className="flex items-baseline gap-0.5 mt-3">
                                <span className="text-2xl font-extrabold tracking-tight text-white font-sans">
                                  R$ {Number(plan.price).toFixed(2)}
                                </span>
                                <span className="text-[10px] text-zinc-505">/mês</span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between pt-2.5 border-t border-zinc-900">
                              <span className="text-[9px] uppercase font-bold text-zinc-550 tracking-wider">Benefícios inclusos</span>
                              <span className="text-[10px] font-bold text-amber-500 flex items-center gap-1">
                                <span>Ver vantagens</span>
                                <ArrowRight size={10} />
                              </span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </motion.div>
              )}

              {/* IMAGENS, LOCALIZAÇÃO & HORÁRIOS COM DESIGN DA LANDING PAGE */}
              <motion.div 
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.35 }}
                className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 mt-6"
              >
                {/* 1. HORÁRIOS DE FUNCIONAMENTO */}
                <div className="glass-panel border border-zinc-900 rounded-3xl p-6 shadow-2xl flex flex-col gap-4">
                  <div className="flex items-center gap-2 pb-3 border-b border-zinc-900">
                    <Clock size={16} className="text-amber-500" />
                    <h3 className="font-serif-lux text-xl text-white font-normal leading-none">Horários Comerciais</h3>
                  </div>

                  {sortedHours.length > 0 ? (
                    <div className="flex flex-col gap-2.5 mt-2">
                      {sortedHours.map(hour => {
                        const todayDay = new Date().getDay()
                        const isToday = hour.day_of_week === todayDay
                        return (
                          <div 
                            key={hour.id} 
                            className={`flex items-center justify-between text-xs py-1.5 px-2.5 rounded-xl transition-all ${
                              isToday 
                                ? 'bg-amber-500/[0.04] border border-amber-500/20 text-white font-bold' 
                                : 'text-zinc-400 border border-transparent'
                            }`}
                          >
                            <span className={isToday ? 'text-amber-500' : ''}>{daysFull[hour.day_of_week]}</span>
                            <span>
                              {hour.is_open 
                                ? `${hour.open_time.slice(0, 5)} às ${hour.close_time.slice(0, 5)}` 
                                : <span className="text-red-500/70 font-semibold uppercase tracking-wider text-[9px] bg-red-500/5 border border-red-500/10 px-2 py-0.5 rounded">Fechado</span>
                              }
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <p className="text-zinc-550 text-xs font-light">Horários não cadastrados.</p>
                  )}
                </div>

                {/* 2. LOCALIZAÇÃO E CONTATO */}
                <div className="glass-panel border border-zinc-900 rounded-3xl p-6 shadow-2xl flex flex-col justify-between gap-6 relative overflow-hidden">
                  <div className="absolute inset-0 z-0 pointer-events-none opacity-5">
                    <img 
                      src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=600&auto=format&fit=crop" 
                      alt="Interior Barbearia" 
                      className="w-full h-full object-cover" 
                    />
                  </div>

                  <div className="relative z-10 flex flex-col gap-4">
                    <div className="flex items-center gap-2 pb-3 border-b border-zinc-900">
                      <MapPin size={16} className="text-amber-500" />
                      <h3 className="font-serif-lux text-xl text-white font-normal leading-none">Nosso Endereço</h3>
                    </div>

                    <p className="text-zinc-300 text-xs leading-relaxed font-light mt-1">
                      {shop.address || 'Av. Paulista, 1000 - Bela Vista, São Paulo - SP, 01310-100'}
                    </p>

                    <div className="flex items-center gap-2 text-zinc-400 text-xs mt-2">
                      <Phone size={14} className="text-amber-500" />
                      <span className="font-light">WhatsApp: {customer?.whatsapp || '(11) 99999-9999'}</span>
                    </div>
                  </div>

                  <div className="relative z-10 flex items-center gap-2 text-[10px] uppercase font-bold text-amber-500/80 bg-amber-500/[0.04] border border-amber-500/15 rounded-xl px-3 py-2 mt-4">
                    <Star size={12} className="fill-amber-500 text-amber-500 animate-pulse" />
                    <span>Atendimento de Luxo Garantido</span>
                  </div>
                </div>
              </motion.div>

              {/* GALERIA VINTAGE DO AMBIENTE (3 FOTOS) */}
              <motion.div 
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.45 }}
                className="w-full flex flex-col gap-4 mt-4"
              >
                <div className="mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-amber-500">Conheça nosso espaço</span>
                  <h2 className="font-serif-lux text-2xl text-white font-normal mt-2 leading-none">O Ambiente Premium</h2>
                </div>
                
                <div className="grid grid-cols-3 gap-4 h-28 sm:h-36">
                  <div className="rounded-2xl overflow-hidden border border-zinc-900/60 relative group">
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-transparent transition-all duration-300" />
                    <img 
                      src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=400&auto=format&fit=crop" 
                      alt="Espaço 1" 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                    />
                  </div>
                  <div className="rounded-2xl overflow-hidden border border-zinc-900/60 relative group">
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-transparent transition-all duration-300" />
                    <img 
                      src="https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=400&auto=format&fit=crop" 
                      alt="Espaço 2" 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                    />
                  </div>
                  <div className="rounded-2xl overflow-hidden border border-zinc-900/60 relative group">
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-transparent transition-all duration-300" />
                    <img 
                      src="https://images.unsplash.com/photo-1599351431202-1e0f0137899a?q=80&w=400&auto=format&fit=crop" 
                      alt="Espaço 3" 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                    />
                  </div>
                </div>
              </motion.div>
                        </>
          )}

          {activeTab === 'catalog' && (
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="w-full"
            >
{/* SEÇÃO DE PRODUTOS & CUIDADOS */}
              {products.length > 0 && (
                <motion.div 
                  id="catalogo-produtos"
                  initial={{ opacity: 0, y: 25 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="w-full flex flex-col gap-4 mt-2"
                >
                  <div className="mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-amber-500 flex items-center gap-1">
                      <Sparkles size={10} className="text-amber-500 animate-pulse" />
                      <span>Produtos & Cosméticos</span>
                    </span>
                    <h2 className="font-serif-lux text-2xl text-white font-normal mt-2 leading-none">
                      Buscar Produtos
                    </h2>
                    <p className="text-zinc-400 text-xs mt-1.5 font-light leading-relaxed font-sans">
                      Adquira shampoos, condicionadores, cremes e óleos indicados por nossos profissionais para prolongar sua experiência.
                    </p>
                  </div>

                  {/* Banner informativo de retirada presencial */}
                  <div className="w-full bg-[#0c0c0e]/60 border border-amber-500/20 text-amber-500/95 rounded-2xl p-4 text-xs flex items-start gap-2.5 shadow-sm">
                    <Info size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
                    <div className="leading-relaxed">
                      <span className="font-bold">Aviso Importante: </span>
                      <span className="font-light">Todos os produtos adquiridos/reservados aqui devem ser retirados diretamente na barbearia. O pagamento é efetuado presencialmente no salão.</span>
                    </div>
                  </div>

                  {/* Grid de produtos */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full mt-2">
                    {products.map((product) => (
                      <div
                        key={product.id}
                        onMouseMove={handleMouseMove}
                        onMouseLeave={handleMouseLeave}
                        onClick={() => {
                          setSelectedProduct(product)
                          setPurchaseQuantity(1)
                          setPurchaseSuccess(false)
                          setPurchaseError('')
                          setPurchasePaymentMethod('online')
                          setCheckoutStep('select_method')
                          setOnlinePaymentType('credit_card')
                          setCardName('')
                          setCardNumber('')
                          setCardExpiry('')
                          setCardCvv('')
                          setPixCopied(false)
                        }}
                        className="premium-card-3d group relative rounded-3xl p-5 flex flex-col justify-between shadow-xl cursor-pointer border border-zinc-900 bg-[#0c0c0e]/30"
                      >
                        {/* Glow background interativo */}
                        <div className="premium-card-3d__glow" />

                        <div className="premium-card-3d__content flex flex-col gap-4 h-full">
                          {/* Imagem do Produto */}
                          <div className="h-40 bg-zinc-950/80 rounded-2xl overflow-hidden border border-zinc-900 relative">
                            <img 
                              src={product.photo_url} 
                              alt={product.name} 
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                            />
                            <div className="absolute top-2.5 right-2.5 bg-black/90 backdrop-blur border border-zinc-850 rounded-lg px-2 py-0.5 text-[8px] font-bold text-amber-500 tracking-wider">
                              {product.volume_ml} ML
                            </div>
                          </div>

                          <div className="flex-1 flex flex-col justify-between gap-3">
                            <div>
                              <div className="flex items-center justify-between">
                                <span className="text-[9px] font-bold uppercase tracking-wider text-amber-500">{product.brand}</span>
                              </div>
                              
                              <h3 className="text-sm font-bold text-white mt-1 group-hover:text-amber-500 transition-colors line-clamp-1">
                                {product.name}
                              </h3>

                              <p className="text-[10px] text-zinc-550 font-light mt-1 line-clamp-2 leading-relaxed">
                                {product.description}
                              </p>
                            </div>

                            <div className="flex items-center justify-between pt-2.5 border-t border-zinc-900/60 mt-1 font-sans">
                              <span className="text-base font-extrabold text-white font-sans">
                                R$ {Number(product.price).toFixed(2)}
                              </span>
                              <span className="text-[9px] font-bold text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-xl group-hover:bg-amber-50 group-hover:text-black transition-all">
                                Adquirir
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

                          </motion.div>
          )}

          {activeTab === 'my_products' && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="w-full flex flex-col gap-6"
            >
              <div className="mb-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-500 flex items-center gap-1">
                  <User size={10} className="text-amber-500" />
                  <span>Histórico de Adquiridos</span>
                </span>
                <h2 className="font-serif-lux text-2xl text-white font-normal mt-2 leading-none">
                  Meus Produtos
                </h2>
                <p className="text-zinc-400 text-xs mt-1.5 font-light leading-relaxed font-sans">
                  Visualize os produtos que foram adquiridos por você. Caso não tenha comprado nada, o painel permanecerá vazio.
                </p>
              </div>

              {/* Banner informativo de retirada presencial em Meus Produtos */}
              <div className="w-full bg-[#0c0c0e]/60 border border-amber-500/20 text-amber-500/95 rounded-2xl p-4 text-xs flex items-start gap-2.5 shadow-sm">
                <Info size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <span className="font-bold">Aviso sobre Retirada: </span>
                  <span className="font-light">
                    Os produtos adquiridos/reservados pela plataforma não são entregues em domicílio.
                    <strong> Você deverá retirar suas compras diretamente na barbearia.</strong>
                  </span>
                </div>
              </div>

              {customerOrders.length === 0 ? (
                <div className="border border-zinc-900 rounded-3xl p-16 text-center bg-[#0c0c0e]/30 flex flex-col items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-550">
                    <ShoppingBag size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Sem produtos adquiridos</h3>
                    <p className="text-zinc-555 text-xs mt-1.5 max-w-xs mx-auto leading-relaxed font-light font-sans">
                      Você ainda não adquiriu nenhum produto em nossa barbearia.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setActiveTab('catalog')
                      setTimeout(() => {
                        const el = document.getElementById('catalogo-produtos')
                        if (el) {
                          el.scrollIntoView({ behavior: 'smooth', block: 'center' })
                        }
                      }, 100)
                    }}
                    className="mt-2 px-5 py-2.5 rounded-full text-xs font-bold text-black bg-gradient-to-r from-amber-500 to-yellow-500 hover:scale-[1.02] transition-all cursor-pointer shadow-[0_0_15px_rgba(245,158,11,0.15)] flex items-center gap-1.5"
                  >
                    <span>Buscar Produtos</span>
                    <ArrowRight size={12} className="stroke-[2.5px]" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {customerOrders.map((order) => (
                    <div 
                      key={order.id} 
                      className="glass-panel border border-zinc-900 rounded-3xl p-5 flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between"
                    >
                      <div className="flex gap-4 items-center">
                        <div className="w-16 h-16 rounded-2xl bg-zinc-950 overflow-hidden border border-zinc-900 flex-shrink-0">
                          <img 
                            src={order.product?.photo_url} 
                            alt={order.product?.name} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[9px] font-extrabold uppercase tracking-widest text-amber-500">
                            {order.product?.brand}
                          </span>
                          <h4 className="text-xs font-bold text-white">{order.product?.name}</h4>
                          <div className="flex flex-wrap gap-2 mt-1">
                            <span className="text-[10px] text-zinc-405">
                              Qtd: <strong className="text-white font-mono">{order.quantity}</strong>
                            </span>
                            <span className="text-[10px] text-zinc-550">&bull;</span>
                            <span className="text-[10px] text-zinc-405">
                              Total: <strong className="text-white">R$ {(Number(order.price_at_purchase) * order.quantity).toFixed(2)}</strong>
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap sm:flex-col items-start sm:items-end gap-3 sm:gap-1.5 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-zinc-900/60 justify-between">
                        {/* Status de Retirada */}
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[9px] font-bold uppercase tracking-wider ${
                          order.status === 'picked_up' 
                            ? 'bg-emerald-500/10 text-emerald-450 border-emerald-500/20' 
                            : order.status === 'pending'
                              ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                              : 'bg-red-500/10 text-red-400 border-red-500/20'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            order.status === 'picked_up' ? 'bg-emerald-500' : order.status === 'pending' ? 'bg-amber-500' : 'bg-red-400'
                          }`} />
                          <span>{order.status === 'picked_up' ? 'Retirado' : order.status === 'pending' ? 'Pendente' : 'Cancelado'}</span>
                        </span>

                        {/* Pagamento */}
                        <div className="flex flex-col sm:items-end text-[9px]">
                          <span className="text-zinc-405">
                            Pagamento:{' '}
                            <strong className={order.payment_status === 'paid' ? 'text-emerald-400' : 'text-amber-505'}>
                              {order.payment_status === 'paid' ? 'Pago' : 'Pendente'}
                            </strong>
                          </span>
                          <span className="text-zinc-550 text-[8px] mt-0.5 font-light">
                            {order.payment_method === 'online' ? 'Online (Gateway)' : 'Pagar na Retirada'}
                          </span>
                        </div>

                        {/* Data */}
                        <span className="text-[9px] text-zinc-550 font-light mt-1 self-center sm:self-auto">
                          {new Date(order.created_at).toLocaleDateString('pt-BR')} às{' '}
                          {new Date(order.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}


        </main>

        {/* MODAL PLANO DETALHES */}
        <AnimatePresence>
          {selectedPlan && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPlan(null)} 
              className="fixed inset-0 bg-black/85 backdrop-blur-md z-[200] flex items-center justify-center p-4"
            >
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: 'spring', duration: 0.5 }}
                onClick={e => e.stopPropagation()} 
                className="glass-panel border border-zinc-900 rounded-3xl p-6 md:p-8 w-full max-w-[480px] max-h-[85vh] overflow-y-auto flex flex-col gap-6 relative shadow-2xl"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-amber-500">Clube de Fidelidade</span>
                    <h3 className="font-serif-lux text-3xl font-normal text-white mt-1 leading-none">{selectedPlan.name}</h3>
                  </div>
                  <button 
                    onClick={() => setSelectedPlan(null)} 
                    className="p-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <div className="flex flex-col gap-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">Serviços e Benefícios Inclusos</span>
                  <div className="flex flex-col gap-2 max-h-56 overflow-y-auto pr-1">
                    {selectedPlan.plan_services?.length > 0 ? selectedPlan.plan_services.map(svc => {
                      const isFree = svc.benefit_type === 'free'
                      return (
                        <div key={svc.id} className="flex items-center justify-between p-3.5 bg-zinc-950/40 border border-zinc-900 rounded-2xl">
                          <span className="text-xs text-white font-medium">{svc.service_name}</span>
                          <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full ${
                            isFree 
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10' 
                              : 'bg-amber-500/10 text-amber-500 border border-amber-500/10'
                          }`}>
                            {isFree ? '100% Grátis' : `${svc.discount_percent}% OFF`}
                          </span>
                        </div>
                      )
                    }) : (
                      <p className="text-zinc-500 text-xs font-light">Nenhum serviço atrelado a este plano.</p>
                    )}
                  </div>
                </div>

                <div className="border-t border-zinc-900 pt-5 flex items-center justify-between flex-wrap gap-4 mt-2">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider block">Assinatura Mensal</span>
                    <div className="flex items-baseline gap-0.5 mt-1">
                      <span className="text-3xl font-extrabold text-white font-sans">R$ {Number(selectedPlan.price).toFixed(2)}</span>
                      <span className="text-xs text-zinc-500">/mês</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleSubscribe(selectedPlan)}
                    disabled={savingPlan === selectedPlan.id}
                    className="px-6 py-3.5 rounded-full text-xs font-bold text-black bg-gradient-to-r from-amber-500 to-yellow-500 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shadow-[0_0_20px_rgba(245,158,11,0.15)] flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {savingPlan === selectedPlan.id ? (
                      <div className="w-4 h-4 rounded-full border border-t-black border-zinc-900 animate-spin" />
                    ) : (
                      <>
                        <span>Assinar agora</span>
                        <ArrowRight size={12} />
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MODAL PRODUTO DETALHES & RESERVA (COM CHECKOUT GATEWAY) */}
        <AnimatePresence>
          {selectedProduct && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProduct(null)} 
              className="fixed inset-0 bg-black/85 backdrop-blur-md z-[200] flex items-center justify-center p-4"
            >
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: 'spring', duration: 0.5 }}
                onClick={e => e.stopPropagation()} 
                className="glass-panel border border-zinc-900 rounded-3xl p-6 md:p-8 w-full max-w-[480px] max-h-[90vh] overflow-y-auto flex flex-col gap-5 relative shadow-2xl"
              >
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-amber-500">{selectedProduct.brand}</span>
                    <h3 className="font-serif-lux text-2xl font-normal text-white mt-1 leading-snug">{selectedProduct.name}</h3>
                  </div>
                  <button 
                    onClick={() => setSelectedProduct(null)} 
                    className="p-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                {/* STEP 4: SUCCESS */}
                {checkoutStep === 'success' && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center text-center py-6 gap-4"
                  >
                    <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <Check size={24} className="stroke-[3px]" />
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold uppercase tracking-widest text-white">
                        {purchasePaymentMethod === 'online' ? 'Pagamento Aprovado!' : 'Reserva Confirmada!'}
                      </h4>
                      <p className="text-zinc-400 text-xs leading-relaxed max-w-xs font-light mt-1.5">
                        {purchasePaymentMethod === 'online' 
                          ? 'Seu pagamento foi processado com sucesso pelo gateway de testes.' 
                          : 'Seu produto foi reservado com sucesso.'}
                      </p>
                    </div>

                    <div className="w-full bg-[#0c0c0e]/50 border border-zinc-900 rounded-2xl p-4 text-left text-xs flex flex-col gap-1.5">
                      <p className="text-[10px] text-zinc-550 font-bold uppercase tracking-wider">Como retirar o produto:</p>
                      <p className="text-zinc-300 font-light leading-relaxed">
                        Dirija-se ao balcão da barbearia física e informe seu nome: <strong className="text-white font-semibold">{customer?.name}</strong>.
                      </p>
                      <p className="text-zinc-400 text-[10px] leading-normal mt-1 border-t border-zinc-900/60 pt-2.5 flex items-center gap-1.5">
                        <Info size={12} className="text-amber-500 flex-shrink-0" />
                        <span>
                          {purchasePaymentMethod === 'online' 
                            ? 'O produto já está pago. Basta retirá-lo.' 
                            : 'O pagamento do produto deverá ser realizado na retirada.'}
                        </span>
                      </p>
                    </div>

                    <button
                      onClick={() => setSelectedProduct(null)}
                      className="mt-2 w-full py-3 rounded-full text-xs font-bold text-black bg-gradient-to-r from-amber-500 to-yellow-500 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                    >
                      Voltar ao Painel
                    </button>
                  </motion.div>
                )}

                {/* STEP 1: SELECT METHOD */}
                {checkoutStep === 'select_method' && (
                  <div className="flex flex-col gap-4">
                    {/* Imagem do Produto */}
                    <div className="h-44 bg-zinc-950 rounded-2xl overflow-hidden border border-zinc-900/60 relative">
                      <img src={selectedProduct.photo_url} alt={selectedProduct.name} className="w-full h-full object-cover" />
                      <div className="absolute top-2.5 right-2.5 bg-black/90 backdrop-blur border border-zinc-850 rounded-lg px-2 py-0.5 text-[8px] font-bold text-amber-500 tracking-wider">
                        {selectedProduct.volume_ml} ML
                      </div>
                    </div>

                    <p className="text-xs text-zinc-400 leading-relaxed font-light font-sans">
                      {selectedProduct.description}
                    </p>

                    {/* Quantidade */}
                    <div className="flex items-center justify-between p-3.5 bg-zinc-950/40 border border-zinc-900 rounded-2xl">
                      <span className="text-xs text-white font-bold uppercase tracking-wider text-zinc-500">Quantidade</span>
                      <div className="flex items-center gap-3 font-sans">
                        <button
                          type="button"
                          disabled={purchaseQuantity <= 1}
                          onClick={() => setPurchaseQuantity(prev => prev - 1)}
                          className="w-7 h-7 rounded-lg border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center font-bold disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                        >
                          -
                        </button>
                        <span className="text-sm font-bold text-white font-mono w-4 text-center">{purchaseQuantity}</span>
                        <button
                          type="button"
                          disabled={purchaseQuantity >= 5}
                          onClick={() => setPurchaseQuantity(prev => prev + 1)}
                          className="w-7 h-7 rounded-lg border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center font-bold disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Seletor de Forma de Pagamento */}
                    <div className="flex flex-col gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Forma de Pagamento</span>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => setPurchasePaymentMethod('online')}
                          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                            purchasePaymentMethod === 'online'
                              ? 'border-amber-500 bg-amber-500/[0.02] shadow-[0_0_12px_rgba(245,158,11,0.06)]'
                              : 'border-zinc-900 bg-zinc-950/20 hover:border-zinc-800'
                          }`}
                        >
                          <span className={`text-[10px] font-bold ${purchasePaymentMethod === 'online' ? 'text-amber-500' : 'text-white'}`}>Pagar Online</span>
                          <span className="text-[8px] text-zinc-550 leading-normal">Cartão / Pix via Gateway</span>
                        </button>
                        
                        <button
                          onClick={() => setPurchasePaymentMethod('pickup')}
                          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                            purchasePaymentMethod === 'pickup'
                              ? 'border-amber-500 bg-amber-500/[0.02] shadow-[0_0_12px_rgba(245,158,11,0.06)]'
                              : 'border-zinc-900 bg-zinc-950/20 hover:border-zinc-800'
                          }`}
                        >
                          <span className={`text-[10px] font-bold ${purchasePaymentMethod === 'pickup' ? 'text-amber-500' : 'text-white'}`}>Na Retirada</span>
                          <span className="text-[8px] text-zinc-550 leading-normal">Dinheiro / Pix / Cartão</span>
                        </button>
                      </div>
                    </div>

                    {/* Aviso Obrigatório */}
                    <div className="p-3.5 bg-blue-500/[0.03] border border-blue-500/20 text-blue-400 rounded-2xl text-[10px] leading-relaxed font-light flex gap-2">
                      <Info size={14} className="text-blue-400 flex-shrink-0 mt-0.5" />
                      <span>
                        <strong>Aviso sobre Retirada:</strong> Os produtos adquiridos devem ser retirados presencialmente na barbearia. Não realizamos entregas.
                      </span>
                    </div>

                    {/* Rodapé do Modal */}
                    <div className="border-t border-zinc-900 pt-4 flex items-center justify-between flex-wrap gap-4 mt-1">
                      <div>
                        <span className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider block">Valor Total</span>
                        <span className="text-2xl font-extrabold text-white font-sans mt-0.5 block">
                          R$ {(Number(selectedProduct.price) * purchaseQuantity).toFixed(2)}
                        </span>
                      </div>
                      
                      {purchasePaymentMethod === 'online' ? (
                        <button
                          onClick={() => setCheckoutStep('online_form')}
                          className="px-6 py-3.5 rounded-full text-xs font-bold text-black bg-gradient-to-r from-amber-500 to-yellow-500 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shadow-[0_0_15px_rgba(245,158,11,0.15)] flex items-center gap-1"
                        >
                          <span>Pagar Online</span>
                          <ArrowRight size={12} className="stroke-[2.5px]" />
                        </button>
                      ) : (
                        <button
                          onClick={handleConfirmPickup}
                          disabled={purchaseSaving}
                          className="px-6 py-3.5 rounded-full text-xs font-bold text-black bg-gradient-to-r from-amber-500 to-yellow-500 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shadow-[0_0_15px_rgba(245,158,11,0.15)] flex items-center gap-1 disabled:opacity-50"
                        >
                          {purchaseSaving ? (
                            <Loader2 size={12} className="animate-spin text-black" />
                          ) : (
                            <>
                              <span>Reservar & Retirar</span>
                              <Check size={12} className="stroke-[2.5px]" />
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* STEP 2: ONLINE FORM */}
                {checkoutStep === 'online_form' && (
                  <div className="flex flex-col gap-4">
                    {/* Botão de Voltar */}
                    <button
                      onClick={() => { setCheckoutStep('select_method'); setPurchaseError('') }}
                      className="text-left text-[10px] text-zinc-500 hover:text-white transition-colors cursor-pointer w-fit"
                    >
                      &larr; Voltar para opções
                    </button>

                    {/* Abas de Pagamento: Cartão vs Pix */}
                    <div className="flex bg-zinc-950 border border-zinc-900 rounded-2xl p-1">
                      <button
                        type="button"
                        onClick={() => { setOnlinePaymentType('credit_card'); setPurchaseError('') }}
                        className={`flex-1 py-2 rounded-xl text-center text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                          onlinePaymentType === 'credit_card'
                            ? 'bg-zinc-900 text-amber-500 shadow-sm border border-zinc-800'
                            : 'text-zinc-500 hover:text-zinc-350'
                        }`}
                      >
                        <CreditCard size={12} />
                        <span>Cartão de Crédito</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => { setOnlinePaymentType('pix'); setPurchaseError('') }}
                        className={`flex-1 py-2 rounded-xl text-center text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                          onlinePaymentType === 'pix'
                            ? 'bg-zinc-900 text-amber-500 shadow-sm border border-zinc-800'
                            : 'text-zinc-500 hover:text-zinc-350'
                        }`}
                      >
                        <QrCode size={12} />
                        <span>Pix</span>
                      </button>
                    </div>

                    {purchaseError && (
                      <div className="p-3 bg-red-955/20 border border-red-900/40 text-red-400 rounded-xl text-[10px]">
                        {purchaseError}
                      </div>
                    )}

                    {/* FORMULÁRIO DO CARTÃO DE CRÉDITO */}
                    {onlinePaymentType === 'credit_card' && (
                      <div className="flex flex-col gap-3.5">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[9px] font-bold uppercase tracking-wider text-zinc-500">Nome no Cartão</label>
                          <input
                            type="text"
                            placeholder="Ex: João P Silva"
                            value={cardName}
                            onChange={(e) => setCardName(e.target.value)}
                            className="px-4 py-3 bg-zinc-950/40 border border-zinc-900 rounded-xl focus:border-amber-500/80 focus:outline-none text-xs text-white"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[9px] font-bold uppercase tracking-wider text-zinc-500">Número do Cartão</label>
                          <input
                            type="text"
                            placeholder="4000 1234 5678 9010"
                            maxLength={19}
                            value={cardNumber}
                            onChange={(e) => {
                              const v = e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim();
                              setCardNumber(v);
                            }}
                            className="px-4 py-3 bg-zinc-950/40 border border-zinc-900 rounded-xl focus:border-amber-500/80 focus:outline-none text-xs text-white font-mono"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[9px] font-bold uppercase tracking-wider text-zinc-500">Validade</label>
                            <input
                              type="text"
                              placeholder="MM/AA"
                              maxLength={5}
                              value={cardExpiry}
                              onChange={(e) => {
                                let v = e.target.value.replace(/\D/g, '');
                                if (v.length > 2) v = v.substring(0, 2) + '/' + v.substring(2, 4);
                                setCardExpiry(v);
                              }}
                              className="px-4 py-3 bg-zinc-950/40 border border-zinc-900 rounded-xl focus:border-amber-500/80 focus:outline-none text-xs text-white font-mono"
                            />
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[9px] font-bold uppercase tracking-wider text-zinc-500">CVV</label>
                            <input
                              type="text"
                              placeholder="123"
                              maxLength={4}
                              value={cardCvv}
                              onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                              className="px-4 py-3 bg-zinc-950/40 border border-zinc-900 rounded-xl focus:border-amber-500/80 focus:outline-none text-xs text-white font-mono"
                            />
                          </div>
                        </div>

                        <div className="text-[10px] text-zinc-550 leading-normal flex items-start gap-1.5 mt-1">
                          <ShieldCheck size={12} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                          <span>Conexão segura SSL de testes. Seus dados estão simulados localmente de forma segura.</span>
                        </div>

                        {/* Botão de confirmação de pagamento */}
                        <button
                          type="button"
                          onClick={handleStartOnlinePayment}
                          className="mt-2 w-full py-3.5 rounded-full text-xs font-bold text-black bg-gradient-to-r from-amber-500 to-yellow-500 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shadow-[0_0_15px_rgba(245,158,11,0.15)] flex items-center justify-center gap-1.5"
                        >
                          <CheckCircle2 size={13} className="stroke-[2.5px]" />
                          <span>Pagar R$ {(Number(selectedProduct.price) * purchaseQuantity).toFixed(2)}</span>
                        </button>
                      </div>
                    )}

                    {/* MOCK DE PIX COPIA E COLA */}
                    {onlinePaymentType === 'pix' && (
                      <div className="flex flex-col gap-4 items-center py-2">
                        {/* QR Code Simulado Premium */}
                        <div className="p-3 bg-white rounded-3xl border border-zinc-200 shadow-md relative overflow-hidden flex flex-col items-center justify-center">
                          <svg width="140" height="140" viewBox="0 0 100 100" className="text-black fill-current">
                            <rect x="0" y="0" width="25" height="25" />
                            <rect x="5" y="5" width="15" height="15" fill="white" />
                            <rect x="8" y="8" width="9" height="9" />
                            
                            <rect x="75" y="0" width="25" height="25" />
                            <rect x="80" y="5" width="15" height="15" fill="white" />
                            <rect x="83" y="8" width="9" height="9" />
                            
                            <rect x="0" y="75" width="25" height="25" />
                            <rect x="5" y="80" width="15" height="15" fill="white" />
                            <rect x="8" y="83" width="9" height="9" />
                            
                            <rect x="30" y="5" width="8" height="8" />
                            <rect x="45" y="2" width="6" height="6" />
                            <rect x="55" y="8" width="12" height="6" />
                            <rect x="35" y="20" width="10" height="10" />
                            <rect x="50" y="22" width="15" height="6" />
                            <rect x="68" y="25" width="6" height="14" />
                            <rect x="30" y="35" width="12" height="12" />
                            <rect x="48" y="38" width="8" height="8" />
                            <rect x="60" y="45" width="14" height="14" />
                            <rect x="10" y="35" width="8" height="14" />
                            <rect x="15" y="55" width="16" height="8" />
                            <rect x="0" y="65" width="8" height="6" />
                            <rect x="35" y="55" width="10" height="10" />
                            <rect x="48" y="62" width="18" height="10" />
                            <rect x="30" y="72" width="8" height="18" />
                            <rect x="72" y="72" width="12" height="12" />
                            <rect x="88" y="72" width="8" height="8" />
                            <rect x="75" y="88" width="22" height="8" />
                          </svg>
                          
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 py-0.5 border border-zinc-200 rounded-lg text-[9px] font-bold text-teal-600 tracking-wider">
                            PIX
                          </div>
                        </div>

                        <div className="text-center">
                          <p className="text-xs text-white font-bold">Escaneie o código QR acima</p>
                          <p className="text-[10px] text-zinc-550 mt-1 max-w-xs leading-normal font-sans">
                            Ou copie o código copia e cola abaixo para realizar o pagamento no aplicativo do seu banco.
                          </p>
                        </div>

                        {/* Copia e Cola */}
                        <div className="w-full bg-[#0c0c0e]/60 border border-zinc-900 rounded-2xl p-3.5 flex items-center justify-between gap-3">
                          <span className="text-[9px] font-mono text-zinc-400 select-all truncate max-w-[280px]">
                            00020101021226830014br.gov.bcb.pix256132026barber-gold-studio-purchase-test-payload
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              if (typeof window !== 'undefined') {
                                navigator.clipboard.writeText('00020101021226830014br.gov.bcb.pix256132026barber-gold-studio-purchase-test-payload');
                                if (pixTimerRef.current) {
                                  clearTimeout(pixTimerRef.current);
                                }
                                setPixCopied(true);
                                pixTimerRef.current = setTimeout(() => setPixCopied(false), 2000);
                              }
                            }}
                            className="p-2 bg-zinc-900 border border-zinc-800 text-zinc-455 hover:text-white rounded-xl transition-colors cursor-pointer flex-shrink-0"
                            title="Copiar Código"
                          >
                            {pixCopied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={handleStartOnlinePayment}
                          className="w-full py-3.5 rounded-full text-xs font-bold text-black bg-gradient-to-r from-amber-500 to-yellow-500 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shadow-[0_0_15px_rgba(245,158,11,0.15)] flex items-center justify-center gap-1.5"
                        >
                          <CheckCircle2 size={13} className="stroke-[2.5px]" />
                          <span>Já fiz o pagamento / Confirmar</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* STEP 3: ONLINE PROCESSING */}
                {checkoutStep === 'online_processing' && (
                  <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
                    <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
                    <div>
                      <h4 className="text-sm font-extrabold uppercase tracking-widest text-white">Processando Transação</h4>
                      <p className="text-zinc-550 text-xs font-light max-w-xs mt-1.5 leading-relaxed font-sans">
                        Conectando com o gateway de pagamentos seguro e validando transação...
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* FOOTER */}
        <footer className="py-6 text-center border-t border-white/[0.02] bg-black/30 relative z-10">
          <p className="text-[9px] uppercase font-bold text-zinc-600 tracking-widest">
            &copy; {currentYear} {shop?.name} &bull; Plataforma BarberShopBR
          </p>
        </footer>

      </div>
    </>
  )
}