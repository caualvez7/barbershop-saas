'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase.js'
import { useRouter } from 'next/navigation'
import DashboardLayout, { useTheme, useDashboard } from '../../components/DashboardLayout.jsx'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ShoppingBag, 
  Plus, 
  Trash2, 
  Edit2, 
  X, 
  Check, 
  Loader2, 
  AlertTriangle,
  Sparkles,
  Info,
  DollarSign,
  Package,
  Layers,
  ShoppingBag as OrderIcon,
  Phone,
  Mail,
  CheckCircle2,
  XCircle,
  ExternalLink
} from 'lucide-react'

// Imagens padrão premium do Unsplash para facilitar o cadastro
const IMAGE_PRESETS = [
  { name: 'Shampoo Premium', url: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?q=80&w=600&auto=format&fit=crop' },
  { name: 'Condicionador', url: 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?q=80&w=600&auto=format&fit=crop' },
  { name: 'Pomada Matte', url: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=600&auto=format&fit=crop' },
  { name: 'Óleo de Barba', url: 'https://images.unsplash.com/photo-1617897903246-719242758050?q=80&w=600&auto=format&fit=crop' },
]

export default function ProductsPage() {
  const router = useRouter()
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  // Estados principais
  const { barbershop } = useDashboard()
  const [products, setProducts] = useState([])
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('products') // 'products' | 'orders'
  const [databaseWarning, setDatabaseWarning] = useState(false)

  // Estados do Modal de Formulário de Produto
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('create') // 'create' | 'edit'
  const [currentProductId, setCurrentProductId] = useState(null)
  const [name, setName] = useState('')
  const [brand, setBrand] = useState('')
  const [volumeMl, setVolumeMl] = useState('')
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [photoUrl, setPhotoUrl] = useState('')
  const [saving, setSaving] = useState(false)
  const [validationErrors, setValidationErrors] = useState({})

  // Estados do Modal de Confirmação de Exclusão
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  // Estados do loading de ações de vendas
  const [salesActionLoading, setSalesActionLoading] = useState({})

  // Carregar dados
  const loadData = async () => {
    if (!barbershop) return
    try {
      setLoading(true)
      // Tenta carregar produtos
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('barbershop_id', barbershop.id)
        .order('created_at', { ascending: false })

      if (productsError) {
        console.warn('Erro ao carregar produtos (tabela pode não existir):', productsError.message)
        setDatabaseWarning(true)
        // Modo fallback local
        loadMockData(shop.id, shop.slug)
      } else {
        setProducts(productsData || [])
        
        // Carrega pedidos simulados locais do localStorage
        let savedLocalOrders = []
        if (typeof window !== 'undefined') {
          const saved = localStorage.getItem(`mock_orders_${shop.slug}`)
          if (saved) {
            try {
              savedLocalOrders = JSON.parse(saved)
            } catch (e) {
              console.error('Erro ao ler mock_orders:', e)
            }
          }
        }

        // Tenta carregar vendas
        const { data: salesData, error: salesError } = await supabase
          .from('product_sales')
          .select('*')
          .eq('barbershop_id', shop.id)
          .order('created_at', { ascending: false })

        if (!salesError && salesData && salesData.length > 0) {
          // Carregar clientes relacionados manualmente para evitar erros de join PostgREST complexos
          const customerIds = [...new Set(salesData.map(sale => sale.customer_id).filter(Boolean))]
          const productIds = [...new Set(salesData.map(sale => sale.product_id).filter(Boolean))]
          
          const [customersResponse, productsResponse] = await Promise.all([
            customerIds.length > 0 ? supabase.from('customers').select('*').in('id', customerIds) : { data: [] },
            productIds.length > 0 ? supabase.from('products').select('*').in('id', productIds) : { data: [] }
          ])

          const customerMap = {}
          customersResponse.data?.forEach(c => { customerMap[c.id] = c })

          const productMap = {}
          productsResponse.data?.forEach(p => { productMap[p.id] = p })

          const mergedSales = salesData.map(sale => ({
            ...sale,
            customer: customerMap[sale.customer_id] || { name: 'Cliente Removido', whatsapp: '', email: '' },
            product: productMap[sale.product_id] || { name: 'Produto Removido', brand: '', price: sale.price_at_purchase, photo_url: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?q=80&w=600&auto=format&fit=crop' }
          }))
          
          // Mesclar vendas locais do sandbox (que nao sobem pro banco ou de produtos mock)
          const localOnly = savedLocalOrders.filter(lo => !mergedSales.some(db => db.id === lo.id))
          setSales([...mergedSales, ...localOnly])
        } else {
          setSales(savedLocalOrders)
        }
      }
    } catch (err) {
      console.error('Erro geral no carregamento:', err)
      setDatabaseWarning(true)
      loadMockData(1, null)
    } finally {
      setLoading(false)
    }
  }

  // Carregar dados simulados em caso de falta de tabela no Supabase
  const loadMockData = (shopId, slug) => {
    const mockProducts = [
      {
        id: 'mock-1',
        name: 'Shampoo Carbon Cabelo & Barba',
        brand: 'L\'Oréal Men Expert',
        volume_ml: 250,
        price: 59.90,
        description: 'Shampoo purificante enriquecido com carvão ativado. Limpa profundamente e elimina impurezas da fibra capilar e dos fios da barba.',
        photo_url: IMAGE_PRESETS[0].url,
        active: true,
        barbershop_id: shopId
      },
      {
        id: 'mock-2',
        name: 'Condicionador Hidratante Silk',
        brand: 'Keune Haircosmetics',
        volume_ml: 200,
        price: 49.90,
        description: 'Condicionador de nutrição profunda. Deixa os fios macios, maleáveis e fáceis de pentear, com brilho natural incomparável.',
        photo_url: IMAGE_PRESETS[1].url,
        active: true,
        barbershop_id: shopId
      },
      {
        id: 'mock-3',
        name: 'Pomada Matte Modeladora Strong',
        brand: 'Redken Brews',
        volume_ml: 100,
        price: 79.90,
        description: 'Pomada modeladora com fixação forte e acabamento matte opaco. Ideal para penteados estruturados com aspect natural.',
        photo_url: IMAGE_PRESETS[2].url,
        active: true,
        barbershop_id: shopId
      },
      {
        id: 'mock-4',
        name: 'Óleo de Barba Maciez Suprema',
        brand: 'Beard Alchemist',
        volume_ml: 50,
        price: 39.90,
        description: 'Blend de óleos essenciais hidratantes para barbas longas e ressecadas. Amacia instantaneamente os pelos rebeldes.',
        photo_url: IMAGE_PRESETS[3].url,
        active: true,
        barbershop_id: shopId
      }
    ]
    setProducts(mockProducts)

    const mockSales = [
      {
        id: 'mock-sale-1',
        created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
        product_id: 'mock-3',
        customer_id: 'mock-cust-1',
        quantity: 1,
        price_at_purchase: 79.90,
        status: 'pending',
        payment_method: 'online',
        payment_status: 'paid',
        customer: {
          name: 'João Pedro Silva',
          whatsapp: '(11) 98888-7777',
          email: 'joaopedro@gmail.com'
        },
        product: mockProducts[2]
      },
      {
        id: 'mock-sale-2',
        created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
        product_id: 'mock-1',
        customer_id: 'mock-cust-2',
        quantity: 2,
        price_at_purchase: 59.90,
        status: 'picked_up',
        payment_method: 'pickup',
        payment_status: 'paid',
        customer: {
          name: 'Guilherme Santos',
          whatsapp: '(11) 97777-6666',
          email: 'guilherme@vip.com.br'
        },
        product: mockProducts[0]
      },
      {
        id: 'mock-sale-3',
        created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
        product_id: 'mock-4',
        customer_id: 'mock-cust-3',
        quantity: 1,
        price_at_purchase: 39.90,
        status: 'pending',
        payment_method: 'pickup',
        payment_status: 'pending',
        customer: {
          name: 'Thiago Ramos',
          whatsapp: '(11) 96666-5555',
          email: 'thiago@hotmail.com'
        },
        product: mockProducts[3]
      }
    ]
    
    // Mesclar vendas locais do localStorage se houver slug no sandbox
    let savedLocalOrders = []
    if (typeof window !== 'undefined' && slug) {
      const saved = localStorage.getItem(`mock_orders_${slug}`)
      if (saved) {
        try {
          savedLocalOrders = JSON.parse(saved)
        } catch (e) {
          console.error('Erro ao ler mock_orders:', e)
        }
      }
    }
    const localOnly = savedLocalOrders.filter(lo => !mockSales.some(db => db.id === lo.id))
    setSales([...mockSales, ...localOnly])
  }

  useEffect(() => {
    loadData()
  }, [barbershop])

  // Abrir modal de criação
  const openCreateModal = () => {
    setModalMode('create')
    setCurrentProductId(null)
    setName('')
    setBrand('')
    setVolumeMl('')
    setPrice('')
    setDescription('')
    setPhotoUrl('')
    setValidationErrors({})
    setModalOpen(true)
  }

  // Abrir modal de edição
  const openEditModal = (product) => {
    setModalMode('edit')
    setCurrentProductId(product.id)
    setName(product.name)
    setBrand(product.brand)
    setVolumeMl(product.volume_ml.toString())
    setPrice(product.price.toString())
    setDescription(product.description)
    setPhotoUrl(product.photo_url)
    setValidationErrors({})
    setModalOpen(true)
  }

  // Enviar formulário
  const handleSubmit = async (e) => {
    e.preventDefault()
    setValidationErrors({})

    // Validações no frontend
    const errors = {}
    if (!name.trim()) errors.name = 'O nome do produto é obrigatório.'
    if (!brand.trim()) errors.brand = 'A marca é obrigatória.'
    
    const mlNum = parseInt(volumeMl, 10)
    if (isNaN(mlNum) || mlNum <= 0) errors.volumeMl = 'Informe uma quantidade de ML válida.'

    const priceNum = parseFloat(price)
    if (isNaN(priceNum) || priceNum <= 0) errors.price = 'Informe um preço válido maior que zero.'

    if (!description.trim()) errors.description = 'A descrição do produto é obrigatória.'
    if (!photoUrl.trim()) errors.photoUrl = 'A foto do produto é obrigatória.'

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      return
    }

    setSaving(true)

    const payload = {
      name: name.trim(),
      brand: brand.trim(),
      volume_ml: mlNum,
      price: priceNum,
      description: description.trim(),
      photo_url: photoUrl.trim(),
      barbershop_id: barbershop?.id,
      active: true
    }

    if (databaseWarning) {
      // Operações locais simuladas
      if (modalMode === 'create') {
        const newProduct = {
          ...payload,
          id: 'mock-' + Date.now(),
          created_at: new Date().toISOString()
        }
        setProducts(prev => [newProduct, ...prev])
      } else {
        setProducts(prev => 
          prev.map(p => p.id === currentProductId ? { ...p, ...payload } : p)
        )
      }
      setSaving(false)
      setModalOpen(false)
      return
    }

    try {
      if (modalMode === 'create') {
        const { error } = await supabase
          .from('products')
          .insert(payload)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('products')
          .update(payload)
          .eq('id', currentProductId)

        if (error) throw error
      }

      await loadData()
      setModalOpen(false)
    } catch (err) {
      console.error('Erro ao salvar produto:', err)
      alert('Erro ao salvar produto: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  // Deletar produto
  const handleDeleteConfirm = async () => {
    if (!productToDelete) return
    setDeleting(true)

    if (databaseWarning) {
      setProducts(prev => prev.filter(p => p.id !== productToDelete.id))
      setDeleting(false)
      setDeleteModalOpen(false)
      setProductToDelete(null)
      return
    }

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productToDelete.id)

      if (error) throw error

      await loadData()
      setDeleteModalOpen(false)
      setProductToDelete(null)
    } catch (err) {
      console.error('Erro ao deletar produto:', err)
      alert('Erro ao deletar produto: ' + err.message)
    } finally {
      setDeleting(false)
    }
  }

  // Atualizar status de pedido de compra
  const handleUpdateSaleStatus = async (saleId, nextStatus) => {
    setSalesActionLoading(prev => ({ ...prev, [saleId]: true }))

    const updatePayload = { status: nextStatus }
    if (nextStatus === 'picked_up') {
      updatePayload.payment_status = 'paid'
    }

    const isLocalOrder = saleId.toString().startsWith('order-') || saleId.toString().startsWith('mock-')

    if (databaseWarning || isLocalOrder) {
      const updatedSales = sales.map(s => s.id === saleId 
        ? { 
            ...s, 
            status: nextStatus, 
            ...(nextStatus === 'picked_up' ? { payment_status: 'paid' } : {}) 
          } 
        : s
      )
      setSales(updatedSales)
      
      // Salva de volta nas ordens simuladas do localStorage
      if (typeof window !== 'undefined' && barbershop?.slug) {
        const localOrders = updatedSales.filter(s => s.id.toString().startsWith('order-') || s.id.toString().startsWith('mock-'))
        localStorage.setItem(`mock_orders_${barbershop.slug}`, JSON.stringify(localOrders))
      }
      setSalesActionLoading(prev => ({ ...prev, [saleId]: false }))
      return
    }

    try {
      const { error } = await supabase
        .from('product_sales')
        .update(updatePayload)
        .eq('id', saleId)

      if (error) throw error
      await loadData()
    } catch (err) {
      console.error('Erro ao atualizar status da venda:', err)
      alert('Erro ao atualizar status: ' + err.message)
    } finally {
      setSalesActionLoading(prev => ({ ...prev, [saleId]: false }))
    }
  }

  // Limpar WhatsApp para wa.me
  const getWhatsAppLink = (phone) => {
    if (!phone) return '#'
    const clean = phone.replace(/\D/g, '')
    const ddi = clean.startsWith('55') ? '' : '55'
    return `https://wa.me/${ddi}${clean}`
  }

  // Estilos
  const styles = {
    card: isDark ? 'bg-[#09090b]/50 border-zinc-900/60' : 'bg-white border-zinc-200/80 shadow-sm',
    border: isDark ? 'border-zinc-900/60' : 'border-zinc-200/80',
    title: isDark ? 'text-zinc-100' : 'text-zinc-900',
    subtext: isDark ? 'text-zinc-500' : 'text-zinc-400',
    text: isDark ? 'text-zinc-300' : 'text-zinc-700',
    tableHeader: isDark ? 'bg-zinc-950/40 text-zinc-400 border-zinc-900/50' : 'bg-zinc-50/70 text-zinc-500 border-zinc-200/60',
    tableRowHover: isDark ? 'hover:bg-zinc-900/20' : 'hover:bg-zinc-50/50',
    input: isDark ? 'bg-zinc-950/40 border-zinc-900 focus:border-amber-500/80 text-white' : 'bg-white border-zinc-200 focus:border-amber-500/80 text-zinc-800 placeholder-zinc-400 shadow-sm',
    tabActive: isDark ? 'bg-amber-500/10 text-amber-500 border-amber-500/30' : 'bg-amber-500/5 text-amber-600 border-amber-500/20 shadow-sm',
    tabInactive: isDark ? 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/30' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100/60 border-transparent',
    badgeActive: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    badgePending: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    badgeCancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 relative z-10 font-sans">
        
        {/* CABEÇALHO */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className={`text-xl font-bold tracking-tight ${styles.title}`}>Gestão de Produtos</h1>
            <p className={`text-xs ${styles.subtext} mt-1`}>
              Cadastre e gerencie cosméticos, pomadas e produtos disponíveis para venda direta na sua barbearia.
            </p>
          </div>
          <button
            onClick={openCreateModal}
            className="self-start px-4 py-2 rounded-xl text-xs font-bold text-black bg-gradient-to-r from-amber-500 to-yellow-500 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center gap-1.5 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
          >
            <Plus size={14} className="stroke-[3px]" />
            <span>Adicionar Produto</span>
          </button>
        </div>

        {/* ALERTA DE BANCO DE DADOS (MOCK FALLBACK) */}
        {databaseWarning && (
          <div className="p-4 bg-amber-500/[0.03] border border-amber-500/20 text-amber-500/90 rounded-2xl flex items-start gap-3">
            <AlertTriangle size={18} className="flex-shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-bold">Modo Sandbox Ativo: </span>
              <span className="font-light">
                A tabela `products` ou `product_sales` não foi encontrada no Supabase. Estamos utilizando o modo simulador local. 
                Para integrar plenamente, execute os scripts SQL fornecidos no painel do Supabase.
              </span>
            </div>
          </div>
        )}

        {/* MENSAGEM OBRIGATÓRIA DE RETIRADA NA BARBEARIA */}
        <div className="p-4 bg-blue-500/[0.03] border border-blue-500/20 text-blue-400 rounded-2xl flex items-start gap-3">
          <Info size={18} className="flex-shrink-0 mt-0.5 text-blue-400" />
          <div className="text-xs">
            <span className="font-bold">Aviso sobre Aquisições: </span>
            <span className="font-light">
              <strong>Os produtos adquiridos/reservados deverão ser retirados diretamente na barbearia.</strong> O pagamento e entrega são efetuados presencialmente no salão.
            </span>
          </div>
        </div>

        {/* NAVEGAÇÃO DE ABAS */}
        <div className="flex border-b border-zinc-900/60 pb-px">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2 border-b-2 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'products'
                ? 'border-amber-500 text-amber-500'
                : 'border-transparent text-zinc-500 hover:text-zinc-350'
            }`}
          >
            <Package size={14} />
            <span>Produtos Cadastrados ({products.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 border-b-2 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'orders'
                ? 'border-amber-500 text-amber-500'
                : 'border-transparent text-zinc-500 hover:text-zinc-350'
            }`}
          >
            <OrderIcon size={14} />
            <span>Pedidos de Retirada ({sales.length})</span>
          </button>
        </div>

        {/* TAB 1: PRODUTOS CADASTRADOS */}
        {activeTab === 'products' && (
          loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
            </div>
          ) : products.length === 0 ? (
            <div className={`border rounded-2xl p-12 text-center ${styles.card}`}>
              <ShoppingBag className="w-10 h-10 mx-auto text-zinc-650 mb-3" />
              <h3 className="text-sm font-bold text-white">Nenhum produto cadastrado</h3>
              <p className="text-zinc-500 text-xs mt-1 max-w-xs mx-auto">
                Adicione shampoos, condicionadores ou pomadas para exibi-los no painel de agendamentos dos clientes.
              </p>
              <button
                onClick={openCreateModal}
                className="mt-4 px-4 py-2 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 rounded-xl text-xs font-semibold text-zinc-200 cursor-pointer"
              >
                Cadastrar Primeiro Produto
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {products.map(product => (
                <div 
                  key={product.id} 
                  className={`border rounded-2xl overflow-hidden flex flex-col justify-between group transition-all duration-300 hover:scale-[1.01] ${styles.card}`}
                >
                  <div className="relative h-44 bg-zinc-950 flex items-center justify-center overflow-hidden border-b border-zinc-900/60">
                    <img 
                      src={product.photo_url} 
                      alt={product.name} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-2.5 right-2.5 bg-black/85 backdrop-blur border border-zinc-850 rounded-lg px-2 py-1 text-[9px] font-bold text-amber-500 tracking-wider">
                      {product.volume_ml} ML
                    </div>
                  </div>
                  
                  <div className="p-4 flex-1 flex flex-col justify-between gap-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-extrabold uppercase tracking-widest text-amber-500">{product.brand}</span>
                      <h3 className="text-xs font-bold text-white group-hover:text-amber-500 transition-colors line-clamp-1">{product.name}</h3>
                      <p className="text-zinc-500 text-[10px] line-clamp-2 leading-relaxed font-light mt-1">{product.description}</p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-zinc-900/60">
                      <span className="text-sm font-extrabold text-white">R$ {Number(product.price).toFixed(2)}</span>
                      
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => openEditModal(product)}
                          className="p-1.5 rounded-lg border border-zinc-900 hover:border-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer bg-zinc-950/20"
                          title="Editar"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          onClick={() => { setProductToDelete(product); setDeleteModalOpen(true) }}
                          className="p-1.5 rounded-lg border border-zinc-900 hover:border-red-900/40 text-zinc-400 hover:text-red-400 transition-colors cursor-pointer bg-zinc-950/20"
                          title="Excluir"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* TAB 2: PEDIDOS DE RETIRADA */}
        {activeTab === 'orders' && (
          loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
            </div>
          ) : sales.length === 0 ? (
            <div className={`border rounded-2xl p-12 text-center ${styles.card}`}>
              <OrderIcon className="w-10 h-10 mx-auto text-zinc-650 mb-3" />
              <h3 className="text-sm font-bold text-white">Nenhum pedido de retirada</h3>
              <p className="text-zinc-500 text-xs mt-1 max-w-xs mx-auto">
                Quando os clientes reservarem cosméticos no painel deles, os pedidos para entrega presencial aparecerão aqui.
              </p>
            </div>
          ) : (
            <div className={`border rounded-2xl overflow-hidden ${styles.card}`}>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className={`border-b text-[9px] font-bold uppercase tracking-wider ${styles.tableHeader}`}>
                      <th className="p-4">Cliente</th>
                      <th className="p-4">Produto</th>
                      <th className="p-4">Qtd.</th>
                      <th className="p-4">Preço Total</th>
                      <th className="p-4">Pagamento</th>
                      <th className="p-4">Data do Pedido</th>
                      <th className="p-4">Retirada</th>
                      <th className="p-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900/50">
                    {sales.map(sale => {
                      const dateObj = new Date(sale.created_at)
                      const formattedDate = dateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
                      const formattedTime = dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
                      const totalPrice = Number(sale.price_at_purchase) * sale.quantity
                      const isPending = sale.status === 'pending'
                      const isPickedUp = sale.status === 'picked_up'
                      const isCancelled = sale.status === 'cancelled'

                      const isOnlinePay = sale.payment_method === 'online'
                      const isPaid = sale.payment_status === 'paid'

                      return (
                        <tr key={sale.id} className={`text-xs transition-colors ${styles.tableRowHover}`}>
                          {/* Cliente */}
                          <td className="p-4">
                            <div className="flex flex-col">
                              <span className="font-bold text-white">{sale.customer?.name}</span>
                              <div className="flex items-center gap-2 text-[10px] text-zinc-550 mt-1">
                                {sale.customer?.whatsapp && (
                                  <a 
                                    href={getWhatsAppLink(sale.customer.whatsapp)} 
                                    target="_blank" 
                                    rel="noreferrer" 
                                    className="hover:text-amber-500 flex items-center gap-0.5 text-[10px]"
                                  >
                                    <Phone size={10} />
                                    <span>{sale.customer.whatsapp}</span>
                                  </a>
                                )}
                                {sale.customer?.email && (
                                  <span className="flex items-center gap-0.5">
                                    <Mail size={10} />
                                    <span>{sale.customer.email}</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Produto */}
                          <td className="p-4">
                            <div className="flex flex-col">
                              <span className="font-bold text-white">{sale.product?.name}</span>
                              <span className="text-[10px] text-zinc-550 mt-0.5">{sale.product?.brand}</span>
                            </div>
                          </td>

                          {/* Qtd */}
                          <td className="p-4 font-mono font-medium text-white">{sale.quantity}</td>

                          {/* Preço total */}
                          <td className="p-4 font-bold text-white">R$ {totalPrice.toFixed(2)}</td>

                          {/* Pagamento */}
                          <td className="p-4">
                            <div className="flex flex-col gap-1">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg border text-[9px] font-bold w-fit ${
                                isPaid ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                              }`}>
                                <span>{isPaid ? 'Pago' : 'Pendente'}</span>
                              </span>
                              <span className="text-[9px] text-zinc-500 font-light">
                                {isOnlinePay ? 'Online (Gateway)' : 'Na Retirada'}
                              </span>
                            </div>
                          </td>

                          {/* Data do pedido */}
                          <td className="p-4 text-[10px] text-zinc-400">
                            <p>{formattedDate}</p>
                            <p className="text-zinc-650 mt-0.5">{formattedTime}</p>
                          </td>

                          {/* Status */}
                          <td className="p-4">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-[9px] font-bold uppercase tracking-wider ${
                              isPickedUp ? styles.badgeActive : isPending ? styles.badgePending : styles.badgeCancelled
                            }`}>
                              <span className={`w-1 h-1 rounded-full ${isPickedUp ? 'bg-emerald-500' : isPending ? 'bg-amber-500' : 'bg-red-400'}`} />
                              <span>{isPickedUp ? 'Retirado' : isPending ? 'Pendente' : 'Cancelado'}</span>
                            </span>
                          </td>

                          {/* Ações */}
                          <td className="p-4 text-right">
                            {isPending ? (
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  disabled={salesActionLoading[sale.id]}
                                  onClick={() => handleUpdateSaleStatus(sale.id, 'picked_up')}
                                  className="px-2 py-1.5 rounded-lg border border-emerald-950 bg-emerald-500/5 hover:bg-emerald-500/15 text-emerald-400 text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1"
                                >
                                  {salesActionLoading[sale.id] ? (
                                    <Loader2 size={10} className="animate-spin" />
                                  ) : (
                                    <>
                                      <CheckCircle2 size={11} />
                                      <span>Entregar</span>
                                    </>
                                  )}
                                </button>
                                <button
                                  disabled={salesActionLoading[sale.id]}
                                  onClick={() => handleUpdateSaleStatus(sale.id, 'cancelled')}
                                  className="px-2 py-1.5 rounded-lg border border-red-950 bg-red-500/5 hover:bg-red-500/15 text-red-400 text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1"
                                >
                                  {salesActionLoading[sale.id] ? (
                                    <Loader2 size={10} className="animate-spin" />
                                  ) : (
                                    <>
                                      <XCircle size={11} />
                                      <span>Cancelar</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            ) : (
                              <span className="text-[10px] text-zinc-550 italic">Sem ações</span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )
        )}

        {/* MODAL: CADASTRAR / EDITAR PRODUTO */}
        <AnimatePresence>
          {modalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`w-full max-w-lg border rounded-3xl overflow-hidden shadow-2xl relative flex flex-col ${
                  isDark ? 'bg-[#09090b] border-zinc-900 text-white' : 'bg-white border-zinc-200 text-zinc-800'
                }`}
              >
                {/* Cabeçalho do Modal */}
                <div className={`p-5 border-b flex items-center justify-between ${styles.border}`}>
                  <div className="flex items-center gap-2">
                    <ShoppingBag size={18} className="text-amber-500" />
                    <h2 className="text-sm font-extrabold uppercase tracking-widest text-white">
                      {modalMode === 'create' ? 'Cadastrar Novo Produto' : 'Editar Produto'}
                    </h2>
                  </div>
                  <button
                    onClick={() => setModalOpen(false)}
                    className="p-1.5 rounded-lg hover:bg-zinc-900/40 text-zinc-500 hover:text-white transition-colors cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Formulário */}
                <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4 overflow-y-auto max-h-[70vh]">
                  
                  {/* Nome do Produto */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Nome do Produto *</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ex: Shampoo Anticaspa Mentol"
                      className={`px-4 py-2.5 rounded-xl border text-xs outline-none transition-all ${styles.input}`}
                    />
                    {validationErrors.name && (
                      <span className="text-[10px] text-red-450 font-bold mt-0.5">{validationErrors.name}</span>
                    )}
                  </div>

                  {/* Marca e Volume (ML) */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Marca *</label>
                      <input
                        type="text"
                        value={brand}
                        onChange={(e) => setBrand(e.target.value)}
                        placeholder="Ex: L'Oréal, Redken"
                        className={`px-4 py-2.5 rounded-xl border text-xs outline-none transition-all ${styles.input}`}
                      />
                      {validationErrors.brand && (
                        <span className="text-[10px] text-red-450 font-bold mt-0.5">{validationErrors.brand}</span>
                      )}
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Quantidade em ML *</label>
                      <input
                        type="number"
                        value={volumeMl}
                        onChange={(e) => setVolumeMl(e.target.value)}
                        placeholder="Ex: 250"
                        className={`px-4 py-2.5 rounded-xl border text-xs outline-none transition-all ${styles.input}`}
                      />
                      {validationErrors.volumeMl && (
                        <span className="text-[10px] text-red-450 font-bold mt-0.5">{validationErrors.volumeMl}</span>
                      )}
                    </div>
                  </div>

                  {/* Preço (R$) */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Preço de Venda (R$) *</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs text-zinc-500 font-bold">R$</span>
                      <input
                        type="number"
                        step="0.01"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="59.90"
                        className={`pl-10 pr-4 py-2.5 rounded-xl border text-xs outline-none transition-all w-full ${styles.input}`}
                      />
                    </div>
                    {validationErrors.price && (
                      <span className="text-[10px] text-red-450 font-bold mt-0.5">{validationErrors.price}</span>
                    )}
                  </div>

                  {/* Descrição */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Descrição do Produto *</label>
                    <textarea
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Descreva os principais benefícios, modo de uso e características do produto."
                      className={`px-4 py-2.5 rounded-xl border text-xs outline-none transition-all resize-none ${styles.input}`}
                    />
                    {validationErrors.description && (
                      <span className="text-[10px] text-red-450 font-bold mt-0.5">{validationErrors.description}</span>
                    )}
                  </div>

                  {/* Foto do Produto */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Foto do Produto (URL) *</label>
                    <input
                      type="url"
                      value={photoUrl}
                      onChange={(e) => setPhotoUrl(e.target.value)}
                      placeholder="https://exemplo.com/foto.jpg"
                      className={`px-4 py-2.5 rounded-xl border text-xs outline-none transition-all ${styles.input}`}
                    />
                    {validationErrors.photoUrl && (
                      <span className="text-[10px] text-red-450 font-bold mt-0.5">{validationErrors.photoUrl}</span>
                    )}

                    {/* Quick selector de presets premium */}
                    <div className="flex flex-col gap-1.5 mt-1">
                      <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Sugestões de Imagens Premium (Clique para selecionar):</span>
                      <div className="grid grid-cols-4 gap-2">
                        {IMAGE_PRESETS.map((preset, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setPhotoUrl(preset.url)}
                            className={`rounded-lg overflow-hidden h-12 border relative group transition-all cursor-pointer ${
                              photoUrl === preset.url ? 'border-amber-500 ring-1 ring-amber-500' : 'border-zinc-900 hover:border-zinc-800'
                            }`}
                          >
                            <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/45 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <span className="text-[8px] font-extrabold text-white uppercase tracking-wider">{preset.name.split(' ')[0]}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Pré-visualização do card */}
                  {photoUrl && (
                    <div className={`mt-2 p-3 border rounded-xl flex items-center gap-3 bg-zinc-950/20 ${styles.border}`}>
                      <div className="w-12 h-12 rounded-lg overflow-hidden border border-zinc-900 bg-zinc-950 flex-shrink-0">
                        <img src={photoUrl} alt="Preview" className="w-full h-full object-cover" onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=200&auto=format&fit=crop' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-extrabold">{brand || 'Marca'}</p>
                        <p className="text-xs font-bold text-white truncate">{name || 'Nome do Produto'}</p>
                        <p className="text-[10px] text-amber-500 font-bold mt-0.5">R$ {price ? Number(price).toFixed(2) : '0.00'} | {volumeMl || '0'} ml</p>
                      </div>
                    </div>
                  )}

                  {/* Botoes de acao */}
                  <div className={`flex items-center justify-end gap-2 pt-4 border-t mt-3 ${styles.border}`}>
                    <button
                      type="button"
                      onClick={() => setModalOpen(false)}
                      className="px-4 py-2 border border-zinc-800 hover:bg-zinc-900/40 rounded-xl text-xs font-bold text-zinc-400 hover:text-white transition-colors cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-bold text-xs rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      {saving ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <>
                          <Check size={12} className="stroke-[3px]" />
                          <span>{modalMode === 'create' ? 'Salvar Produto' : 'Atualizar Produto'}</span>
                        </>
                      )}
                    </button>
                  </div>

                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* MODAL: CONFIRMAR EXCLUSÃO */}
        <AnimatePresence>
          {deleteModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`w-full max-w-sm border rounded-3xl overflow-hidden shadow-2xl relative p-6 flex flex-col items-center text-center ${
                  isDark ? 'bg-[#09090b] border-zinc-900 text-white' : 'bg-white border-zinc-250 text-zinc-800'
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center mb-4">
                  <Trash2 size={20} className="animate-pulse" />
                </div>
                <h3 className="text-sm font-extrabold uppercase tracking-widest text-white">Excluir Produto?</h3>
                <p className="text-xs text-zinc-500 mt-2 leading-relaxed">
                  Você está prestes a remover permanentemente o produto <strong className="text-zinc-300 font-bold">"{productToDelete?.name}"</strong>. Esta ação não poderá ser desfeita.
                </p>

                <div className="flex items-center gap-3 w-full mt-6">
                  <button
                    disabled={deleting}
                    onClick={() => { setDeleteModalOpen(false); setProductToDelete(null) }}
                    className="flex-1 py-2.5 border border-zinc-800 hover:bg-zinc-900/40 text-zinc-400 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    disabled={deleting}
                    onClick={handleDeleteConfirm}
                    className="flex-1 py-2.5 bg-red-500 hover:bg-red-650 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    {deleting ? (
                      <Loader2 size={12} className="animate-spin text-white" />
                    ) : (
                      <>
                        <Check size={12} className="stroke-[3px]" />
                        <span>Confirmar</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </DashboardLayout>
  )
}
