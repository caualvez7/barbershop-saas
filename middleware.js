import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function middleware(request) {
  // 1. Otimização crítica: Se for requisição de prefetch do Next.js, 
  // não precisamos verificar/atualizar sessão para evitar concorrência no refresh token
  const isPrefetch = request.headers.get('next-router-prefetch') === '1' || 
                     request.headers.get('purpose') === 'prefetch'

  if (isPrefetch) {
    return NextResponse.next({ request })
  }

  let response = NextResponse.next({ request })

  const isCustomerRoute = request.nextUrl.pathname.startsWith('/barber')
  const cookieName = isCustomerRoute ? 'sb-customer-auth' : 'sb-barber-auth'

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookieOptions: {
        name: cookieName,
      },
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', request.nextUrl.pathname)
    
    // Cria a resposta de redirecionamento
    const redirectResponse = NextResponse.redirect(loginUrl)
    
    // Propaga os cookies gerados pelo Supabase (limpeza de tokens) para o redirecionamento
    response.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value, {
        path: cookie.path,
        domain: cookie.domain,
        maxAge: cookie.maxAge,
        expires: cookie.expires,
        secure: cookie.secure,
        httpOnly: cookie.httpOnly,
        sameSite: cookie.sameSite,
      })
    })
    
    return redirectResponse
  }

  return response
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/barber/:slug/plans',
    '/barber/:slug/scheduling',
    '/barber/:slug/checkout',
  ],
}