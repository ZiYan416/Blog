import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from '@/lib/types'

export default async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const isAuth = request.nextUrl.pathname.startsWith('/auth')
  const isDashboard = request.nextUrl.pathname.startsWith('/dashboard')
  const isProfile = request.nextUrl.pathname.startsWith('/profile')
  const isAdmin = request.nextUrl.pathname.startsWith('/admin')
  const isRegisterPage = request.nextUrl.pathname.startsWith('/register')

  if (isAuth || isDashboard || isProfile || isAdmin || isRegisterPage) {
    let user = null
    try {
      const { data } = await supabase.auth.getUser()
      user = data.user
    } catch {
      // 捕获 "Invalid Refresh Token" 等错误，防止中间件崩溃
      // 视为未登录状态，后续逻辑会处理重定向
    }

    // 1. 未登录用户访问受保护页面 -> 重定向到首页
    if (!user && (isDashboard || isProfile || isAdmin)) {
      const url = request.nextUrl.clone()
      const next = `${request.nextUrl.pathname}${request.nextUrl.search}`
      url.pathname = '/'
      url.search = ''
      url.searchParams.set('next', next)
      return NextResponse.redirect(url)
    }

    // 2. 已登录用户访问注册页 -> 重定向到控制台
    if (user && (isRegisterPage)) {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }
  } else {
    // 非保护路由也刷新 session，确保 auth token 持续有效
    await supabase.auth.getUser()
  }

  return response
}

export const config = {
  matcher: [
    // API routes validate/refresh their own sessions. Public pages still pass
    // through the proxy so the navbar receives a fresh session, while all
    // static assets (especially large hero videos) bypass Supabase entirely.
    '/((?!api(?:/|$)|_next/static|_next/image|favicon.ico|.*\\.(?:avif|css|eot|gif|ico|jpeg|jpg|js|map|mp4|ogg|otf|pdf|png|svg|ttf|webm|webp|woff|woff2)$).*)',
  ],
}
