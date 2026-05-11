'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase.js'
import DashboardLayout from '../../components/DashboardLayout.jsx'
import Button from '../../components/ui/Button.jsx'
import Input from '../../components/ui/Input.jsx'
import Card from '../../components/ui/Card.jsx'

export default function ServicesPage() {
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [duration, setDuration] = useState('')
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(false)
  const [barbershop, setBarbershop] = useState(null)

  // 🚀 CARREGAR SERVIÇOS
  const loadServices = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    const user = session?.user

    if (!user) return

    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('user_id', user.id)

    if (error) {
      console.log(error)
      return
    }

    setServices(data)

    const { data: shop } = await supabase
  .from('barbershops')
  .select('*')
  .eq('user_id', user.id)
  .single()

  setBarbershop(shop)
  }

  useEffect(() => {
    loadServices()
  }, [])

  // ➕ CRIAR SERVIÇO
  const handleCreate = async () => {
  setLoading(true)

  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user

  if (!user) {
    alert('Usuário não logado')
    setLoading(false)
    return
  }

  // 🔹 1. pegar barbearia
  const { data: barbershop } = await supabase
    .from('barbershops')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!barbershop) {
    alert('Barbearia não encontrada')
    setLoading(false)
    return
  }

  // 🔹 2. contar serviços
  const { data: services } = await supabase
    .from('services')
    .select('*')
    .eq('barbershop_id', barbershop.id)

  // 🔥 3. validação ANTES do insert
  if (barbershop.plan === 'basic' && services.length >= 3) {
    alert('Plano básico permite até 3 serviços.')
    setLoading(false)
    return
  }

  // 🔹 4. criar serviço
  const { error } = await supabase
    .from('services')
    .insert({
      name,
      price,
      duration,
      barbershop_id: barbershop.id,
      user_id: user.id,
    })

  if (error) {
    alert(error.message)
    setLoading(false)
    return
  }

  // 🔹 5. recarregar lista
  await loadServices()

  // 🔹 6. limpar campos
  setName('')
  setPrice('')
  setDuration('')
  setLoading(false)
}



  return (
    <DashboardLayout>
    <div style={{ padding: 20 }}>
        <Card>
            <h1>Serviços:</h1>
        </Card>
      <p>
        {services.length} / {barbershop?.plan === 'basic' ? 3 : '∞'} serviços usados
      </p>
      {/* FORM */}
      <Input
        placeholder="Nome"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <br /><br />

      <Input
        placeholder="Preço"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
      />
      <br /><br />

      <Input
        placeholder="Duração (min)"
        value={duration}
        onChange={(e) => setDuration(e.target.value)}
      />
      <br /><br />

      <Button
        onClick={handleCreate}
        disabled={barbershop?.plan === 'basic' && services.length >= 3}
      >
        {loading ? 'Salvando...' : 'Criar'}
    </Button>

    {barbershop?.plan === 'basic' && services.length >= 3 && (
      <div style={{ marginTop: 10 }}>
        <p>Você atingiu o limite do plano básico.</p>

        <button onClick={() => window.location.href = '/'}>
          Fazer upgrade de plano
        </button>
      </div>
)}

      <hr />

      {/* LISTA */}
      <h2>Lista de Serviços</h2>

      {services.length === 0 ? (
        <p>Nenhum serviço cadastrado</p>
      ) : (
        services.map((service) => (
          <div key={service.id} style={{ marginBottom: 10 }}>
            <strong>{service.name}</strong>
            <p>R$ {service.price}</p>
            <p>{service.duration} min</p>
          </div>
        ))
      )}
    </div>
    </DashboardLayout>
  )
}