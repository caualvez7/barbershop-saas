'use client'

import { supabaseCustomer as supabase } from '../../../lib/supabase-customer.js'
import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Scissors, 
  Sparkles, 
  Star, 
  MapPin, 
  Phone, 
  Clock, 
  Calendar, 
  ArrowRight, 
  Check, 
  Shield, 
  Award,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  Menu,
  MessageSquare
} from 'lucide-react'

// Componente SVG local para o ícone do Instagram para evitar incompatibilidades de exportação do Lucide
const InstagramIcon = ({ size = 24, ...props }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
)
import ThreeBackground from '../../components/ThreeBackground'
import NumberTicker from '../../components/ui/NumberTicker'
import './client-landing.css'
import Lenis from 'lenis'

// Banco de imagens de alta fidelidade e resolução do Unsplash
const UNSPLASH_IMAGES = {
  hero: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=1920&auto=format&fit=crop',
  barberShopInterior: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=1200&auto=format&fit=crop',
  ctaBg: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?q=80&w=1920&auto=format&fit=crop',
  
  // Categorias de Serviços
  services: {
    haircut: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?q=80&w=600&auto=format&fit=crop',
    beard: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?q=80&w=600&auto=format&fit=crop',
    shave: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=600&auto=format&fit=crop',
    hairSpa: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=600&auto=format&fit=crop',
    default: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=600&auto=format&fit=crop'
  },
  
  // Barbeiros Fallbacks
  barbers: [
    'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1600486913747-55e5470d6f40?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=400&auto=format&fit=crop'
  ],
  
  // Galeria de Estilo
  gallery: [
    { url: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?q=80&w=800&auto=format&fit=crop', title: 'Corte Degradê Moderno' },
    { url: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=800&auto=format&fit=crop', title: 'Nossa Cadeira de Couro Clássica' },
    { url: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=800&auto=format&fit=crop', title: 'Tratamento de Toalha Quente' },
    { url: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=800&auto=format&fit=crop', title: 'Corte Clássico Executivo' },
    { url: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?q=80&w=800&auto=format&fit=crop', title: 'Barba Esculpida em Detalhes' },
    { url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=800&auto=format&fit=crop', title: 'Spa de Cabelo e Hidratação' }
  ],
  
  // Clientes Depoimentos
  avatars: [
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=150&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?q=80&w=150&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=150&auto=format&fit=crop'
  ]
}

// Depoimentos realistas de alta fidelidade
const TESTIMONIALS = [
  {
    name: "Guilherme Santos",
    role: "Cliente VIP",
    rating: 5,
    comment: "Ambiente fantástico e atendimento impecável. O clube de assinatura mudou minha rotina, consigo manter o cabelo e barba alinhados toda semana sem complicação.",
    avatar: UNSPLASH_IMAGES.avatars[0]
  },
  {
    name: "Rodrigo Mello",
    role: "Empresário",
    rating: 5,
    comment: "Uma experiência genuinamente de alto padrão. O acabamento com a navalha e o tratamento com a toalha quente expressam luxo e o máximo respeito ao cliente.",
    avatar: UNSPLASH_IMAGES.avatars[1]
  },
  {
    name: "Arthur Valente",
    role: "Diretor Criativo",
    rating: 5,
    comment: "Profissionalismo extraordinário. Os barbeiros aqui são verdadeiros mestres do visagismo. É mais do que cortar cabelo, é elevar a autoimagem.",
    avatar: UNSPLASH_IMAGES.avatars[2]
  },
  {
    name: "Thiago Ramos",
    role: "Cliente Fiel",
    rating: 5,
    comment: "Excelente plataforma de agendamento online. Consigo marcar meu horário em segundos no celular, escolher o meu profissional preferido e ter prioridade.",
    avatar: UNSPLASH_IMAGES.avatars[3]
  }
]

export default function ClientLandingPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params?.slug

  // Estados principais
  const [shop, setShop] = useState(null)
  const [services, setServices] = useState([])
  const [plans, setPlans] = useState([])
  const [barbers, setBarbers] = useState([])
  const [hours, setHours] = useState([])
  const [loading, setLoading] = useState(true)

  // Estados Interativos da UI
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [lightboxImage, setLightboxImage] = useState(null)
  const [activeTestimonial, setActiveTestimonial] = useState(0)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Carregar dados dinâmicos do Supabase baseados no slug
  useEffect(() => {
    const loadShopData = async () => {
      try {
        setLoading(true)
        const { data: shopData, error: shopError } = await supabase
          .from('barbershops')
          .select('*')
          .eq('slug', slug)
          .single()

        if (shopError || !shopData) {
          setLoading(false)
          return
        }
        setShop(shopData)

        // Buscar serviços
        const { data: servicesData } = await supabase
          .from('services')
          .select('*')
          .eq('barbershop_id', shopData.id)
        setServices(servicesData || [])

        // Buscar planos ativos
        const { data: plansData } = await supabase
          .from('plans')
          .select('*, plan_services(*)')
          .eq('barbershop_id', shopData.id)
          .eq('active', true)
        setPlans(plansData || [])

        // Buscar barbeiros ativos
        const { data: barbersData } = await supabase
          .from('barbers')
          .select('*')
          .eq('barbershop_id', shopData.id)
          .eq('active', true)
        setBarbers(barbersData || [])

        // Buscar horários comerciais
        const { data: hoursData } = await supabase
          .from('business_hours')
          .select('*')
          .eq('barbershop_id', shopData.id)
        setHours(hoursData || [])

      } catch (err) {
        console.error('Erro ao carregar dados da barbearia:', err)
      } finally {
        setLoading(false)
      }
    }
    if (slug) loadShopData()
  }, [slug])

  // Inicializar Lenis Smooth Scroll
  useEffect(() => {
    if (loading || !shop) return

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    })

    function raf(time) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)

    return () => {
      lenis.destroy()
    }
  }, [loading, shop])

  // Efeito 3D Card Hover
  const handleMouseMove = (e) => {
    const card = e.currentTarget
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const rotateX = ((centerY - y) / centerY) * 8 // Rotação máxima de 8 graus
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

  // Mapeamento dinâmico de fotos realistas para serviços cadastrados
  const getServiceImage = (serviceName) => {
    const name = serviceName.toLowerCase()
    if (name.includes('corte') || name.includes('cabelo') || name.includes('degrad')) {
      return UNSPLASH_IMAGES.services.haircut
    }
    if (name.includes('barba') || name.includes('terapia') || name.includes('hot towel')) {
      return UNSPLASH_IMAGES.services.beard
    }
    if (name.includes('navalha') || name.includes('barbear') || name.includes('shave')) {
      return UNSPLASH_IMAGES.services.shave
    }
    if (name.includes('combo') || name.includes('completo') || name.includes('vip') || name.includes('sobrancelha') || name.includes('quimica')) {
      return UNSPLASH_IMAGES.services.hairSpa
    }
    return UNSPLASH_IMAGES.services.default
  }

  // Retornar nome formatado do dia da semana
  const formatDayName = (dayNum) => {
    const days = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado']
    return days[dayNum]
  }

  // Ir para autenticação e agendamento
  const handleScheduleAction = () => {
    router.push(`/barber/${slug}/auth`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030303] flex flex-col items-center justify-center text-zinc-500 font-sans gap-3">
        <div className="w-8 h-8 rounded-full border border-t-amber-500 border-zinc-800 animate-spin" />
        <p className="text-xs uppercase tracking-widest text-zinc-600 font-bold animate-pulse">Carregando Experiência...</p>
      </div>
    )
  }

  if (!shop) {
    return (
      <div className="min-h-screen bg-[#030303] flex flex-col items-center justify-center text-center px-4 font-sans">
        <Scissors size={40} className="text-zinc-700 mb-4 animate-bounce" />
        <h2 className="text-lg font-bold text-white tracking-tight">Barbearia não encontrada</h2>
        <p className="text-zinc-500 text-xs mt-1 max-w-xs leading-normal">
          O endereço solicitado não pertence a nenhuma barbearia ativa em nosso sistema.
        </p>
        <button
          onClick={() => router.push('/')}
          className="mt-6 px-5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-full text-xs font-semibold text-zinc-300 hover:bg-zinc-800 transition-all cursor-pointer"
        >
          Voltar para Home
        </button>
      </div>
    )
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
        
        /* Fontes customizadas no documento */
        .font-serif-lux {
          font-family: 'Instrument Serif', serif;
        }
        .font-sans-lux {
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
      `}</style>

      <div className="font-sans-lux min-h-screen bg-[#030303] text-white overflow-hidden selection:bg-amber-500 selection:text-black antialiased">
        
        {/* BACKGROUND 3D DE PARTÍCULAS DOURADAS (THREE.JS) */}
        <ThreeBackground />

        {/* HEADER / NAVBAR */}
        <header className="fixed top-0 left-0 w-full z-[999] border-b border-white/[0.03] bg-black/60 backdrop-blur-xl transition-all duration-300 px-6 py-4 md:px-12 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-serif-lux text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-1.5">
              <Sparkles size={16} className="text-amber-500 animate-pulse" />
              <span>{shop.name}</span>
            </span>
          </div>

          {/* Links Internos (Desktop) */}
          <nav className="hidden md:flex items-center gap-8 text-[11px] font-bold uppercase tracking-wider text-zinc-400">
            <a href="#servicos" className="hover:text-white transition-colors">Serviços</a>
            <a href="#equipe" className="hover:text-white transition-colors">Profissionais</a>
            <a href="#planos" className="hover:text-white transition-colors">Clubes</a>
            <a href="#galeria" className="hover:text-white transition-colors">Galeria</a>
            <a href="#contato" className="hover:text-white transition-colors">Horários & Contato</a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={handleScheduleAction}
              className="px-5 py-2.5 rounded-full text-xs font-bold text-black bg-gradient-to-r from-amber-500 to-yellow-500 hover:scale-[1.03] active:scale-[0.97] transition-all shadow-[0_0_20px_rgba(245,158,11,0.2)] cursor-pointer hidden sm:block"
            >
              Agendar Horário
            </button>
            
            {/* Menu Mobile Button */}
            <button
              onClick={() => setMobileMenuOpen(prev => !prev)}
              className="p-2 border border-zinc-800 rounded-lg text-zinc-400 hover:text-white md:hidden cursor-pointer"
            >
              <Menu size={16} />
            </button>
          </div>
        </header>

        {/* MOBILE NAVIGATION MENU */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-[65px] left-0 w-full z-[998] border-b border-zinc-900 bg-black/95 backdrop-blur-2xl p-6 flex flex-col gap-5 md:hidden"
            >
              <div className="flex flex-col gap-3 text-xs font-bold uppercase tracking-wider text-zinc-400">
                <a href="#servicos" onClick={() => setMobileMenuOpen(false)} className="py-2 border-b border-zinc-900 hover:text-white">Serviços</a>
                <a href="#equipe" onClick={() => setMobileMenuOpen(false)} className="py-2 border-b border-zinc-900 hover:text-white">Profissionais</a>
                <a href="#planos" onClick={() => setMobileMenuOpen(false)} className="py-2 border-b border-zinc-900 hover:text-white">Clubes</a>
                <a href="#galeria" onClick={() => setMobileMenuOpen(false)} className="py-2 border-b border-zinc-900 hover:text-white">Galeria</a>
                <a href="#contato" onClick={() => setMobileMenuOpen(false)} className="py-2 border-b border-zinc-900 hover:text-white">Horários & Contato</a>
              </div>
              <button
                onClick={() => {
                  setMobileMenuOpen(false)
                  handleScheduleAction()
                }}
                className="w-full py-3 rounded-xl text-xs font-bold text-black bg-gradient-to-r from-amber-500 to-yellow-500 text-center"
              >
                Agendar Agora
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* HERO SECTION */}
        <section className="relative min-h-screen flex items-center justify-center px-6 md:px-12 pt-24 overflow-hidden">
          
          {/* Capa de fundo com overlay escuro cinematográfico */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-[#030303]/70 to-transparent z-10" />
            <div className="absolute inset-0 bg-black/45 z-10" />
            <img
              src={UNSPLASH_IMAGES.hero}
              alt="Barbearia premium"
              className="w-full h-full object-cover scale-105 select-none"
            />
          </div>

          <div className="relative z-10 max-w-4xl w-full text-center flex flex-col items-center">
            
            {/* Tag / Badge */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-1.5 border border-amber-500/20 bg-amber-500/[0.04] backdrop-blur-md rounded-full px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-amber-500 mb-6"
            >
              <Scissors size={10} className="stroke-[3px]" />
              <span>Agendamento Online Ativo</span>
            </motion.div>

            {/* Slogan de impacto */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="font-serif-lux text-5xl sm:text-6xl md:text-8xl font-normal tracking-tight text-white mb-6 leading-[0.95]"
            >
              Mais do que um corte.<br />
              <em className="font-serif-lux italic text-amber-500 font-normal">Uma experiência.</em>
            </motion.h1>

            {/* Subtítulo */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-zinc-400 text-xs sm:text-sm md:text-base font-light max-w-lg mb-10 leading-relaxed"
            >
              Agende online de forma rápida, selecione o seu profissional favorito e aproveite um tratamento sofisticado de altíssimo padrão.
            </motion.p>

            {/* Ações */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="flex flex-col sm:flex-row items-center gap-4 justify-center w-full max-w-xs sm:max-w-md"
            >
              <button
                onClick={handleScheduleAction}
                className="w-full sm:w-auto px-8 py-4 rounded-full text-xs font-bold text-black bg-gradient-to-r from-amber-500 to-yellow-500 hover:scale-[1.03] active:scale-[0.97] transition-all shadow-[0_0_30px_rgba(245,158,11,0.25)] cursor-pointer flex items-center justify-center gap-2"
              >
                <Calendar size={13} />
                <span>Agendar Agora</span>
              </button>
              
              <a
                href="#servicos"
                className="w-full sm:w-auto px-8 py-4 rounded-full text-xs font-bold text-zinc-300 border border-zinc-800 hover:bg-zinc-950/60 hover:text-white transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Conhecer Serviços</span>
                <ArrowRight size={13} />
              </a>
            </motion.div>

            {/* Prova Social Flutuante (Estatísticas) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1, duration: 1 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-12 mt-20 pt-10 border-t border-white/[0.04] w-full max-w-3xl"
            >
              <div className="flex flex-col items-center">
                <span className="text-2xl font-extrabold text-white tracking-tight">
                  <NumberTicker value={4.9} decimals={1} suffix="★" startImmediately={true} />
                </span>
                <span className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider mt-1">Avaliações Clientes</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-2xl font-extrabold text-white tracking-tight">
                  <NumberTicker value={10} decimals={0} suffix="k+" startImmediately={true} />
                </span>
                <span className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider mt-1">Atendimentos</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-2xl font-extrabold text-white tracking-tight">
                  <NumberTicker value={barbers.length > 0 ? barbers.length : 8} decimals={0} startImmediately={true} />
                </span>
                <span className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider mt-1">Barbeiros na Equipe</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-2xl font-extrabold text-white tracking-tight">
                  <NumberTicker value={100} decimals={0} suffix="%" startImmediately={true} />
                </span>
                <span className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider mt-1">Garantia VIP</span>
              </div>
            </motion.div>

          </div>
        </section>

        {/* BENEFÍCIOS DE LUXO */}
        <section className="py-24 px-6 md:px-12 bg-gradient-to-b from-[#030303] to-[#080808] relative z-10 border-t border-white/[0.02]">
          <div className="max-w-5xl mx-auto">
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* Benefício 1 */}
              <div className="glass-panel p-8 rounded-3xl border border-zinc-900/60 flex flex-col gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                  <Shield size={20} />
                </div>
                <h3 className="text-base font-bold tracking-tight text-white">Prioridade no Agendamento</h3>
                <p className="text-zinc-500 text-xs font-light leading-relaxed">
                  Assine nossos planos de fidelidade e tenha acesso antecipado à agenda dos barbeiros mais procurados, garantindo seu horário preferido.
                </p>
              </div>

              {/* Benefício 2 */}
              <div className="glass-panel p-8 rounded-3xl border border-zinc-900/60 flex flex-col gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                  <Sparkles size={20} />
                </div>
                <h3 className="text-base font-bold tracking-tight text-white">Cortes & Cuidados Ilimitados</h3>
                <p className="text-zinc-500 text-xs font-light leading-relaxed">
                  Esqueça a preocupação com valores unitários. Pague uma assinatura recorrente mensal e mantenha seu visual sempre impecável.
                </p>
              </div>

              {/* Benefício 3 */}
              <div className="glass-panel p-8 rounded-3xl border border-zinc-900/60 flex flex-col gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                  <Award size={20} />
                </div>
                <h3 className="text-base font-bold tracking-tight text-white">Bebidas e Vantagens Exclusivas</h3>
                <p className="text-zinc-500 text-xs font-light leading-relaxed">
                  Desfrute de café expresso gourmet, cerveja artesanal trincando e descontos especiais em produtos premium de modelação para membros.
                </p>
              </div>

            </div>

          </div>
        </section>

        {/* CATÁLOGO DE SERVIÇOS PREMIUM */}
        {services.length > 0 && (
          <section id="servicos" className="py-24 px-6 md:px-12 bg-[#080808] relative z-10">
            <div className="max-w-5xl mx-auto">
              
              <div className="flex flex-col items-center text-center mb-16">
                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-500">Catálogo de Serviços</span>
                <h2 className="font-serif-lux text-4xl md:text-5xl font-normal tracking-tight text-white mt-3">
                  Escolha o seu próximo visual
                </h2>
                <p className="text-zinc-500 text-xs font-light max-w-sm mt-2 leading-relaxed">
                  Tratamentos completos de cabelo, barba e estética desenvolvidos por profissionais certificados de alto nível.
                </p>
              </div>

              {/* Grid 3D de Serviços */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {services.map(service => (
                  <div
                    key={service.id}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    className="premium-card-3d group relative rounded-3xl border border-zinc-900 bg-[#0c0c0e]/40 p-5 flex items-center gap-5 cursor-pointer shadow-lg hover:border-zinc-800/80 transition-all overflow-hidden"
                    onClick={handleScheduleAction}
                  >
                    {/* Glow background interativo */}
                    <div className="premium-card-3d__glow" />

                    <div className="premium-card-3d__content flex w-full items-center gap-5">
                      {/* Imagem do Serviço */}
                      <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden flex-shrink-0 border border-white/[0.04] relative">
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-all z-10" />
                        <img
                          src={getServiceImage(service.name)}
                          alt={service.name}
                          className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                        />
                      </div>

                      {/* Informações */}
                      <div className="flex-1">
                        <h3 className="text-sm md:text-base font-bold text-white group-hover:text-amber-500 transition-colors">
                          {service.name}
                        </h3>
                        <p className="text-zinc-500 text-xxs uppercase tracking-wider font-bold mt-1">
                          Duração: {service.duration} minutos
                        </p>
                        
                        <div className="flex items-center justify-between mt-4">
                          <span className="text-base md:text-lg font-extrabold text-white tracking-tight">
                            R$ {Number(service.price).toFixed(2)}
                          </span>
                          
                          <span className="text-[10px] font-bold text-amber-500 flex items-center gap-1 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                            <span>Agendar</span>
                            <ArrowRight size={10} />
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </section>
        )}

        {/* EQUIPE / BARBEIROS */}
        {barbers.length > 0 && (
          <section id="equipe" className="py-24 px-6 md:px-12 bg-gradient-to-b from-[#080808] to-[#030303] relative z-10">
            <div className="max-w-5xl mx-auto">
              
              <div className="flex flex-col items-center text-center mb-16">
                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-500">Mestres Tesouras</span>
                <h2 className="font-serif-lux text-4xl md:text-5xl font-normal tracking-tight text-white mt-3">
                  Nossa Equipe de Barbeiros
                </h2>
                <p className="text-zinc-500 text-xs font-light max-w-sm mt-2 leading-relaxed">
                  Profissionais treinados e apaixonados pelo estilo, prontos para modelar o seu visual com maestria.
                </p>
              </div>

              {/* Grid 3D de Barbeiros */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {barbers.map((barber, index) => (
                  <div
                    key={barber.id}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    className="premium-card-3d group relative rounded-3xl border border-zinc-900 bg-[#0c0c0e]/50 p-4 flex flex-col gap-4 text-center cursor-pointer hover:border-zinc-800 transition-all"
                    onClick={handleScheduleAction}
                  >
                    {/* Glow background interativo */}
                    <div className="premium-card-3d__glow" />

                    <div className="premium-card-3d__content flex flex-col items-center w-full">
                      {/* Avatar do Barbeiro */}
                      <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-zinc-800 group-hover:border-amber-500 transition-colors duration-300 relative shadow-inner mb-3">
                        <img
                          src={barber.photo_url || UNSPLASH_IMAGES.barbers[index % UNSPLASH_IMAGES.barbers.length]}
                          alt={barber.full_name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>

                      <h3 className="text-xs font-bold text-white tracking-tight">{barber.full_name}</h3>
                      <p className="text-[9px] font-bold uppercase tracking-wider text-amber-500/70 mt-1">Especialista Visagista</p>
                      
                      {/* Avaliação Estrelas */}
                      <div className="flex items-center gap-0.5 justify-center mt-3 text-amber-500">
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star key={star} size={9} className="fill-amber-500" />
                        ))}
                        <span className="text-[9px] font-bold text-zinc-400 ml-1">5.0</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </section>
        )}

        {/* SEÇÃO DE PLANOS DE ASSINATURA */}
        {plans.length > 0 && (
          <section id="planos" className="py-24 px-6 md:px-12 bg-[#030303] relative z-10 border-t border-white/[0.01]">
            <div className="max-w-5xl mx-auto">
              
              <div className="flex flex-col items-center text-center mb-16">
                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-500">Clube de Fidelidade</span>
                <h2 className="font-serif-lux text-4xl md:text-5xl font-normal tracking-tight text-white mt-3">
                  Planos de Assinatura Recorrente
                </h2>
                <p className="text-zinc-500 text-xs font-light max-w-sm mt-2 leading-relaxed">
                  Garanta cortes ilimitados, descontos especiais em serviços adicionais e prioridade na agenda.
                </p>
              </div>

              {/* Lista de Planos */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                {plans.map((plan, index) => {
                  const isRecommended = index === 0 // Define o primeiro como recomendado
                  return (
                    <div
                      key={plan.id}
                      onMouseMove={handleMouseMove}
                      onMouseLeave={handleMouseLeave}
                      className={`premium-card-3d group relative rounded-3xl p-6 flex flex-col gap-6 shadow-2xl transition-all cursor-pointer ${
                        isRecommended 
                          ? 'animated-gold-border' 
                          : 'border border-zinc-900 bg-[#0c0c0e]/30'
                      }`}
                      onClick={() => setSelectedPlan(plan)}
                    >
                      {/* Glow background interativo */}
                      <div className="premium-card-3d__glow" />

                      {/* Conteúdo com Borda Animada Dourada */}
                      <div className={`premium-card-3d__content flex flex-col justify-between h-full gap-6 ${
                        isRecommended ? 'animated-gold-border__inner p-6 bg-[#09090b]' : ''
                      }`}>
                        
                        {/* Header */}
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-base md:text-lg font-bold tracking-tight text-white">
                                {plan.name}
                              </h3>
                              {isRecommended && (
                                <span className="text-[8px] font-bold text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-sm">
                                  <Sparkles size={8} className="animate-pulse" />
                                  <span>Recomendado</span>
                                </span>
                              )}
                            </div>
                            
                            <div className="flex items-baseline gap-1 mt-3">
                              <span className="text-3xl md:text-4xl font-extrabold tracking-tight text-white font-sans">
                                R$ {Number(plan.price).toFixed(2)}
                              </span>
                              <span className="text-xs text-zinc-500">/mês</span>
                            </div>
                          </div>

                          <div className="w-10 h-10 rounded-xl bg-amber-500/5 border border-amber-500/10 flex items-center justify-center text-amber-500">
                            <Sparkles size={16} />
                          </div>
                        </div>

                        {/* Linha Divisória */}
                        <div className="border-b border-zinc-900 w-full" />

                        {/* Benefícios */}
                        {plan.plan_services?.length > 0 ? (
                          <div className="flex flex-col gap-3">
                            <p className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider">Benefícios inclusos:</p>
                            <ul className="flex flex-col gap-2">
                              {plan.plan_services.slice(0, 3).map(svc => {
                                const isFree = svc.benefit_type === 'free'
                                return (
                                  <li key={svc.id} className="flex items-center gap-2 text-xs">
                                    <div className="w-4 h-4 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0 text-amber-500">
                                      <Check size={10} className="stroke-[3.5px]" />
                                    </div>
                                    <span className="text-zinc-300 font-medium">{svc.service_name}</span>
                                    <span className={`text-[8px] font-bold px-1.5 py-0.2 rounded ${
                                      isFree 
                                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/10' 
                                        : 'bg-amber-500/10 text-amber-500 border border-amber-500/10'
                                    }`}>
                                      {isFree ? '100% Grátis' : `${svc.discount_percent}% OFF`}
                                    </span>
                                  </li>
                                )
                              })}
                            </ul>
                          </div>
                        ) : (
                          <p className="text-[10px] text-zinc-500">Sem serviços vinculados ao plano.</p>
                        )}

                        {/* Ações */}
                        <div className="flex items-center justify-between pt-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedPlan(plan)
                            }}
                            className="text-[10px] font-bold text-amber-500 hover:text-amber-400 flex items-center gap-1 bg-none border-none cursor-pointer"
                          >
                            <span>Confira todas vantagens</span>
                            <ArrowRight size={10} />
                          </button>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleScheduleAction()
                            }}
                            className="px-5 py-2.5 rounded-xl text-xs font-bold text-black bg-gradient-to-r from-amber-500 to-yellow-500 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shadow-sm"
                          >
                            Assinar Plano
                          </button>
                        </div>

                      </div>
                    </div>
                  )
                })}
              </div>

            </div>
          </section>
        )}

        {/* GALERIA INSTAGRAM-QUALITY */}
        <section id="galeria" className="py-24 px-6 md:px-12 bg-gradient-to-b from-[#030303] to-[#080808] relative overflow-hidden z-10">
          
          <motion.div
            initial={{ opacity: 0, filter: 'blur(15px)', y: 40 }}
            whileInView={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
            viewport={{ once: true, margin: "-120px" }}
            transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-5xl mx-auto relative z-10"
          >
            
            <div className="flex flex-col items-center text-center mb-16">
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-500">Portfólio & Cortes</span>
              <h2 className="font-serif-lux text-4xl md:text-5xl font-normal tracking-tight text-white mt-3">
                Galeria de Estilos
              </h2>
              <p className="text-zinc-500 text-xs font-light max-w-sm mt-2 leading-relaxed">
                Fotos reais dos cortes, barbas, alinhamentos e do ambiente acolhedor da nossa barbearia.
              </p>
            </div>

            {/* Grid Simétrico de Imagens (Preenchendo todo o espaço no mesmo formato) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {UNSPLASH_IMAGES.gallery.map((img, i) => (
                <div
                  key={i}
                  className="relative rounded-3xl overflow-hidden border border-zinc-900 group cursor-pointer aspect-[4/3]"
                  onClick={() => setLightboxImage(img)}
                >
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/10 transition-all duration-300 z-10" />
                  <img
                    src={img.url}
                    alt={img.title}
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                  />
                  
                  {/* Hover Information overlay */}
                  <div className="absolute bottom-0 left-0 w-full p-5 bg-gradient-to-t from-black/80 to-transparent z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-amber-500">Visual Clássico</p>
                      <h4 className="text-xs font-bold text-white tracking-tight mt-1">{img.title}</h4>
                    </div>
                    <div className="p-1.5 rounded-lg bg-white/10 text-white backdrop-blur">
                      <Maximize2 size={12} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </motion.div>
        </section>

        {/* DEPOIMENTOS CARROSSEL */}
        <section className="py-24 px-6 md:px-12 bg-[#080808] relative z-10 border-t border-white/[0.01]">
          <div className="max-w-4xl mx-auto">
            
            <div className="flex flex-col items-center text-center mb-12">
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-500">Opinião dos Clientes</span>
              <h2 className="font-serif-lux text-4xl md:text-5xl font-normal tracking-tight text-white mt-3">
                Quem frequenta aprova
              </h2>
            </div>

            {/* Card Depoimento Animado */}
            <div className="relative glass-panel rounded-3xl border border-zinc-900/60 p-8 md:p-12 flex flex-col gap-6">
              
              {/* Ícone de Aspas */}
              <div className="absolute top-8 right-8 text-amber-500/10 pointer-events-none">
                <MessageSquare size={80} />
              </div>

              <div className="flex items-center gap-4">
                <img
                  src={TESTIMONIALS[activeTestimonial].avatar}
                  alt={TESTIMONIALS[activeTestimonial].name}
                  className="w-14 h-14 rounded-full border border-zinc-800 object-cover"
                />
                <div>
                  <h4 className="text-sm font-bold text-white">{TESTIMONIALS[activeTestimonial].name}</h4>
                  <p className="text-xxs uppercase tracking-wider font-bold text-zinc-500 mt-0.5">
                    {TESTIMONIALS[activeTestimonial].role}
                  </p>
                </div>
              </div>

              {/* Avaliação Estrelas */}
              <div className="flex items-center gap-0.5 text-amber-500">
                {[1, 2, 3, 4, 5].map(star => (
                  <Star key={star} size={11} className="fill-amber-500" />
                ))}
              </div>

              {/* Comentário */}
              <p className="text-zinc-300 text-xs sm:text-sm font-light leading-relaxed italic">
                "{TESTIMONIALS[activeTestimonial].comment}"
              </p>

              {/* Controles do Carrossel */}
              <div className="flex items-center justify-between border-t border-zinc-900/80 pt-6 mt-4">
                <div className="flex gap-1.5">
                  {TESTIMONIALS.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveTestimonial(i)}
                      className={`w-1.5 h-1.5 rounded-full transition-all cursor-pointer ${
                        i === activeTestimonial ? 'bg-amber-500 w-4' : 'bg-zinc-800'
                      }`}
                    />
                  ))}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveTestimonial(prev => (prev === 0 ? TESTIMONIALS.length - 1 : prev - 1))}
                    className="p-2 rounded-lg border border-zinc-900 bg-[#0c0c0e]/30 text-zinc-400 hover:text-white cursor-pointer"
                  >
                    <ChevronLeft size={13} />
                  </button>
                  <button
                    onClick={() => setActiveTestimonial(prev => (prev === TESTIMONIALS.length - 1 ? 0 : prev + 1))}
                    className="p-2 rounded-lg border border-zinc-900 bg-[#0c0c0e]/30 text-zinc-400 hover:text-white cursor-pointer"
                  >
                    <ChevronRight size={13} />
                  </button>
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* BOOKING CTA DE CONVERSÃO */}
        <section className="py-24 px-6 md:px-12 relative z-10 overflow-hidden border-t border-white/[0.01]">
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-[#030303]/90 z-10" />
            <img
              src={UNSPLASH_IMAGES.ctaBg}
              alt="Navalha e espuma"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="relative z-10 max-w-4xl mx-auto">
            <div className="glass-panel border border-zinc-900/60 rounded-3xl p-8 md:p-16 text-center flex flex-col items-center">
              
              <span className="text-[9px] font-bold uppercase tracking-widest text-amber-500">Agende em Segundos</span>
              
              <h2 className="font-serif-lux text-4xl sm:text-5xl md:text-6xl font-normal tracking-tight text-white mt-4 max-w-lg leading-tight">
                Seu próximo visual de alto padrão começa aqui.
              </h2>
              
              <p className="text-zinc-500 text-xs font-light max-w-sm mt-3 leading-relaxed">
                Garanta o seu horário na cadeira, escolha o seu barbeiro favorito e seja atendido com o respeito que você merece.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center w-full max-w-xs sm:max-w-md mt-10">
                <button
                  onClick={handleScheduleAction}
                  className="w-full sm:w-auto px-8 py-4 rounded-full text-xs font-bold text-black bg-gradient-to-r from-amber-500 to-yellow-500 hover:scale-[1.03] active:scale-[0.97] transition-all shadow-[0_0_30px_rgba(245,158,11,0.25)] cursor-pointer flex items-center justify-center gap-2"
                >
                  <Calendar size={13} />
                  <span>Reservar Horário</span>
                </button>
                
                {plans.length > 0 && (
                  <a
                    href="#planos"
                    className="w-full sm:w-auto px-8 py-4 rounded-full text-xs font-bold text-zinc-300 border border-zinc-800 hover:bg-zinc-950/60 hover:text-white transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Assinar Plano</span>
                    <ArrowRight size={13} />
                  </a>
                )}
              </div>

            </div>
          </div>
        </section>

        {/* CONTATO & HORÁRIOS DE FUNCIONAMENTO */}
        <section id="contato" className="py-24 px-6 md:px-12 bg-gradient-to-b from-[#080808] to-[#030303] relative z-10 border-t border-white/[0.01]">
          <div className="max-w-5xl mx-auto">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
              
              {/* Informações de Contato */}
              <div className="flex flex-col gap-6">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-amber-500">Localização & Contato</span>
                  <h2 className="font-serif-lux text-4xl md:text-5xl font-normal tracking-tight text-white mt-3">
                    Faça-nos uma visita
                  </h2>
                  <p className="text-zinc-500 text-xs font-light mt-2 leading-relaxed">
                    Estamos localizados em um ponto estratégico para lhe oferecer comodidade e a melhor experiência de barbearia.
                  </p>
                </div>

                <div className="flex flex-col gap-4 mt-4">
                  {/* Endereço */}
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/5 border border-amber-500/10 flex items-center justify-center text-amber-500 flex-shrink-0">
                      <MapPin size={15} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-zinc-400">Endereço</h4>
                      <p className="text-zinc-300 text-xs mt-1 leading-relaxed">
                        {shop.address || 'Av. Paulista, 1000 - Bela Vista, São Paulo - SP, 01310-100'}
                      </p>
                    </div>
                  </div>

                  {/* Telefone */}
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/5 border border-amber-500/10 flex items-center justify-center text-amber-500 flex-shrink-0">
                      <Phone size={15} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-zinc-400">Telefone & WhatsApp</h4>
                      <p className="text-zinc-300 text-xs mt-1 leading-relaxed">
                        {shop.phone ? `+55 ${shop.phone}` : '+55 (11) 99999-8888'}
                      </p>
                    </div>
                  </div>

                  {/* Redes Sociais */}
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/5 border border-amber-500/10 flex items-center justify-center text-amber-500 flex-shrink-0">
                      <InstagramIcon size={15} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-zinc-400">Redes Sociais</h4>
                      <a
                        href={`https://instagram.com/${slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-amber-500 text-xs mt-1 leading-relaxed hover:text-amber-400 transition-colors inline-block"
                      >
                        @{slug}
                      </a>
                    </div>
                  </div>
                </div>

                {/* Mapa Simulado / Ilustração */}
                <div className="w-full h-48 rounded-3xl overflow-hidden border border-zinc-900 relative mt-6">
                  <div className="absolute inset-0 bg-[#0c0c0e]/90 flex flex-col items-center justify-center text-center p-4">
                    <MapPin size={24} className="text-amber-500 mb-2 animate-bounce" />
                    <p className="text-xs font-bold text-white tracking-tight">Mapa de Acesso</p>
                    <p className="text-zinc-500 text-xxs mt-1 leading-relaxed">
                      Clique para abrir as rotas do Google Maps.
                    </p>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(shop.address || shop.name)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 px-4 py-1.5 bg-amber-500 text-black text-[10px] font-bold rounded-lg hover:scale-103 transition-transform cursor-pointer"
                    >
                      Abrir no Maps
                    </a>
                  </div>
                </div>

              </div>

              {/* Horários de Funcionamento */}
              <div className="glass-panel p-8 rounded-3xl border border-zinc-900/60 flex flex-col gap-6">
                <div className="flex items-center gap-2 border-b border-zinc-900 pb-4">
                  <Clock size={16} className="text-amber-500" />
                  <h3 className="text-base font-bold text-white">Horários de Funcionamento</h3>
                </div>

                {hours.length === 0 ? (
                  <div className="flex flex-col gap-3">
                    {[1, 2, 3, 4, 5].map(day => (
                      <div key={day} className="flex items-center justify-between text-xs py-2 border-b border-zinc-900/50">
                        <span className="text-zinc-400 font-medium">{formatDayName(day)}</span>
                        <span className="text-zinc-300">09:00 às 19:00</span>
                      </div>
                    ))}
                    <div className="flex items-center justify-between text-xs py-2">
                      <span className="text-zinc-500 font-medium">Sábado e Domingo</span>
                      <span className="text-zinc-600 font-bold">Fechado</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {hours
                      .sort((a, b) => a.day_of_week - b.day_of_week)
                      .map(h => (
                        <div key={h.day_of_week} className="flex items-center justify-between text-xs py-2 border-b border-zinc-900/50">
                          <span className={`${h.is_open ? 'text-zinc-300' : 'text-zinc-500'} font-medium`}>
                            {formatDayName(h.day_of_week)}
                          </span>
                          <span className={`font-semibold ${h.is_open ? 'text-amber-500' : 'text-zinc-600'}`}>
                            {h.is_open ? `${h.open_time.slice(0, 5)} às ${h.close_time.slice(0, 5)}` : 'Fechado'}
                          </span>
                        </div>
                      ))}
                  </div>
                )}
              </div>

            </div>

          </div>
        </section>

        {/* FOOTER */}
        <footer className="border-t border-zinc-900 bg-[#030303] px-6 py-12 md:px-12 relative z-10">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            
            <span className="font-serif-lux text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
              <Sparkles size={16} className="text-amber-500" />
              <span>{shop.name}</span>
            </span>

            <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-wider">
              © {new Date().getFullYear()} {shop.name}. Todos os direitos reservados.
            </span>

            <span className="text-[10px] text-zinc-500 font-medium flex items-center gap-1">
              <span>Tecnologia</span>
              <a href="#" className="hover:text-amber-500 transition-colors font-bold">BarberShopBR</a>
            </span>

          </div>
        </footer>

        {/* LIGHTBOX DE IMAGENS DA GALERIA */}
        <AnimatePresence>
          {lightboxImage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/95 z-[9999] flex items-center justify-center p-4"
              onClick={() => setLightboxImage(null)}
            >
              <button
                onClick={() => setLightboxImage(null)}
                className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer backdrop-blur transition-all"
              >
                <X size={18} />
              </button>

              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                className="max-w-3xl w-full max-h-[85vh] overflow-hidden rounded-3xl relative border border-white/[0.04]"
                onClick={e => e.stopPropagation()}
              >
                <img
                  src={lightboxImage.url}
                  alt={lightboxImage.title}
                  className="w-full h-auto max-h-[80vh] object-contain mx-auto"
                />
                
                <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col gap-1">
                  <p className="text-xxs font-bold uppercase tracking-widest text-amber-500">Corte & Estilo</p>
                  <h3 className="text-sm md:text-base font-bold text-white tracking-tight">{lightboxImage.title}</h3>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MODAL DETALHES DE PLANO */}
        <AnimatePresence>
          {selectedPlan && (
            <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-[9999] flex items-center justify-center p-4" onClick={() => setSelectedPlan(null)}>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="glass-panel border border-zinc-900 rounded-3xl p-6 w-full max-w-md relative flex flex-col gap-6"
                onClick={e => e.stopPropagation()}
              >
                
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-amber-500">Detalhes do Plano</span>
                    <h3 className="text-lg md:text-xl font-bold tracking-tight text-white mt-1">
                      {selectedPlan.name}
                    </h3>
                  </div>
                  
                  <button
                    onClick={() => setSelectedPlan(null)}
                    className="p-1.5 border border-zinc-800 rounded-full text-zinc-400 hover:text-white cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                </div>

                {/* Serviços incluídos */}
                <div className="flex flex-col gap-3">
                  <p className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                    Vantagens inclusas no clube:
                  </p>
                  
                  <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
                    {selectedPlan.plan_services?.length > 0 ? (
                      selectedPlan.plan_services.map(svc => (
                        <div key={svc.id} className="flex items-center justify-between p-3 rounded-xl border border-zinc-900 bg-[#0c0c0e]/30">
                          <span className="text-xs text-zinc-300 font-medium">{svc.service_name}</span>
                          <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full ${
                            svc.benefit_type === 'free' 
                              ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/10' 
                              : 'bg-amber-500/10 text-amber-500 border border-amber-500/10'
                          }`}>
                            {svc.benefit_type === 'free' ? 'Totalmente Grátis' : `${svc.discount_percent}% OFF`}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-zinc-500">Sem benefícios cadastrados no momento.</p>
                    )}
                  </div>
                </div>

                {/* Preço e CTA */}
                <div className="border-t border-zinc-900 pt-5 flex items-center justify-between">
                  <div>
                    <p className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider">Valor recorrente</p>
                    <div className="flex items-baseline gap-0.5 mt-1">
                      <span className="text-2xl font-extrabold text-white font-sans">
                        R$ {Number(selectedPlan.price).toFixed(2)}
                      </span>
                      <span className="text-[10px] text-zinc-500">/mês</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedPlan(null)
                      handleScheduleAction()
                    }}
                    className="px-6 py-3 rounded-xl text-xs font-bold text-black bg-gradient-to-r from-amber-500 to-yellow-500 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                  >
                    Assinar Agora
                  </button>
                </div>

              </motion.div>

            </div>
          )}
        </AnimatePresence>

      </div>
    </>
  )
}