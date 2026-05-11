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

  // 🔥 busca barbearia

  useEffect(() => {

  const loadShop = async () => {

    const slug = params?.slug

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

            Assine um plano mensal e mantenha seu visual impecável todos os meses.

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

<section className="px-6 pb-24">

  <div className="max-w-6xl mx-auto">


    {/* GRID */}

    <div className="grid md:grid-cols-3 gap-8 items-stretch">

      {/* CARD 1 */}

      <Card className="p-8 flex flex-col rounded-3xl">

        <h3 className="text-3xl font-bold mb-5">

          Corte Livre

        </h3>

        <p className="text-slate-500 mb-8 text-lg">

          Corte quantas vezes quiser durante o mês.

        </p>

        <div className="mb-10">

          <span className="text-5xl font-bold">

            R$ 84,90

          </span>

          <span className="text-slate-500 text-lg">

            /mês

          </span>

        </div>

        <Button className="w-full mt-auto">

          Assinar agora

        </Button>

      </Card>

      {/* CARD 2 */}

      <Card className="p-8 flex flex-col rounded-3xl border-2 border-blue-600 relative scale-105 shadow-xl">

        <div className="absolute -top-3 left-1/2 -translate-x-1/2">

          <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">

            Mais popular

          </span>

        </div>

        <h3 className="text-3xl font-bold mb-5 mt-4">

          Corte + Barba

        </h3>

        <p className="text-slate-500 mb-8 text-lg">

          Visual completo todos os meses.

        </p>

        <div className="mb-10">

          <span className="text-5xl font-bold">

            R$ 129,90

          </span>

          <span className="text-slate-500 text-lg">

            /mês

          </span>

        </div>

        <Button className="w-full mt-auto">

          Assinar agora

        </Button>

      </Card>

      {/* CARD 3 */}

      <Card className="p-8 flex flex-col rounded-3xl">

        <h3 className="text-3xl font-bold mb-5">

          Premium VIP

        </h3>

        <p className="text-slate-500 mb-8 text-lg">

          Atendimento premium e benefícios exclusivos.

        </p>

        <div className="mb-10">

          <span className="text-5xl font-bold">

            R$ 199,90

          </span>

          <span className="text-slate-500 text-lg">

            /mês

          </span>

        </div>

        <Button className="w-full mt-auto">

          Assinar agora

        </Button>

      </Card>

    </div>

  </div>

</section>

    </div>

  )

}