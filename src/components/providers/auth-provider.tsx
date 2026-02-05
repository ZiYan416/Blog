"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

interface AuthState {
  user: User | null;
  profile: any | null;
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
  initialProfile: any | null;
}) {
  const [state, setState] = useState<AuthState>({
    user: initialUser,
    profile: initialProfile,
    isAdmin: initialProfile?.is_admin || false,
    loading: false, // Initial state is loaded from server
  });

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // When router.refresh() updates server components, these props might change.
    // We need to sync them to our local state to reflect changes (like avatar updates) immediately.
    if (initialProfile) {
        setState(prev => ({
            ...prev,
            profile: initialProfile,
            isAdmin: initialProfile?.is_admin || false
        }));
    }
  }, [initialProfile]);

  useEffect(() => {
    // Sync with client-side events
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth State Change:", event);

      if (event === "SIGNED_OUT") {
        setState({
          user: null,
          profile: null,
          isAdmin: false,
          loading: false,
        });
        router.refresh();
        return;
      }

      if (session?.user) {
        // If the session user is different from current state, update
        if (session.user.id !== state.user?.id) {
            // Fetch new profile
            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();

            setState({
                user: session.user,
                profile,
                isAdmin: profile?.is_admin || false,
                loading: false
            });
            router.refresh();
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [state.user?.id, router]);

  return (
    <AuthContext.Provider value={state}>
      {children}
    </AuthContext.Provider>
  );
}
