'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../../../lib/supabase.js'
import { useRouter } from 'next/navigation'
import DashboardLayout, { useTheme, useDashboard } from '../../components/DashboardLayout.jsx'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Scissors, 
  Plus, 
  Trash2, 
  Edit2, 
  X, 
  Check, 
  Loader2, 
  ShieldAlert, 
  Sparkles, 
  Clock, 
  DollarSign, 
  AlertTriangle 
} from 'lucide-react'

export default function ServicesPage() {
  const router = useRouter()
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  // Estados principais
  const { barbershop, loading: layoutLoading } = useDashboard()
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)

  // Estados do Modal de Formulário
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('create') // 'create' | 'edit'
  const [currentServiceId, setCurrentServiceId] = useState(null)
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [duration, setDuration] = useState('')
  const [saving, setSaving] = useState(false)
  const [validationErrors, setValidationErrors] = useState({})

  // Estados do Modal de Confirmação de Exclusão
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [serviceToDelete, setServiceToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  // Carregar serviços e dados da barbearia
  const loadData = useCallback(async () => {
    if (!barbershop) return
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('barbershop_id', barbershop.id)
        .order('id', { ascending: true })

      if (!error) {
        setServices(data || [])
      } else {
        console.error('Erro ao buscar serviços:', error)
      }
    } catch (err) {
      console.error('Erro no loadData:', err)
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
  }, [barbershop, layoutLoading, loadData, router])

  // Abrir modal de criação
  const openCreateModal = () => {
    if (barbershop?.plan === 'basic' && services.length >= 3) {
      alert('Limite do plano básico atingido! Remova um serviço ou faça upgrade de plano.')
      return
    }
    setModalMode('create')
    setCurrentServiceId(null)
    setName('')
    setPrice('')
    setDuration('')
    setValidationErrors({})
    setModalOpen(true)
  }

  // Abrir modal de edição
  const openEditModal = (service) => {
    setModalMode('edit')
    setCurrentServiceId(service.id)
    setName(service.name || '')
    setPrice(String(service.price || ''))
    setDuration(String(service.duration || ''))
    setValidationErrors({})
    setModalOpen(true)
  }

  // Salvar serviço (Cadastro ou Edição)
  const handleSave = async (e) => {
    e.preventDefault()

    // Validações
    const errors = {}
    if (!name.trim()) errors.name = 'O nome do serviço é obrigatório'
    if (!price || Number(price) <= 0) errors.price = 'Digite um valor válido maior que R$ 0'
    if (!duration || Number(duration) <= 0) errors.duration = 'Digite uma duração válida (minutos)'

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      return
    }

    setSaving(true)
    try {
      const payload = {
        name: name.trim(),
        price: Number(price),
        duration: Number(duration),
        barbershop_id: barbershop.id,
        user_id: barbershop.user_id
      }

      if (modalMode === 'create') {
        const { error } = await supabase
          .from('services')
          .insert(payload)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('services')
          .update(payload)
          .eq('id', currentServiceId)

        if (error) throw error
      }

      setModalOpen(false)
      await loadData()
    } catch (err) {
      console.error('Erro ao salvar serviço:', err)
      alert(`Falha ao salvar serviço: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  // Confirmar início de exclusão
  const confirmDelete = (service) => {
    setServiceToDelete(service)
    setDeleteModalOpen(true)
  }

  // Executar exclusão física no banco
  const handleDelete = async () => {
    if (!serviceToDelete) return
    setDeleting(true)
    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', serviceToDelete.id)

      if (error) throw error

      setDeleteModalOpen(false)
      setServiceToDelete(null)
      await loadData()
    } catch (err) {
      console.error('Erro ao excluir serviço:', err)
      alert(`Não foi possível excluir o serviço permanentemente.\n\nMotivo: Esse serviço pode estar vinculado a agendamentos de clientes existentes no banco de dados.`)
    } finally {
      setDeleting(false)
    }
  }

  const atLimit = barbershop?.plan === 'basic' && services.length >= 3

  const styles = {
    card: isDark 
      ? 'border-zinc-900 bg-[#0c0c0e]/50 backdrop-blur-xl shadow-xl' 
      : 'border-zinc-200/80 bg-white shadow-md',
    serviceCard: isDark
      ? 'bg-[#09090b]/40 border-zinc-900/60 hover:border-zinc-800/80 hover:bg-zinc-900/20'
      : 'bg-white border-zinc-200/80 hover:border-zinc-300 hover:bg-zinc-50 shadow-sm',
    input: isDark 
      ? 'bg-zinc-900/30 border-zinc-900 focus:border-zinc-800 text-zinc-200 placeholder-zinc-500 focus:ring-1 focus:ring-amber-500/20' 
      : 'bg-white border-zinc-200 focus:border-zinc-300 text-zinc-900 placeholder-zinc-400 shadow-sm focus:ring-1 focus:ring-amber-500/20',
    buttonPrimary: 'bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-semibold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_15px_rgba(245,158,11,0.15)] cursor-pointer',
    buttonSecondary: isDark
      ? 'bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 hover:border-zinc-700 text-zinc-300 cursor-pointer'
      : 'bg-zinc-100 border border-zinc-200 hover:bg-zinc-200/60 text-zinc-700 cursor-pointer shadow-sm',
    badge: 'text-amber-500 bg-amber-500/10 border border-amber-500/10',
    modalOverlay: 'fixed inset-0 bg-black/60 backdrop-blur-md z-[9999] flex items-center justify-center p-4',
    modalBody: isDark
      ? 'bg-[#09090b]/95 border border-zinc-900 shadow-2xl rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto text-white'
      : 'bg-white border border-zinc-250 shadow-xl rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto text-zinc-900',
    modalSmallBody: isDark
      ? 'bg-[#09090b]/95 border border-zinc-900 shadow-2xl rounded-2xl w-full max-w-md p-6 text-white'
      : 'bg-white border border-zinc-250 shadow-xl rounded-2xl w-full max-w-md p-6 text-zinc-900'
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col gap-6 max-w-2xl mx-auto px-4">
          <div className="h-10 w-48 bg-zinc-900/60 animate-pulse rounded-lg" />
          <div className="h-20 bg-[#0c0c0e]/40 border border-zinc-900 rounded-2xl animate-pulse" />
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-[#0c0c0e]/40 border border-zinc-900 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 max-w-2xl mx-auto pb-10 px-4">
        
        {/* CABEÇALHO */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className={`text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-zinc-900'}`}>
              Catálogo de Serviços
            </h1>
            <p className="text-zinc-500 text-xs mt-0.5">
              Gerencie os serviços oferecidos e seus respectivos valores.
            </p>
          </div>
          
          <div className="flex items-center gap-3 self-end sm:self-auto">
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border ${styles.badge}`}>
              {services.length} / {barbershop?.plan === 'basic' ? 3 : '∞'} Ativos
            </span>
            <button
              onClick={openCreateModal}
              disabled={atLimit}
              className={`px-4 py-2 rounded-xl text-xs flex items-center gap-2 justify-center ${styles.buttonPrimary} ${
                atLimit ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <Plus size={15} />
              <span>Adicionar Serviço</span>
            </button>
          </div>
        </div>

        {/* ALERTA DE PLANO BÁSICO LIMITADO */}
        {atLimit && (
          <div className="bg-gradient-to-r from-amber-500/5 via-amber-500/10 to-transparent border border-amber-500/20 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
            <div>
              <p className="text-xs text-amber-500 font-bold flex items-center gap-1.5">
                <ShieldAlert size={14} />
                <span>Limite do plano básico atingido!</span>
              </p>
              <p className="text-[10px] text-zinc-500 mt-0.5">O plano Básico permite até 3 serviços. Faça um upgrade para liberar cadastro ilimitado.</p>
            </div>
            <Link 
              href="/#plans" 
              className="text-[11px] font-bold text-zinc-900 bg-amber-400 hover:bg-amber-300 px-3.5 py-2 rounded-xl transition-all hover:scale-[1.02] shadow-md shadow-amber-500/10"
            >
              Fazer upgrade de plano
            </Link>
          </div>
        )}

        {/* LISTAGEM DE SERVIÇOS */}
        <div className="flex flex-col gap-3">
          <h2 className={`text-xs uppercase tracking-wider text-zinc-500 font-bold ${services.length > 0 ? 'mb-1' : ''}`}>
            Serviços Cadastrados
          </h2>

          <AnimatePresence mode="popLayout">
            {services.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`p-10 rounded-2xl border text-center flex flex-col items-center justify-center ${styles.card}`}
              >
                <Scissors size={28} className="text-zinc-600 mb-2" />
                <p className="text-sm text-zinc-500 font-medium">Nenhum serviço cadastrado ainda</p>
                <p className="text-xs text-zinc-600">Cadastre seu primeiro serviço no botão superior para disponibilizá-lo aos clientes.</p>
              </motion.div>
            ) : (
              services.map((service) => (
                <motion.div 
                  key={service.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className={`p-4 rounded-xl border flex items-center justify-between gap-4 transition-all ${styles.serviceCard}`}
                >
                  {/* Nome e Duração */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-500 p-[1px] shadow-sm flex-shrink-0 flex items-center justify-center">
                      <div className={`w-full h-full rounded-[9px] flex items-center justify-center ${
                        isDark ? 'bg-zinc-950 text-amber-500' : 'bg-white text-amber-600'
                      }`}>
                        <Scissors size={15} />
                      </div>
                    </div>
                    <div className="min-w-0">
                      <p className={`text-sm font-bold truncate ${isDark ? 'text-zinc-200' : 'text-zinc-800'}`}>{service.name}</p>
                      <p className="text-xs text-zinc-500 truncate mt-0.5 flex items-center gap-1.5">
                        <Clock size={11} className="text-zinc-600" />
                        <span>{service.duration} minutos de duração</span>
                      </p>
                    </div>
                  </div>

                  {/* Preço e Ações */}
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <span className="text-sm font-extrabold bg-gradient-to-r from-amber-500 to-yellow-500 bg-clip-text text-transparent">
                      R$ {Number(service.price).toFixed(2)}
                    </span>
                    
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => openEditModal(service)}
                        className={`p-2 rounded-lg border cursor-pointer transition-colors ${
                          isDark 
                            ? 'text-zinc-400 hover:text-white bg-zinc-950/30 border-zinc-900 hover:border-zinc-800' 
                            : 'text-zinc-500 hover:text-zinc-900 bg-white border-zinc-200 hover:bg-zinc-50 shadow-sm'
                        }`}
                        title="Editar serviço"
                      >
                        <Edit2 size={13} />
                      </button>
                      
                      <button
                        onClick={() => confirmDelete(service)}
                        className={`p-2 rounded-lg border cursor-pointer transition-colors ${styles.trashBtn}`}
                        title="Excluir serviço"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

      </div>

      {/* MODAL DE CADASTRO E EDIÇÃO (ANIMADO) */}
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
              {/* Cabeçalho do Modal */}
              <div className={`flex items-center justify-between px-6 py-4 border-b ${isDark ? 'border-zinc-900' : 'border-zinc-200/80'}`}>
                <div className="flex items-center gap-2">
                  <Scissors size={18} className="text-amber-500" />
                  <h2 className="font-bold text-base">
                    {modalMode === 'create' ? 'Adicionar Novo Serviço' : 'Editar Serviço'}
                  </h2>
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
              <form onSubmit={handleSave} className="p-6 flex flex-col gap-4">
                
                {/* Nome do Serviço */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xxs font-bold uppercase tracking-wider text-zinc-500">Nome do Serviço *</label>
                  <input
                    type="text"
                    placeholder="Ex: Corte degradê, Barba completa..."
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Preço (R$) */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xxs font-bold uppercase tracking-wider text-zinc-500">Valor (R$) *</label>
                    <div className="relative">
                      <DollarSign size={12} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                      <input
                        type="number"
                        placeholder="Ex: 35"
                        min="0.01"
                        step="0.01"
                        value={price}
                        onChange={e => {
                          setPrice(e.target.value)
                          if (validationErrors.price) {
                            setValidationErrors(prev => ({ ...prev, price: null }))
                          }
                        }}
                        className={`w-full pl-9 pr-4 py-2.5 text-xs rounded-xl border outline-none ${styles.input} ${
                          validationErrors.price ? 'border-red-500/60 focus:border-red-500' : ''
                        }`}
                        required
                      />
                    </div>
                    {validationErrors.price && (
                      <span className="text-red-400 text-xxs flex items-center gap-1 mt-0.5">
                        <AlertTriangle size={10} />
                        {validationErrors.price}
                      </span>
                    )}
                  </div>

                  {/* Duração (Minutos) */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xxs font-bold uppercase tracking-wider text-zinc-500">Duração (Minutos) *</label>
                    <div className="relative">
                      <Clock size={12} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                      <input
                        type="number"
                        placeholder="Ex: 30, 45..."
                        min="1"
                        value={duration}
                        onChange={e => {
                          setDuration(e.target.value)
                          if (validationErrors.duration) {
                            setValidationErrors(prev => ({ ...prev, duration: null }))
                          }
                        }}
                        className={`w-full pl-9 pr-4 py-2.5 text-xs rounded-xl border outline-none ${styles.input} ${
                          validationErrors.duration ? 'border-red-500/60 focus:border-red-500' : ''
                        }`}
                        required
                      />
                    </div>
                    {validationErrors.duration && (
                      <span className="text-red-400 text-xxs flex items-center gap-1 mt-0.5">
                        <AlertTriangle size={10} />
                        {validationErrors.duration}
                      </span>
                    )}
                  </div>
                </div>

                <div className={`border-b w-full mt-2 ${isDark ? 'border-zinc-900' : 'border-zinc-200/80'}`} />

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
                        <span>Salvando...</span>
                      </>
                    ) : (
                      <>
                        <Check size={13} />
                        <span>Salvar Serviço</span>
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
                
                <h3 className="text-base font-bold">Excluir Serviço?</h3>
                <p className="text-zinc-500 text-xs mt-2 max-w-sm">
                  Você está prestes a excluir permanentemente o serviço <strong className="font-semibold">{serviceToDelete?.name}</strong> da sua barbearia. Esta ação é irreversível e removerá o serviço de forma definitiva.
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