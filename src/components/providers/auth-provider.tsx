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
  initialUser = null,
  initialProfile = null,
}: {
  children: React.ReactNode;
  initialUser?: User | null;
  initialProfile?: Profile | null;
}) {
  const [sessionState, setSessionState] = useState<AuthState | null>(null);
  const state = sessionState || {
    user: initialUser,
    profile: initialProfile,
    isAdmin: initialProfile?.is_admin || false,
    loading: !initialUser && !initialProfile,
  };

  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    let active = true;

    const syncSession = async (user: User | null) => {
      if (!active) return;

      if (!user) {
        setSessionState({
          user: null,
          profile: null,
          isAdmin: false,
          loading: false,
        });
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (!active) return;
      setSessionState({
        user,
        profile,
        isAdmin: profile?.is_admin || false,
        loading: false,
      });
    };

    void supabase.auth.getSession().then(({ data }) => {
      void syncSession(data.session?.user || null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      window.setTimeout(() => {
        void syncSession(session?.user || null);
        if (event !== "INITIAL_SESSION") router.refresh();
      }, 0);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [router, supabase]);

  return (
    <AuthContext.Provider value={state}>
      {children}
    </AuthContext.Provider>
  );
}
