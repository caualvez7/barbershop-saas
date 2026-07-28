import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://fclbjsemjcsdlktgniza.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZjbGJqc2VtamNzZGxrdGduaXphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1MjQ4NzcsImV4cCI6MjA5MTEwMDg3N30.jCINHRMfKBrkCgq1U8liOCCh0kQpa9c6hRtHz6qnZeI'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function inspectAppointments() {
  console.log('--- BUSCANDO TODOS OS AGENDAMENTOS EXISTENTES NO BANCO ---')
  const { data: appts, error: apptsErr } = await supabase.from('appointments').select('*')
  console.log('Agendamentos encontrados (bruto):', appts)
  if (apptsErr) console.error('Erro ao buscar appts:', apptsErr)

  if (appts && appts.length > 0) {
    const shopId = appts[0].barbershop_id
    console.log(`Buscando dashboard para barbershop_id: ${shopId}`)
    
    // Simulate dashboard query
    const { data: dashAppts, error: dashErr } = await supabase
      .from('appointments')
      .select('id, customer_name, customer_whatsapp, date, time, status, payment_status, payment_method, barber_id, service_id, services(name, price)')
      .eq('barbershop_id', shopId)
      .order('time', { ascending: true })
    
    console.log('Dashboard query appts:', dashAppts)
    if (dashErr) console.error('Dashboard query error:', dashErr)
  }
}

inspectAppointments()
