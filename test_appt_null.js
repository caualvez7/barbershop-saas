import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://fclbjsemjcsdlktgniza.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZjbGJqc2VtamNzZGxrdGduaXphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1MjQ4NzcsImV4cCI6MjA5MTEwMDg3N30.jCINHRMfKBrkCgq1U8liOCCh0kQpa9c6hRtHz6qnZeI'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function testInsertAndSelect() {
  console.log('--- TESTANDO INSERÇÃO EM APPOINTMENTS ---')
  const { data: shops } = await supabase.from('barbershops').select('id, name').limit(1)
  const shop = shops?.[0]
  console.log('Barbearia encontrada:', shop)

  const { data: barbers } = await supabase.from('barbers').select('id, name').limit(1)
  const barber = barbers?.[0]

  const { data: services } = await supabase.from('services').select('id, name').limit(1)
  const service = services?.[0]

  console.log('Tentando insert como anon...')
  const { data: insertData, error: insertError } = await supabase.from('appointments').insert({
    barbershop_id: shop?.id,
    barber_id: barber?.id,
    service_id: service?.id,
    customer_name: 'Teste Cliente RLS',
    customer_whatsapp: '11999999999',
    date: '2026-07-27',
    time: '14:00',
    status: 'Pendente'
  }).select()

  if (insertError) {
    console.error('ERRO NO INSERT DE APPOINTMENTS (RLS):', insertError)
  } else {
    console.log('INSERT SUCESSO:', insertData)
  }
}

testInsertAndSelect()
