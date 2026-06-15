'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { supabaseBarber as supabase } from '../../lib/supabase-barber.js'

function CheckoutContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const plan = searchParams.get('plan') || 'basic'
  const [checkingAuth, setCheckingAuth] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push(`/login?redirect=/checkout?plan=${plan}`)
        } else {
          setCheckingAuth(false)
        }
      } catch (err) {
        console.error('Erro de autenticação no checkout:', err)
        router.push(`/login?redirect=/checkout?plan=${plan}`)
      }
    }
    checkAuth()
  }, [router, plan])

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
        <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
        <p className="text-slate-500 text-xs font-mono tracking-wider uppercase">Verificando autenticação...</p>
      </div>
    )
  }

  const plans = {
    basic: {
      name: 'Basic',
      price: '29',
      features: [
        'Até 3 serviços',
        'Agendamentos online',
        'Página pública da barbearia',
      ],
    },
    plus: {
      name: 'Plus',
      price: '59',
      features: [
        'Serviços ilimitados',
        'Dashboard avançado',
        'Prioridade no suporte',
      ],
    },
    premium: {
      name: 'Premium',
      price: '99',
      features: [
        'Tudo liberado',
        'Multi barbeiros',
        'Recursos premium',
      ],
    },
  }

  const selectedPlan = plans[plan]

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="w-full relative h-[220px] md:h-[300px] bg-slate-100">
        <Image
          src="/banner.jpg"
          alt="BarberShopBR"
          fill
          className="object-contain"
          priority
          quality={100}
        />
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900">Checkout</h1>
            <p className="text-slate-500 mt-2">Finalize seu plano para continuar</p>
          </div>

          <div className="border rounded-2xl p-6 bg-slate-50">
            <div className="text-center">
              <p className="text-sm text-slate-500">Plano selecionado</p>
              <h2 className="text-2xl font-bold text-blue-600 mt-1">{selectedPlan.name}</h2>
              <div className="mt-4">
                <span className="text-4xl font-bold text-slate-900">R$ {selectedPlan.price}</span>
                <span className="text-slate-500">/mês</span>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {selectedPlan.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-slate-700">
                  <span className="text-blue-600">✓</span>
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 space-y-3">
            <button
              className="w-full bg-blue-600 hover:bg-blue-700 transition text-white py-3 rounded-xl font-medium"
              onClick={() => alert('Integração de pagamento será adicionada aqui.')}
            >
              Continuar pagamento
            </button>
            <button
              className="w-full border border-slate-300 hover:bg-slate-100 transition py-3 rounded-xl font-medium"
              onClick={() => router.push('/')}
            >
              Voltar
            </button>
          </div>

          <p className="text-xs text-slate-400 text-center mt-6">
            Ambiente seguro • BarberShopBR
          </p>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Carregando...</div>}>
      <CheckoutContent />
    </Suspense>
  )
}