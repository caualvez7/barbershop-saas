'use client'

import { motion } from 'framer-motion'
import { ShoppingBag, Package, Plus, Clock, ExternalLink, CheckCircle2, XCircle } from 'lucide-react'

export function ClientProductStore({ 
  products, 
  customerOrders, 
  activeTab, 
  setActiveTab, 
  onSelectProduct,
  getWhatsAppLink,
  customerName,
  shopPhone 
}) {
  return (
    <div className="flex flex-col gap-6">
      {/* Sub-tabs toggle: Catalogo vs Meus Pedidos */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
        <button
          onClick={() => setActiveTab('scheduling')}
          className={`text-xs px-4 py-2 rounded-xl font-medium transition-all ${
            activeTab === 'scheduling' 
              ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-sm' 
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40'
          }`}
        >
          <div className="flex items-center gap-2">
            <Package size={14} />
            <span>Catálogo de Produtos ({products.length})</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`text-xs px-4 py-2 rounded-xl font-medium transition-all ${
            activeTab === 'orders' 
              ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-sm' 
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40'
          }`}
        >
          <div className="flex items-center gap-2">
            <ShoppingBag size={14} />
            <span>Meus Pedidos ({customerOrders.length})</span>
          </div>
        </button>
      </div>

      {/* Conteudo: Catalogo de Produtos */}
      {activeTab === 'scheduling' && (
        <div>
          {products.length === 0 ? (
            <div className="text-center py-12 p-6 rounded-2xl border border-zinc-900 bg-[#0c0c0e]/40">
              <Package size={32} className="mx-auto text-zinc-600 mb-2" />
              <p className="text-sm font-semibold text-zinc-300">Nenhum produto cadastrado no momento</p>
              <p className="text-xs text-zinc-500 mt-1">A barbearia ainda não adicionou cosméticos à loja online.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {products.map((product) => (
                <div 
                  key={product.id}
                  className="p-4 rounded-2xl border border-zinc-900 bg-[#0c0c0e]/50 backdrop-blur-xl flex flex-col justify-between group hover:border-amber-500/30 transition-all duration-300"
                >
                  <div>
                    <div className="h-40 w-full rounded-xl overflow-hidden mb-3 relative bg-zinc-950">
                      <img 
                        src={product.photo_url || 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?q=80&w=600&auto=format&fit=crop'} 
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      />
                      <div className="absolute top-2 right-2 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md border border-white/10 text-[10px] font-bold text-amber-400 font-mono">
                        {product.volume_ml} ML
                      </div>
                    </div>

                    <p className="text-[10px] uppercase tracking-wider text-amber-500 font-semibold">{product.brand}</p>
                    <h3 className="text-sm font-bold text-white mt-0.5">{product.name}</h3>
                    <p className="text-xs text-zinc-400 mt-1.5 line-clamp-2">{product.description}</p>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-zinc-900">
                    <div>
                      <span className="text-[10px] text-zinc-500 block">Preço Unitário</span>
                      <span className="text-base font-bold text-amber-400">
                        R$ {Number(product.price).toFixed(2).replace('.', ',')}
                      </span>
                    </div>

                    <button
                      onClick={() => onSelectProduct(product)}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold text-black bg-gradient-to-r from-amber-500 to-yellow-500 hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer shadow-[0_0_12px_rgba(245,158,11,0.2)]"
                    >
                      <ShoppingBag size={14} />
                      <span>Comprar</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Conteudo: Meus Pedidos */}
      {activeTab === 'orders' && (
        <div>
          {customerOrders.length === 0 ? (
            <div className="text-center py-12 p-6 rounded-2xl border border-zinc-900 bg-[#0c0c0e]/40">
              <ShoppingBag size={32} className="mx-auto text-zinc-600 mb-2" />
              <p className="text-sm font-semibold text-zinc-300">Você ainda não possui pedidos de produtos</p>
              <p className="text-xs text-zinc-500 mt-1">Navegue no catálogo de produtos acima para fazer sua primeira reserva.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {customerOrders.map((order) => (
                <div key={order.id} className="p-4 rounded-2xl border border-zinc-900 bg-[#0c0c0e]/50 backdrop-blur-xl flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-zinc-900 flex-shrink-0">
                      <img 
                        src={order.product?.photo_url || 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?q=80&w=600&auto=format&fit=crop'} 
                        alt={order.product?.name || 'Produto'}
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">{order.product?.name || 'Produto Reservado'}</h4>
                      <p className="text-[10px] text-zinc-400 mt-0.5">
                        Qtd: {order.quantity} x R$ {Number(order.price_at_purchase).toFixed(2)} • Total: R$ {(order.quantity * Number(order.price_at_purchase)).toFixed(2)}
                      </p>
                      <p className="text-[9px] text-zinc-500 mt-0.5 font-mono">
                        Data: {new Date(order.created_at).toLocaleDateString('pt-BR')} às {new Date(order.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-0 border-zinc-900">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border flex items-center gap-1 ${
                      order.status === 'picked_up' 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                        : order.status === 'cancelled'
                        ? 'bg-red-500/10 text-red-400 border-red-500/20'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }`}>
                      {order.status === 'picked_up' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                      <span>{order.status === 'picked_up' ? 'Retirado' : order.status === 'cancelled' ? 'Cancelado' : 'Aguardando Retirada'}</span>
                    </span>

                    {order.status === 'pending' && (
                      <a 
                        href={getWhatsAppLink(shopPhone)} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[10px] font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 underline"
                      >
                        <span>Contato</span>
                        <ExternalLink size={10} />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
