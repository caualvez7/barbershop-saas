'use client' 
// 👉 Indica que esse componente roda no cliente (browser)
// Necessário para usar estado (useState) e eventos

import { useState } from 'react'
// 👉 Hook do React para controlar estado (inputs, loading, etc)

import { supabase } from '../../lib/supabase'
// 👉 Importa o cliente que você criou para conectar com o Supabase

import { useRouter } from 'next/navigation'
import Card from '../components/ui/Card.jsx'
import Input from '../components/ui/Input.jsx'
import Button from '../components/ui/Button.jsx'
import Link from 'next/link'

export default function LoginPage() {

  const router = useRouter()

  // 👉 Estados para armazenar os valores digitados
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // 👉 Estado para controlar carregamento (UX)
  const [loading, setLoading] = useState(false)

  // 👉 Função chamada ao clicar no botão
  const handleLogin = async () => {

    setLoading(true) 
    // 👉 Ativa o estado de loading (ex: botão "Entrando...")

    // 🔐 Faz login no Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,     // 👉 email digitado
      password,  // 👉 senha digitada
    })

    console.log('LOGIN DATA: ', data)
    console.log('LOGIN ERROR: ', error)

    // 👉 Se deu erro no login
    if (error) {
      alert(error.message) // mostra erro
      setLoading(false)    // para loading
      return               // encerra função
    }

    // 👉 Se deu certo
    router.push('/dashboard')

    setLoading(false)
  }

  // 🎨 Interface simples
  return (

  <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">

    <div className="w-full max-w-md">

      {/* LOGO */}

      <div className="text-center mb-8">

        <h1 className="text-4xl font-bold text-slate-900">

          BarberShop<span className="text-blue-600">BR</span>

        </h1>

        <p className="text-slate-500 mt-2">

          Acesse sua barbearia

        </p>

      </div>

      {/* CARD */}

      <Card>

        <div className="space-y-4">

          <div>

            <label className="text-sm text-slate-600 mb-2 block">

              Email

            </label>

            <Input
              placeholder="Digite seu email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

          </div>

          <div>

            <label className="text-sm text-slate-600 mb-2 block">

              Senha

            </label>

            <Input
              type="password"
              placeholder="Digite sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

          </div>

          <Button
            onClick={handleLogin}
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>

        </div>

        {/* FOOTER */}

        <div className="mt-6 text-center">

          <p className="text-sm text-slate-500">

            Ainda não possui conta?

          </p>

          <Link
            href="/#plans"
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Escolher plano
          </Link>

        </div>

      </Card>

    </div>

  </div>

  )
}