'use client'

import { useEffect, useState } from 'react'

import { supabase } from '../../../lib/supabase'

import DashboardLayout from '../../components/DashboardLayout'

import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'

export default function PlansPage() {

  const [plans, setPlans] = useState([])

  const [shop, setShop] = useState(null)

  const [name, setName] = useState('')

  const [description, setDescription] = useState('')

  const [price, setPrice] = useState('')

  const [loading, setLoading] = useState(true)

  const [saving, setSaving] = useState(false)

  // 🔥 carregar planos

  useEffect(() => {

    const loadData = async () => {

      const { data: { user } } = await supabase.auth.getUser()

      if (!user) return

      // 🔥 busca barbearia

      const { data: shopData } = await supabase
        .from('barbershops')
        .select('*')
        .eq('user_id', user.id)
        .single()

      setShop(shopData)

      // 🔥 busca planos

      const { data: plansData } = await supabase
        .from('plans')
        .select('*')
        .eq('barbershop_id', shopData.id)
        .order('created_at', { ascending: false })

      setPlans(plansData || [])

      setLoading(false)
    }

    loadData()

  }, [])

  // 🔥 criar plano

  const handleCreatePlan = async () => {

    if (
      !name.trim() ||
      !description.trim() ||
      !price
    ) {

      alert('Preencha todos os campos.')

      return
    }

    setSaving(true)

    const { error } = await supabase
      .from('plans')
      .insert({
        barbershop_id: shop.id,
        name,
        description,
        price,
        active: true
      })

    console.log(error)

    if (error) {

      alert('Erro ao criar plano.')

      setSaving(false)

      return
    }

    alert('Plano criado com sucesso!')

    setName('')
    setDescription('')
    setPrice('')

    // 🔥 recarrega planos

    const { data: plansData } = await supabase
      .from('plans')
      .select('*')
      .eq('barbershop_id', shop.id)
      .order('created_at', { ascending: false })

    setPlans(plansData || [])

    setSaving(false)
  }

  // 🔥 excluir plano

  const handleDelete = async (id) => {

    const confirmDelete = confirm(
      'Deseja excluir este plano?'
    )

    if (!confirmDelete) return

    const { error } = await supabase
      .from('plans')
      .delete()
      .eq('id', id)

    console.log(error)

    if (error) {

      alert('Erro ao excluir.')

      return
    }

    setPlans(plans.filter((item) => item.id !== id))
  }

  if (loading) {

    return (
      <DashboardLayout>

        <p>Carregando...</p>

      </DashboardLayout>
    )

  }

  return (

    <DashboardLayout>

      <div className="max-w-5xl">

        {/* TOPO */}

        <div className="mb-10">

          <h1 className="text-4xl font-bold text-slate-900 mb-3">

            Planos

          </h1>

          <p className="text-slate-500">

            Gerencie os planos da sua barbearia.

          </p>

        </div>

        {/* FORM */}

        <Card className="p-6 mb-10 space-y-4">

          <div>

            <label className="text-sm text-slate-600 block mb-2">

              Nome do plano

            </label>

            <Input
              placeholder="Ex: Corte Livre"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

          </div>

          <div>

            <label className="text-sm text-slate-600 block mb-2">

              Descrição

            </label>

            <Input
              placeholder="Ex: Corte ilimitado durante o mês"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

          </div>

          <div>

            <label className="text-sm text-slate-600 block mb-2">

              Preço mensal

            </label>

            <Input
              type="number"
              placeholder="99.90"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />

          </div>

          <Button
            onClick={handleCreatePlan}
            disabled={saving}
            className="w-full"
          >

            {saving
              ? 'Criando plano...'
              : 'Criar plano'}

          </Button>

        </Card>

        {/* LISTA */}

        <div className="grid md:grid-cols-2 gap-6">

          {plans.map((plan) => (

            <Card
              key={plan.id}
              className="p-6"
            >

              <div className="flex justify-between items-start mb-4">

                <div>

                  <h2 className="text-2xl font-bold">

                    {plan.name}

                  </h2>

                  <p className="text-slate-500 mt-2">

                    {plan.description}

                  </p>

                </div>

                <button
                  onClick={() => handleDelete(plan.id)}
                  className="text-red-500 text-sm"
                >

                  Excluir

                </button>

              </div>

              <div className="mt-6">

                <span className="text-4xl font-bold">

                  R$ {plan.price}

                </span>

                <span className="text-slate-500">

                  /mês

                </span>

              </div>

            </Card>

          ))}

        </div>

      </div>

    </DashboardLayout>

  )

}   