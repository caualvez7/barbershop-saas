'use client'

import { useState } from 'react'
import { supabase } from '../../lib/supabase.js'
import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const searchParams = useSearchParams()
  const plan = searchParams.get('plan') || 'basic'
  const router = useRouter()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [barbershopName, setBarbershopName] = useState('')
  const [ownerName, setOwnerName] = useState('')
  const [loading, setLoading] = useState(false)

  const handleRegister = async () => {
    setLoading(true)

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      alert(error.message)
      setLoading(false)
      return
    }

    const user = data.user || data.session?.user

    if (!user) {
      alert('Erro ao criar usuário')
      setLoading(false)
      return
    }

    const { error: insertError } = await supabase
      .from('barbershops')
      .insert({
        name: barbershopName,
        owner_name: ownerName,
        user_id: user.id,
        plan: plan
      })

    if (insertError) {
      alert(insertError.message)
      setLoading(false)
      return
    }

    router.push(`/checkout?plan=${plan}`)
    setLoading(false)
  }

 return (

    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">

      <div className="w-full max-w-md bg-white rounded-2xl shadow p-8">

        {/* HEADER */}

        <div className="mb-6 text-center">

          <h1 className="text-2xl font-bold text-black">Criar conta</h1>

          <p className="text-gray-500 text-sm">

            Comece a gerenciar sua barbearia

          </p>

        </div>

        {/* PLANO */}

        <div className="mb-4 text-center">

          <span className="text-sm text-gray-500">Plano selecionado:</span>

          <p className="font-semibold capitalize text-blue-600">

            {plan}

          </p>

        </div>

        {/* FORM */}

        <div className="space-y-4">

          <input

            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"

            placeholder="Nome da barbearia"

            value={barbershopName}

            onChange={(e) => setBarbershopName(e.target.value)}

          />

          <input

            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"

            placeholder="Nome do proprietário"

            value={ownerName}

            onChange={(e) => setOwnerName(e.target.value)}

          />

          <input

            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"

            placeholder="Email"

            value={email}

            onChange={(e) => setEmail(e.target.value)}

          />

          <input

            type="password"

            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"

            placeholder="Senha"

            value={password}

            onChange={(e) => setPassword(e.target.value)}

          />

          <button

            onClick={handleRegister}

            disabled={loading}

            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"

          >

            {loading ? 'Criando conta...' : 'Criar conta'}

          </button>

        </div>

        {/* FOOTER */}

        <p className="text-xs text-gray-400 text-center mt-6">

          Ao continuar, você concorda com os termos da plataforma.

        </p>

      </div>

    </div>

  )

} 