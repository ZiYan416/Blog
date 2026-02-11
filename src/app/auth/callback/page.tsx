import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AuthCallbackClient from './auth-callback-client'

export default async function AuthCallbackPage(props: {
  searchParams: Promise<{ code?: string; error?: string; type?: string; next?: string }>
}) {
  const searchParams = await props.searchParams
  const supabase = await createClient()

  // Handle error display - redirect to home with error message
  if (searchParams.error) {
    redirect(`/?error=${encodeURIComponent(searchParams.error)}`)
  }

  // Handle OAuth/Email code exchange
  if (searchParams.code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(searchParams.code)
    if (error) {
      redirect(`/?error=${encodeURIComponent(error.message)}`)
    }

    // Get user profile to show personalized greeting
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

    const next = searchParams.next || '/dashboard'

    // Pass data to client component for toast and redirect
    return <AuthCallbackClient displayName={displayName} redirectTo={next} />
  }

  // No code or error - redirect to home
  redirect('/')
}
