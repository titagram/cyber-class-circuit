import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type AuthCtx = { session: Session | null; user: User | null; isAdmin: boolean; rolesLoaded: boolean; loading: boolean };
const Ctx = createContext<AuthCtx>({ session: null, user: null, isAdmin: false, rolesLoaded: false, loading: true });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [rolesLoaded, setRolesLoaded] = useState(false);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const uid = session?.user.id;
    setRolesLoaded(false);
    if (!uid) {
      setIsAdmin(false);
      setRolesLoaded(true);
      return;
    }
    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", uid)
      .then(({ data }) => {
        setIsAdmin((data ?? []).some((r) => r.role === "admin"));
        setRolesLoaded(true);
      });
  }, [session?.user.id]);

  return (
    <Ctx.Provider value={{ session, user: session?.user ?? null, isAdmin, rolesLoaded, loading }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);
