"use client"

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

export function useUser() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    const fetchUserAndProfile = async () => {
      try {
        setLoading(true)
        const { data: { user }, error: userError } = await supabase.auth.getUser()

        if (userError || !user) {
          setUser(null)
          setProfile(null)
          return
        }

        setUser(user)

        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (profileError) {
          console.error('Error fetching profile:', profileError)
          // Even if profile fails, we have the user
          setProfile(null)
        } else {
          setProfile(profileData)
        }
      } catch (error) {
        console.error('Error in fetchUserAndProfile:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserAndProfile()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth event:', event)

      if (session?.user) {
        setUser(session.user)
        try {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()

          if (!profileError) {
            setProfile(profileData)
          } else {
            setProfile(null)
          }
        } catch (e) {
          setProfile(null)
        }
      } else {
        setUser(null)
        setProfile(null)
      }

      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  return { user, profile, loading, isAdmin: profile?.is_admin || false }
}

export function useSession() {
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    const fetchSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) {
        console.error('Error fetching session:', error)
      } else {
        setSession(session)
      }
      setLoading(false)
    }
    fetchSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  return { session, loading }
}
