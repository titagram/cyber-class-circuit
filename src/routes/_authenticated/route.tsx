import { createFileRoute, Link, Outlet, redirect, useLocation, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { BookOpen, GraduationCap, LogOut, Menu, Users, X } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { canAccessAuthenticatedPath } from "@/lib/access";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) throw redirect({ to: "/auth", search: { next: location.href } });
  },
  component: Layout,
});

const adminNav = [
  { to: "/classi", label: "Classi", icon: GraduationCap },
  { to: "/studenti", label: "Studenti", icon: Users },
  { to: "/corsi", label: "Corsi", icon: BookOpen },
] as const;

const studentNav = [{ to: "/area-studente", label: "I miei corsi", icon: BookOpen }] as const;

function Layout() {
  const { user, isAdmin, rolesLoaded } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [menuOpen, setMenuOpen] = useState(false);
  const isStudent = rolesLoaded && !isAdmin;
  const pathAllowed = canAccessAuthenticatedPath(location.pathname, isAdmin);
  const nav = isStudent ? studentNav : adminNav;

  useEffect(() => {
    if (isStudent && !pathAllowed) {
      navigate({ to: "/area-studente", replace: true });
    }
  }, [isStudent, pathAllowed, navigate]);

  const signOut = async () => {
    await supabase.auth.signOut();
    queryClient.clear();
    navigate({ to: "/auth", search: { next: isAdmin ? "/classi" : "/area-studente" } });
  };

  return (
    <div className="flex min-h-screen min-w-0 flex-col md:flex-row">
      <aside className="nr-sidebar sticky top-0 z-30 shrink-0 text-sidebar-foreground md:h-screen md:w-56 md:p-4">
        <div className="flex h-14 items-center justify-between gap-2 px-4 md:mb-8 md:h-auto md:px-0">
          <div className="nr-brand min-w-0">CYBERSECURITY / 101</div>
          <div className="md:hidden"><Button size="icon" variant="ghost" onClick={() => setMenuOpen((o) => !o)} aria-expanded={menuOpen} aria-label={menuOpen ? "Chiudi menu" : "Apri menu"}>
            {menuOpen ? <X /> : <Menu />}
          </Button></div>
        </div>
        <div className={`${menuOpen ? "block" : "hidden"} border-t border-sidebar-border px-4 pb-4 md:flex md:h-[calc(100%-4rem)] md:flex-col md:border-0 md:p-0`}>
          <nav aria-label="Navigazione principale" className="flex-1 space-y-1 pt-3 md:pt-0">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setMenuOpen(false)}
                className="nr-nav-link flex items-center gap-2 px-3 py-2.5 text-base hover:bg-sidebar-accent md:py-2"
                activeProps={{ "aria-current": "page" }}
              >
                <n.icon className="h-4 w-4" />
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="mt-4 space-y-2 border-t border-sidebar-border pt-4 text-xs md:mt-0">
            <div className="truncate">{user?.email}</div>
            <div className="font-mono uppercase text-sidebar-primary">{rolesLoaded ? (isAdmin ? "Admin" : "Studente") : "…"}</div>
            <Button size="sm" variant="ghost" className="w-full justify-start px-2" onClick={signOut}>
              <LogOut className="h-4 w-4" /> Esci
            </Button>
          </div>
        </div>
      </aside>
      <main className="min-w-0 flex-1 px-4 pb-8 pt-5 sm:px-6 lg:p-8">
        {!rolesLoaded || (isStudent && !pathAllowed) ? <p className="text-muted-foreground">Caricamento…</p> : <Outlet />}
      </main>
    </div>
  );
}
