"use client"

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

interface AuthState {
  user: any | null
  profile: any | null
  loading: boolean
  isAdmin: boolean
}

export function useUser() {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: true,
    isAdmin: false
  })

  useEffect(() => {
    const supabase = createClient()

    const fetchUserAndProfile = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser()

        if (userError || !user) {
          setState({ user: null, profile: null, loading: false, isAdmin: false })
          return
        }

        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        setState({
          user,
          profile: profileData || null,
          loading: false,
          isAdmin: profileData?.is_admin || false
        })
      } catch (error) {
        console.error('Error fetching auth state:', error)
        setState(prev => ({ ...prev, loading: false }))
      }
    }

    fetchUserAndProfile()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth event:', event)

      if (event === 'SIGNED_OUT' || !session?.user) {
        // 立即清除状态，不再使用 setTimeout
        setState({ user: null, profile: null, loading: false, isAdmin: false })
        return
      }

      if (session.user) {
        // 获取最新的 profile 并一次性更新状态
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        setState({
          user: session.user,
          profile: profileData || null,
          loading: false,
          isAdmin: profileData?.is_admin || false
        })
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  return state
}

export function useSession() {
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
      setLoading(false)
    }
    fetchSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  return { session, loading }
}
