"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import type { Profile } from "@/lib/types";

interface AuthState {
  user: User | null;
  profile: Profile | null;
  isAdmin: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthState>({
  user: null,
  profile: null,
  isAdmin: false,
  loading: true,
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({
  children,
  initialUser,
  initialProfile,
}: {
  children: React.ReactNode;
  initialUser: User | null;
  initialProfile: Profile | null;
}) {
  const [sessionState, setSessionState] = useState<AuthState | null>(null);
  const state = sessionState || {
    user: initialUser,
    profile: initialProfile,
    isAdmin: initialProfile?.is_admin || false,
    loading: false,
  };

  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    // Sync with client-side events
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT") {
        setSessionState({
          user: null,
          profile: null,
          isAdmin: false,
          loading: false,
        });
        router.refresh();
        return;
      }

      if (event === "INITIAL_SESSION") return;

      if (session?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        setSessionState({
          user: session.user,
          profile,
          isAdmin: profile?.is_admin || false,
          loading: false,
        });
        router.refresh();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router, supabase]);

  return (
    <AuthContext.Provider value={state}>
      {children}
    </AuthContext.Provider>
  );
}
