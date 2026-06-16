'use client'

import { useEffect, useState } from 'react'
import { supabaseBarber as supabase } from '../../../lib/supabase-barber.js'
import { useRouter } from 'next/navigation'
import DashboardLayout, { useTheme, useDashboard } from '../../components/DashboardLayout'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Users, 
  Search, 
  Check, 
  X, 
  Phone, 
  Mail, 
  Loader2, 
  ShieldCheck, 
  AlertCircle, 
  CreditCard,
  Calendar,
  ExternalLink,
  ChevronRight,
  Clock
} from 'lucide-react'

export default function CustomersPage() {
  const router = useRouter()
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const { barbershop, loading: layoutLoading } = useDashboard()
  const [subscriptions, setSubscriptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all') // 'all' | 'active' | 'pending' | 'cancelled'
  const [actionLoading, setActionLoading] = useState({}) // armazena loading de ações por ID de subscription

  useEffect(() => {
    if (layoutLoading) return
    if (!barbershop) {
      setLoading(false)
      const timer = setTimeout(() => router.push('/login'), 3000)
      return () => clearTimeout(timer)
    }

    const loadData = async () => {
      try {
        setLoading(true)
        // 1. Carregar todos os clientes registrados da barbearia
        const { data: customersData, error: customersError } = await supabase
          .from('customers')
          .select('*')
          .eq('barbershop_id', barbershop.id)
          .order('name', { ascending: true })

        if (customersError) throw customersError

        // 2. Carregar todas as assinaturas da barbearia
        const { data: subsData, error: subsError } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('barbershop_id', barbershop.id)

        if (subsError) throw subsError

        // 3. Mesclar dados para garantir que mesmo clientes sem assinatura ativa apareçam
        const subMap = {}
        subsData?.forEach(sub => {
          const current = subMap[sub.customer_id]
          if (!current || sub.status === 'active' || (sub.status === 'pending' && current.status !== 'active')) {
            subMap[sub.customer_id] = sub
          }
        })

        const merged = (customersData || []).map(cust => {
          const sub = subMap[cust.id]
          if (sub) {
            return {
              ...sub,
              customer: cust
            }
          } else {
            return {
              id: `no-sub-${cust.id}`,
              customer_id: cust.id,
              barbershop_id: barbershop.id,
              plan_name: 'Sem Assinatura',
              price: 0,
              status: 'none',
              starts_at: null,
              expires_at: null,
              created_at: cust.created_at,
              customer: cust
            }
          }
        })

        // Ordenar por prioridade de status: ativos, depois pendentes, depois cancelados, por fim sem assinatura
        merged.sort((a, b) => {
          const statusOrder = { active: 1, pending: 2, cancelled: 3, none: 4 }
          return (statusOrder[a.status] || 99) - (statusOrder[b.status] || 99)
        })

        setSubscriptions(merged)
      } catch (err) {
        console.error('Erro ao carregar clientes e assinaturas:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [barbershop, layoutLoading, router])

  // Limpar número do WhatsApp para o link wa.me
  const getWhatsAppLink = (phone) => {
    if (!phone) return '#'
    const clean = phone.replace(/\D/g, '')
    // Adiciona o código DDI 55 do Brasil se o número não possuir
    const ddi = clean.startsWith('55') ? '' : '55'
    return `https://wa.me/${ddi}${clean}`
  }

  // Atualizar status de assinatura no Supabase (Ativação manual/Cancelamento)
  const handleUpdateStatus = async (subId, nextStatus) => {
    setActionLoading(prev => ({ ...prev, [subId]: true }))

    const { error } = await supabase
      .from('subscriptions')
      .update({ status: nextStatus })
      .eq('id', subId)

    if (error) {
      alert('Erro ao atualizar status da assinatura: ' + error.message)
      setActionLoading(prev => ({ ...prev, [subId]: false }))
      return
    }

    // Atualiza localmente
    setSubscriptions(prev => 
      prev.map(sub => sub.id === subId ? { ...sub, status: nextStatus } : sub)
    )
    setActionLoading(prev => ({ ...prev, [subId]: false }))
  }

  // Filtragem e busca de dados
  const filteredSubs = subscriptions.filter(sub => {
    const customerName = sub.customer?.name?.toLowerCase() || ''
    const customerEmail = sub.customer?.email?.toLowerCase() || ''
    const customerPhone = sub.customer?.whatsapp?.toLowerCase() || ''
    const planName = sub.plan_name?.toLowerCase() || ''
    const search = searchTerm.toLowerCase()

    const matchesSearch = 
      customerName.includes(search) || 
      customerEmail.includes(search) || 
      customerPhone.includes(search) ||
      planName.includes(search)

    const matchesStatus = 
      statusFilter === 'all' || 
      sub.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // Estilos baseados no tema
  const styles = {
    card: isDark ? 'bg-[#09090b]/50 border-zinc-900/60' : 'bg-white border-zinc-200/80 shadow-sm',
    border: isDark ? 'border-zinc-900/60' : 'border-zinc-200/80',
    title: isDark ? 'text-zinc-100' : 'text-zinc-900',
    subtext: isDark ? 'text-zinc-500' : 'text-zinc-400',
    text: isDark ? 'text-zinc-300' : 'text-zinc-700',
    tableHeader: isDark ? 'bg-zinc-950/40 text-zinc-400 border-zinc-900/50' : 'bg-zinc-50/70 text-zinc-500 border-zinc-200/60',
    tableRowHover: isDark ? 'hover:bg-zinc-900/20' : 'hover:bg-zinc-50/50',
    input: isDark ? 'bg-zinc-950/40 border-zinc-900 focus:border-amber-500/80 text-white' : 'bg-white border-zinc-200 focus:border-amber-500/80 text-zinc-800 placeholder-zinc-400 shadow-sm',
    badgeActive: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    badgePending: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    badgeCancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
    tabActive: isDark ? 'bg-amber-500/10 text-amber-500 border-amber-500/30' : 'bg-amber-500/5 text-amber-600 border-amber-500/20 shadow-sm',
    tabInactive: isDark ? 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/30' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100/60 border-transparent',
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 relative z-10">
        
        {/* CABEÇALHO DA PÁGINA */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className={`text-xl font-bold tracking-tight ${styles.title}`}>Clientes e Assinaturas</h1>
            <p className={`text-xs ${styles.subtext} mt-1`}>
              Gerencie os clientes cadastrados que assinaram planos de fidelidade da sua barbearia.
            </p>
          </div>
        </div>

        {/* ALERTA DE PLATAFORMA DE PAGAMENTO */}
        <div className={`p-4 border rounded-2xl flex items-start gap-3 ${
          isDark ? 'bg-amber-500/[0.02] border-amber-500/10 text-amber-500/90' : 'bg-amber-50/50 border-amber-500/20 text-amber-600/95 shadow-sm'
        }`}>
          <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-bold">Aviso sobre Pagamentos: </span>
            <span className="font-light">
              Como não há gateway de pagamento real integrado no momento, as assinaturas criadas pelos clientes entram como <strong>Pendente</strong>. 
              Você pode aprovar manualmente o plano após receber o pagamento presencialmente.
            </span>
          </div>
        </div>

        {/* FILTROS E PESQUISA */}
        <div className={`border rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 ${styles.card}`}>
          {/* Abas de Status */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {[
              { id: 'all', label: 'Todos' },
              { id: 'active', label: 'Ativos' },
              { id: 'pending', label: 'Pendentes' },
              { id: 'cancelled', label: 'Cancelados' }
            ].map(tab => {
              const isActive = statusFilter === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer whitespace-nowrap ${
                    isActive ? styles.tabActive : styles.tabInactive
                  }`}
                >
                  {tab.label}
                </button>
              )
            })}
          </div>

          {/* Campo de Pesquisa */}
          <div className="relative w-full md:w-72">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
            <input
              type="text"
              placeholder="Pesquisar cliente ou plano..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className={`w-full pl-9 pr-4 py-2 text-xs rounded-xl border outline-none transition-all ${styles.input}`}
            />
          </div>
        </div>

        {/* LISTAGEM DE CLIENTES */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 size={24} className="animate-spin text-amber-500" />
            <p className={`text-xs ${styles.subtext} font-mono tracking-wider uppercase`}>Carregando Clientes...</p>
          </div>
        ) : filteredSubs.length === 0 ? (
          <div className={`border border-dashed rounded-3xl p-12 text-center flex flex-col items-center gap-4 ${styles.card}`}>
            <Users size={36} className="text-zinc-600 mb-2" />
            <h3 className={`font-bold text-sm ${styles.title}`}>Nenhum cliente encontrado</h3>
            <p className={`text-xs ${styles.subtext} max-w-xs leading-relaxed`}>
              Não encontramos clientes com planos de assinatura correspondentes aos filtros selecionados.
            </p>
          </div>
        ) : (
          <div className={`border rounded-3xl overflow-hidden ${styles.card}`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className={`border-b text-[10px] font-bold uppercase tracking-wider ${styles.tableHeader}`}>
                    <th className="px-6 py-4">Cliente</th>
                    <th className="px-6 py-4">Plano</th>
                    <th className="px-6 py-4">Período</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900/10 dark:divide-zinc-900/40 text-xs">
                  {filteredSubs.map(sub => {
                    const client = sub.customer
                    const isLoading = actionLoading[sub.id]
                    
                    return (
                      <tr key={sub.id} className={`transition-colors ${styles.tableRowHover}`}>
                        
                        {/* Dados do Cliente */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-500/20 to-yellow-500/10 flex items-center justify-center font-bold text-amber-500 border border-amber-500/10 flex-shrink-0">
                              {client?.name ? client.name.charAt(0).toUpperCase() : 'C'}
                            </div>
                            <div className="flex flex-col gap-0.5 min-w-0">
                              <span className={`font-bold truncate ${styles.title}`}>{client?.name || 'Cliente Sem Nome'}</span>
                              <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3 text-xxs mt-0.5">
                                {/* Email */}
                                <span className={`flex items-center gap-1 ${styles.subtext}`}>
                                  <Mail size={10} className="flex-shrink-0" />
                                  <a href={`mailto:${client?.email}`} className="hover:text-amber-500 truncate">{client?.email || 'N/A'}</a>
                                </span>
                                {/* WhatsApp */}
                                <span className={`flex items-center gap-1 ${styles.subtext}`}>
                                  <Phone size={10} className="flex-shrink-0" />
                                  <a 
                                    href={getWhatsAppLink(client?.whatsapp)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-emerald-500 hover:underline flex items-center gap-0.5 truncate font-medium text-emerald-500/90"
                                  >
                                    <span>{client?.whatsapp || 'N/A'}</span>
                                    <ExternalLink size={8} className="flex-shrink-0" />
                                  </a>
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Plano Assinado */}
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-0.5">
                            <span className={`font-bold ${styles.title}`}>{sub.plan_name}</span>
                            <span className="text-[10px] text-zinc-500 font-mono">
                              R$ {Number(sub.price).toFixed(2)}/mês
                            </span>
                          </div>
                        </td>

                        {/* Período da Assinatura */}
                        <td className="px-6 py-4 text-zinc-500">
                          {sub.starts_at ? (
                            <div className="flex flex-col gap-0.5">
                              <span className="flex items-center gap-1 text-[10px]">
                                <Calendar size={9} />
                                <span>Início: {new Date(sub.starts_at).toLocaleDateString('pt-BR')}</span>
                              </span>
                              <span className="flex items-center gap-1 text-[10px]">
                                <Clock size={9} />
                                <span>Expira: {new Date(sub.expires_at).toLocaleDateString('pt-BR')}</span>
                              </span>
                            </div>
                          ) : (
                            <span className="text-[10px] text-zinc-500 font-mono">N/A</span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          <AnimatePresence mode="wait">
                            {sub.status === 'active' ? (
                              <motion.span 
                                key="active"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${styles.badgeActive}`}
                              >
                                <ShieldCheck size={10} />
                                <span>Ativo</span>
                              </motion.span>
                            ) : sub.status === 'pending' ? (
                              <motion.span 
                                key="pending"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${styles.badgePending}`}
                              >
                                <Clock size={10} />
                                <span>Pendente</span>
                              </motion.span>
                            ) : sub.status === 'cancelled' ? (
                              <motion.span 
                                key="cancelled"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${styles.badgeCancelled}`}
                              >
                                <X size={10} />
                                <span>Cancelado</span>
                              </motion.span>
                            ) : (
                              <motion.span 
                                key="none"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-zinc-800 text-zinc-500 bg-zinc-900/10"
                              >
                                <Users size={10} />
                                <span>Sem Clube</span>
                              </motion.span>
                            )}
                          </AnimatePresence>
                        </td>

                        {/* Ações */}
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {isLoading ? (
                              <Loader2 size={14} className="animate-spin text-zinc-500 mr-2" />
                            ) : (
                              <>
                                {/* Ação de Aprovar/Ativar (Se for Pendente ou Cancelado) */}
                                {sub.status !== 'active' && sub.status !== 'none' && (
                                  <button
                                    onClick={() => handleUpdateStatus(sub.id, 'active')}
                                    className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                                      isDark 
                                        ? 'text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10 border-zinc-900 hover:border-emerald-500/20' 
                                        : 'text-emerald-600 hover:text-emerald-700 bg-white border-zinc-200 hover:bg-emerald-50 shadow-sm'
                                    }`}
                                    title="Ativar/Aprovar plano"
                                  >
                                    <Check size={13} className="stroke-[3px]" />
                                  </button>
                                )}

                                {/* Ação de Cancelar (Se for Ativo ou Pendente) */}
                                {sub.status !== 'cancelled' && sub.status !== 'none' && (
                                  <button
                                    onClick={() => handleUpdateStatus(sub.id, 'cancelled')}
                                    className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                                      isDark 
                                        ? 'text-zinc-500 hover:text-red-400 hover:bg-red-500/10 border-zinc-900' 
                                        : 'text-zinc-400 hover:text-red-600 hover:bg-red-50 border-zinc-200 shadow-sm'
                                    }`}
                                    title="Suspender/Cancelar plano"
                                  >
                                    <X size={13} className="stroke-[3px]" />
                                  </button>
                                )}
                              </>
                            )}
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
    </DashboardLayout>
  )
}
