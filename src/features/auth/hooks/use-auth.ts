"use client"

import { useAuth } from "@/features/auth/components/auth-provider"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Session } from "@supabase/supabase-js"

export function useUser() {
  return useAuth()
}

export function useSession() {
  const [session, setSession] = useState<Session | null>(null)
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
