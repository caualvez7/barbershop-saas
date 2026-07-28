import { createBrowserClient } from '@supabase/ssr'

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
      storageKey: 'sb-barbershop-auth',
    }
  }
)

// aliases para compatibilidade — apontam para o mesmo cliente
export const supabaseBarber = supabase
export const supabaseCustomer = supabase