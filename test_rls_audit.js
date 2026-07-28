import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://fclbjsemjcsdlktgniza.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZjbGJqc2VtamNzZGxrdGduaXphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1MjQ4NzcsImV4cCI6MjA5MTEwMDg3N30.jCINHRMfKBrkCgq1U8liOCCh0kQpa9c6hRtHz6qnZeI'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function testPublicInsert() {
  console.log('--- TESTANDO INSERÇÃO SEM AUTH (ANON) ---')
  const { data: shop } = await supabase.from('barbershops').select('id').limit(1).single()
  const { data: barber } = await supabase.from('barbers').select('id').limit(1).single()
  const { data: service } = await supabase.from('services').select('id').limit(1).single()

  const payload = {
    barbershop_id: shop.id,
    barber_id: barber.id,
    service_id: service.id,
    customer_name: 'Teste Diagnóstico RLS',
    customer_whatsapp: '11999999999',
    date: '2026-07-27',
    time: '18:00',
    status: 'Pendente'
  }

  const { data, error } = await supabase.from('appointments').insert(payload).select()
  if (error) {
    console.error('RESULTADO: BLOQUEADO PELO BANCO SUPABASE (RLS)!')
    console.error('Código de erro:', error.code)
    console.error('Mensagem:', error.message)
  } else {
    console.log('RESULTADO: SUCESSO! Inserido com ID:', data[0].id)
  }
}

testPublicInsert()
