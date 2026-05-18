'use client'

import { useEffect, useState } from 'react'

import { useParams, useRouter } from 'next/navigation'

import { supabase } from '../../../../lib/supabase'

import Card from '../../../components/ui/Card'
import Input from '../../../components/ui/Input'
import Button from '../../../components/ui/Button'

export default function SchedulingPage() {

  const params = useParams()

  const router = useRouter()

  const slug = params?.slug

  const [shop, setShop] = useState(null)

  const [services, setServices] = useState([])

  const [selectedService, setSelectedService] = useState('')

  const [customerName, setCustomerName] = useState('')

  const [customerPhone, setCustomerPhone] = useState('')

  const [date, setDate] = useState('')

  const [time, setTime] = useState('')

  const [loading, setLoading] = useState(true)

  const [saving, setSaving] = useState(false)

  // 🔥 carregar barbearia

  useEffect(() => {

    const loadData = async () => {


      // 🔥 usuário logado

const { data: { user } } = await supabase.auth.getUser()

if (!user) {

  router.push(`/barber/${slug}/auth`)

  return
}

// 🔥 busca customer

const { data: customer } = await supabase
  .from('customers')
  .select('*')
  .eq('user_id', user.id)
  .single()

if (!customer) {

  router.push(`/barber/${slug}/auth`)

  return
}

// 🔥 busca assinatura

const { data: subscription } = await supabase
  .from('subscriptions')
  .select('*')
  .eq('customer_id', customer.id)
  .in('status', ['pending', 'active'])
  .single()

// 🔥 sem assinatura

if (!subscription) {

  router.push(`/barber/${slug}/plans`)

  return
}
      // busca barbearia

      const { data: shopData, error: shopError } = await supabase
        .from('barbershops')
        .select('*')
        .eq('slug', slug)
        .single()

      console.log(shopData)
      console.log(shopError)

      if (!shopData) {

        setLoading(false)

        return
      }

      setShop(shopData)

      // busca serviços

      const { data: servicesData } = await supabase
        .from('services')
        .select('*')
        .eq('barbershop_id', shopData.id)

      setServices(servicesData || [])

      setLoading(false)
    }

    if (slug) {
      loadData()
    }

  }, [slug])

  // 🔥 criar agendamento

  const handleScheduling = async () => {

    if (
      !customerName.trim() ||
      !customerPhone.trim() ||
      !selectedService ||
      !date ||
      !time
    ) {

      alert('Preencha todos os campos.')

      return
    }

    setSaving(true)

   const { error } = await supabase
  .from('appointments')
  .insert({
    customer_name: customerName,
    customer_whatsapp: customerPhone,
    service_id: selectedService,
    date,
    time,
    status: 'Pendente',
    barbershop_id: shop.id
  })

    console.log(error)

    if (error) {

      alert('Erro ao realizar agendamento.')

      setSaving(false)

      return
    }

    alert('Agendamento realizado com sucesso!')

    setCustomerName('')
    setCustomerPhone('')
    setSelectedService('')
    setDate('')
    setTime('')

    setSaving(false)
  }

  // 🔥 loading

  if (loading) {

    return (

      <div className="min-h-screen flex items-center justify-center">

        <p>Carregando...</p>

      </div>

    )

  }

  // ❌ barbearia não encontrada

  if (!shop) {

    return (

      <div className="min-h-screen flex items-center justify-center">

        <p>Barbearia não encontrada.</p>

      </div>

    )

  }

  return (

    <div className="min-h-screen bg-slate-50 px-6 py-16">

      <div className="max-w-2xl mx-auto">

        {/* TOPO */}

        <div className="text-center mb-10">

          <p className="text-blue-600 font-medium mb-3">

            {shop.name}

          </p>

          <h1 className="text-5xl font-bold text-slate-900 mb-4">

            Agende seu horário

          </h1>

          <p className="text-slate-500 text-lg">

            Escolha o serviço e reserve seu atendimento.

          </p>

        </div>

        {/* FORM */}

        <Card className="p-8 space-y-5">

          {/* nome */}

          <div>

            <label className="text-sm text-slate-600 block mb-2">

              Seu nome

            </label>

            <Input
              placeholder="Digite seu nome"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />

          </div>

          {/* telefone */}

          <div>

            <label className="text-sm text-slate-600 block mb-2">

              Telefone

            </label>

            <Input
              placeholder="(00) 00000-0000"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
            />

          </div>

          {/* serviço */}

          <div>

            <label className="text-sm text-slate-600 block mb-2">

              Serviço

            </label>

            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="
                w-full
                border
                border-slate-300
                rounded-xl
                px-4
                py-3
                bg-white
                outline-none
                focus:ring-2
                focus:ring-blue-500
              "
            >

              <option value="">
                Selecione um serviço
              </option>

              {services.map((service) => (

                <option
                  key={service.id}
                  value={service.id}
                >

                  {service.name} — R$ {service.price}

                </option>

              ))}

            </select>

          </div>

          {/* data */}

          <div>

            <label className="text-sm text-slate-600 block mb-2">

              Data

            </label>

            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />

          </div>

          {/* horário */}

          <div>

            <label className="text-sm text-slate-600 block mb-2">

              Horário

            </label>

            <Input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />

          </div>

          {/* botão */}

          <Button
            onClick={handleScheduling}
            disabled={saving}
            className="w-full"
          >

            {saving
              ? 'Agendando...'
              : 'Confirmar agendamento'}

          </Button>

        </Card>

      </div>

    </div>

  )

}