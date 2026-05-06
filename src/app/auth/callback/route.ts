import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'
import type { SupabaseClient, User } from '@supabase/supabase-js'
import { getAuthAvatarUrl, getAuthDisplayName, getSafeRedirectPath } from '@/lib/auth'

async function syncOAuthProfile(supabase: SupabaseClient, user: User) {
  const displayName = getAuthDisplayName(user)
  const avatarUrl = getAuthAvatarUrl(user)
  const lastSignInAt = new Date().toISOString()

  const { data: profile } = await supabase
    .from('profiles')
    .select('email, display_name, avatar_url')
    .eq('id', user.id)
    .maybeSingle()

  if (!profile) {
    await supabase.from('profiles').insert({
      id: user.id,
      email: user.email,
      display_name: displayName,
      avatar_url: avatarUrl,
      card_bg: 'default',
      last_sign_in_at: lastSignInAt,
    })
    return displayName
  }

  const updates: Record<string, string | null> = {
    last_sign_in_at: lastSignInAt,
  }

  if (user.email && profile.email !== user.email) {
    updates.email = user.email
  }

  if (!profile.display_name && displayName) {
    updates.display_name = displayName
  }

  if (!profile.avatar_url && avatarUrl) {
    updates.avatar_url = avatarUrl
  }

  await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id)

  return profile.display_name || displayName
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const code = searchParams.get('code')
  const next = getSafeRedirectPath(searchParams.get('next'))
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

    const displayName = data.user
      ? await syncOAuthProfile(supabase, data.user)
      : '用户'

    // Redirect to the success page with display params
    const successUrl = new URL('/auth/success', origin)
    successUrl.searchParams.set('name', displayName)
    successUrl.searchParams.set('next', next)
    return NextResponse.redirect(successUrl)
  }

  // No code provided - redirect to home
  return NextResponse.redirect(`${origin}/`)
}
