import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Next.js 16 Proxy (Middleware)
 * 处理全局会话同步与 Cookies 刷新
 */
export default async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            // 在请求中设置
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))

            // 在响应中同步设置
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

    // 刷新会话，确保 Cookies 与 Supabase 同步
    // 必须包裹在 try-catch 中，防止未登录状态下抛出错误导致 500
    await supabase.auth.getUser()
  } catch (e) {
    // 捕获异常，确保请求继续流转（例如登录页请求）
    console.error('Proxy auth sync error:', e)
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
