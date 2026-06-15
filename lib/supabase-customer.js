import { createBrowserClient } from '@supabase/ssr'

export const supabaseCustomer = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
      storageKey: 'sb-customer-auth-token',
    },
    cookieOptions: {
      name: 'sb-customer-auth',
    }
  }
)
