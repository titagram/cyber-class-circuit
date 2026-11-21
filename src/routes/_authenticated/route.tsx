import { createFileRoute, Link, Outlet, redirect, useLocation, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { BookOpen, ChevronLeft, ChevronRight, GraduationCap, LogOut, Menu, ShieldCheck, Users, X } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { canAccessAuthenticatedPath } from "@/lib/access";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ThemeToggle } from "@/components/ThemeToggle";

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

const COLLAPSE_KEY = "nr-sidebar-collapsed";

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const sync = () => setIsDesktop(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return isDesktop;
}

function Layout() {
  const { user, isAdmin, rolesLoaded } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [menuOpen, setMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const isDesktop = useIsDesktop();
  const rail = collapsed && isDesktop;
  const isStudent = Boolean(user) && rolesLoaded && !isAdmin;
  const pathAllowed = canAccessAuthenticatedPath(location.pathname, isAdmin);
  const nav = isStudent ? studentNav : adminNav;

  useEffect(() => {
    if (isStudent && !pathAllowed) {
      navigate({ to: "/area-studente", replace: true });
    }
  }, [isStudent, pathAllowed, navigate]);

  useEffect(() => {
    try {
      if (window.localStorage.getItem(COLLAPSE_KEY) === "1") setCollapsed(true);
    } catch {
      /* storage unavailable */
    }
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(COLLAPSE_KEY, next ? "1" : "0");
      } catch {
        /* storage unavailable */
      }
      return next;
    });
  };

  const signOut = async () => {
    const next = isAdmin ? "/classi" : "/area-studente";
    await supabase.auth.signOut({ scope: "local" });
    queryClient.clear();
    window.location.replace(`/auth?next=${encodeURIComponent(next)}`);
  };

  const roleLabel = rolesLoaded ? (isAdmin ? "Admin" : "Studente") : "…";
  const email = user?.email ?? "";

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex min-h-screen min-w-0 flex-col md:flex-row">
        <aside
          className={cn(
            "nr-sidebar sticky top-0 z-30 shrink-0 text-sidebar-foreground md:h-screen md:p-4 md:transition-[width] md:duration-200",
            rail ? "md:w-[72px]" : "md:w-56",
          )}
        >
          <div className="flex h-14 items-center justify-between gap-2 px-4 md:mb-8 md:h-auto md:px-0">
            {rail ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="flex h-8 w-8 items-center justify-center" aria-label="Cybersecurity 101">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                  </span>
                </TooltipTrigger>
                <TooltipContent side="right">Cybersecurity 101</TooltipContent>
              </Tooltip>
            ) : (
              <div className="nr-brand min-w-0">CYBERSECURITY / 101</div>
            )}
            <div className="md:hidden">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setMenuOpen((o) => !o)}
                aria-expanded={menuOpen}
                aria-label={menuOpen ? "Chiudi menu" : "Apri menu"}
              >
                {menuOpen ? <X /> : <Menu />}
              </Button>
            </div>
          </div>

          <button
            type="button"
            onClick={toggleCollapsed}
            aria-expanded={!collapsed}
            aria-label={collapsed ? "Espandi barra laterale" : "Comprimi barra laterale"}
            className="absolute -right-3 top-16 z-40 hidden h-6 w-6 items-center justify-center border border-sidebar-border bg-sidebar-accent text-sidebar-primary hover:text-primary md:flex"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>

          <div
            className={cn(
              "border-t border-sidebar-border px-4 pb-4 md:flex md:h-[calc(100%-4rem)] md:flex-col md:border-0 md:p-0",
              menuOpen ? "block" : "hidden",
            )}
          >
            <nav aria-label="Navigazione principale" className="flex-1 space-y-1 pt-3 md:pt-0">
              {nav.map((n) => {
                const link = (
                  <Link
                    key={n.to}
                    to={n.to}
                    onClick={() => setMenuOpen(false)}
                    aria-label={n.label}
                    className={cn(
                      "nr-nav-link flex items-center gap-2 px-3 py-2.5 text-base hover:bg-sidebar-accent md:py-2",
                      rail ? "justify-center px-0" : "",
                    )}
                    activeProps={{ "aria-current": "page" }}
                  >
                    <n.icon className="h-4 w-4" />
                    {rail ? null : n.label}
                  </Link>
                );
                if (!rail) return link;
                return (
                  <Tooltip key={n.to}>
                    <TooltipTrigger asChild>{link}</TooltipTrigger>
                    <TooltipContent side="right">{n.label}</TooltipContent>
                  </Tooltip>
                );
              })}
            </nav>

            {rail ? (
              <div className="mt-4 flex flex-col items-center gap-2 border-t border-sidebar-border pt-4 md:mt-0">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="flex h-8 w-8 items-center justify-center border border-sidebar-border font-mono text-xs uppercase text-sidebar-primary">
                      {email ? email.slice(0, 1) : "?"}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    {email} · {roleLabel}
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <ThemeToggle collapsed />
                  </TooltipTrigger>
                  <TooltipContent side="right">Cambia tema</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="icon" variant="ghost" onClick={signOut} aria-label="Esci">
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">Esci</TooltipContent>
                </Tooltip>
              </div>
            ) : (
              <div className="mt-4 space-y-2 border-t border-sidebar-border pt-4 text-xs md:mt-0">
                <div className="truncate">{email}</div>
                <div className="font-mono uppercase text-sidebar-primary">{roleLabel}</div>
                <ThemeToggle className="w-full" />
                <Button size="sm" variant="ghost" className="w-full justify-start px-2" onClick={signOut}>
                  <LogOut className="h-4 w-4" /> Esci
                </Button>
              </div>
            )}
          </div>
        </aside>
        <main className="min-w-0 flex-1 px-4 pb-8 pt-5 sm:px-6 lg:p-8">
          {!rolesLoaded || (isStudent && !pathAllowed) ? (
            <p className="text-muted-foreground">Caricamento…</p>
          ) : (
            <Outlet />
          )}
        </main>
      </div>
    </TooltipProvider>
  );
}
