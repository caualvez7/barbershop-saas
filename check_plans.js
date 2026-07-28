import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://fclbjsemjcsdlktgniza.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZjbGJqc2VtamNzZGxrdGduaXphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1MjQ4NzcsImV4cCI6MjA5MTEwMDg3N30.jCINHRMfKBrkCgq1U8liOCCh0kQpa9c6hRtHz6qnZeI'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
const SHOP_ID = 'fa0e4135-9dc7-40ef-9997-09b4b921dfd7'

async function test() {
  // Test with wildcard join (used in client pages)
  const { data, error } = await supabase
    .from('plans')
    .select('*, plan_services(*)')
    .eq('barbershop_id', SHOP_ID)
    .eq('active', true)
  console.log('Result:', data, error)
}
test()
