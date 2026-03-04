import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'
  const error = searchParams.get('error')

  // Handle OAuth error
  if (error) {
    return NextResponse.redirect(
      `${origin}/auth/success?error=${encodeURIComponent(error)}`
    )
  }

  if (code) {
    const cookieStore = await cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (exchangeError) {
      return NextResponse.redirect(
        `${origin}/auth/success?error=${encodeURIComponent(exchangeError.message)}`
      )
    }

    // Get display name for greeting
    let displayName = data.user?.email?.split('@')[0] || '用户'
    if (data.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('id', data.user.id)
        .single()

      if (profile?.display_name) {
        displayName = profile.display_name
      }
    }

    // Redirect to the success page with display params
    const successUrl = new URL('/auth/success', origin)
    successUrl.searchParams.set('name', displayName)
    successUrl.searchParams.set('next', next)
    return NextResponse.redirect(successUrl)
  }

  // No code provided - redirect to home
  return NextResponse.redirect(`${origin}/`)
}
