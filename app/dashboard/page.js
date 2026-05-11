'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import DashboardLayout from '../components/DashboardLayout.jsx'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Link from 'next/link'

export default function Dashboard() {

  // 👉 estado para armazenar dados da barbearia
  const [barbershop, setBarbershop] = useState(null)

  // 👉 estado de loading
  const [loading, setLoading] = useState(true)

  // 👉 estado com os dados cliente
  const [appointments, setAppointments] = useState([])


const cancelAppointment = async (id) => {
  const { error } = await supabase
    .from('appointments')
    .update({ status: 'Cancelado' })
    .select()
    .eq('id', id)

    console.log(error)

  if (error) {
    alert('Erro ao cancelar')
    return
  }

  alert('Agendamento cancelado')

  // 🔄 recarregar lista
  window.location.reload()
}

  useEffect(() => {
  const getSessionAndData = async () => {

    // 🔥 pega sessão atual
    const { data: { session } } = await supabase.auth.getSession()

    console.log('SESSION DASHBOARD:', session)

    if (!session) {
      console.log('Sem sessão')
      setLoading(false)
      return
    }

    const user = session.user

    console.log('USER DASHBOARD:', user)

    // 🔥 busca barbearia
    const { data, error } = await supabase
      .from('barbershops')
      .select('*')

    console.log('DATA DASHBOARD:', data)

    if (error) {
      console.log(error)
      setLoading(false)
      return
    }

    if (!data || data.length === 0) {
      console.log('Nenhuma barbearia encontrada')
      setLoading(false)
      return
    }

    setBarbershop(data[0])
    setLoading(false)
  }

  getSessionAndData()

  // 🔥 ESSA PARTE É O SEGREDO
  const { data: listener } = supabase.auth.onAuthStateChange(
    (_event, session) => {
      console.log('Auth mudou:', session)
      if (session) {
        getSessionAndData()
      }
    }
  )

  return () => {
    listener.subscription.unsubscribe()
  }

}, [])

useEffect(() => {
  const loadAppointments = async () => {

    // 🔐 pega usuário logado
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return

    // 🔍 pega barbearia do usuário
    const { data: shop } = await supabase
      .from('barbershops')
      .select('*')
      .eq('user_id', user.id)
      .single()

    // 🔥 busca agendamentos + serviço junto
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        services (
          name
        )
      `)
      .eq('barbershop_id', shop.id)
      .eq('status', 'Pendente')
      .order('date', { ascending: true })

    if (error) {
      console.log(error)
      return
    }

    setAppointments(data)
  }

  loadAppointments()
}, [])


  if (loading) return <p>Carregando...</p>

return (

  <DashboardLayout>

    <div className="space-y-6">

      {/* TOPO */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

        <div>

          <h1 className="text-3xl font-bold text-slate-900">

            {barbershop?.name}

          </h1>

          <p className="text-slate-500 mt-1">

            Bem-vindo ao painel da sua barbearia.

          </p>

        </div>

        <Link href={`/barber/${barbershop?.slug}`}>

          <Button>

            Ver minha página

          </Button>

        </Link>

      </div>

      {/* ALERTA */}

      {barbershop?.plan === 'basic' && (

        <Card className="bg-yellow-50 border-yellow-200">

          <p className="text-yellow-800 font-medium">

            Seu plano atual permite até 3 serviços cadastrados.

          </p>

        </Card>

      )}

      {/* CARDS */}

      <div className="grid md:grid-cols-3 gap-4">

        <Card>

          <p className="text-slate-500 text-sm mb-2">

            Plano atual

          </p>

          <h2 className="text-2xl font-bold capitalize">

            {barbershop?.plan}

          </h2>

        </Card>

        <Card>

          <p className="text-slate-500 text-sm mb-2">

            Agendamentos pendentes

          </p>

          <h2 className="text-2xl font-bold">

            {appointments.length}

          </h2>

        </Card>

        <Card>

          <p className="text-slate-500 text-sm mb-2">

            Página pública

          </p>

          <p className="text-sm text-blue-600 break-all">

            /barber/{barbershop?.slug}

          </p>

        </Card>

      </div>

      {/* AÇÕES */}

      <div className="grid md:grid-cols-3 gap-4">

        <Link href="/dashboard/services">

          <Card className="hover:shadow-md transition cursor-pointer">

            <h3 className="font-semibold text-lg mb-2">

              Serviços

            </h3>

            <p className="text-slate-500 text-sm">

              Gerencie os serviços da sua barbearia.

            </p>

          </Card>

        </Link>

        <Card className="hover:shadow-md transition cursor-pointer">

          <h3 className="font-semibold text-lg mb-2">

            Agenda

          </h3>

          <p className="text-slate-500 text-sm">

            Veja os próximos atendimentos.

          </p>

        </Card>

        <Card className="hover:shadow-md transition cursor-pointer">

          <h3 className="font-semibold text-lg mb-2">

            Configurações

          </h3>

          <p className="text-slate-500 text-sm">

            Personalize sua barbearia.

          </p>

        </Card>

      </div>

      {/* AGENDAMENTOS */}

      <Card>

        <div className="flex items-center justify-between mb-6">

          <h2 className="text-2xl font-bold">

            Agendamentos

          </h2>

        </div>

        {appointments.length === 0 ? (

          <p className="text-slate-500">

            Nenhum agendamento pendente.

          </p>

        ) : (

          <div className="space-y-4">

            {appointments.map((item) => (

              <div
                key={item.id}
                className="border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
              >

                <div>

                  <h3 className="font-semibold text-slate-900">

                    {item.customer_name}

                  </h3>

                  <p className="text-sm text-slate-500">

                    {item.services?.name}

                  </p>

                  <p className="text-sm text-slate-500">

                    {item.date} às {item.time}

                  </p>

                </div>

                <div className="flex items-center gap-3">

                  <span className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full">

                    {item.status}

                  </span>

                  <Button
                    variant="danger"
                    onClick={() => cancelAppointment(item.id)}
                  >
                    Cancelar
                  </Button>

                </div>

              </div>

            ))}

          </div>

        )}

      </Card>

    </div>

  </DashboardLayout>

  )
}
