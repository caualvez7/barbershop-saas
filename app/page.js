'use client'

import { useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Navbar from './components/Navbar.jsx'

export default function Home() {
  const router = useRouter()

  return (

    <main className="bg-slate-50 text-slate-900">
          <Navbar/>

        <div className="w-full relative h-[300px] md:h-[600px] bg-slate-100 flex items-center justify-center">
        <Image
            src="/banner.jpeg"
            alt="Banner"
            fill
            className="object-contain"
            priority
            quality={100}
        />
        </div>

      {/* HERO */}
      <section className="min-h-auto flex flex-col justify-center items-center text-center px-6">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Organize sua barbearia sem esforço
        </h1>

        <p className="text-lg text-gray-600 mb-6 max-w-xl">
          Agendamentos automáticos, clientes organizados e mais tempo pra focar no que importa.
        </p>

        <button
          onClick={() => {
            document
            .getElementById('plans')
            ?.scrollIntoView({behavior: 'smooth'})
          }}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl text-lg hover:bg-blue-700 transition"
        >
          Começar agora
        </button>
      </section>

      {/* BENEFÍCIOS */}
      <section className="py-20 px-6 max-w-5xl mx-auto grid md:grid-cols-3 gap-8 text-center">
        <div>
          <h3 className="text-xl font-semibold mb-2">Agendamento fácil</h3>
          <p className="text-gray-600">Seus clientes marcam horário sem precisar te chamar.</p>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-2">Menos faltas</h3>
          <p className="text-gray-600">Organize melhor sua agenda e evite horários perdidos.</p>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-2">Tudo organizado</h3>
          <p className="text-gray-600">Veja seus atendimentos de forma simples e rápida.</p>
        </div>
      </section>

      {/* DIFERENCIAL */}
      <section className="bg-white py-20 px-6 text-center">
        <h2 className="text-3xl font-bold mb-4">
          Simples, direto e feito para barbeiros
        </h2>

        <p className="text-gray-600 max-w-2xl mx-auto">
          Nada de sistemas complicados. Você cria sua página, seus clientes agendam e você só atende.
        </p>
      </section>

      {/* PLANOS */}
      <section className="py-20 px-6 max-w-6xl mx-auto text-center" id='plans'>
        <h2 className="text-3xl font-bold mb-10">Escolha seu plano</h2>

        <div className="grid md:grid-cols-3 gap-6">

          {/* BÁSICO */}
          <div className="bg-white p-6 rounded-2xl shadow">
            <h3 className="text-xl font-semibold mb-2">Básico</h3>
            <p className="text-3xl font-bold mb-4">R$29</p>

            <ul className="text-gray-600 mb-6 space-y-2">
              <li>✔ Página de agendamento</li>
              <li>✔ Cadastro de serviços</li>
            </ul>

            <button className="w-full bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700" onClick={() => router.push('/register?plan=basic')}>
              Escolher plano
            </button>
          </div>

          {/* PLUS */}
          <div className="bg-blue-600 text-white p-6 rounded-2xl shadow scale-105">
            <h3 className="text-xl font-semibold mb-2">Plus</h3>
            <p className="text-3xl font-bold mb-4">R$49</p>

            <ul className="mb-6 space-y-2">
              <li>✔ Tudo do básico</li>
              <li>✔ Prioridade de suporte</li>
            </ul>

            <button className="w-full bg-white text-blue-600 py-2 rounded-xl hover:bg-gray-200" onClick={() => router.push('/register?plan=plus')}>
              Escolher plano
            </button>
          </div>

          {/* PREMIUM */}
          <div className="bg-white p-6 rounded-2xl shadow">
            <h3 className="text-xl font-semibold mb-2">Premium</h3>
            <p className="text-3xl font-bold mb-4">R$79</p>

            <ul className="text-gray-600 mb-6 space-y-2">
              <li>✔ Tudo do plus</li>
              <li>✔ Recursos avançados</li>
            </ul>

            <button className="w-full bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700" onClick={() => router.push('/register?plan=premium')}>
              Escolher plano
            </button>
          </div>

        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-20 text-center">
        <h2 className="text-3xl font-bold mb-4">
          Comece a organizar sua agenda hoje
        </h2>

        <button
          onClick={() => router.push('/evaluation')}
          className="bg-blue-600 text-white px-8 py-3 rounded-xl text-lg hover:bg-blue-700"
        >
          Realizar uma avaliação 🚀
        </button>
      </section>

    </main>
  )
}