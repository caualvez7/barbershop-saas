'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useState, useEffect, createContext, useContext } from 'react'
import { supabaseBarber as supabase } from '../../lib/supabase-barber.js'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  Scissors, 
  CreditCard, 
  Settings, 
  Search, 
  Bell, 
  LogOut, 
  Globe, 
  Menu, 
  X, 
  ChevronLeft, 
  Plus, 
  BarChart3,
  Moon,
  Sun,
  ShoppingBag
} from 'lucide-react'

// --- THEME CONTEXT ---
export const ThemeContext = createContext({
  theme: 'dark',
  toggleTheme: () => {}
})

export function useTheme() {
  return useContext(ThemeContext)
}

// --- DASHBOARD CONTEXT ---
export const DashboardContext = createContext({
  session: null,
  barbershop: null,
  loading: true
})

export function useDashboard() {
  return useContext(DashboardContext)
}

export default function DashboardLayout({ children }) {
  const router = useRouter()
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [notificationsCount, setNotificationsCount] = useState(0)
  const [notifications, setNotifications] = useState([])
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { theme, toggleTheme } = useTheme()
  const { barbershop, loading: checkingAuth } = useDashboard()

  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    if (!barbershop) return

    const fetchPendingNotifications = async () => {
      try {
        // 1. Buscar agendamentos com status 'Pendente' no banco
        const { data: appData, error: appError } = await supabase
          .from('appointments')
          .select('id, customer_name, date, time, created_at')
          .eq('barbershop_id', barbershop.id)
          .eq('status', 'Pendente')

        let pendingAppsList = []
        if (!appError && appData) {
          pendingAppsList = appData.map(app => ({
            id: `app-${app.id}`,
            type: 'appointment',
            title: 'Novo Agendamento Pendente',
            description: `${app.customer_name} agendou para ${app.date.split('-').reverse().join('/')} às ${app.time}`,
            link: '/dashboard/appointments',
            created_at: app.created_at || new Date().toISOString()
          }))
        }

        // 2. Buscar pedidos do banco (se a tabela product_sales existir)
        let pendingOrdersList = []
        try {
          const { data: dbSales, error: salesError } = await supabase
            .from('product_sales')
            .select('id, created_at, quantity, price_at_purchase, products(name), customer_id')
            .eq('barbershop_id', barbershop.id)
            .eq('status', 'pending')

          if (!salesError && dbSales && dbSales.length > 0) {
            // fetch customer names
            const customerIds = [...new Set(dbSales.map(s => s.customer_id).filter(Boolean))]
            const { data: customersData } = customerIds.length > 0 
              ? await supabase.from('customers').select('id, name').in('id', customerIds) 
              : { data: [] }
            const customerMap = {}
            customersData?.forEach(c => { customerMap[c.id] = c.name })

            pendingOrdersList = dbSales.map(sale => ({
              id: `sale-${sale.id}`,
              type: 'order',
              title: 'Pedido de Retirada Pendente',
              description: `${customerMap[sale.customer_id] || 'Cliente'} reservou ${sale.products?.name || 'Produto'} (Qtd: ${sale.quantity})`,
              link: '/dashboard/products',
              created_at: sale.created_at
            }))
          }
        } catch (e) {
          console.warn('Erro ao carregar product_sales do banco para notificações:', e)
        }

        const allNotifications = [...pendingAppsList, ...pendingOrdersList].sort((a, b) => 
          new Date(b.created_at) - new Date(a.created_at)
        )

        setNotifications(allNotifications)
        setNotificationsCount(allNotifications.length)
      } catch (err) {
        console.error('Erro ao buscar notificações pendentes:', err)
      }
    }

    fetchPendingNotifications()
    const interval = setInterval(fetchPendingNotifications, 30000)
    return () => clearInterval(interval)
  }, [barbershop])

  // toggleTheme is consumed from global theme context

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const isDark = theme === 'dark'

  const styles = {
    bg: isDark ? 'bg-[#030303] text-zinc-100' : 'bg-[#fafaf9] text-zinc-800',
    sidebar: isDark ? 'bg-[#09090b]/40 border-zinc-900/60 backdrop-blur-xl' : 'bg-white border-zinc-200/80 shadow-sm',
    sidebarBorder: isDark ? 'border-zinc-900/60' : 'border-zinc-200/80',
    navLinkActive: 'bg-gradient-to-r text-amber-500 font-bold border-l-2 border-amber-500',
    navLinkActiveBg: isDark ? 'from-amber-500/10 to-yellow-500/5 border-amber-500/20' : 'from-amber-500/5 to-yellow-500/5 border-amber-500/10 shadow-sm',
    navLinkInactive: isDark ? 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/30' : 'text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100/60',
    profileFooter: isDark ? 'border-zinc-900/60 bg-zinc-950/20' : 'border-zinc-200/80 bg-zinc-50/80',
    profileFooterName: isDark ? 'text-zinc-200' : 'text-zinc-800',
    profileFooterPlan: isDark ? 'text-zinc-500' : 'text-zinc-400',
    profileButton: isDark ? 'text-zinc-500 hover:text-red-400 hover:bg-red-500/10' : 'text-zinc-400 hover:text-red-600 hover:bg-red-50',
    topnav: isDark ? 'border-zinc-900/60 bg-[#030303]/70' : 'border-zinc-200/80 bg-[#fafaf9]/80',
    searchInput: isDark ? 'bg-zinc-900/30 border-zinc-900 hover:border-zinc-800 text-zinc-300' : 'bg-zinc-200/40 border-zinc-200 hover:border-zinc-300/80 text-zinc-800 placeholder-zinc-400',
    searchBadge: isDark ? 'bg-zinc-900 text-zinc-500 border-zinc-800' : 'bg-zinc-200 text-zinc-400 border-zinc-200/60',
    iconButton: isDark ? 'text-zinc-400 hover:text-zinc-200 bg-zinc-950/40 border-zinc-900 hover:border-zinc-800/80' : 'text-zinc-600 hover:text-zinc-900 bg-white border-zinc-200/80 hover:bg-zinc-50',
    quickActionButton: 'bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-semibold shadow-[0_0_15px_rgba(245,158,11,0.25)]',
    avatarContainer: 'bg-gradient-to-tr from-amber-500 via-yellow-500 to-amber-600 p-[1px]',
    avatarInner: isDark ? 'bg-[#09090b] text-zinc-200' : 'bg-white text-zinc-800',
    mobileTabBar: isDark ? 'bg-[#09090b]/85 border-zinc-900/60' : 'bg-white/95 border-zinc-200/80',
    mobileTabLinkActive: 'text-amber-500',
    mobileTabLinkInactive: isDark ? 'text-zinc-500 hover:text-zinc-300' : 'text-zinc-400 hover:text-zinc-700',
    drawer: isDark ? 'bg-[#09090b] border-zinc-900' : 'bg-white border-zinc-200/80',
    drawerLinkActive: 'bg-amber-500/10 text-amber-500 border-l-2 border-amber-500',
    drawerLinkInactive: isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-500 hover:text-zinc-900',
  }

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#030303] flex flex-col items-center justify-center gap-4">
        <div className="w-8 h-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
        <p className="text-zinc-500 text-xs font-mono tracking-wider uppercase">
          Verificando sessão...
        </p>
      </div>
    )
  }

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/appointments', label: 'Agendamentos', icon: Calendar },
    { href: '/dashboard/customers', label: 'Clientes', icon: Users },
    { href: '/dashboard/services', label: 'Serviços', icon: Scissors },
    { href: '/dashboard/barbers', label: 'Barbeiros', icon: Users },
    { href: '/dashboard/plans', label: 'Planos', icon: CreditCard },
    { href: '/dashboard/products', label: 'Produtos', icon: ShoppingBag },
    { href: '/dashboard/reports', label: 'Relatórios', icon: BarChart3, disabled: false },
    { href: barbershop ? `/barber/${barbershop.slug}` : '#', label: 'Página Pública', icon: Globe, external: true },
    { href: '/dashboard/settings', label: 'Configurações', icon: Settings },
  ]

  const mobileTabItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/appointments', label: 'Agenda', icon: Calendar },
    { href: '/dashboard/services', label: 'Serviços', icon: Scissors },
    { href: '/dashboard/barbers', label: 'Barbeiros', icon: Users },
    { href: '/dashboard/settings', label: 'Ajustes', icon: Settings },
  ]

  return (
    <div className={`min-h-screen flex flex-col font-sans antialiased selection:bg-amber-500/30 selection:text-amber-200 transition-colors duration-300 ${styles.bg}`}>
        
        {/* Decorative Blur Backgrounds (only visible in dark mode to preserve contrast) */}
        {isDark && (
          <>
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-amber-500/[0.03] rounded-full blur-[140px] pointer-events-none z-0" />
            <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-yellow-500/[0.02] rounded-full blur-[120px] pointer-events-none z-0" />
          </>
        )}

        <div className="flex flex-1 relative overflow-hidden z-10">
          
          {/* SIDEBAR (Desktop) */}
          <aside 
            className={`hidden md:flex flex-col border-r transition-all duration-300 relative overflow-hidden ${styles.sidebar} ${
              collapsed ? 'w-[78px]' : 'w-[260px]'
            }`}
          >
            {/* Sidebar Glow Header Accent (Dark mode only) */}
            {isDark && (
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-500/10 to-transparent" />
            )}

            {/* Brand Header */}
            <div className={`h-16 flex items-center justify-between px-5 border-b ${styles.sidebarBorder}`}>
              <Link href="/dashboard" className="flex items-center gap-2.5 group">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-yellow-500 flex items-center justify-center text-sm font-bold text-black shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                  B
                </div>
                {!collapsed && (
                  <span className={`font-bold tracking-tight text-lg transition-all duration-300 ${
                    isDark 
                      ? 'bg-gradient-to-r from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent group-hover:via-amber-200' 
                      : 'text-zinc-900 group-hover:text-amber-600'
                  }`}>
                    Barber<span className="text-amber-500">Shop</span>
                  </span>
                )}
              </Link>
              {!collapsed && (
                <button 
                  onClick={() => setCollapsed(true)}
                  className={`p-1 rounded-lg transition-colors ${
                    isDark ? 'text-zinc-500 hover:text-white hover:bg-zinc-900/50' : 'text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100'
                  }`}
                >
                  <ChevronLeft size={16} />
                </button>
              )}
            </div>

            {/* Navigation Links */}
            <div className="flex-1 py-4 px-3 flex flex-col gap-1 overflow-y-auto scrollbar-none">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all relative group ${
                      item.disabled ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''
                    } ${isActive ? styles.navLinkActive : styles.navLinkInactive}`}
                  >
                    {/* Active Background Slide Effect */}
                    {isActive && (
                      <motion.div
                        layoutId="sidebar-active-bg"
                        className={`absolute inset-0 bg-gradient-to-r border rounded-xl -z-10 ${styles.navLinkActiveBg}`}
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                    {isActive && (
                      <div className="absolute left-0 top-3 bottom-3 w-0.5 rounded-full bg-amber-500" />
                    )}

                    <Icon size={18} className={`flex-shrink-0 transition-colors duration-300 ${isActive ? 'text-amber-500' : 'text-zinc-400 group-hover:text-amber-500'}`} />
                    
                    {!collapsed && (
                      <span className="truncate">{item.label}</span>
                    )}

                    {/* Tooltip for collapsed view */}
                    {collapsed && (
                      <div className={`absolute left-[85px] border px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap shadow-xl z-50 ${
                        isDark ? 'bg-[#0c0c0e] border-zinc-800 text-zinc-200' : 'bg-white border-zinc-200 text-zinc-800'
                      }`}>
                        {item.label}
                      </div>
                    )}
                  </Link>
                )
              })}
            </div>

            {/* User Profile Footer */}
            <div className={`p-4 border-t ${styles.profileFooter}`}>
              <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} gap-3`}>
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-amber-700 flex items-center justify-center text-xs font-bold text-white border border-amber-400/20 shadow-md flex-shrink-0">
                    {barbershop?.name ? barbershop.name.charAt(0) : 'A'}
                  </div>
                  {!collapsed && (
                    <div className="min-w-0">
                      <p className={`text-xs font-bold truncate leading-tight ${styles.profileFooterName}`}>
                        {barbershop?.name || 'Carregando...'}
                      </p>
                      <p className={`text-[10px] font-mono tracking-wider uppercase leading-none mt-0.5 ${styles.profileFooterPlan}`}>
                        {barbershop?.plan === 'premium' ? 'Plano VIP' : 'Plano Básico'}
                      </p>
                    </div>
                  )}
                </div>
                {!collapsed && (
                  <button 
                    onClick={handleLogout}
                    className={`p-1.5 rounded-lg transition-all duration-200 ${styles.profileButton}`}
                    title="Sair do painel"
                  >
                    <LogOut size={15} />
                  </button>
                )}
              </div>
            </div>
          </aside>

          {/* MAIN PANEL */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
            
            {/* TOPNAV */}
            <header className={`h-16 border-b flex items-center justify-between px-6 z-40 backdrop-blur-md ${styles.topnav}`}>
              <div className="flex items-center gap-4">
                {/* Expand Sidebar Trigger when Collapsed */}
                {collapsed && (
                  <button 
                    onClick={() => setCollapsed(false)}
                    className={`hidden md:flex p-1 rounded-lg transition-colors ${
                      isDark ? 'text-zinc-500 hover:text-white hover:bg-zinc-900/50' : 'text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100'
                    }`}
                  >
                    <Menu size={18} />
                  </button>
                )}
                {/* Mobile Menu Trigger */}
                <button 
                  onClick={() => setMobileMenuOpen(true)}
                  className={`md:hidden p-1 rounded-lg transition-colors ${
                    isDark ? 'text-zinc-400 hover:text-white hover:bg-zinc-900/50' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
                  }`}
                >
                  <Menu size={20} />
                </button>

                {/* Global Search */}
                <div className="relative hidden sm:block">
                  <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                  <input 
                    type="text" 
                    placeholder="Pesquisar..." 
                    className={`border rounded-xl pl-9 pr-14 py-1.5 text-xs w-56 focus:w-72 outline-none transition-all duration-300 ${styles.searchInput}`}
                  />
                  <span className={`absolute right-3 top-1/2 -translate-y-1/2 border text-[9px] px-1.5 py-0.5 rounded font-mono pointer-events-none ${styles.searchBadge}`}>
                    ⌘K
                  </span>
                </div>
              </div>

              {/* Topnav Actions */}
              <div className="flex items-center gap-4">
                
                {/* Theme Toggle Button */}
                <button 
                  onClick={toggleTheme}
                  className={`p-2 rounded-xl border transition-all ${styles.iconButton}`}
                  title={isDark ? "Ativar Modo Claro" : "Ativar Modo Escuro"}
                >
                  {isDark ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} />}
                </button>

                 {/* Notifications */}
                 <div className="relative">
                   <button 
                     onClick={() => setDropdownOpen(!dropdownOpen)}
                     className={`p-2 rounded-xl border transition-all ${styles.iconButton} ${dropdownOpen ? 'border-amber-500 bg-amber-500/5 text-amber-500' : ''}`}
                     title="Notificações"
                   >
                     <Bell size={15} />
                   </button>
                   {notificationsCount > 0 && (
                     <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full border border-black animate-pulse" />
                   )}

                   {/* Dropdown list */}
                   <AnimatePresence>
                     {dropdownOpen && (
                       <>
                         {/* Backdrop overlay for closing */}
                         <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                         
                         <motion.div
                           initial={{ opacity: 0, y: 10, scale: 0.95 }}
                           animate={{ opacity: 1, y: 0, scale: 1 }}
                           exit={{ opacity: 0, y: 10, scale: 0.95 }}
                           transition={{ duration: 0.15 }}
                           className={`absolute right-0 mt-2 w-80 border rounded-2xl shadow-xl overflow-hidden z-50 flex flex-col ${
                             isDark ? 'bg-[#09090b] border-zinc-900 text-white' : 'bg-white border-zinc-250 text-zinc-800'
                           }`}
                         >
                           <div className={`p-4 border-b flex items-center justify-between ${styles.sidebarBorder}`}>
                             <span className="text-xs font-extrabold uppercase tracking-widest text-zinc-400">Notificações</span>
                             {notificationsCount > 0 && (
                               <span className="px-2 py-0.5 rounded-full text-[9px] font-bold text-black bg-gradient-to-r from-amber-500 to-yellow-500">
                                 {notificationsCount} Pendentes
                               </span>
                             )}
                           </div>
                           
                           <div className="max-h-64 overflow-y-auto divide-y divide-zinc-900/50">
                             {notifications.length === 0 ? (
                               <div className="p-8 text-center flex flex-col items-center justify-center gap-2">
                                 <Bell size={20} className="text-zinc-650" />
                                 <p className="text-[10px] text-zinc-500">Nenhuma notificação pendente</p>
                               </div>
                             ) : (
                               notifications.map(notif => (
                                 <Link
                                   key={notif.id}
                                   href={notif.link}
                                   onClick={() => setDropdownOpen(false)}
                                   className={`p-3.5 flex flex-col gap-1 transition-all text-left block ${
                                     isDark ? 'hover:bg-zinc-900/40 border-zinc-900/20' : 'hover:bg-zinc-50 border-zinc-100'
                                   }`}
                                 >
                                   <div className="flex items-center justify-between">
                                     <span className="text-[10px] font-extrabold text-amber-500 uppercase tracking-wider">
                                       {notif.title}
                                     </span>
                                     <span className="text-[8px] text-zinc-500">
                                       {new Date(notif.created_at).toLocaleDateString('pt-BR', { hour: '2-digit', minute: '2-digit' }).split(' ')[1]}
                                     </span>
                                   </div>
                                   <p className={`text-[11px] leading-relaxed ${isDark ? 'text-zinc-350' : 'text-zinc-650'}`}>
                                     {notif.description}
                                   </p>
                                 </Link>
                               ))
                             )}
                           </div>
                           
                           <div className={`p-2 bg-zinc-950/20 border-t text-center ${styles.sidebarBorder}`}>
                             <span className="text-[9px] text-zinc-500 font-light">Clique para ver detalhes no painel</span>
                           </div>
                         </motion.div>
                       </>
                     )}
                   </AnimatePresence>
                 </div>

                {/* Quick Action Button */}
                <Link
                  href="/dashboard/services"
                  className={`hidden sm:flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl transition-all duration-300 hover:scale-[1.02] ${styles.quickActionButton}`}
                >
                  <Plus size={14} />
                  <span>Novo Serviço</span>
                </Link>

                {/* User profile avatar */}
                <div className={`w-8 h-8 rounded-xl cursor-pointer ${styles.avatarContainer}`}>
                  <div className={`w-full h-full rounded-[11px] flex items-center justify-center text-xs font-semibold ${styles.avatarInner}`}>
                    {barbershop?.name ? barbershop.name.charAt(0) : 'A'}
                  </div>
                </div>
              </div>
            </header>

            {/* MAIN PAGE VIEW (Scrollable) */}
            <main className="flex-1 overflow-y-auto p-5 md:p-8 pb-24 md:pb-8">
              {children}
            </main>
          </div>
        </div>

        {/* MOBILE BOTTOM NAVIGATION TAB BAR */}
        <nav className={`fixed bottom-0 left-0 right-0 h-16 backdrop-blur-xl border-t flex justify-around items-center z-40 md:hidden pb-1 px-2 ${styles.mobileTabBar}`}>
          {mobileTabItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center flex-1 py-1 gap-1 transition-colors ${
                  isActive ? styles.mobileTabLinkActive : styles.mobileTabLinkInactive
                }`}
              >
                <div className="relative">
                  <Icon size={18} />
                  {isActive && (
                    <motion.div 
                      layoutId="mobile-tab-dot" 
                      className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-amber-500 rounded-full"
                    />
                  )}
                </div>
                <span className="text-[9px] font-medium tracking-tight">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* MOBILE DRAWER MENU OVERLAY */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              {/* Backdrop */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileMenuOpen(false)}
                className="fixed inset-0 bg-black z-50 md:hidden"
              />
              {/* Drawer */}
              <motion.div 
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                className={`fixed top-0 bottom-0 left-0 w-64 border-r z-50 md:hidden flex flex-col p-6 shadow-2xl ${styles.drawer}`}
              >
                <div className="flex items-center justify-between mb-8">
                  <span className="font-bold text-lg bg-gradient-to-r from-amber-500 to-yellow-500 bg-clip-text text-transparent">
                    BarberShopBR
                  </span>
                  <button 
                    onClick={() => setMobileMenuOpen(false)}
                    className={`p-1 rounded-lg ${
                      isDark ? 'text-zinc-500 hover:text-white hover:bg-zinc-900' : 'text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100'
                    }`}
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Drawer items */}
                <div className="flex-1 flex flex-col gap-2 overflow-y-auto">
                  {navItems.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                          item.disabled ? 'opacity-35 pointer-events-none' : ''
                        } ${
                          isActive ? styles.drawerLinkActive : styles.drawerLinkInactive
                        }`}
                      >
                        <Icon size={16} />
                        <span>{item.label}</span>
                      </Link>
                    )
                  })}
                </div>

                {/* Drawer footer profile */}
                <div className={`border-t pt-4 flex items-center justify-between mt-auto ${isDark ? 'border-zinc-900' : 'border-zinc-200'}`}>
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-amber-700 flex items-center justify-center text-xs font-bold text-white border border-amber-400/20 flex-shrink-0">
                      {barbershop?.name ? barbershop.name.charAt(0) : 'A'}
                    </div>
                    <div className="min-w-0">
                      <p className={`text-xs font-bold truncate leading-tight ${styles.profileFooterName}`}>
                        {barbershop?.name || 'Minha Barbearia'}
                      </p>
                      <p className={`text-[10px] mt-0.5 ${styles.profileFooterPlan}`}>
                        {barbershop?.plan === 'premium' ? 'Plano VIP' : 'Plano Básico'}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className={`p-1.5 rounded-lg ${styles.profileButton}`}
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

      </div>
  )
}