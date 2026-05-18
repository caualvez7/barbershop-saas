'use client'

import { useEffect, useState } from 'react'

import { useParams, useRouter } from 'next/navigation'

import { supabase } from '../../../../lib/supabase'

import Card from '../../../components/ui/Card'
import Button from '../../../components/ui/Button'

export default function PlansPage() {

  const params = useParams()

  const router = useRouter()

  const slug = params?.slug

  const [shop, setShop] = useState(null)

  const [customer, setCustomer] = useState(null)

  const [plans, setPlans] = useState([])

  const [loading, setLoading] = useState(true)

  const [saving, setSaving] = useState(false)
  

  // 🔥 carregar dados

  useEffect(() => {

    const loadData = async () => {

      // sessão

      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {

        router.push(`/barber/${slug}/auth`)

        return
      }

      // barbearia

      const { data: shopData } = await supabase
        .from('barbershops')
        .select('*')
        .eq('slug', slug)
        .single()

        // 🔥 busca planos

      const { data: plansData } = await supabase
        .from('plans')
        .select('*')
        .eq('barbershop_id', shopData.id)
        .eq('active', true)

      setPlans(plansData || [])

      // customer

      const { data: customerData } = await supabase
        .from('customers')
        .select('*')
        .eq('user_id', user.id)
        .single()

      setShop(shopData)

      setCustomer(customerData)

      setLoading(false)
    }

    if (slug) {
      loadData()
    }

  }, [slug])

  // 🔥 assinar plano

  const handleSubscribe = async (plan) => {

    setSaving(true)

    // expiração (30 dias)

    const expiresAt = new Date()

    expiresAt.setDate(expiresAt.getDate() + 30)

    // cria subscription

    const { error } = await supabase
      .from('subscriptions')
      .insert({
        customer_id: customer.id,
        barbershop_id: shop.id,
        plan_name: plan.name,
        price: plan.price,
        status: 'pending',
        starts_at: new Date(),
        expires_at: expiresAt
      })

    console.log(error)

    if (error) {

      alert('Erro ao criar assinatura.')

      setSaving(false)

      return
    }

    // 🔥 futuramente:
    // aqui entrará Stripe Checkout

    alert('Plano selecionado com sucesso!')

    router.push(`/barber/${slug}/scheduling`)
  }

  // loading

  if (loading) {

    return (

      <div className="min-h-screen flex items-center justify-center">

        <p>Carregando...</p>

      </div>

    )

  }

  return (

    <div className="min-h-screen bg-slate-50 px-6 py-20">

      <div className="max-w-6xl mx-auto">

        {/* TOPO */}

        <div className="text-center mb-16">

          <p className="text-blue-600 font-medium mb-3">

            {shop?.name}

          </p>

          <h1 className="text-5xl font-bold text-slate-900 mb-5">

            Escolha seu plano

          </h1>

          <p className="text-slate-500 text-lg">

            Assine e tenha acesso aos benefícios exclusivos.

          </p>

        </div>

        {/* GRID */}

        <div className="grid md:grid-cols-3 gap-8">

          {plans.map((plan, index) => (

            <Card
              key={index}
              className={`
                p-8
                rounded-3xl
                flex
                flex-col
                ${index === 1
                  ? 'border-2 border-blue-600 scale-105 shadow-xl'
                  : ''}
              `}
            >

              {index === 1 && (

                <div className="mb-5">

                  <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm">

                    Mais popular

                  </span>

                </div>

              )}

              <h2 className="text-3xl font-bold mb-4">

                {plan.name}

              </h2>

              <p className="text-slate-500 mb-8 text-lg">

                {plan.description}

              </p>

              <div className="mb-10">

                <span className="text-5xl font-bold">

                  R$ {plan.price}

                </span>

                <span className="text-slate-500 text-lg">

                  /mês

                </span>

              </div>

              <Button
                onClick={() => handleSubscribe(plan)}
                disabled={saving}
                className="w-full mt-auto"
              >

                {saving
                  ? 'Processando...'
                  : 'Assinar agora'}

              </Button>

            </Card>

          ))}

        </div>

      </div>

    </div>

  )

}