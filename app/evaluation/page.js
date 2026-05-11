'use client'
import { supabase } from '../../lib/supabase'
import { useState } from 'react'

import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'

export default function EvaluationPage() {

  const [companyName, setCompanyName] = useState('')
  const [ownerName, setOwnerName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [revenue, setRevenue] = useState('')
  const [loading, setLoading] = useState(false)

const handleSubmit = async () => {

  // 🔥 validação

  if (
    !companyName.trim() ||
    !ownerName.trim() ||
    !email.trim() ||
    !phone.trim() ||
    !revenue.trim()
  ) {

    alert('Preencha todos os campos.')

    return
  }

  setLoading(true)

  // 🔥 salva no Supabase

  const { error } = await supabase
    .from('evaluations')
    .insert({
      company_name: companyName,
      owner_name: ownerName,
      email,
      phone,
      revenue,
    })

  if (error) {

    console.log(error)

    alert('Erro ao enviar avaliação.')

    setLoading(false)

    return
  }

  // 🔥 sucesso

  alert('Avaliação enviada com sucesso!')

  // limpa campos

  setCompanyName('')
  setOwnerName('')
  setEmail('')
  setPhone('')
  setRevenue('')

  setLoading(false)
}

  return (

    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-10">

      <div className="w-full max-w-xl">

        {/* TOPO */}

        <div className="text-center mb-8">

          <h1 className="text-4xl font-bold text-slate-900">

            BarberShop<span className="text-blue-600">BR</span>

          </h1>

          <p className="text-slate-500 mt-3">

            Solicite uma avaliação gratuita da sua barbearia

          </p>

        </div>

        {/* CARD */}

        <Card>

          <div className="space-y-4">

            <div>

              <label className="text-sm text-slate-600 block mb-2">

                Nome da empresa

              </label>

              <Input
                placeholder="Digite o nome da barbearia"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />

            </div>

            <div>

              <label className="text-sm text-slate-600 block mb-2">

                Nome do proprietário

              </label>

              <Input
                placeholder="Digite seu nome"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
              />

            </div>

            <div>

              <label className="text-sm text-slate-600 block mb-2">

                Email

              </label>

              <Input
                placeholder="Digite seu email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

            </div>

            <div>

              <label className="text-sm text-slate-600 block mb-2">

                Telefone

              </label>

              <Input
                placeholder="(00) 00000-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />

            </div>

            <div>

  <label className="text-sm text-slate-600 block mb-2">

    Média de faturamento mensal

  </label>

  <select
    value={revenue}
    onChange={(e) => setRevenue(e.target.value)}
    className="
      w-full
      border
      border-slate-300
      rounded-xl
      px-4
      py-3
      outline-none
      focus:ring-2
      focus:ring-blue-500
      focus:border-blue-500
      transition
      bg-white
    "
  >

    <option value="">
      Selecione
    </option>

    <option>
      Até R$ 2 mil/mês
    </option>

    <option>
      De R$ 2 mil a R$ 5 mil
    </option>

    <option>
      De R$ 5 mil a R$ 10 mil
    </option>

    <option>
      De R$ 10 mil a R$ 20 mil
    </option>

    <option>
      De R$ 20 mil a R$ 40 mil
    </option>

    <option>
      Mais de R$ 40 mil/mês
    </option>

  </select>

</div>

            <Button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full"
                >
                {loading
                    ? 'Enviando...'
                    : 'Solicitar avaliação'}
            </Button>

          </div>

        </Card>

      </div>

    </div>

  )

}