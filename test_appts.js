import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://fclbjsemjcsdlktgniza.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZjbGJqc2VtamNzZGxrdGduaXphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1MjQ4NzcsImV4cCI6MjA5MTEwMDg3N30.jCINHRMfKBrkCgq1U8liOCCh0kQpa9c6hRtHz6qnZeI'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function checkAppointments() {
  console.log('--- BUSCANDO TODOS OS AGENDAMENTOS REGISTRADOS NO SUPABASE ---')
  const { data, error } = await supabase
    .from('appointments')
    .select('id, customer_name, customer_whatsapp, date, time, status, barbershop_id, created_at')
    .order('created_at', { ascending: false })
    .limit(10)

  if (error) {
    console.error('Erro ao buscar agendamentos:', error)
  } else {
    console.log('Últimos 10 agendamentos encontrados no banco:', JSON.stringify(data, null, 2))
  }
}

checkAppointments()
