import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://fclbjsemjcsdlktgniza.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZjbGJqc2VtamNzZGxrdGduaXphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1MjQ4NzcsImV4cCI6MjA5MTEwMDg3N30.jCINHRMfKBrkCgq1U8liOCCh0kQpa9c6hRtHz6qnZeI'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function testSimulatedInsert() {
  console.log('--- TESTANDO A BUSCA DE BARBEARIA ---')
  const { data: shops } = await supabase.from('barbershops').select('id, name, slug').limit(10)
  console.log('Barbearias no banco:', shops)

  const shop = shops?.[0]
  if (!shop) return

  const { data: barbers } = await supabase.from('barbers').select('id, name').eq('barbershop_id', shop.id).limit(1)
  const { data: services } = await supabase.from('services').select('id, name').eq('barbershop_id', shop.id).limit(1)

  console.log('Barbeiro encontrado:', barbers?.[0])
  console.log('Serviço encontrado:', services?.[0])

  console.log('\n--- TENTANDO GRAVAR AGENDAMENTO DO DIA 28 NO SUPABASE ---')
  const { data, error } = await supabase.from('appointments').insert({
    barbershop_id: shop.id,
    barber_id: barbers?.[0]?.id || null,
    service_id: services?.[0]?.id || null,
    customer_name: 'Cliente Teste Terça 28',
    customer_whatsapp: '11999998888',
    date: '2026-07-28',
    time: '14:00',
    status: 'Pendente'
  }).select()

  if (error) {
    console.error('\n🔴 O SUPABASE REJEITOU O AGENDAMENTO POR FALTA DE PERMISSÃO (RLS):')
    console.error('Código de Erro:', error.code)
    console.error('Mensagem:', error.message)
  } else {
    console.log('\n🟢 SUCESSO AO INSERIR:', data)
  }
}

testSimulatedInsert()
