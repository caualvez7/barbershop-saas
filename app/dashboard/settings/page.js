'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { useRouter } from 'next/navigation'
import DashboardLayout, { useTheme, useDashboard } from '../../components/DashboardLayout'
import { motion, AnimatePresence } from 'framer-motion'
import { Settings, Save, CheckCircle2, Clock, MapPin, Store } from 'lucide-react'

const DAYS = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Segunda-feira' },
  { value: 2, label: 'Terça-feira' },
  { value: 3, label: 'Quarta-feira' },
  { value: 4, label: 'Quinta-feira' },
  { value: 5, label: 'Sexta-feira' },
  { value: 6, label: 'Sábado' },
]

export default function SettingsPage() {
  const router = useRouter()
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const { barbershop: initialBarbershop } = useDashboard()
  const [barbershop, setBarbershop] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savingHours, setSavingHours] = useState(false)
  const [successInfo, setSuccessInfo] = useState(false)
  const [successHours, setSuccessHours] = useState(false)

  // campos info
  const [name, setName] = useState('')
  const [ownerName, setOwnerName] = useState('')
  const [phone, setPhone] = useState('')
  const [commercialEmail, setCommercialEmail] = useState('')

  // horários
  const [hours, setHours] = useState(
    DAYS.map(d => ({ day_of_week: d.value, is_open: false, open_time: '09:00', close_time: '19:00' }))
  )

  useEffect(() => {
    if (!initialBarbershop) return

    const loadData = async () => {
      try {
        setLoading(true)
        setBarbershop(initialBarbershop)
        setName(initialBarbershop.name || '')
        setOwnerName(initialBarbershop.owner_name || '')
        setPhone(initialBarbershop.phone || '')
        setCommercialEmail(initialBarbershop.commercial_email || '')

        const { data: hoursData } = await supabase
          .from('business_hours')
          .select('*')
          .eq('barbershop_id', initialBarbershop.id)

        if (hoursData && hoursData.length > 0) {
          setHours(DAYS.map(d => {
            const existing = hoursData.find(h => h.day_of_week === d.value)
            return existing
              ? { day_of_week: d.value, is_open: existing.is_open, open_time: existing.open_time.slice(0, 5), close_time: existing.close_time.slice(0, 5) }
              : { day_of_week: d.value, is_open: false, open_time: '09:00', close_time: '19:00' }
          }))
        }
      } catch (err) {
        console.error('Erro ao carregar configurações:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [initialBarbershop])

  const updateHour = (dayValue, field, value) => {
    setHours(prev => prev.map(h =>
      h.day_of_week === dayValue ? { ...h, [field]: value } : h
    ))
  }

  const handleSaveInfo = async () => {
    if (!name.trim() || !ownerName.trim()) { alert('Nome da barbearia e proprietário são obrigatórios.'); return }

    setSaving(true)

    const { error } = await supabase
      .from('barbershops')
      .update({ name: name.trim(), owner_name: ownerName.trim(), phone: phone.trim(), commercial_email: commercialEmail.trim() })
      .eq('id', barbershop.id)

    if (error) { 
      alert('Erro ao salvar informações.')
      setSaving(false)
      return 
    }

    setSuccessInfo(true)
    setTimeout(() => setSuccessInfo(false), 3000)
    setSaving(false)
  }

  const handleSaveHours = async () => {
    setSavingHours(true)

    const rows = hours.map(h => ({
      barbershop_id: barbershop.id,
      day_of_week: h.day_of_week,
      is_open: h.is_open,
      open_time: h.open_time + ':00',
      close_time: h.close_time + ':00',
    }))

    const { error } = await supabase
      .from('business_hours')
      .upsert(rows, { onConflict: 'barbershop_id,day_of_week' })

    if (error) { 
      alert('Erro ao salvar horários.')
      setSavingHours(false)
      return 
    }

    setSuccessHours(true)
    setTimeout(() => setSuccessHours(false), 3000)
    setSavingHours(false)
  }

  const styles = {
    card: isDark 
      ? 'border-zinc-900 bg-[#0c0c0e]/50 backdrop-blur-xl shadow-xl' 
      : 'border-zinc-200/80 bg-white shadow-md',
    input: isDark 
      ? 'bg-zinc-900/30 border-zinc-900 focus:border-zinc-800 text-zinc-200 placeholder-zinc-500' 
      : 'bg-white border-zinc-200 focus:border-zinc-300 text-zinc-900 placeholder-zinc-400 shadow-sm',
    timeInput: isDark
      ? 'bg-zinc-950 border-zinc-900 text-zinc-200'
      : 'bg-zinc-50 border-zinc-200 text-zinc-800 shadow-inner',
    button: 'bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-semibold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_15px_rgba(245,158,11,0.15)]',
    hoursRow: (isOpen) => {
      if (isOpen) {
        return isDark
          ? 'border-amber-500/35 bg-amber-500/[0.04]'
          : 'border-amber-500 bg-amber-50/30 shadow-sm'
      }
      return isDark
        ? 'border-zinc-900 bg-zinc-950/20'
        : 'border-zinc-200 bg-white'
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col gap-6 max-w-2xl mx-auto">
          <div className="h-10 w-48 bg-zinc-900/60 animate-pulse rounded-lg" />
          <div className="h-64 bg-[#0c0c0e]/40 border border-zinc-900 rounded-2xl animate-pulse" />
          <div className="h-96 bg-[#0c0c0e]/40 border border-zinc-900 rounded-2xl animate-pulse" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 max-w-2xl mx-auto pb-10">
        
        {/* CABEÇALHO */}
        <div>
          <h1 className={`text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-zinc-900'}`}>
            Configurações
          </h1>
          <p className="text-zinc-500 text-xs mt-0.5">
            Gerencie o perfil público, dados comerciais e o horário de funcionamento da barbearia.
          </p>
        </div>

        {/* INFORMAÇÕES BÁSICAS */}
        <div className={`p-6 rounded-2xl border flex flex-col gap-5 ${styles.card}`}>
          <div className="flex items-center gap-2 text-sm font-bold">
            <Store size={16} className="text-amber-500" />
            <span className={isDark ? 'text-zinc-200' : 'text-zinc-800'}>Informações da Barbearia</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-bold text-zinc-500">Nome da Barbearia</label>
              <input
                type="text"
                placeholder="Ex: Barbearia Master"
                value={name}
                onChange={e => setName(e.target.value)}
                className={`px-4 py-2.5 text-xs rounded-xl border outline-none ${styles.input}`}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-bold text-zinc-500">Nome do Proprietário</label>
              <input
                type="text"
                placeholder="Ex: João Silva"
                value={ownerName}
                onChange={e => setOwnerName(e.target.value)}
                className={`px-4 py-2.5 text-xs rounded-xl border outline-none ${styles.input}`}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-bold text-zinc-500">Telefone</label>
              <input
                type="text"
                placeholder="(00) 00000-0000"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className={`px-4 py-2.5 text-xs rounded-xl border outline-none ${styles.input}`}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-bold text-zinc-500">E-mail Comercial</label>
              <input
                type="email"
                placeholder="contato@barbearia.com"
                value={commercialEmail}
                onChange={e => setCommercialEmail(e.target.value)}
                className={`px-4 py-2.5 text-xs rounded-xl border outline-none ${styles.input}`}
              />
            </div>
          </div>

          <AnimatePresence>
            {successInfo && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="bg-emerald-500/10 border border-emerald-500/10 rounded-xl p-3 flex items-center gap-2"
              >
                <CheckCircle2 size={14} className="text-emerald-500" />
                <span className="text-[11px] font-bold text-emerald-500">Configurações salvas com sucesso!</span>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={handleSaveInfo}
            disabled={saving}
            className={`py-2.5 text-xs rounded-xl cursor-pointer flex items-center justify-center gap-1.5 ${styles.button} ${
              saving ? 'opacity-55 cursor-not-allowed' : ''
            }`}
          >
            <Save size={14} />
            <span>{saving ? 'Salvando...' : 'Salvar Informações'}</span>
          </button>
        </div>

        {/* HORÁRIOS DE ATENDIMENTO */}
        <div className={`p-6 rounded-2xl border flex flex-col gap-5 ${styles.card}`}>
          <div className="flex items-center gap-2 text-sm font-bold">
            <Clock size={16} className="text-amber-500" />
            <span className={isDark ? 'text-zinc-200' : 'text-zinc-800'}>Horário de Funcionamento</span>
          </div>

          <p className="text-zinc-500 text-xs">
            Selecione quais dias da semana sua barbearia estará de portas abertas e configure a janela de agendamento.
          </p>

          <div className="flex flex-col gap-2">
            {DAYS.map(day => {
              const h = hours.find(x => x.day_of_week === day.value)
              return (
                <div 
                  key={day.value}
                  className={`px-4 py-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-200 ${
                    styles.hoursRow(h.is_open)
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    {/* CUSTOM ANIMATED TOGGLE */}
                    <button
                      type="button"
                      onClick={() => updateHour(day.value, 'is_open', !h.is_open)}
                      className={`w-9 h-5 rounded-full relative transition-colors duration-200 cursor-pointer flex-shrink-0 ${
                        h.is_open ? 'bg-amber-500' : 'bg-zinc-700/60 dark:bg-zinc-800'
                      }`}
                    >
                      <motion.div 
                        animate={{ x: h.is_open ? 18 : 2 }}
                        className="w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 left-0.5 shadow-sm"
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    </button>

                    <span className={`text-xs font-bold ${
                      h.is_open 
                        ? (isDark ? 'text-white' : 'text-zinc-900') 
                        : (isDark ? 'text-zinc-500' : 'text-zinc-400')
                    }`}>
                      {day.label}
                    </span>
                  </div>

                  {h.is_open ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="time"
                        value={h.open_time}
                        onChange={e => updateHour(day.value, 'open_time', e.target.value)}
                        className={`px-2 py-1 text-center text-xs font-bold font-mono rounded-lg border outline-none w-18 ${styles.timeInput}`}
                      />
                      <span className="text-[10px] text-zinc-500 font-bold">até</span>
                      <input
                        type="time"
                        value={h.close_time}
                        onChange={e => updateHour(day.value, 'close_time', e.target.value)}
                        className={`px-2 py-1 text-center text-xs font-bold font-mono rounded-lg border outline-none w-18 ${styles.timeInput}`}
                      />
                    </div>
                  ) : (
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider bg-zinc-900/10 dark:bg-zinc-950/40 px-2 py-0.5 rounded border border-zinc-200/50 dark:border-zinc-900/60">
                      Fechado
                    </span>
                  )}
                </div>
              )
            })}
          </div>

          <AnimatePresence>
            {successHours && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="bg-emerald-500/10 border border-emerald-500/10 rounded-xl p-3 flex items-center gap-2"
              >
                <CheckCircle2 size={14} className="text-emerald-500" />
                <span className="text-[11px] font-bold text-emerald-500">Horários de funcionamento salvos com sucesso!</span>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={handleSaveHours}
            disabled={savingHours}
            className={`py-2.5 text-xs rounded-xl cursor-pointer flex items-center justify-center gap-1.5 ${styles.button} ${
              savingHours ? 'opacity-55 cursor-not-allowed' : ''
            }`}
          >
            <Save size={14} />
            <span>{savingHours ? 'Salvando...' : 'Salvar Horários'}</span>
          </button>
        </div>

      </div>
    </DashboardLayout>
  )
}