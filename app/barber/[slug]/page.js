'use client'

import { supabase } from '../../../lib/supabase'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

import Card from '../../components/ui/Card.jsx'
import Button from '../../components/ui/Button.jsx'

export default function BarberPage() {
    
  const [shop, setShop] = useState(null)
  const [loading, setLoading] = useState(true)
  const params = useParams()
  const slug = params?.slug

  // 🔥 busca barbearia

  useEffect(() => {

  const loadShop = async () => {

    const { data, error } = await supabase
      .from('barbershops')
      .select('*')
      .eq('slug', slug)
      .single()

    console.log(data)
    console.log(error)

    setShop(data)

    setLoading(false)
  }

  loadShop()

}, [])

if (loading) {

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Carregando...</p>
    </div>
  )

}
  return (

    <div className="min-h-screen bg-slate-50">

      {/* HERO */}

      <section className="px-6 py-20 text-center">

        <div className="max-w-4xl mx-auto">

          <h1 className="text-3xl font-bold text-slate-900 mb-6">

            Bem-vindo à {shop?.name}

          </h1>

          <p className="text-xl text-slate-500 max-w-2xl mx-auto">

            

          </p>

        </div>

      </section>

    {/* HEADER */}

    <div className="text-center mb-14">

      <h2 className="text-2xl font-bold text-slate-900 mb-4">

        Escolha seu plano

      </h2>

      <p className="text-slate-500 text-lg">

        Simples, transparente e sem burocracia.

      </p>

    </div>

      {/* BENEFÍCIOS */}

      <section className="px-6 pb-16">

        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6">

          <Card>

            <h3 className="text-xl font-semibold mb-3">

              Cortes ilimitados

            </h3>

            <p className="text-slate-500">

              Frequente sua barbearia sem preocupação.

            </p>

          </Card>

          <Card>

            <h3 className="text-xl font-semibold mb-3">

              Prioridade no atendimento

            </h3>

            <p className="text-slate-500">

              Clientes assinantes possuem prioridade.

            </p>

          </Card>

          <Card>

            <h3 className="text-xl font-semibold mb-3">

              Benefícios exclusivos

            </h3>

            <p className="text-slate-500">

              Promoções especiais e vantagens únicas.

            </p>

          </Card>

        </div>

      </section>

{/* PLANOS */}

{/* CTA */}

<section className="px-6 pb-24">

  <div className="max-w-4xl mx-auto">

    <Card className="p-12 text-center rounded-3xl">

      <h2 className="text-5xl font-bold text-slate-900 mb-6">

        Faça parte da experiência {shop?.name}

      </h2>

      <p className="text-slate-500 text-xl mb-10 max-w-2xl mx-auto">

        Crie sua conta para acessar os planos exclusivos,
        benefícios mensais e realizar seus agendamentos.

      </p>

      <Button
        onClick={() => window.location.href = `/barber/${slug}/auth`}
        className="px-10 py-4 text-lg"
      >

        Começar agora

      </Button>

    </Card>

  </div>

</section>

    </div>

  )

}