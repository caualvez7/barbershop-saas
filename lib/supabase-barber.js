import { createBrowserClient } from '@supabase/ssr'

export const supabaseBarber = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
      storageKey: 'sb-barber-auth-token',
    },
    cookieOptions: {
      name: 'sb-barber-auth',
    }
  }
)
