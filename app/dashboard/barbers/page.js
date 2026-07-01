'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { supabaseBarber as supabase } from '../../../lib/supabase-barber.js'
import { useRouter } from 'next/navigation'
import DashboardLayout, { useTheme, useDashboard } from '../../components/DashboardLayout'
import Toast from '../../components/Toast'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  UserPlus, 
  Trash2, 
  Search, 
  Edit2, 
  Camera, 
  X, 
  Phone, 
  Percent, 
  User, 
  Check, 
  AlertTriangle, 
  Loader2, 
  Info,
  Calendar,
  MapPin,
  FileText,
  UserCheck,
  UserMinus
} from 'lucide-react'

export default function BarbersPage() {
  const router = useRouter()
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  // Estados principais
  const { barbershop, loading: layoutLoading } = useDashboard()
  const [barbers, setBarbers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('active') // 'active' | 'inactive' | 'all'

  // Estados do Modal
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('create') // 'create' | 'edit'
  const [currentBarberId, setCurrentBarberId] = useState(null)
  const [saving, setSaving] = useState(false)

  // Estados do Formulário
  const [fullName, setFullName] = useState('')
  const [cpf, setCpf] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [address, setAddress] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [commission, setCommission] = useState(0)
  const [isActive, setIsActive] = useState(true)
  const [photoUrl, setPhotoUrl] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [localPreview, setLocalPreview] = useState('')

  // Estados do Modal de Exclusão
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [barberToDelete, setBarberToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [toast, setToast] = useState({ message: '', type: 'error' })

  // Erros de Validação
  const [validationErrors, setValidationErrors] = useState({})

  // Ref do Input de File
  const fileInputRef = useRef(null)

  // Mascaramento CPF: 000.000.000-00
  const handleCpfChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '')
    let formatted = raw
    if (raw.length > 3) formatted = raw.substring(0, 3) + '.' + raw.substring(3)
    if (raw.length > 6) formatted = formatted.substring(0, 7) + '.' + formatted.substring(7)
    if (raw.length > 9) formatted = formatted.substring(0, 11) + '-' + formatted.substring(11, 13)
    setCpf(formatted.substring(0, 14))
  }

  // Mascaramento WhatsApp: (00) 00000-0000
  const handleWhatsappChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '')
    let formatted = raw
    if (raw.length > 0) {
      formatted = '(' + raw
    }
    if (raw.length > 2) {
      formatted = formatted.substring(0, 3) + ') ' + formatted.substring(3)
    }
    if (raw.length > 7) {
      formatted = formatted.substring(0, 10) + '-' + formatted.substring(10, 14)
    }
    setWhatsapp(formatted.substring(0, 15))
  }

  // Validar CPF
  const validateCPF = (value) => {
    const clean = value.replace(/\D/g, '')
    if (!clean) return true // opcional
    if (clean.length !== 11) return false
    if (/^(\d)\1{10}$/.test(clean)) return false
    
    let sum = 0
    let remainder
    
    for (let i = 1; i <= 9; i++) {
      sum += parseInt(clean.substring(i - 1, i)) * (11 - i)
    }
    
    remainder = (sum * 10) % 11
    if ((remainder === 10) || (remainder === 11)) remainder = 0
    if (remainder !== parseInt(clean.substring(9, 10))) return false
    
    sum = 0
    for (let i = 1; i <= 10; i++) {
      sum += parseInt(clean.substring(i - 1, i)) * (12 - i)
    }
    
    remainder = (sum * 10) % 11
    if ((remainder === 10) || (remainder === 11)) remainder = 0
    if (remainder !== parseInt(clean.substring(10, 11))) return false
    
    return true
  }

  // Carregar dados
  const loadData = useCallback(async () => {
    if (!barbershop) return
    try {
      setLoading(true)
      // Trazer todos os barbeiros (ativos e inativos) da barbearia
      const { data: barbersData, error: barbersError } = await supabase
        .from('barbers')
        .select('id, name, phone, email, bio, photo_url, active, commission_percentage')
        .eq('barbershop_id', barbershop.id)
        .order('created_at', { ascending: true })

      if (barbersError) {
        console.error('Erro ao buscar barbeiros', barbersError)
      } else {
        setBarbers(barbersData || [])
      }
    } catch (err) {
      console.error('Erro no loadData', err)
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

  // Tratar seleção da imagem
  const handlePhotoSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setToast({ message: 'A foto deve ter no máximo 2MB.', type: 'warning' })
        return
      }
      setSelectedFile(file)
      setLocalPreview(URL.createObjectURL(file))
    }
  }

  // Upload para o Supabase Storage
  const uploadPhoto = async (file) => {
    if (!file || !barbershop) return null
    
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`
    const filePath = `${barbershop.id}/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('barbers')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      })

    if (uploadError) {
      throw new Error(`Upload da foto falhou: ${uploadError.message}`)
    }

    const { data: { publicUrl } } = supabase.storage
      .from('barbers')
      .getPublicUrl(filePath)

    return publicUrl
  }

  // Abrir modal de criação
  const openCreateModal = () => {
    setModalMode('create')
    setCurrentBarberId(null)
    setFullName('')
    setCpf('')
    setBirthDate('')
    setAddress('')
    setWhatsapp('')
    setCommission(0)
    setIsActive(true)
    setPhotoUrl('')
    setSelectedFile(null)
    setLocalPreview('')
    setValidationErrors({})
    setModalOpen(true)
  }

  // Abrir modal de edição
  const openEditModal = (barber) => {
    setModalMode('edit')
    setCurrentBarberId(barber.id)
    setFullName(barber.full_name || barber.name || '')
    
    // Formatar valores salvos caso necessário
    const rawCpf = barber.cpf || ''
    setCpf(rawCpf)
    
    setBirthDate(barber.birth_date || '')
    setAddress(barber.address || '')
    setWhatsapp(barber.whatsapp || '')
    setCommission(barber.commission_percentage || 0)
    setIsActive(barber.active !== false)
    setPhotoUrl(barber.photo_url || '')
    setSelectedFile(null)
    setLocalPreview(barber.photo_url || '')
    setValidationErrors({})
    setModalOpen(true)
  }

  // Salvar Barbeiro
  const handleSave = async (e) => {
    e.preventDefault()
    
    // Validações
    const errors = {}
    if (!fullName.trim()) errors.fullName = 'Nome completo é obrigatório'
    if (cpf && !validateCPF(cpf)) errors.cpf = 'CPF inválido'
    if (commission < 0 || commission > 100) errors.commission = 'Porcentagem de comissão deve ser entre 0% e 100%'
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      return
    }

    setSaving(true)
    try {
      let finalPhotoUrl = photoUrl

      // Fazer upload de arquivo se selecionado
      if (selectedFile) {
        finalPhotoUrl = await uploadPhoto(selectedFile)
      }

      // Preparar payload do barbeiro
      const payload = {
        barbershop_id: barbershop.id,
        name: fullName.trim(), // manter nome legado
        full_name: fullName.trim(),
        photo_url: finalPhotoUrl,
        cpf: cpf ? cpf.replace(/\D/g, '') : null, // salvar apenas números
        birth_date: birthDate || null,
        address: address.trim() || null,
        whatsapp: whatsapp ? whatsapp.replace(/\D/g, '') : null, // salvar apenas números
        commission_percentage: Number(commission),
        active: isActive,
        updated_at: new Date().toISOString()
      }

      if (modalMode === 'create') {
        const { error } = await supabase
          .from('barbers')
          .insert(payload)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('barbers')
          .update(payload)
          .eq('id', currentBarberId)

        if (error) throw error
      }

      setModalOpen(false)
      await loadData()
    } catch (err) {
      console.error('Erro ao salvar barbeiro:', err)
      setToast({ message: `Ocorreu um erro ao salvar o barbeiro: ${err.message}`, type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  // Solicitar exclusão definitiva
  const confirmDelete = (barber) => {
    setBarberToDelete(barber)
    setDeleteModalOpen(true)
  }

  // Confirmar exclusão física permanente (delete do banco)
  const handleDelete = async () => {
    if (!barberToDelete) return
    setDeleting(true)
    try {
      const { error } = await supabase
        .from('barbers')
        .delete()
        .eq('id', barberToDelete.id)

      if (error) throw error

      setDeleteModalOpen(false)
      setBarberToDelete(null)
      await loadData()
    } catch (err) {
      console.error('Erro ao excluir barbeiro:', err)
      setToast({ 
        message: 'Não foi possível excluir o barbeiro permanentemente pois ele possui histórico de agendamentos. Recomendação: utilize a opção "Inativar" para removê-lo da agenda sem perder o histórico.', 
        type: 'error' 
      })
    } finally {
      setDeleting(false)
    }
  }

  // Inativar barbeiro (active = false)
  const handleInactivate = async (id) => {
    try {
      const { error } = await supabase
        .from('barbers')
        .update({ active: false, updated_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error
      await loadData()
    } catch (err) {
      console.error('Erro ao inativar barbeiro:', err)
      setToast({ message: 'Ocorreu um erro ao inativar o profissional.', type: 'error' })
    }
  }

  // Reativar barbeiro (active = true)
  const handleActivate = async (id) => {
    try {
      const { error } = await supabase
        .from('barbers')
        .update({ active: true, updated_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error
      await loadData()
    } catch (err) {
      console.error('Erro ao reativar barbeiro:', err)
      setToast({ message: 'Ocorreu um erro ao reativar o profissional.', type: 'error' })
    }
  }

  // Formatar visualização do CPF
  const displayCpf = (rawCpf) => {
    if (!rawCpf) return '—'
    const clean = rawCpf.replace(/\D/g, '')
    if (clean.length !== 11) return rawCpf
    return `${clean.substring(0, 3)}.${clean.substring(3, 6)}.${clean.substring(6, 9)}-${clean.substring(9, 11)}`
  }

  // Formatar visualização do Whatsapp
  const displayWhatsapp = (rawPhone) => {
    if (!rawPhone) return '—'
    const clean = rawPhone.replace(/\D/g, '')
    if (clean.length === 10) {
      return `(${clean.substring(0, 2)}) ${clean.substring(2, 6)}-${clean.substring(6, 10)}`
    }
    if (clean.length === 11) {
      return `(${clean.substring(0, 2)}) ${clean.substring(2, 7)}-${clean.substring(7, 11)}`
    }
    return rawPhone
  }

  // Filtrar barbeiros
  const filteredBarbers = barbers.filter(barber => {
    const nameToSearch = (barber.full_name || barber.name || '').toLowerCase()
    const matchesSearch = nameToSearch.includes(searchTerm.toLowerCase())
    
    const isBarberActive = barber.active !== false
    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'active' && isBarberActive) || 
      (statusFilter === 'inactive' && !isBarberActive)

    return matchesSearch && matchesStatus
  })

  // Estilos de tema dinâmicos
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
    tableHeader: isDark ? 'bg-zinc-950/40 text-zinc-400 border-zinc-900/80' : 'bg-zinc-50 text-zinc-500 border-zinc-200/80',
    tableRow: isDark 
      ? 'border-zinc-900 hover:bg-zinc-900/10' 
      : 'border-zinc-200/80 hover:bg-zinc-50/40 shadow-sm',
    modalOverlay: 'fixed inset-0 bg-black/60 backdrop-blur-md z-[9999] flex items-center justify-center p-4',
    modalBody: isDark
      ? 'bg-[#09090b]/95 border border-zinc-900 shadow-2xl rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto'
      : 'bg-white border border-zinc-250 shadow-xl rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto text-zinc-900',
    modalSmallBody: isDark
      ? 'bg-[#09090b]/95 border border-zinc-900 shadow-2xl rounded-2xl w-full max-w-md p-6'
      : 'bg-white border border-zinc-250 shadow-xl rounded-2xl w-full max-w-md p-6 text-zinc-900',
    tabActive: 'bg-gradient-to-r from-amber-500/10 to-yellow-500/5 text-amber-500 border border-amber-500/20 shadow-sm font-semibold',
    tabInactive: isDark
      ? 'text-zinc-400 hover:text-zinc-250 hover:bg-zinc-900/30'
      : 'text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100/60 shadow-sm border border-transparent'
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 max-w-6xl mx-auto pb-16 px-4">
        
        {/* CABEÇALHO DA PÁGINA */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className={`text-2xl font-bold tracking-tight ${styles.headerText}`}>
              Gestão de Barbeiros
            </h1>
            <p className={`${styles.subtext} text-xs mt-0.5`}>
              Gerencie a equipe de profissionais da barbearia, defina comissões e acompanhe o status dos membros.
            </p>
          </div>

          <button
            onClick={openCreateModal}
            className={`px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 justify-center ${styles.buttonPrimary}`}
          >
            <UserPlus size={15} />
            <span>Adicionar Barbeiro</span>
          </button>
        </div>

        {/* BARRA DE PESQUISA, FILTROS E CONTAGENS */}
        <div className={`p-4 rounded-xl border flex flex-col md:flex-row items-center gap-4 justify-between ${styles.card}`}>
          {/* Campo de Busca */}
          <div className="relative w-full md:w-80">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Buscar por nome..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className={`w-full pl-9 pr-4 py-2 text-xs rounded-xl border outline-none ${styles.input}`}
            />
          </div>

          {/* Filtro por Status */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-950/20 border border-zinc-900/20 w-full md:w-auto">
            {[
              { id: 'active', label: 'Ativos' },
              { id: 'inactive', label: 'Inativos' },
              { id: 'all', label: 'Todos' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`flex-1 md:flex-initial px-4 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                  statusFilter === tab.id ? styles.tabActive : styles.tabInactive
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* LISTAGEM DE BARBEIROS (TABELA PREMIUM) */}
        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map(i => (
              <div key={i} className={`h-20 w-full rounded-2xl border animate-pulse ${isDark ? 'bg-zinc-900/20 border-zinc-900' : 'bg-white border-zinc-200'}`} />
            ))}
          </div>
        ) : filteredBarbers.length === 0 ? (
          <div className={`p-16 rounded-2xl border text-center flex flex-col items-center justify-center ${styles.card}`}>
            <AlertTriangle size={32} className="text-amber-500/80 mb-3 animate-pulse" />
            <h3 className={`text-base font-bold ${styles.headerText}`}>Nenhum barbeiro encontrado</h3>
            <p className={`${styles.subtext} text-xs max-w-md mt-1`}>
              Tente redefinir a busca ou filtro por status. Para começar a cadastrar sua equipe, clique no botão "Adicionar Barbeiro" no topo.
            </p>
          </div>
        ) : (
          <div className={`overflow-hidden rounded-2xl border ${styles.card}`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className={`border-b text-xxs uppercase tracking-wider font-bold ${styles.tableHeader}`}>
                    <th className="px-6 py-4">Barbeiro</th>
                    <th className="px-6 py-4">Contato (WhatsApp)</th>
                    <th className="px-6 py-4">CPF</th>
                    <th className="px-6 py-4 text-center">Comissão</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900/10">
                  {filteredBarbers.map((barber) => {
                    const isBarberActive = barber.active !== false
                    return (
                      <tr 
                        key={barber.id}
                        className={`transition-all text-xs ${styles.tableRow}`}
                      >
                        {/* Avatar & Nome */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-500 p-[1px] shadow-md flex-shrink-0">
                              {barber.photo_url ? (
                                <img 
                                  src={barber.photo_url} 
                                  alt={barber.full_name || barber.name} 
                                  className="w-full h-full object-cover rounded-[9px]"
                                  onError={(e) => {
                                    // Fallback se a imagem der erro de carregamento
                                    e.target.style.display = 'none'
                                    e.target.nextSibling.style.display = 'flex'
                                  }}
                                />
                              ) : null}
                              <div 
                                className="w-full h-full rounded-[9px] flex items-center justify-center font-bold text-xs"
                                style={{ 
                                  display: barber.photo_url ? 'none' : 'flex',
                                  backgroundColor: isDark ? '#09090b' : '#ffffff',
                                  color: isDark ? '#e4e4e7' : '#27272a'
                                }}
                              >
                                {(barber.full_name || barber.name || 'B').charAt(0).toUpperCase()}
                              </div>
                            </div>
                            <div>
                              <p className={`font-bold text-sm leading-tight ${styles.headerText}`}>
                                {barber.full_name || barber.name}
                              </p>
                              {barber.birth_date && (
                                <span className={`${styles.subtext} text-[10px] block mt-0.5`}>
                                  Nasc: {new Date(barber.birth_date + 'T00:00:00').toLocaleDateString('pt-BR')}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* WhatsApp */}
                        <td className="px-6 py-4">
                          {barber.whatsapp ? (
                            <a
                              href={`https://wa.me/55${barber.whatsapp.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-emerald-500 hover:text-emerald-400 hover:underline font-medium transition-all"
                            >
                              <Phone size={12} />
                              <span>{displayWhatsapp(barber.whatsapp)}</span>
                            </a>
                          ) : (
                            <span className="text-zinc-500">—</span>
                          )}
                        </td>

                        {/* CPF */}
                        <td className="px-6 py-4 font-mono text-[11px] text-zinc-500">
                          {displayCpf(barber.cpf)}
                        </td>

                        {/* Comissão */}
                        <td className="px-6 py-4 text-center">
                          <div className="flex flex-col items-center gap-1">
                            <span className={`font-bold ${isDark ? 'text-zinc-200' : 'text-zinc-800'}`}>
                              {barber.commission_percentage || 0}%
                            </span>
                            <div className="w-16 h-1 rounded-full bg-zinc-950/20 overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-amber-500 to-yellow-500" 
                                style={{ width: `${Math.min(100, Math.max(0, barber.commission_percentage || 0))}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          {isBarberActive ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20">
                              <UserCheck size={10} />
                              <span>Ativo</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-zinc-400 bg-zinc-500/10 border border-zinc-500/20">
                              <UserMinus size={10} />
                              <span>Inativo</span>
                            </span>
                          )}
                        </td>

                        {/* Ações */}
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* Editar (Sempre presente) */}
                            <button
                              onClick={() => openEditModal(barber)}
                              className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                                isDark 
                                  ? 'text-zinc-400 hover:text-white bg-zinc-950/30 border-zinc-900 hover:border-zinc-800' 
                                  : 'text-zinc-500 hover:text-zinc-900 bg-white border-zinc-200 hover:bg-zinc-50 shadow-sm'
                              }`}
                              title="Editar barbeiro"
                            >
                              <Edit2 size={13} />
                            </button>

                            {/* Inativar (Apenas se a aba selecionada for "Ativos") */}
                            {statusFilter === 'active' && (
                              <button
                                onClick={() => handleInactivate(barber.id)}
                                className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                                  isDark 
                                    ? 'text-amber-500 hover:text-amber-400 hover:bg-amber-500/10 border-zinc-900 hover:border-amber-500/20' 
                                    : 'text-amber-600 hover:text-amber-700 bg-white border-zinc-200 hover:bg-amber-50 shadow-sm'
                                }`}
                                title="Inativar profissional"
                              >
                                <UserMinus size={13} />
                              </button>
                            )}

                            {/* Ativar (Apenas se a aba selecionada for "Inativos") */}
                            {statusFilter === 'inactive' && (
                              <button
                                onClick={() => handleActivate(barber.id)}
                                className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                                  isDark 
                                    ? 'text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10 border-zinc-900 hover:border-emerald-500/20' 
                                    : 'text-emerald-600 hover:text-emerald-700 bg-white border-zinc-200 hover:bg-emerald-50 shadow-sm'
                                }`}
                                title="Ativar profissional"
                              >
                                <UserCheck size={13} />
                              </button>
                            )}

                            {/* Excluir Permanentemente da Barbearia (Sempre presente em todas as abas) */}
                            <button
                              onClick={() => confirmDelete(barber)}
                              className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                                isDark 
                                  ? 'text-zinc-500 hover:text-red-400 hover:bg-red-500/10 border-zinc-900' 
                                  : 'text-zinc-400 hover:text-red-600 hover:bg-red-50 border-zinc-200 shadow-sm'
                              }`}
                              title="Excluir permanentemente da barbearia"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* MODAL DE CRIAÇÃO E EDIÇÃO (ANIMADO) */}
      <AnimatePresence>
        {modalOpen && (
          <div className={styles.modalOverlay}>
            
            {/* Backdrop Blur Animation */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60"
              onClick={() => !saving && setModalOpen(false)}
            />

            {/* Modal Body Container */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ type: 'spring', duration: 0.4 }}
              className={`relative z-10 ${styles.modalBody}`}
            >
              {/* Header */}
              <div className={`flex items-center justify-between px-6 py-4 border-b ${styles.border}`}>
                <div className="flex items-center gap-2">
                  <UserPlus size={18} className="text-amber-500" />
                  <h2 className="font-bold text-base">
                    {modalMode === 'create' ? 'Adicionar Novo Barbeiro' : 'Editar Configurações do Barbeiro'}
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

              {/* Form Content */}
              <form onSubmit={handleSave} className="p-6 flex flex-col gap-5">
                
                {/* UPLOAD DE AVATAR */}
                <div className="flex flex-col sm:flex-row items-center gap-5 pb-3">
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-500 p-[1.5px] shadow-lg flex-shrink-0 overflow-hidden">
                      {localPreview ? (
                        <img 
                          src={localPreview} 
                          alt="Preview do Avatar" 
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        <div className={`w-full h-full rounded-full flex items-center justify-center ${
                          isDark ? 'bg-zinc-950 text-zinc-500' : 'bg-zinc-100 text-zinc-400'
                        }`}>
                          <User size={36} />
                        </div>
                      )}
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={saving}
                      className="absolute bottom-0 right-0 p-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-black hover:scale-105 rounded-full shadow-md border border-black/10 transition-transform cursor-pointer"
                    >
                      <Camera size={14} />
                    </button>
                    
                    <input 
                      type="file"
                      ref={fileInputRef}
                      onChange={handlePhotoSelect}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>

                  <div className="text-center sm:text-left">
                    <h3 className="text-sm font-bold leading-tight">Foto do Profissional</h3>
                    <p className={`${styles.subtext} text-xxs mt-1 max-w-sm`}>
                      Carregue uma imagem em formato JPG ou PNG (Máx 2MB). Essa foto será usada no painel e na página pública de agendamento do cliente.
                    </p>
                    {localPreview && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedFile(null)
                          setLocalPreview('')
                          setPhotoUrl('')
                        }}
                        className="text-red-400 hover:text-red-300 text-xxs font-semibold mt-2 flex items-center gap-1 justify-center sm:justify-start"
                      >
                        <Trash2 size={10} />
                        Remover foto
                      </button>
                    )}
                  </div>
                </div>

                <div className={`border-b w-full ${styles.border}`} />

                {/* DADOS GERAIS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Nome Completo */}
                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <label className="text-xxs font-bold uppercase tracking-wider text-zinc-500">Nome Completo *</label>
                    <input
                      type="text"
                      placeholder="Ex: João da Silva Santos"
                      value={fullName}
                      onChange={e => {
                        setFullName(e.target.value)
                        if (validationErrors.fullName) {
                          setValidationErrors(prev => ({ ...prev, fullName: null }))
                        }
                      }}
                      className={`px-4 py-2.5 text-xs rounded-xl border outline-none ${styles.input} ${
                        validationErrors.fullName ? 'border-red-500/60 focus:border-red-500' : ''
                      }`}
                      required
                    />
                    {validationErrors.fullName && (
                      <span className="text-red-400 text-xxs flex items-center gap-1 mt-0.5">
                        <AlertTriangle size={10} />
                        {validationErrors.fullName}
                      </span>
                    )}
                  </div>

                  {/* CPF */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xxs font-bold uppercase tracking-wider text-zinc-500">CPF (Opcional)</label>
                    <input
                      type="text"
                      placeholder="000.000.000-00"
                      value={cpf}
                      onChange={handleCpfChange}
                      className={`px-4 py-2.5 text-xs rounded-xl border outline-none font-mono ${styles.input} ${
                        validationErrors.cpf ? 'border-red-500/60 focus:border-red-500' : ''
                      }`}
                    />
                    {validationErrors.cpf && (
                      <span className="text-red-400 text-xxs flex items-center gap-1 mt-0.5">
                        <AlertTriangle size={10} />
                        {validationErrors.cpf}
                      </span>
                    )}
                  </div>

                  {/* Data de Nascimento */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xxs font-bold uppercase tracking-wider text-zinc-500">Data de Nascimento</label>
                    <input
                      type="date"
                      value={birthDate}
                      onChange={e => setBirthDate(e.target.value)}
                      className={`px-4 py-2.5 text-xs rounded-xl border outline-none ${styles.input}`}
                    />
                  </div>

                  {/* WhatsApp */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xxs font-bold uppercase tracking-wider text-zinc-500">WhatsApp (Opcional)</label>
                    <div className="relative">
                      <Phone size={12} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                      <input
                        type="text"
                        placeholder="(00) 00000-0000"
                        value={whatsapp}
                        onChange={handleWhatsappChange}
                        className={`w-full pl-9 pr-4 py-2.5 text-xs rounded-xl border outline-none font-mono ${styles.input}`}
                      />
                    </div>
                  </div>

                  {/* Porcentagem de Comissão */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xxs font-bold uppercase tracking-wider text-zinc-500">Comissão de Serviços (%)</label>
                    <div className="relative">
                      <Percent size={12} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                      <input
                        type="number"
                        placeholder="Ex: 50"
                        min="0"
                        max="100"
                        value={commission === 0 ? '' : commission}
                        onChange={e => {
                          const val = Number(e.target.value)
                          setCommission(val)
                          if (validationErrors.commission) {
                            setValidationErrors(prev => ({ ...prev, commission: null }))
                          }
                        }}
                        className={`w-full pl-9 pr-4 py-2.5 text-xs rounded-xl border outline-none ${styles.input} ${
                          validationErrors.commission ? 'border-red-500/60 focus:border-red-500' : ''
                        }`}
                      />
                    </div>
                    {validationErrors.commission && (
                      <span className="text-red-400 text-xxs flex items-center gap-1 mt-0.5">
                        <AlertTriangle size={10} />
                        {validationErrors.commission}
                      </span>
                    )}
                  </div>

                  {/* Endereço Residencial */}
                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <label className="text-xxs font-bold uppercase tracking-wider text-zinc-500">Endereço Residencial (Opcional)</label>
                    <input
                      type="text"
                      placeholder="Rua, número, bairro, cidade..."
                      value={address}
                      onChange={e => setAddress(e.target.value)}
                      className={`px-4 py-2.5 text-xs rounded-xl border outline-none ${styles.input}`}
                    />
                  </div>

                  {/* Toggle de Status Ativo/Inativo */}
                  <div className={`p-4 rounded-xl border sm:col-span-2 flex items-center justify-between mt-2 ${
                    isDark ? 'bg-zinc-950/20 border-zinc-900/60' : 'bg-zinc-50 border-zinc-200/80 shadow-sm'
                  }`}>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-bold leading-tight">Profissional Ativo</span>
                      <span className={`${styles.subtext} text-[10px]`}>
                        Profissionais inativos não aparecem para novos agendamentos mas preservam histórico de vendas.
                      </span>
                    </div>

                    {/* Switch Toggle Animado */}
                    <button
                      type="button"
                      onClick={() => setIsActive(prev => !prev)}
                      className={`w-11 h-6 rounded-full p-[2px] transition-colors duration-200 cursor-pointer ${
                        isActive ? 'bg-amber-500' : (isDark ? 'bg-zinc-800' : 'bg-zinc-300')
                      }`}
                    >
                      <motion.div 
                        layout 
                        className="w-5 h-5 rounded-full bg-white shadow-sm"
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        animate={{ x: isActive ? 20 : 0 }}
                      />
                    </button>
                  </div>
                </div>

                <div className={`border-b w-full mt-2 ${styles.border}`} />

                {/* ACTIONS */}
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
                        <span>Salvar Alterações</span>
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
                
                <h3 className={`text-base font-bold ${styles.headerText}`}>Excluir Profissional?</h3>
                <p className={`${styles.subtext} text-xs mt-2 max-w-sm`}>
                  Você está prestes a excluir permanentemente o barbeiro <strong className="font-semibold">{barberToDelete?.full_name || barberToDelete?.name}</strong> da sua barbearia. Esta ação removerá o registro do banco de dados e é irreversível.
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
      <Toast 
        message={toast.message} 
        type={toast.type} 
        onClose={() => setToast({ message: '', type: 'error' })} 
      />
    </DashboardLayout>
  )
}