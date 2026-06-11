'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Scissors, Calendar, Users, TrendingUp, Smartphone, 
  CreditCard, Check, Star, ChevronRight, Menu, X, 
  MessageSquare, ShieldCheck, BarChart3, Clock, Sparkles
} from 'lucide-react'
import Lenis from 'lenis'
import { supabase } from '../lib/supabase.js'
import ThreeBackground from './components/ThreeBackground.jsx'
import InteractiveCard from './components/ui/InteractiveCard.jsx'
import NumberTicker from './components/ui/NumberTicker.jsx'
import DashboardMockup from './components/DashboardMockup.jsx'
import MobileAppMockup from './components/MobileAppMockup.jsx'
import LogoLoop from './components/LogoLoop.jsx'
import StarBorder from './components/StarBorder.jsx'



export default function Home() {
  const router = useRouter()

  // State for evaluation form
  const [companyName, setCompanyName] = useState('')
  const [ownerName, setOwnerName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [revenue, setRevenue] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  // Active showcase tab
  const [activeTab, setActiveTab] = useState('dashboard')

  // Mobile menu open
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Testimonial index
  const [testimonialIndex, setTestimonialIndex] = useState(0)

  const testimonials = [
    {
      name: 'Rodrigo Silva',
      role: 'Proprietário',
      company: 'Barbearia Master',
      text: 'Antes eu perdia horário toda semana respondendo clientes no WhatsApp. Hoje com o BarberShopBR, meus clientes agendam sozinhos e eu só preciso focar no corte. O faturamento aumentou em 28% no primeiro trimestre.',
      avatar: 'RS',
      rating: 5
    },
    {
      name: 'Bernardo Ramos',
      role: 'Fundador',
      company: 'The Classic Club',
      text: 'A gestão de assinaturas recorrentes mudou o nosso negócio. Agora temos receita previsível todo mês, e os clientes adoram a conveniência de fazer parte do clube VIP da barbearia.',
      avatar: 'BR',
      rating: 5
    },
    {
      name: 'Mateus Souza',
      role: 'Sócio-Diretor',
      company: 'Navalha Gold',
      text: 'O painel financeiro e a integração automática do WhatsApp reduziram nossas faltas em quase 90%. O sistema é extremamente limpo, rápido e premium. Sentimos que é um produto feito para escala.',
      avatar: 'MS',
      rating: 5
    }
  ]

  // Initialize Lenis Smooth Scroll
  useEffect(() => {
    if (typeof window === 'undefined') return

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // standard easing
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    })

    function raf(time) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)

    return () => {
      lenis.destroy()
    }
  }, [])

  // Auto rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setTestimonialIndex((prev) => (prev + 1) % testimonials.length)
    }, 8000)
    return () => clearInterval(interval)
  }, [])

  // Handle Free Evaluation submission to Supabase
  const handleEvaluationSubmit = async (e) => {
    e.preventDefault()
    if (!companyName.trim() || !ownerName.trim() || !email.trim() || !phone.trim() || !revenue) {
      alert('Por favor, preencha todos os campos obrigatórios.')
      return
    }

    setLoading(true)

    const { error } = await supabase
      .from('evaluations')
      .insert({ company_name: companyName, owner_name: ownerName, email, phone, revenue })

    if (error) {
      alert('Erro ao enviar avaliação: ' + error.message)
      setLoading(false)
      return
    }

    setSubmitted(true)
    setLoading(false)
  }

  const features = [
    {
      icon: <Calendar className="w-5 h-5 text-amber-500" />,
      title: 'Agendamento Online 24h',
      desc: 'Sua barbearia disponível dia e noite. Clientes agendam de forma intuitiva, escolhendo profissional, serviço e horário.'
    },
    {
      icon: <Users className="w-5 h-5 text-amber-500" />,
      title: 'Gestão de Clientes Inteligente',
      desc: 'Histórico completo de visitas, preferências de corte, gastos acumulados e dados de contato organizados.'
    },
    {
      icon: <Smartphone className="w-5 h-5 text-amber-500" />,
      title: 'Página Pública Exclusiva',
      desc: 'Sua marca com uma URL personalizada de luxo (ex: barbershop.br/suabarbearia) otimizada para conversão de novos clientes.'
    },
    {
      icon: <CreditCard className="w-5 h-5 text-amber-500" />,
      title: 'Clubes de Assinatura B2B',
      desc: 'Crie planos mensais de recorrência (ex: 4 cortes/mês) e fidelize seus clientes com faturamento automático recorrente.'
    },
    {
      icon: <BarChart3 className="w-5 h-5 text-amber-500" />,
      title: 'Dashboard Financeiro',
      desc: 'Acompanhe fluxo de caixa, ticket médio, faturamento por barbeiro e serviços mais vendidos com relatórios automáticos.'
    },
    {
      icon: <MessageSquare className="w-5 h-5 text-amber-500" />,
      title: 'Notificações & WhatsApp',
      desc: 'Envie lembretes de agendamentos automatizados via WhatsApp, reduzindo as faltas (no-shows) a quase zero.'
    },
    {
      icon: <Clock className="w-5 h-5 text-amber-500" />,
      title: 'Controle de Serviços e Escalas',
      desc: 'Gerencie durações, preços, comissões de profissionais e intervalos de folga de forma integrada no calendário.'
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-amber-500" />,
      title: 'Multi-unidade & Permissões',
      desc: 'Controle múltiplas barbearias ou cadeiras de barbeiros com níveis de acesso seguros e relatórios consolidados.'
    }
  ]

  const tabsContent = {
    dashboard: {
      title: 'Painel Central do Dono',
      desc: 'Acompanhe a saúde financeira da sua barbearia em tempo real, veja ocupação e tome decisões orientadas a dados.',
      image: '/haircut_feature.png',
      caption: 'Relatórios consolidados de comissões, vendas e agendamentos concluídos.'
    },
    calendar: {
      title: 'Agenda Multi-Barbeiro Dinâmica',
      desc: 'Visualize a escala de todos os seus barbeiros simultaneamente com drag-and-drop e bloqueios de horários rápidos.',
      image: '/haircut_hero.png',
      caption: 'Gerencie conflitos de horários e visualize ocupação diária num piscar de olhos.'
    },
    subscriptions: {
      title: 'Gestão de Assinaturas Recorrentes',
      desc: 'Fidelize seus clientes oferecendo planos mensais. O BarberShopBR gerencia cobranças automáticas no cartão de crédito.',
      image: '/haircut_feature.png',
      caption: 'Receita previsível que cai direto na sua conta bancária todos os meses.'
    },
    reports: {
      title: 'Relatórios Gerenciais Avançados',
      desc: 'Descubra quais barbeiros geram mais receita, quais serviços têm maior margem e acompanhe a retenção de clientes.',
      image: '/haircut_hero.png',
      caption: 'Exporte relatórios contábeis e gráficos de evolução anual de faturamento.'
    }
  }

  // Animation values for Scroll Reveal
  const scrollFadeUp = {
    initial: { opacity: 0, y: 40 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: false, margin: '-100px' },
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } // easeOutExpo
  }

  return (
    <div className="min-h-screen bg-[#030303] text-zinc-100 font-sans selection:bg-amber-500/35 selection:text-white overflow-x-hidden relative">
      
      {/* HEADER / NAVBAR */}
      <nav className="fixed top-0 left-0 w-full bg-[#030303]/75 backdrop-blur-md border-b border-zinc-900 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <Scissors className="w-5 h-5 text-amber-500 transform rotate-90" />
              <span className="text-lg font-bold tracking-tight text-white font-sans">
                Barber<span className="text-amber-500">ShopBR</span>
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {['Recursos', 'Como Funciona', 'Demonstração', 'Preços', 'Depoimentos'].map((item) => (
                <button
                  key={item}
                  onClick={() => {
                    const id = item.toLowerCase().replace(' ', '-').normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  }}
                  className="text-xs text-zinc-400 hover:text-white uppercase tracking-wider font-semibold transition-colors duration-200 cursor-pointer"
                >
                  {item}
                </button>
              ))}
            </div>

            {/* Right Buttons */}
            <div className="hidden md:flex items-center gap-4">
              <button 
                onClick={() => router.push('/login')}
                className="text-sm font-semibold text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                Entrar
              </button>
              <button 
                onClick={() => document.getElementById('demonstracao')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-5 py-2.5 rounded-full text-xs font-bold bg-white text-black hover:bg-zinc-200 transition-all duration-200 shadow-md shadow-white/5 relative overflow-hidden group/btn cursor-pointer"
              >
                {/* Shine Sweep animation on button hover */}
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover/btn:animate-[shine_0.8s_ease-out] block" />
                Começar agora
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-zinc-400 hover:text-white p-2 rounded-lg"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-b border-zinc-900 bg-[#050505] overflow-hidden"
            >
              <div className="px-4 pt-2 pb-6 space-y-3">
                {['Recursos', 'Como Funciona', 'Demonstração', 'Preços', 'Depoimentos'].map((item) => (
                  <button
                    key={item}
                    onClick={() => {
                      setMobileMenuOpen(false)
                      const id = item.toLowerCase().replace(' ', '-').normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
                    }}
                    className="block w-full text-left py-2 text-sm text-zinc-400 hover:text-white font-medium"
                  >
                    {item}
                  </button>
                ))}
                <div className="pt-4 flex flex-col gap-3 border-t border-zinc-900">
                  <button 
                    onClick={() => { setMobileMenuOpen(false); router.push('/login') }}
                    className="w-full py-2.5 text-center text-sm font-semibold text-zinc-400 hover:text-white"
                  >
                    Entrar
                  </button>
                  <button 
                    onClick={() => { setMobileMenuOpen(false); document.getElementById('demonstracao')?.scrollIntoView({ behavior: 'smooth' }) }}
                    className="w-full py-2.5 rounded-full text-center text-sm font-bold bg-white text-black"
                  >
                    Começar agora
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* HERO SECTION WITH THREE.JS PARTICLE BACKGROUND */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-4 max-w-7xl mx-auto flex flex-col items-center text-center overflow-hidden min-h-[85vh] justify-center">
        
        {/* Three.js Interactive Particle Wave Canvas */}
        <ThreeBackground />

        {/* Glow Effects (Fallback/overlay) */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[500px] sm:w-[800px] h-[300px] sm:h-[400px] bg-gradient-to-r from-amber-500/5 to-blue-500/5 rounded-full blur-3xl pointer-events-none -z-10" />

        {/* Badge */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900/80 border border-zinc-800 text-xs font-medium text-amber-400 mb-6 tracking-wide shadow-lg shadow-black/40 backdrop-blur-sm"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Vertical SaaS B2B feito para barbearias de alto padrão</span>
        </motion.div>

        {/* Main Headline */}
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white max-w-4xl leading-[1.1] mb-6 font-sans"
        >
          Sua barbearia organizada.<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500">
            Sem esforço nenhum.
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-base sm:text-xl text-zinc-400 max-w-2xl leading-relaxed mb-10 font-light"
        >
          Agendamentos automáticos, gestão de planos recorrentes de assinatura, relatórios financeiros e automações via WhatsApp. O sistema operacional definitivo para modernizar seu negócio.
        </motion.p>

        {/* Hero CTAs */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 mb-16 z-10"
        >
          <button 
            onClick={() => document.getElementById('demonstracao')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-8 py-4 rounded-full text-sm font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black shadow-lg shadow-amber-500/20 hover:shadow-amber-500/35 transition-all duration-300 transform hover:-translate-y-0.5 relative overflow-hidden group/hero-btn cursor-pointer"
          >
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover/hero-btn:animate-[shine_0.8s_ease-out] block" />
            Fazer Avaliação Gratuita
          </button>
          <StarBorder
            as="button"
            onClick={() => document.getElementById('demonstracao')?.scrollIntoView({ behavior: 'smooth' })}
            className="cursor-pointer"
            color="#f59e0b"
            speed="5s"
            thickness={2}
          >
            Ver demonstração
          </StarBorder>
        </motion.div>

        {/* Double Mockup (Desktop + Mobile overlay) */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="w-full max-w-5xl relative mt-4 rounded-2xl border border-zinc-800 bg-zinc-950/20 p-2.5 backdrop-blur-sm shadow-2xl overflow-visible"
        >
          {/* Main Desktop Mockup */}
          <div className="w-full">
            <DashboardMockup />
          </div>

          {/* Overlapping Mobile App Mockup */}
          <div className="absolute -bottom-10 -right-4 sm:-right-8 lg:-right-12 z-20 hidden md:block drop-shadow-[0_25px_50px_rgba(0,0,0,0.85)]">
            <MobileAppMockup />
          </div>
        </motion.div>
      </section>

      {/* TRUST / SOCIAL PROOF WITH PROGRESSIVE COUNT TICKER */}
      <section className="border-y border-zinc-900 bg-zinc-950/40 py-12 px-4 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-[10px] uppercase tracking-wider font-semibold text-zinc-500 mb-8">
            Confiado por barbearias de alta performance em todo o Brasil
          </p>
          
          <div className="opacity-40 grayscale contrast-200 mb-12">
            <LogoLoop
              logos={[
                { node: <span className="text-sm font-black font-sans tracking-widest text-zinc-300 select-none">BARBER KING</span> },
                { node: <span className="text-sm font-black font-sans tracking-widest text-zinc-300 select-none">THE CLASSIC</span> },
                { node: <span className="text-sm font-black font-sans tracking-widest text-zinc-300 select-none">NAVALHA CLUB</span> },
                { node: <span className="text-sm font-black font-sans tracking-widest text-zinc-300 select-none">ELITE CUTS</span> },
                { node: <span className="text-sm font-black font-sans tracking-widest text-zinc-300 select-none">BLACKSTONE</span> },
              ]}
              speed={60}
              direction="left"
              logoHeight={24}
              gap={80}
              hoverSpeed={0}
              scaleOnHover={true}
              fadeOut={false}
              ariaLabel="Nossos parceiros de alta performance"
            />
          </div>
          
          {/* Platform stats (With animated counter effect) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-12 border-t border-zinc-900/60 max-w-5xl mx-auto text-center">
            {[
              { val: 500, label: 'Barbearias parceiras', prefix: '+', suffix: '' },
              { val: 1.2, label: 'Agendamentos concluídos', prefix: '', suffix: 'M+', decimals: 1 },
              { val: 18, label: 'Faturados no sistema', prefix: 'R$ ', suffix: 'M+' },
              { val: 98.7, label: 'Taxa de satisfação', prefix: '', suffix: '%', decimals: 1 }
            ].map((stat, idx) => (
              <div key={idx}>
                <p className="text-2xl sm:text-4xl font-extrabold text-white font-sans">
                  <NumberTicker 
                    value={stat.val} 
                    prefix={stat.prefix} 
                    suffix={stat.suffix} 
                    decimals={stat.decimals || 0}
                  />
                </p>
                <p className="text-xs text-zinc-500 mt-1 font-light">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES SECTION WITH 3D TILT & GLOW CARDS & SCROLL REVEAL */}
      <section id="recursos" className="py-24 sm:py-32 px-4 max-w-7xl mx-auto relative">
        <div className="absolute right-0 top-1/3 w-[300px] h-[300px] bg-amber-500/5 rounded-full blur-3xl pointer-events-none -z-10" />
        
        {/* Header - Animated Scroll Reveal */}
        <motion.div 
          {...scrollFadeUp}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <p className="text-xs font-semibold text-amber-500 uppercase tracking-widest mb-3">Tudo que você precisa</p>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-6">
            O ecossistema completo para gerenciar seu crescimento.
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base font-light">
            Desenvolvido para eliminar o trabalho operacional manual, organizar sua equipe de profissionais e maximizar o faturamento através de tecnologia e inteligência.
          </p>
        </motion.div>

        {/* Features Grid (Using InteractiveCard for tilt, glow, and shine) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat, idx) => (
            <InteractiveCard key={idx}>
              <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                {feat.icon}
              </div>
              <h3 className="text-sm font-bold text-white mb-2 font-sans tracking-wide">{feat.title}</h3>
              <p className="text-xs text-zinc-400 leading-relaxed font-light">{feat.desc}</p>
            </InteractiveCard>
          ))}
        </div>
      </section>

      {/* PRODUCT SHOWCASE WITH SCROLL REVEAL HEADER */}
      <section className="py-24 sm:py-32 px-4 border-t border-zinc-900 bg-gradient-to-b from-[#030303] to-[#060608] relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          {/* Header - Animated Scroll Reveal */}
          <motion.div 
            {...scrollFadeUp}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <p className="text-xs font-semibold text-amber-500 uppercase tracking-widest mb-3">Conheça o Produto</p>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-6">
              Uma experiência pensada em cada detalhe.
            </h2>
            <p className="text-zinc-400 text-sm sm:text-base font-light">
              Navegue pelas diferentes interfaces e veja como simplificamos a operação diária tanto para você quanto para sua equipe e seus clientes.
            </p>
          </motion.div>

          {/* Navigation Tabs */}
          <div className="flex justify-center gap-2 sm:gap-4 mb-12 flex-wrap">
            {Object.keys(tabsContent).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 sm:px-6 py-2.5 rounded-full text-xs font-bold tracking-wide uppercase transition-all duration-300 cursor-pointer ${
                  activeTab === tab
                    ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/10'
                    : 'bg-zinc-900/60 text-zinc-400 hover:text-white border border-zinc-800'
                }`}
              >
                {tab === 'dashboard' && 'Dashboard'}
                {tab === 'calendar' && 'Calendário'}
                {tab === 'subscriptions' && 'Assinaturas'}
                {tab === 'reports' && 'Relatórios'}
              </button>
            ))}
          </div>

          {/* Tab Content Display */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-5xl mx-auto">
            {/* Description side */}
            <div className="lg:col-span-4 flex flex-col justify-center">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
                className="space-y-4"
              >
                <h3 className="text-xl sm:text-2xl font-bold text-white leading-snug">{tabsContent[activeTab].title}</h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-light">{tabsContent[activeTab].desc}</p>
                <p className="text-[11px] font-mono text-amber-500/90 bg-amber-500/5 border border-amber-500/10 px-3 py-1.5 rounded-lg inline-block">
                  {tabsContent[activeTab].caption}
                </p>
              </motion.div>
            </div>

            {/* Showcase Image container with Haircuts (No empty chairs) */}
            <div className="lg:col-span-8">
              <motion.div
                key={activeTab + '-img'}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950 aspect-[4/3] sm:aspect-[16/10] shadow-2xl flex items-center justify-center group"
              >
                {/* Embedded haircut image as part of visual context (using our generated haircuts) */}
                <img
                  src={tabsContent[activeTab].image}
                  alt={tabsContent[activeTab].title}
                  className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-700 pointer-events-none"
                />
                {/* Floating UI overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent flex items-end p-6 sm:p-8">
                  <div className="backdrop-blur-md bg-black/40 border border-zinc-800/80 p-4 rounded-xl max-w-sm">
                    <p className="text-xs font-bold text-white mb-1 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      Visual de Produto Real
                    </p>
                    <p className="text-[10px] text-zinc-400 leading-relaxed font-light">
                      Substitua imagens estáticas de divulgação por telas de agendamento focadas no resultado técnico e na experiência de luxo.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS WITH SCROLL REVEAL HEADER */}
      <section id="como-funciona" className="py-24 sm:py-32 px-4 max-w-7xl mx-auto">
        {/* Header - Animated Scroll Reveal */}
        <motion.div 
          {...scrollFadeUp}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <p className="text-xs font-semibold text-amber-500 uppercase tracking-widest mb-3">Simples e Eficiente</p>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-6">
            Como funciona em 3 passos
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base font-light">
            Sem processos complexos ou consultorias demoradas. Veja como sua barbearia migra para o digital em minutos.
          </p>
        </motion.div>

        {/* Timeline cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative max-w-5xl mx-auto">
          {/* Vertical connecting line for timeline */}
          <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-gradient-to-r from-amber-500/20 via-blue-500/10 to-amber-500/20 -translate-y-1/2 hidden md:block -z-10" />

          {[
            { step: '01', title: 'Crie sua conta', desc: 'Cadastre sua empresa, insira sua logo e defina seu subdomínio exclusivo de forma rápida.' },
            { step: '02', title: 'Configure seus serviços', desc: 'Adicione seus profissionais, corte de cabelo, preços de serviços e defina a agenda disponível.' },
            { step: '03', title: 'Comece a faturar', desc: 'Compartilhe o link de agendamentos no seu Instagram e receba pagamentos de forma totalmente integrada.' }
          ].map((item, idx) => (
            <InteractiveCard key={idx} className="bg-zinc-950/60 p-6 sm:p-8">
              <div className="text-4xl sm:text-5xl font-black font-mono text-zinc-800 group-hover:text-amber-500/30 transition-colors duration-300 mb-4 leading-none select-none">
                {item.step}
              </div>
              <h3 className="text-sm sm:text-base font-bold text-white mb-2 font-sans tracking-wide">{item.title}</h3>
              <p className="text-xs text-zinc-400 leading-relaxed font-light">{item.desc}</p>
            </InteractiveCard>
          ))}
        </div>
      </section>

      {/* PRICING SECTION WITH SCROLL REVEAL HEADER */}
      <section id="precos" className="py-24 sm:py-32 px-4 border-t border-zinc-900 bg-gradient-to-b from-[#060608] to-[#030303] relative overflow-hidden">
        <div className="absolute left-0 bottom-1/4 w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-3xl pointer-events-none -z-10" />
        
        <div className="max-w-7xl mx-auto">
          {/* Header - Animated Scroll Reveal */}
          <motion.div 
            {...scrollFadeUp}
            className="text-center max-w-3xl mx-auto mb-20"
          >
            <p className="text-xs font-semibold text-amber-500 uppercase tracking-widest mb-3">Preços Simples</p>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-6">
              Planos pensados para o seu momento de escala.
            </h2>
            <p className="text-zinc-400 text-sm sm:text-base font-light">
              Escolha a estrutura ideal e altere seu plano quando precisar. Sem taxas ocultas, sem contratos de longo prazo.
            </p>
          </motion.div>

          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto items-stretch">
            
            {/* Plan 1 - Basic */}
            <div className="p-8 rounded-2xl border border-zinc-800 bg-zinc-950/40 backdrop-blur-md flex flex-col justify-between hover:border-zinc-700/80 transition-all duration-300">
              <div>
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Básico</p>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-3xl sm:text-4xl font-extrabold text-white">R$ 29</span>
                  <span className="text-xs text-zinc-500 font-light">/mês</span>
                </div>
                <p className="text-[11px] text-zinc-400 mb-6 font-light">Essencial para barbeiros autônomos iniciando no digital.</p>
                <hr className="border-zinc-800 mb-6" />
                <ul className="space-y-3.5 mb-8">
                  {[
                    'Página pública de agendamento',
                    'Até 3 serviços cadastrados',
                    'Agendamento online 24h',
                    'Painel de controle básico',
                    'Suporte via e-mail'
                  ].map((feat, idx) => (
                    <li key={idx} className="flex items-center gap-2.5 text-xs text-zinc-400 font-light">
                      <Check className="w-3.5 h-3.5 text-amber-500/80 flex-shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <button 
                onClick={() => document.getElementById('demonstracao')?.scrollIntoView({ behavior: 'smooth' })}
                className="w-full py-3 rounded-full text-xs font-bold bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white transition-all cursor-pointer"
              >
                Começar gratuitamente
              </button>
            </div>

            {/* Plan 2 - Profissional */}
            <div className="p-8 rounded-2xl border-2 border-amber-500/60 bg-[#09090b]/85 backdrop-blur-md flex flex-col justify-between hover:border-amber-500/80 transition-all duration-300 relative shadow-2xl shadow-amber-500/5">
              <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 px-3.5 py-1 rounded-full bg-amber-500 text-black font-extrabold text-[9px] uppercase tracking-wider shadow">
                Mais Popular
              </div>
              <div>
                <p className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">Profissional</p>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-3xl sm:text-4xl font-extrabold text-white">R$ 49</span>
                  <span className="text-xs text-zinc-500 font-light">/mês</span>
                </div>
                <p className="text-[11px] text-zinc-400 mb-6 font-light">Ideal para barbearias em crescimento que querem automatizar tudo.</p>
                <hr className="border-zinc-800 mb-6" />
                <ul className="space-y-3.5 mb-8">
                  {[
                    'Tudo do plano Básico',
                    'Serviços e barbeiros ilimitados',
                    'Lembretes via WhatsApp integrados',
                    'Assinaturas recorrentes (VIP Club)',
                    'Painel financeiro completo',
                    'Suporte prioritário via WhatsApp'
                  ].map((feat, idx) => (
                    <li key={idx} className="flex items-center gap-2.5 text-xs text-zinc-300 font-light">
                      <Check className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <button 
                onClick={() => document.getElementById('demonstracao')?.scrollIntoView({ behavior: 'smooth' })}
                className="w-full py-3 rounded-full text-xs font-extrabold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black shadow-lg shadow-amber-500/20 relative overflow-hidden group/price-btn transition-all cursor-pointer"
              >
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover/price-btn:animate-[shine_0.8s_ease-out] block" />
                Começar gratuitamente
              </button>
            </div>

            {/* Plan 3 - Premium */}
            <div className="p-8 rounded-2xl border border-zinc-800 bg-zinc-950/40 backdrop-blur-md flex flex-col justify-between hover:border-zinc-700/80 transition-all duration-300">
              <div>
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Premium</p>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-3xl sm:text-4xl font-extrabold text-white">R$ 79</span>
                  <span className="text-xs text-zinc-500 font-light">/mês</span>
                </div>
                <p className="text-[11px] text-zinc-400 mb-6 font-light">Para grandes barbearias, franquias e redes multi-unidades.</p>
                <hr className="border-zinc-800 mb-6" />
                <ul className="space-y-3.5 mb-8">
                  {[
                    'Tudo do plano Profissional',
                    'Multi-unidades integradas',
                    'Gestão de comissões avançada',
                    'Relatórios customizados e exportação',
                    'Domínio totalmente personalizado',
                    'Gerente de conta dedicado'
                  ].map((feat, idx) => (
                    <li key={idx} className="flex items-center gap-2.5 text-xs text-zinc-400 font-light">
                      <Check className="w-3.5 h-3.5 text-amber-500/80 flex-shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <button 
                onClick={() => document.getElementById('demonstracao')?.scrollIntoView({ behavior: 'smooth' })}
                className="w-full py-3 rounded-full text-xs font-bold bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-white transition-all cursor-pointer"
              >
                Começar gratuitamente
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* TESTIMONIAL CAROUSEL WITH SCROLL REVEAL HEADER */}
      <section id="depoimentos" className="py-24 sm:py-32 px-4 max-w-7xl mx-auto text-center relative">
        <div className="absolute right-0 bottom-0 w-[200px] h-[200px] bg-amber-500/5 rounded-full blur-2xl pointer-events-none -z-10" />

        <div className="max-w-3xl mx-auto">
          {/* Header - Animated Scroll Reveal */}
          <motion.div {...scrollFadeUp}>
            <p className="text-xs font-semibold text-amber-500 uppercase tracking-widest mb-3">Histórias de Sucesso</p>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-16">
              O que dizem os donos de barbearias.
            </h2>
          </motion.div>

          {/* Testimonial Card */}
          <div className="relative min-h-[250px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={testimonialIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
                className="p-8 sm:p-10 rounded-2xl border border-zinc-800 bg-[#09090b] shadow-2xl flex flex-col items-center max-w-2xl mx-auto"
              >
                {/* Rating stars */}
                <div className="flex gap-1 mb-6">
                  {Array.from({ length: testimonials[testimonialIndex].rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>

                {/* Text quote */}
                <blockquote className="text-sm sm:text-base text-zinc-200 leading-relaxed mb-6 font-light italic">
                  "{testimonials[testimonialIndex].text}"
                </blockquote>

                {/* Author Info */}
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-extrabold text-amber-500">
                    {testimonials[testimonialIndex].avatar}
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-white">{testimonials[testimonialIndex].name}</p>
                    <p className="text-[10px] text-zinc-500">{testimonials[testimonialIndex].role} · {testimonials[testimonialIndex].company}</p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation dots */}
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setTestimonialIndex(idx)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                  testimonialIndex === idx ? 'bg-amber-500 w-6' : 'bg-zinc-800'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CONVERSION SECTION (FREE EVALUATION) WITH SCROLL REVEAL */}
      <section id="demonstracao" className="py-24 sm:py-32 px-4 border-t border-zinc-900 bg-gradient-to-b from-[#030303] to-[#08080c] relative">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/[0.03] rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Headline side - Animated Scroll Reveal */}
          <motion.div 
            {...scrollFadeUp}
            className="lg:col-span-6 space-y-6 text-left"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[10px] font-bold text-amber-500 tracking-wider uppercase">
              Avaliação Gratuita de Negócios
            </div>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
              Pronto para transformar sua barbearia?
            </h2>
            <p className="text-zinc-400 text-sm sm:text-base font-light leading-relaxed">
              Deixe seus dados de contato e nossa equipe especializada fará uma auditoria completa da presença digital e do potencial de faturamento recorrente da sua barbearia, totalmente grátis.
            </p>
            
            {/* Value bullets */}
            <div className="space-y-3 pt-4">
              {[
                'Análise de viabilidade para Clube VIP de assinatura',
                'Simulação de aumento de receita média',
                'Plano operacional de setup inicial em menos de 48h'
              ].map((bullet, idx) => (
                <div key={idx} className="flex items-center gap-3 text-xs text-zinc-300 font-light">
                  <span className="w-5 h-5 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 text-[10px] font-bold">✓</span>
                  <span>{bullet}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Form Card (Insert to Supabase) */}
          <div className="lg:col-span-6">
            <div className="p-6 sm:p-8 rounded-2xl border border-zinc-800/80 bg-zinc-950/60 backdrop-blur-md shadow-2xl relative overflow-hidden">
              <div className="absolute -right-12 -top-12 w-28 h-28 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
              
              {submitted ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-12 text-center space-y-4"
                >
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-2 text-emerald-400 text-xl font-bold">
                    ✓
                  </div>
                  <h3 className="text-lg font-bold text-white">Solicitação enviada com sucesso!</h3>
                  <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed font-light">
                    Nossa equipe de especialistas recebeu os dados da **{companyName}** e entrará em contato em breve pelo telefone/e-mail informado.
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleEvaluationSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wide mb-1.5">Nome da Barbearia *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Ex: Barbearia Club VIP" 
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-amber-500 rounded-xl px-4 py-3 text-xs text-white placeholder-zinc-500 outline-none transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wide mb-1.5">Nome do Proprietário *</label>
                      <input 
                        type="text" 
                        required
                        placeholder="Ex: Carlos Silva" 
                        value={ownerName}
                        onChange={(e) => setOwnerName(e.target.value)}
                        className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-amber-500 rounded-xl px-4 py-3 text-xs text-white placeholder-zinc-500 outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wide mb-1.5">Telefone / WhatsApp *</label>
                      <input 
                        type="tel" 
                        required
                        placeholder="(00) 00000-0000" 
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-amber-500 rounded-xl px-4 py-3 text-xs text-white placeholder-zinc-500 outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wide mb-1.5">E-mail Corporativo *</label>
                    <input 
                      type="email" 
                      required
                      placeholder="seuemail@barbearia.com" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-amber-500 rounded-xl px-4 py-3 text-xs text-white placeholder-zinc-500 outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wide mb-1.5">Média de Faturamento Mensal *</label>
                    <select 
                      required
                      value={revenue}
                      onChange={(e) => setRevenue(e.target.value)}
                      className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-amber-500 rounded-xl px-4 py-3 text-xs text-zinc-400 focus:text-white outline-none transition-colors appearance-none cursor-pointer"
                    >
                      <option value="" disabled>Selecione uma faixa</option>
                      <option value="Até R$ 5 mil">Até R$ 5.000 / mês</option>
                      <option value="R$ 5 mil a R$ 15 mil">De R$ 5.000 a R$ 15.000 / mês</option>
                      <option value="R$ 15 mil a R$ 30 mil">De R$ 15.000 a R$ 30.000 / mês</option>
                      <option value="Mais de R$ 30 mil">Mais de R$ 30.000 / mês</option>
                    </select>
                  </div>

                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-xs shadow-lg shadow-amber-500/10 hover:shadow-amber-500/20 transition-all cursor-pointer flex items-center justify-center gap-2 relative overflow-hidden group/submit-btn"
                  >
                    <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover/submit-btn:animate-[shine_0.8s_ease-out] block" />
                    {loading ? 'Processando solicitação...' : 'Solicitar Auditoria e Avaliação'}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-zinc-900 bg-zinc-950/80 py-16 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-10">
          
          {/* Logo brand & description */}
          <div className="md:col-span-4 space-y-4">
            <div className="flex items-center gap-2">
              <Scissors className="w-5 h-5 text-amber-500 transform rotate-90" />
              <span className="text-md font-bold tracking-tight text-white font-sans">
                Barber<span className="text-amber-500">ShopBR</span>
              </span>
            </div>
            <p className="text-xs text-zinc-500 max-w-sm leading-relaxed font-light">
              Plataforma SaaS vertical líder em automatizar e escalar agendamentos e faturamento recorrente para barbearias de alto padrão.
            </p>
          </div>

          {/* Nav groups */}
          <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-8">
            <div>
              <p className="text-[10px] font-bold text-white uppercase tracking-wider mb-4">Produto</p>
              <ul className="space-y-2.5">
                {['Recursos', 'Calendário', 'Dashboard', 'WhatsApp Recorrência'].map((link) => (
                  <li key={link}>
                    <a href="#" className="text-xs text-zinc-500 hover:text-zinc-300 font-light transition-colors">{link}</a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-[10px] font-bold text-white uppercase tracking-wider mb-4">Preços</p>
              <ul className="space-y-2.5">
                {['Básico', 'Profissional', 'Premium', 'Comparativo'].map((link) => (
                  <li key={link}>
                    <a href="#" className="text-xs text-zinc-500 hover:text-zinc-300 font-light transition-colors">{link}</a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-[10px] font-bold text-white uppercase tracking-wider mb-4">Empresa</p>
              <ul className="space-y-2.5">
                {['Sobre nós', 'Vagas', 'Blog', 'Contato'].map((link) => (
                  <li key={link}>
                    <a href="#" className="text-xs text-zinc-500 hover:text-zinc-300 font-light transition-colors">{link}</a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-[10px] font-bold text-white uppercase tracking-wider mb-4">Legal</p>
              <ul className="space-y-2.5">
                {['Termos de uso', 'Privacidade', 'Segurança', 'LGPD'].map((link) => (
                  <li key={link}>
                    <a href="#" className="text-xs text-zinc-500 hover:text-zinc-300 font-light transition-colors">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </div>

        <div className="max-w-7xl mx-auto border-t border-zinc-900/60 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-[10px] text-zinc-600 font-light">© 2026 BarberShopBR. Todos os direitos reservados.</p>
          <p className="text-[10px] text-zinc-600 font-light">Desenvolvido com carinho para barbearias de alto padrão.</p>
        </div>
      </footer>

      {/* Global CSS keyframes for custom animations (like shineSweep) */}
      <style jsx global>{`
        @keyframes shine {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        
        /* Lenis smooth scrolling compatibility */
        html.lenis, html.lenis body {
          height: auto;
        }
        
        .lenis.lenis-smooth {
          scroll-behavior: auto !important;
        }
        
        .lenis.lenis-smooth [data-lenis-prevent] {
          overflow: clip;
        }
        
        .lenis.lenis-stopped {
          overflow: hidden;
        }
        
        .lenis.lenis-scrolling iframe {
          pointer-events: none;
        }
        
        /* Hide scrollbars but keep functionality */
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  )
}