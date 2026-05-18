'use client'

import { useEffect, useState } from 'react'

import { useParams, useRouter } from 'next/navigation'

import { supabase } from '../../../../lib/supabase.js'

import Card from '../../../components/ui/Card'
import Input from '../../../components/ui/Input'
import Button from '../../../components/ui/Button'

export default function ClientAuthPage() {

  const params = useParams()

  const router = useRouter()

  const slug = params?.slug

  const [shop, setShop] = useState(null)

  const [loading, setLoading] = useState(true)

  const [isLogin, setIsLogin] = useState(false)

  // cadastro

  const [name, setName] = useState('')

  const [whatsapp, setWhatsapp] = useState('')

  const [email, setEmail] = useState('')

  const [password, setPassword] = useState('')

  // 🔥 carregar barbearia

  useEffect(() => {

  if (!slug) return

  const loadShop = async () => {

    const { data, error } = await supabase
      .from('barbershops')
      .select('*')
      .eq('slug', slug)
      .maybeSingle()

    console.log(slug)
    console.log(data)
    console.log(error)

    setShop(data)

    setLoading(false)
  }

  loadShop()

}, [slug])

  // 🔥 cadastro

  const handleRegister = async () => {

    if (
      !name.trim() ||
      !whatsapp.trim() ||
      !email.trim() ||
      !password.trim()
    ) {

      alert('Preencha todos os campos.')

      return
    }

    // cria auth

    const { data, error } = await supabase.auth.signUp({
      email,
      password
    })

    console.log(data)
    console.log(error)

    if (error) {

      alert(error.message)

      return
    }

    const user = data.user

    // salva cliente

    await supabase
      .from('customers')
      .insert({
        name,
        whatsapp,
        email,
        user_id: user.id,
        barbershop_id: shop.id
      })

    alert('Conta criada com sucesso!')

    router.push(`/barber/${slug}/plans`)
  }

  // 🔥 login

  const handleLogin = async () => {

    if (
      !email.trim() ||
      !password.trim()
    ) {

      alert('Preencha todos os campos.')

      return
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {

      alert(error.message)

      return
    }

    router.push(`/barber/${slug}/plans`)
  }

  // loading

  if (loading) {

    return (

      <div className="min-h-screen flex items-center justify-center">

        <p>Carregando...</p>

      </div>

    )

  }

  // barbearia não encontrada

  if (!shop) {

    return (

      <div className="min-h-screen flex items-center justify-center">

        <p>Barbearia não encontrada.</p>

      </div>

    )

  }

  return (

    <div className="min-h-screen bg-slate-50 px-6 py-16">

      <div className="max-w-xl mx-auto">

        {/* TOPO */}

        <div className="text-center mb-10">

          <p className="text-blue-600 font-medium mb-3">

            {shop.name}

          </p>

          <h1 className="text-5xl font-bold text-slate-900 mb-4">

            {isLogin
              ? 'Entrar na sua conta'
              : 'Crie sua conta'}
          </h1>

          <p className="text-slate-500 text-lg">

            {isLogin
              ? 'Acesse sua assinatura e agendamentos.'
              : 'Cadastre-se para acessar os planos da barbearia.'}

          </p>

        </div>

        {/* CARD */}

        <Card className="p-8 space-y-5">

          {/* cadastro */}

          {!isLogin && (

            <>
              <div>

                <label className="text-sm text-slate-600 block mb-2">

                  Seu nome

                </label>

                <Input
                  placeholder="Digite seu nome"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />

              </div>

              <div>

                <label className="text-sm text-slate-600 block mb-2">

                  WhatsApp

                </label>

                <Input
                  placeholder="(00) 00000-0000"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                />

              </div>
            </>

          )}

          {/* email */}

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

          {/* senha */}

          <div>

            <label className="text-sm text-slate-600 block mb-2">

              Senha

            </label>

            <Input
              type="password"
              placeholder="Digite sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

          </div>

          {/* botão */}

          <Button
            onClick={isLogin
              ? handleLogin
              : handleRegister}
            className="w-full"
          >

            {isLogin
              ? 'Entrar'
              : 'Criar conta'}

          </Button>

          {/* alternar */}

          <div className="text-center pt-4">

            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-blue-600 hover:underline"
            >

              {isLogin
                ? 'Ainda não possui conta? Criar conta'
                : 'Já possui conta? Entrar'}

            </button>

          </div>

        </Card>

      </div>

    </div>

  )

}