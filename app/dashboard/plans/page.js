'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabaseBarber as supabase } from '../../../lib/supabase-barber.js'
import { useRouter } from 'next/navigation'
import DashboardLayout, { useTheme, useDashboard } from '../../components/DashboardLayout'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  CreditCard, 
  Check, 
  Trash2, 
  ShieldCheck, 
  Sparkles, 
  Percent, 
  Plus, 
  X, 
  Loader2, 
  AlertTriangle,
  Scissors
} from 'lucide-react'
import './plans.css'

export default function PlansPage() {
  const router = useRouter()
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  // Estados principais
  const { barbershop: shop, loading: layoutLoading } = useDashboard()
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Estados do Modal de Cadastro
  const [modalOpen, setModalOpen] = useState(false)
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [selectedServices, setSelectedServices] = useState({})
  const [availableServices, setAvailableServices] = useState([])
  const [validationErrors, setValidationErrors] = useState({})

  // Estados do Modal de Confirmação de Exclusão
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [planToDelete, setPlanToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  // Carregar dados
  const loadData = useCallback(async () => {
    if (!shop) return
    try {
      setLoading(true)
      const { data: servicesData } = await supabase
        .from('services')
        .select('*')
        .eq('barbershop_id', shop.id)

      setAvailableServices(servicesData || [])

      const { data: plansData } = await supabase
        .from('plans')
        .select('*, plan_services(*)')
        .eq('barbershop_id', shop.id)
        .order('created_at', { ascending: false })

      setPlans(plansData || [])
    } catch (err) {
      console.error('Erro ao carregar dados de planos:', err)
    } finally {
      setLoading(false)
    }
  }, [shop])

  useEffect(() => {
    if (layoutLoading) return
    if (!shop) {
      setLoading(false)
      const timer = setTimeout(() => router.push('/login'), 3000)
      return () => clearTimeout(timer)
    }
    loadData()
  }, [shop, layoutLoading, loadData, router])

  // Lógica do Checkbox de Serviços
  const toggleService = (serviceId, serviceName) => {
    setSelectedServices(prev => {
      if (prev[serviceId]) {
        const updated = { ...prev }
        delete updated[serviceId]
        return updated
      }
      return { ...prev, [serviceId]: { name: serviceName, benefit_type: 'free', discount_percent: '' } }
    })
  }

  // Lógica de Atualização de Tipo de Benefício
  const updateServiceBenefit = (serviceId, field, value) => {
    setSelectedServices(prev => ({
      ...prev,
      [serviceId]: {
        ...prev[serviceId],
        [field]: value,
        ...(field === 'benefit_type' && value === 'free' ? { discount_percent: '' } : {}),
      }
    }))
  }

  // Abrir modal de criação
  const openCreateModal = () => {
    setName('')
    setPrice('')
    setSelectedServices({})
    setValidationErrors({})
    setModalOpen(true)
  }

  // Salvar Plano
  const handleCreate = async (e) => {
    e.preventDefault()

    // Validações
    const errors = {}
    if (!name.trim()) errors.name = 'O nome do plano é obrigatório'
    if (!price || Number(price) <= 0) errors.price = 'Digite um valor mensal válido'
    if (Object.keys(selectedServices).length === 0) errors.services = 'Selecione pelo menos um serviço'

    // Validar descontos
    for (const [svcId, svc] of Object.entries(selectedServices)) {
      if (svc.benefit_type === 'discount') {
        const pct = Number(svc.discount_percent)
        if (!pct || pct < 1 || pct > 99) {
          errors.services = `Informe um desconto válido (1–99%) para os serviços selecionados.`
          break
        }
      }
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      return
    }

    setSaving(true)
    try {
      const { data: planData, error: planError } = await supabase
        .from('plans')
        .insert({ 
          barbershop_id: shop.id, 
          name: name.trim(), 
          price: Number(price), 
          active: true 
        })
        .select()
        .single()

      if (planError) throw planError

      const planServicesRows = Object.entries(selectedServices).map(([svcId, svc]) => ({
        plan_id: planData.id,
        service_name: svc.name,
        benefit_type: svc.benefit_type,
        discount_percent: svc.benefit_type === 'discount' ? Number(svc.discount_percent) : null,
      }))

      const { error: svcError } = await supabase
        .from('plan_services')
        .insert(planServicesRows)

      if (svcError) throw svcError

      setModalOpen(false)
      await loadData()
    } catch (err) {
      console.error('Erro ao criar plano:', err)
      alert(`Falha ao criar plano: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  // Solicitar exclusão do plano
  const confirmDelete = (plan) => {
    setPlanToDelete(plan)
    setDeleteModalOpen(true)
  }

  // Executar exclusão do plano
  const handleDelete = async () => {
    if (!planToDelete) return
    setDeleting(true)
    try {
      const { error } = await supabase
        .from('plans')
        .delete()
        .eq('id', planToDelete.id)

      if (error) throw error

      setDeleteModalOpen(false)
      setPlanToDelete(null)
      await loadData()
    } catch (err) {
      console.error('Erro ao excluir plano:', err)
      alert(`Falha ao excluir plano: ${err.message}`)
    } finally {
      setDeleting(false)
    }
  }

  // Efeito 3D Card Hover - Eventos de Mouse
  const handleMouseMove = (e) => {
    const card = e.currentTarget
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const rotateX = ((centerY - y) / centerY) * 6 // Limite de 6 graus de rotação
    const rotateY = ((x - centerX) / centerX) * 6

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

  // Estilos
  const styles = {
    card: isDark 
      ? 'border-zinc-900 bg-[#0c0c0e]/50 backdrop-blur-xl shadow-xl' 
      : 'border-zinc-200/80 bg-white shadow-md',
    headerText: isDark ? 'text-white' : 'text-zinc-900',
    subtext: isDark ? 'text-zinc-400' : 'text-zinc-500',
    border: isDark ? 'border-zinc-900/60' : 'border-zinc-200/80',
    input: isDark 
      ? 'bg-zinc-900/30 border-zinc-900 focus:border-zinc-800 text-zinc-200 placeholder-zinc-500 focus:ring-1 focus:ring-amber-500/20' 
      : 'bg-white border-zinc-200 focus:border-zinc-300 text-zinc-900 placeholder-zinc-400 shadow-sm focus:ring-1 focus:ring-amber-500/20',
    buttonPrimary: 'bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-semibold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_15px_rgba(245,158,11,0.15)] cursor-pointer',
    buttonSecondary: isDark
      ? 'bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 hover:border-zinc-700 text-zinc-300 cursor-pointer'
      : 'bg-zinc-100 border border-zinc-200 hover:bg-zinc-200/60 text-zinc-700 cursor-pointer shadow-sm',
    badge: 'text-amber-500 bg-amber-500/10 border border-amber-500/10',
    checkboxContainer: (selected) => {
      if (selected) {
        return isDark ? 'border-amber-500/30 bg-amber-500/5' : 'border-amber-500 bg-amber-50/20'
      }
      return isDark ? 'border-zinc-900 bg-zinc-950/20 hover:border-zinc-800' : 'border-zinc-200 bg-white hover:border-zinc-300 shadow-sm'
    },
    modalOverlay: 'fixed inset-0 bg-black/60 backdrop-blur-md z-[9999] flex items-center justify-center p-4',
    modalBody: isDark
      ? 'bg-[#09090b]/95 border border-zinc-900 shadow-2xl rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto'
      : 'bg-white border border-zinc-250 shadow-xl rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto text-zinc-900',
    modalSmallBody: isDark
      ? 'bg-[#09090b]/95 border border-zinc-900 shadow-2xl rounded-2xl w-full max-w-md p-6'
      : 'bg-white border border-zinc-250 shadow-xl rounded-2xl w-full max-w-md p-6 text-zinc-900',
    benefitBadge: (isFree) => {
      if (isFree) return 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/15'
      return 'bg-amber-500/10 text-amber-500 border border-amber-500/15'
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col gap-6 max-w-5xl mx-auto px-4">
          <div className="h-10 w-48 bg-zinc-900/60 animate-pulse rounded-lg" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map(i => (
              <div key={i} className="h-60 bg-[#0c0c0e]/40 border border-zinc-900 rounded-3xl animate-pulse" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8 max-w-5xl mx-auto pb-16 px-4">
        
        {/* CABEÇALHO */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className={`text-2xl font-bold tracking-tight ${styles.headerText}`}>
              Planos de Assinatura
            </h1>
            <p className={`${styles.subtext} text-xs mt-0.5`}>
              Crie e gerencie planos de assinatura recorrentes com benefícios e descontos personalizados.
            </p>
          </div>

          <button
            onClick={openCreateModal}
            className={`px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 justify-center ${styles.buttonPrimary}`}
          >
            <Plus size={15} />
            <span>Criar Novo Plano</span>
          </button>
        </div>

        {/* LISTAGEM DE PLANOS EM GRID 3D */}
        <div className="flex flex-col gap-5">
          <h2 className="text-xs uppercase tracking-wider text-zinc-500 font-bold mb-2">
            Planos Vigentes
          </h2>

          <AnimatePresence mode="popLayout">
            {plans.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`p-16 rounded-3xl border text-center flex flex-col items-center justify-center ${styles.card}`}
              >
                <CreditCard size={32} className="text-zinc-600 mb-3 animate-pulse" />
                <h3 className={`text-base font-bold ${styles.headerText}`}>Nenhum plano ativo</h3>
                <p className={`${styles.subtext} text-xs max-w-sm mt-1`}>
                  Sua barbearia ainda não tem planos recorrentes. Clique no botão "Criar Novo Plano" no topo para lançar seu primeiro clube de assinatura.
                </p>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {plans.map((plan, index) => {
                  const isFirst = index === 0
                  return (
                    <motion.div
                      key={plan.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.4 }}
                      onMouseMove={handleMouseMove}
                      onMouseLeave={handleMouseLeave}
                      className={`premium-plan-card rounded-3xl border p-6 flex flex-col gap-5 ${
                        isFirst 
                          ? (isDark ? 'border-amber-500/40 shadow-[0_0_30px_rgba(245,158,11,0.06)]' : 'border-amber-500 shadow-lg shadow-amber-500/5')
                          : (isDark ? 'border-zinc-900/80 shadow-md' : 'border-zinc-200 shadow-sm')
                      }`}
                    >
                      {/* Background elements para o efeito Glow */}
                      <div className={`premium-plan-card__bg ${isDark ? 'bg-[#0c0c0e]/85' : 'bg-white'}`} />
                      <div className="premium-plan-card__glow" />

                      {/* Conteúdo Principal (Preserve 3D) */}
                      <div className="premium-plan-card__content flex flex-col justify-between h-full gap-5">
                        
                        {/* Cabeçalho do Card */}
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className={`text-lg font-bold tracking-tight ${styles.headerText}`}>
                                {plan.name}
                              </h3>
                              {isFirst && (
                                <span className="text-[9px] font-bold text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-sm">
                                  <Sparkles size={8} />
                                  <span>Destaque</span>
                                </span>
                              )}
                            </div>

                            <div className="flex items-baseline gap-1 mt-2">
                              <span className={`text-3xl font-extrabold tracking-tight bg-gradient-to-r ${
                                isDark ? 'from-white to-zinc-300' : 'from-zinc-900 to-zinc-700'
                              } bg-clip-text text-transparent font-sans`}>
                                R$ {Number(plan.price).toFixed(2)}
                              </span>
                              <span className="text-xs text-zinc-500 font-medium">/mês</span>
                            </div>
                          </div>

                          <button
                            onClick={() => confirmDelete(plan)}
                            className={`p-2 rounded-lg border transition-colors cursor-pointer relative z-10 ${styles.trashBtn}`}
                            title="Excluir plano"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>

                        {/* Linha Divisória */}
                        <div className={`border-b w-full ${styles.border}`} />

                        {/* Benefícios Inclusos */}
                        {plan.plan_services?.length > 0 ? (
                          <div className="flex flex-col gap-2.5">
                            <p className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider">Benefícios inclusos:</p>
                            <ul className="flex flex-col gap-2">
                              {plan.plan_services.map(svc => {
                                const isFree = svc.benefit_type === 'free'
                                return (
                                  <li key={svc.id} className="flex items-center gap-2 text-xs">
                                    <div className="w-4 h-4 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0 text-amber-500">
                                      <Check size={10} className="stroke-[3.5px]" />
                                    </div>
                                    <span className={`${isDark ? 'text-zinc-300' : 'text-zinc-700'} font-medium`}>
                                      {svc.service_name}
                                    </span>
                                    <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${styles.benefitBadge(isFree)}`}>
                                      {isFree ? '100% Grátis' : `${svc.discount_percent}% OFF`}
                                    </span>
                                  </li>
                                )
                              })}
                            </ul>
                          </div>
                        ) : (
                          <p className="text-[10px] text-zinc-500 font-medium">Nenhum serviço atrelado ao plano.</p>
                        )}

                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </AnimatePresence>
        </div>

      </div>

      {/* MODAL DE CRIAÇÃO (ANIMADO ESTILO STRIPE/APPLE) */}
      <AnimatePresence>
        {modalOpen && (
          <div className={styles.modalOverlay}>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60"
              onClick={() => !saving && setModalOpen(false)}
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ type: 'spring', duration: 0.4 }}
              className={`relative z-10 ${styles.modalBody}`}
            >
              {/* Header do Modal */}
              <div className={`flex items-center justify-between px-6 py-4 border-b ${styles.border}`}>
                <div className="flex items-center gap-2">
                  <CreditCard size={18} className="text-amber-500" />
                  <h2 className="font-bold text-base">Criar Novo Plano de Assinatura</h2>
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  disabled={saving}
                  className={`p-1.5 rounded-lg border cursor-pointer hover:bg-red-500/10 hover:text-red-400 transition-colors ${
                    isDark ? 'border-zinc-900 text-zinc-500' : 'border-zinc-200 text-zinc-400'
                  }`}
                >
                  <X size={15} />
                </button>
              </div>

              {/* Formulário do Modal */}
              <form onSubmit={handleCreate} className="p-6 flex flex-col gap-4">
                
                {/* Nome do Plano */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xxs font-bold uppercase tracking-wider text-zinc-500">Nome do Plano *</label>
                  <input
                    type="text"
                    placeholder="Ex: Clube Vip Ouro, Assinatura Barba & Cabelo"
                    value={name}
                    onChange={e => {
                      setName(e.target.value)
                      if (validationErrors.name) {
                        setValidationErrors(prev => ({ ...prev, name: null }))
                      }
                    }}
                    className={`px-4 py-2.5 text-xs rounded-xl border outline-none ${styles.input} ${
                      validationErrors.name ? 'border-red-500/60 focus:border-red-500' : ''
                    }`}
                    required
                  />
                  {validationErrors.name && (
                    <span className="text-red-400 text-xxs flex items-center gap-1 mt-0.5">
                      <AlertTriangle size={10} />
                      {validationErrors.name}
                    </span>
                  )}
                </div>

                {/* Serviços Incluídos */}
                <div className="flex flex-col gap-2">
                  <label className="text-xxs font-bold uppercase tracking-wider text-zinc-500">Serviços Incluídos e Benefícios *</label>
                  
                  {availableServices.length === 0 ? (
                    <div className="p-4 rounded-xl border border-dashed border-zinc-800 text-center flex flex-col items-center justify-center">
                      <Scissors size={20} className="text-zinc-600 mb-1.5" />
                      <p className="text-xxs text-zinc-500 max-w-xs leading-normal">
                        Nenhum serviço cadastrado no catálogo. Por favor, adicione serviços no menu "Serviços" antes de criar planos.
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2 max-h-56 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-zinc-800">
                      {availableServices.map(service => {
                        const isSelected = !!selectedServices[service.id]
                        const svc = selectedServices[service.id]

                        return (
                          <div key={service.id} className="flex flex-col gap-1.5">
                            
                            {/* Card de Seleção */}
                            <div
                              onClick={() => {
                                toggleService(service.id, service.name)
                                if (validationErrors.services) {
                                  setValidationErrors(prev => ({ ...prev, services: null }))
                                }
                              }}
                              className={`flex items-center justify-between px-4 py-2.5 rounded-xl border cursor-pointer transition-all duration-200 ${
                                styles.checkboxContainer(isSelected)
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
                                  isSelected 
                                    ? 'bg-amber-500 border-amber-500' 
                                    : (isDark ? 'border-zinc-800 bg-zinc-950/40' : 'border-zinc-300 bg-white')
                                }`}>
                                  {isSelected && <Check size={10} className="text-black stroke-[3px]" />}
                                </div>
                                <span className={`text-xs font-bold ${
                                  isSelected 
                                    ? (isDark ? 'text-white' : 'text-zinc-900') 
                                    : (isDark ? 'text-zinc-400' : 'text-zinc-650')
                                }`}>
                                  {service.name}
                                </span>
                              </div>

                              {isSelected && (
                                <span className="text-[9px] font-bold text-amber-500 px-2 py-0.5 bg-amber-500/10 border border-amber-500/10 rounded">
                                  {svc.benefit_type === 'free' ? 'Totalmente Grátis' : `${svc.discount_percent || 0}% OFF`}
                                </span>
                              )}
                            </div>

                            {/* Detalhes do Desconto */}
                            <AnimatePresence>
                              {isSelected && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="overflow-hidden pl-7"
                                >
                                  <div className={`p-2.5 rounded-xl border flex flex-wrap items-center gap-3 ${
                                    isDark ? 'bg-zinc-950/30 border-zinc-900' : 'bg-zinc-50 border-zinc-200'
                                  }`}>
                                    
                                    <div className="flex gap-0.5 bg-zinc-900/10 dark:bg-zinc-950/60 p-0.5 rounded-lg border border-zinc-200/50 dark:border-zinc-900">
                                      {['free', 'discount'].map(type => (
                                        <button
                                          key={type}
                                          type="button"
                                          onClick={() => updateServiceBenefit(service.id, 'benefit_type', type)}
                                          className={`px-3 py-1 rounded-md text-[9px] font-bold transition-all cursor-pointer ${
                                            svc.benefit_type === type
                                              ? 'bg-amber-500 text-black shadow-sm'
                                              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
                                          }`}
                                        >
                                          {type === 'free' ? 'Grátis' : 'Desconto'}
                                        </button>
                                      ))}
                                    </div>

                                    {svc.benefit_type === 'discount' && (
                                      <motion.div 
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="flex items-center gap-1.5"
                                      >
                                        <input
                                          type="number"
                                          placeholder="0"
                                          min="1"
                                          max="99"
                                          value={svc.discount_percent}
                                          onChange={e => updateServiceBenefit(service.id, 'discount_percent', e.target.value)}
                                          className={`w-14 px-2 py-1 text-center text-xs rounded-lg border outline-none ${styles.input}`}
                                          required
                                        />
                                        <span className="text-[9px] font-bold text-zinc-500">% OFF</span>
                                      </motion.div>
                                    )}

                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        )
                      })}
                    </div>
                  )}
                  {validationErrors.services && (
                    <span className="text-red-400 text-xxs flex items-center gap-1 mt-0.5">
                      <AlertTriangle size={10} />
                      {validationErrors.services}
                    </span>
                  )}
                </div>

                {/* Preço Mensal */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xxs font-bold uppercase tracking-wider text-zinc-500">Valor Mensal (R$) *</label>
                  <input
                    type="number"
                    placeholder="Ex: 89.90"
                    min="0.01"
                    step="0.01"
                    value={price}
                    onChange={e => {
                      setPrice(e.target.value)
                      if (validationErrors.price) {
                        setValidationErrors(prev => ({ ...prev, price: null }))
                      }
                    }}
                    className={`px-4 py-2.5 text-xs rounded-xl border outline-none ${styles.input} ${
                      validationErrors.price ? 'border-red-500/60 focus:border-red-500' : ''
                    }`}
                    required
                  />
                  {validationErrors.price && (
                    <span className="text-red-400 text-xxs flex items-center gap-1 mt-0.5">
                      <AlertTriangle size={10} />
                      {validationErrors.price}
                    </span>
                  )}
                </div>

                <div className={`border-b w-full mt-2 ${styles.border}`} />

                {/* Botões de Ação */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    disabled={saving}
                    className={`px-5 py-2.5 rounded-xl text-xs ${styles.buttonSecondary} ${
                      saving ? 'opacity-55 cursor-not-allowed' : ''
                    }`}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className={`px-5 py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 ${styles.buttonPrimary} ${
                      saving ? 'opacity-55 cursor-not-allowed' : ''
                    }`}
                  >
                    {saving ? (
                      <>
                        <Loader2 size={13} className="animate-spin" />
                        <span>Criando...</span>
                      </>
                    ) : (
                      <>
                        <Check size={13} />
                        <span>Criar Plano</span>
                      </>
                    )}
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO */}
      <AnimatePresence>
        {deleteModalOpen && (
          <div className={styles.modalOverlay}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60"
              onClick={() => !deleting && setDeleteModalOpen(false)}
            />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`relative z-10 ${styles.modalSmallBody}`}
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center mb-3">
                  <AlertTriangle size={20} />
                </div>
                
                <h3 className="text-base font-bold">Excluir Plano?</h3>
                <p className="text-zinc-500 text-xs mt-2 max-w-sm">
                  Você está prestes a excluir permanentemente o plano <strong className="font-semibold">{planToDelete?.name}</strong> da sua barbearia. Esta ação removerá a assinatura e seus vínculos definitivamente.
                </p>
                
                <div className="flex items-center gap-3 w-full mt-6">
                  <button
                    disabled={deleting}
                    onClick={() => setDeleteModalOpen(false)}
                    className={`flex-1 py-2 text-xs rounded-xl ${styles.buttonSecondary}`}
                  >
                    Cancelar
                  </button>
                  <button
                    disabled={deleting}
                    onClick={handleDelete}
                    className="flex-1 py-2 text-xs font-semibold rounded-xl bg-red-500 hover:bg-red-600 text-white cursor-pointer transition-colors flex items-center justify-center gap-1.5"
                  >
                    {deleting ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <span>Excluir</span>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </DashboardLayout>
  )
}