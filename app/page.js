'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { supabase } from '../lib/supabase.js'
import Navbar from './components/Navbar.jsx'

export default function Home() {
  const router = useRouter()

  const [companyName, setCompanyName] = useState('')
  const [ownerName, setOwnerName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [revenue, setRevenue] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleEvaluation = async () => {
    if (!companyName.trim() || !ownerName.trim() || !email.trim() || !phone.trim() || !revenue.trim()) {
      alert('Preencha todos os campos.')
      return
    }

    setLoading(true)

    const { error } = await supabase
      .from('evaluations')
      .insert({ company_name: companyName, owner_name: ownerName, email, phone, revenue })

    if (error) {
      alert('Erro ao enviar avaliação.')
      setLoading(false)
      return
    }

    setSubmitted(true)
    setLoading(false)
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', sans-serif; background: #fafaf9; color: #1a1a18; }

        .hero-badge {
          display: inline-flex; align-items: center; gap: 0.4rem;
          background: #eef2ff; color: #3730a3; border-radius: 100px;
          padding: 0.35rem 0.85rem; font-size: 0.8rem; font-weight: 500; margin-bottom: 2rem;
        }
        .hero-badge::before {
          content: ''; width: 6px; height: 6px;
          background: #4f46e5; border-radius: 50%; display: block;
        }
        .features-grid {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1px; background: #e5e3dd; border: 0.5px solid #e5e3dd;
          border-radius: 16px; overflow: hidden;
        }
        .feature-item { background: #fafaf9; padding: 2rem; transition: background .2s; }
        .feature-item:hover { background: #f5f4f0; }
        .steps-grid {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1.5rem; margin-top: 3rem;
        }
        .plans-grid {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1rem; margin-top: 3rem;
        }
        .plan-card {
          background: #fff; border: 0.5px solid #e5e3dd;
          border-radius: 16px; padding: 1.75rem; position: relative;
        }
        .plan-card.featured { border: 1.5px solid #2563eb; }
        .plan-btn {
          width: 100%; padding: 0.7rem; border-radius: 100px;
          font-size: 0.875rem; font-family: 'DM Sans', sans-serif;
          cursor: pointer; transition: all .2s;
          border: 0.5px solid #c8c6bf; background: transparent; color: #1a1a18;
        }
        .plan-btn:hover { border-color: #1a1a18; }
        .plan-btn.featured-btn { background: #2563eb; border-color: #2563eb; color: #fff; }
        .plan-btn.featured-btn:hover { opacity: .9; }
        .plan-features li {
          font-size: 0.875rem; color: #4a4a47; display: flex;
          align-items: center; gap: 0.5rem; font-weight: 300;
          list-style: none; margin-bottom: 0.6rem;
        }
        .plan-features li::before {
          content: ''; width: 5px; height: 5px;
          background: #2563eb; border-radius: 50%; flex-shrink: 0;
        }
        .logo-pill {
          background: #fff; border: 0.5px solid #e5e3dd; border-radius: 100px;
          padding: 0.4rem 1.1rem; font-size: 0.8rem; color: #6b6b67;
          font-weight: 500; white-space: nowrap;
        }
        .btn-primary {
          background: #1a1a18; color: #fafaf9; border: none;
          padding: 0.75rem 1.75rem; border-radius: 100px;
          font-size: 0.9rem; font-family: 'DM Sans', sans-serif; cursor: pointer; transition: opacity .2s;
        }
        .btn-primary:hover { opacity: .85; }
        .btn-secondary {
          background: transparent; color: #1a1a18; border: 0.5px solid #c8c6bf;
          padding: 0.75rem 1.75rem; border-radius: 100px;
          font-size: 0.9rem; font-family: 'DM Sans', sans-serif; cursor: pointer; transition: all .2s;
        }
        .btn-secondary:hover { border-color: #1a1a18; }
        .eval-input {
          width: 100%; border: 0.5px solid #e5e3dd; border-radius: 12px;
          padding: 0.75rem 1rem; font-size: 0.9rem; font-family: 'DM Sans', sans-serif;
          color: #1a1a18; background: #fff; outline: none; transition: border-color .2s;
        }
        .eval-input:focus { border-color: #2563eb; }
        .eval-label { font-size: 0.825rem; color: #6b6b67; display: block; margin-bottom: 0.4rem; }
        .section-label {
          font-size: 0.78rem; color: #9e9c96; letter-spacing: 0.08em;
          text-transform: uppercase; margin-bottom: 0.75rem;
        }
        .serif {
          font-family: 'Instrument Serif', serif;
          font-weight: 400; letter-spacing: -0.02em; line-height: 1.2;
        }
      `}</style>

      <main style={{ background: '#fafaf9', minHeight: '100vh' }}>

        <Navbar onCTAClick={() => scrollTo('evaluation')} />

        {/* HERO */}
        <section style={{ padding: '6rem 2rem 5rem', maxWidth: '860px', margin: '0 auto', textAlign: 'center' }}>
          <div className="hero-badge">Novo — Agendamento automático para barbearias</div>
          <h1 className="serif" style={{ fontSize: 'clamp(2.6rem, 5vw, 4rem)', color: '#1a1a18', marginBottom: '1.25rem' }}>
            Sua barbearia organizada,{' '}
            <em style={{ fontStyle: 'italic', color: '#2563eb' }}>sem esforço nenhum</em>
          </h1>
          <p style={{ fontSize: '1.05rem', color: '#6b6b67', maxWidth: '500px', margin: '0 auto 2.5rem', lineHeight: 1.7, fontWeight: 300 }}>
            Agendamentos automáticos, clientes organizados e uma página pública própria.
            Tudo que você precisa para focar no que importa.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button className="btn-primary" onClick={() => scrollTo('evaluation')}>Começar agora</button>
            <button className="btn-secondary" onClick={() => router.push('/login')}>Já tenho conta</button>
          </div>
        </section>

        {/* LOGOS BAR */}
        <div style={{ padding: '2.5rem 2rem', borderTop: '0.5px solid #e5e3dd', borderBottom: '0.5px solid #e5e3dd', background: '#f5f4f0' }}>
          <p style={{ textAlign: 'center', fontSize: '0.78rem', color: '#9e9c96', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '1.25rem' }}>
            Funciona com seu negócio desde o primeiro dia
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
            {['Agendamento online', 'Página pública própria', 'Gestão de clientes', 'Planos de assinatura'].map(item => (
              <span key={item} className="logo-pill">{item}</span>
            ))}
          </div>
        </div>

        {/* FEATURES */}
        <section style={{ padding: '5rem 2rem', maxWidth: '1000px', margin: '0 auto' }}>
          <p className="section-label">Recursos</p>
          <h2 className="serif" style={{ fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', marginBottom: '3rem' }}>
            Tudo que sua barbearia<br />precisa em um só lugar
          </h2>
          <div className="features-grid">
            {[
              { icon: '✂️', title: 'Agendamento fácil', desc: 'Seus clientes marcam horário diretamente pela sua página, sem precisar te chamar no WhatsApp.' },
              { icon: '📋', title: 'Gestão de serviços', desc: 'Cadastre cortes, barba e outros serviços com preço e duração. Controle total na sua mão.' },
              { icon: '👤', title: 'Clientes organizados', desc: 'Histórico completo de cada cliente e agendamentos anteriores em um único painel.' },
              { icon: '📊', title: 'Dashboard completo', desc: 'Veja os atendimentos do dia, faturamento e pendências de forma simples e visual.' },
              { icon: '🔗', title: 'Página pública própria', desc: 'Cada barbearia tem sua URL exclusiva. Compartilhe o link e comece a receber agendamentos.' },
              { icon: '💳', title: 'Planos de assinatura', desc: 'Ofereça planos mensais para seus clientes fiéis. Receita recorrente e previsível.' },
            ].map(item => (
              <div key={item.title} className="feature-item">
                <div style={{ width: '40px', height: '40px', background: '#eef2ff', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', fontSize: '1.1rem' }}>
                  {item.icon}
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 500, color: '#1a1a18', marginBottom: '0.4rem' }}>{item.title}</div>
                <div style={{ fontSize: '0.875rem', color: '#6b6b67', lineHeight: 1.65, fontWeight: 300 }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* STEPS */}
        <section style={{ padding: '5rem 2rem', background: '#f5f4f0', borderTop: '0.5px solid #e5e3dd', borderBottom: '0.5px solid #e5e3dd' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <p className="section-label">Como funciona</p>
            <h2 className="serif" style={{ fontSize: 'clamp(1.8rem, 3vw, 2.6rem)' }}>
              Pronto em minutos,<br />não em dias
            </h2>
            <div className="steps-grid">
              {[
                { num: '01', title: 'Crie sua conta', desc: 'Cadastre sua barbearia em menos de 2 minutos. Sem cartão de crédito, sem burocracia.' },
                { num: '02', title: 'Configure seus serviços', desc: 'Adicione seus cortes, preços e horários disponíveis. Seu painel estará pronto para usar.' },
                { num: '03', title: 'Compartilhe o link', desc: 'Envie sua página para os clientes e comece a receber agendamentos automaticamente.' },
              ].map(step => (
                <div key={step.num} style={{ background: '#fff', border: '0.5px solid #e5e3dd', borderRadius: '16px', padding: '1.75rem' }}>
                  <div className="serif" style={{ fontSize: '2.5rem', color: '#e5e3dd', lineHeight: 1, marginBottom: '0.75rem' }}>{step.num}</div>
                  <div style={{ fontSize: '1rem', fontWeight: 500, color: '#1a1a18', marginBottom: '0.4rem' }}>{step.title}</div>
                  <div style={{ fontSize: '0.875rem', color: '#6b6b67', lineHeight: 1.65, fontWeight: 300 }}>{step.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PLANOS */}
        <section style={{ padding: '5rem 2rem', maxWidth: '900px', margin: '0 auto' }} id="plans">
          <p className="section-label">Preços</p>
          <h2 className="serif" style={{ fontSize: 'clamp(1.8rem, 3vw, 2.6rem)' }}>Simples e transparente</h2>
          <div className="plans-grid">

            <div className="plan-card">
              <div style={{ fontSize: '0.85rem', color: '#6b6b67', fontWeight: 500, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Básico</div>
              <div className="serif" style={{ fontSize: '2.5rem', color: '#1a1a18', lineHeight: 1, marginBottom: '0.25rem' }}>R$29</div>
              <div style={{ fontSize: '0.8rem', color: '#9e9c96', marginBottom: '1.5rem' }}>por mês</div>
              <hr style={{ border: 'none', borderTop: '0.5px solid #e5e3dd', marginBottom: '1.25rem' }} />
              <ul className="plan-features" style={{ marginBottom: '1.75rem' }}>
                <li>Página pública com slug</li>
                <li>Até 3 serviços</li>
                <li>Agendamento online</li>
                <li>Painel de controle</li>
              </ul>
              <button className="plan-btn" onClick={() => router.push('/register?plan=basic')}>Começar com Básico</button>
            </div>

            <div className="plan-card featured">
              <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: '#2563eb', color: '#fff', fontSize: '0.75rem', padding: '0.25rem 0.85rem', borderRadius: '100px', whiteSpace: 'nowrap' }}>
                Mais popular
              </div>
              <div style={{ fontSize: '0.85rem', color: '#6b6b67', fontWeight: 500, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Plus</div>
              <div className="serif" style={{ fontSize: '2.5rem', color: '#1a1a18', lineHeight: 1, marginBottom: '0.25rem' }}>R$49</div>
              <div style={{ fontSize: '0.8rem', color: '#9e9c96', marginBottom: '1.5rem' }}>por mês</div>
              <hr style={{ border: 'none', borderTop: '0.5px solid #e5e3dd', marginBottom: '1.25rem' }} />
              <ul className="plan-features" style={{ marginBottom: '1.75rem' }}>
                <li>Tudo do plano Básico</li>
                <li>Serviços ilimitados</li>
                <li>Planos de assinatura</li>
                <li>Suporte prioritário</li>
              </ul>
              <button className="plan-btn featured-btn" onClick={() => router.push('/register?plan=plus')}>Começar com Plus</button>
            </div>

            <div className="plan-card">
              <div style={{ fontSize: '0.85rem', color: '#6b6b67', fontWeight: 500, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Premium</div>
              <div className="serif" style={{ fontSize: '2.5rem', color: '#1a1a18', lineHeight: 1, marginBottom: '0.25rem' }}>R$79</div>
              <div style={{ fontSize: '0.8rem', color: '#9e9c96', marginBottom: '1.5rem' }}>por mês</div>
              <hr style={{ border: 'none', borderTop: '0.5px solid #e5e3dd', marginBottom: '1.25rem' }} />
              <ul className="plan-features" style={{ marginBottom: '1.75rem' }}>
                <li>Tudo do plano Plus</li>
                <li>Multi-barbeiro</li>
                <li>Relatórios avançados</li>
                <li>Personalização avançada</li>
              </ul>
              <button className="plan-btn" onClick={() => router.push('/register?plan=premium')}>Começar com Premium</button>
            </div>

          </div>
        </section>

        {/* TESTIMONIAL */}
        <section style={{ padding: '5rem 2rem', background: '#1a1a18', textAlign: 'center' }}>
          <div style={{ maxWidth: '640px', margin: '0 auto' }}>
            <blockquote className="serif" style={{ fontSize: 'clamp(1.3rem, 2.5vw, 1.75rem)', color: '#fafaf9', fontStyle: 'italic', lineHeight: 1.45, marginBottom: '1.75rem' }}>
              "Antes eu perdia horário toda semana no WhatsApp. Hoje meus clientes agendam sozinhos e eu só apareço pra trabalhar."
            </blockquote>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', color: '#fff', fontWeight: 500 }}>RS</div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '0.9rem', color: '#fafaf9', fontWeight: 500 }}>Rodrigo Silva</div>
                <div style={{ fontSize: '0.8rem', color: '#6b6b67' }}>Proprietário — Barbearia Master</div>
              </div>
            </div>
          </div>
        </section>

        {/* AVALIAÇÃO */}
        <section id="evaluation" style={{ padding: '5rem 2rem', maxWidth: '580px', margin: '0 auto' }}>

          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <p className="section-label">Avaliação gratuita</p>
            <h2 className="serif" style={{ fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', marginBottom: '0.75rem' }}>
              Solicite uma avaliação<br />da sua barbearia
            </h2>
            <p style={{ fontSize: '0.95rem', color: '#6b6b67', fontWeight: 300 }}>
              Nossa equipe analisa seu negócio, e entra em contato com vocė para te indicar o melhor plano para a sua barbearia.
            </p>
          </div>

          {submitted ? (
            <div style={{ background: '#f0fdf4', border: '0.5px solid #86efac', borderRadius: '16px', padding: '2.5rem', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>✅</div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 500, color: '#166534', marginBottom: '0.5rem' }}>Avaliação enviada com sucesso!</h3>
              <p style={{ fontSize: '0.875rem', color: '#16a34a', fontWeight: 300 }}>Nossa equipe entrará em contato em breve.</p>
            </div>
          ) : (
            <div style={{ background: '#fff', border: '0.5px solid #e5e3dd', borderRadius: '16px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

              <div>
                <label className="eval-label">Nome da barbearia</label>
                <input className="eval-input" placeholder="Digite o nome da barbearia" value={companyName} onChange={e => setCompanyName(e.target.value)} />
              </div>

              <div>
                <label className="eval-label">Nome do proprietário</label>
                <input className="eval-input" placeholder="Digite seu nome" value={ownerName} onChange={e => setOwnerName(e.target.value)} />
              </div>

              <div>
                <label className="eval-label">Email</label>
                <input className="eval-input" placeholder="Digite seu email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
              </div>

              <div>
                <label className="eval-label">Telefone</label>
                <input className="eval-input" placeholder="(00) 00000-0000" value={phone} onChange={e => setPhone(e.target.value)} />
              </div>

              <div>
                <label className="eval-label">Média de faturamento mensal</label>
                <select className="eval-input" value={revenue} onChange={e => setRevenue(e.target.value)}>
                  <option value="">Selecione</option>
                  <option>Até R$ 2 mil/mês</option>
                  <option>De R$ 2 mil a R$ 5 mil</option>
                  <option>De R$ 5 mil a R$ 10 mil</option>
                  <option>De R$ 10 mil a R$ 20 mil</option>
                  <option>De R$ 20 mil a R$ 40 mil</option>
                  <option>Mais de R$ 40 mil/mês</option>
                </select>
              </div>

              <button
                className="btn-primary"
                onClick={handleEvaluation}
                disabled={loading}
                style={{ width: '100%', padding: '0.85rem', opacity: loading ? 0.6 : 1 }}
              >
                {loading ? 'Enviando...' : 'Solicitar avaliação gratuita'}
              </button>

            </div>
          )}

        </section>

        {/* FOOTER */}
        <footer style={{ padding: '2rem', borderTop: '0.5px solid #e5e3dd', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div className="serif" style={{ fontSize: '1.1rem', color: '#1a1a18' }}>
            Barber<span style={{ color: '#2563eb' }}>ShopBR</span>
          </div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            {['Termos de uso', 'Privacidade', 'Suporte'].map(link => (
              <a key={link} href="#" style={{ fontSize: '0.8rem', color: '#9e9c96', textDecoration: 'none' }}>{link}</a>
            ))}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#9e9c96' }}>© 2026 BarberShopBR</div>
        </footer>

      </main>
    </>
  )
}