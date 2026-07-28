"use client"

import type { User } from "@supabase/supabase-js"
import type { Profile } from "@/db/database.types"
import { AuthProvider } from "./auth-provider"

export function AppProviders({
  children,
  initialUser = null,
  initialProfile = null,
}: {
  children: React.ReactNode
  initialUser?: User | null
  initialProfile?: Profile | null
}) {
  return (
    <AuthProvider
      initialUser={initialUser}
      initialProfile={initialProfile}
    >
      {children}
    </AuthProvider>
  )
}
