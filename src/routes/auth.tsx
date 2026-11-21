import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { HudNotice, HudPanel, HudTextField } from "@/design-system/nightrunner";
import { useAuth } from "@/hooks/useAuth";
import { ThemeToggle } from "@/components/ThemeToggle";

function safeNext(n: unknown) {
  return typeof n === "string" && n.startsWith("/") && !n.startsWith("//") ? n : "/classi";
}

export const Route = createFileRoute("/auth")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>) => ({ next: safeNext(s["next"]) }),
  head: () => ({
    meta: [
      { title: "Accedi — Cybersecurity 101" },
      { name: "description", content: "Accedi al pannello amministratore di Cybersecurity 101." },
      { property: "og:title", content: "Accedi — Cybersecurity 101" },
      { property: "og:description", content: "Accedi al pannello amministratore di Cybersecurity 101." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { next } = Route.useSearch();
  const { session } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (session) window.location.href = next;
  }, [session, next]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) toast.error(error.message === "Invalid login credentials" ? "Email o password non corrette" : error.message);
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin },
      });
      if (error) toast.error(error.message);
      else if (!data.session) setSent(true);
    }
    setBusy(false);
  }

  return (
    <div className="relative grid min-h-screen md:grid-cols-2">
      <div className="absolute right-4 top-4 z-10">
        <ThemeToggle />
      </div>
      <div className="hidden flex-col justify-between border-r p-10 md:flex">
        <div className="nr-brand">CYBERSECURITY / 101</div>
        <div>
          <h1 className="text-5xl font-bold leading-tight">Cybersecurity 101</h1>
          <p className="mt-4 max-w-sm text-muted-foreground">
            Classi, studenti e percorsi di formazione sulla sicurezza informatica, in un unico pannello.
          </p>
        </div>
        <div className="font-mono text-xs text-muted-foreground">Classi · Studenti · Corsi</div>
      </div>
      <div className="flex items-center justify-center px-5 py-10 sm:p-6">
        <HudPanel className="w-full max-w-md">
          {sent ? (
            <div className="space-y-4">
              <div className="nr-brand mb-6 md:hidden">CYBERSECURITY / 101</div>
              <h2 className="text-2xl font-semibold">Controlla la tua email</h2>
              <p className="text-sm text-muted-foreground">
                Abbiamo inviato un link di conferma a {email}. Aprilo per attivare l'account, poi accedi.
              </p>
              <Button variant="outline" className="w-full" onClick={() => { setSent(false); setMode("login"); }}>
                Torna all'accesso
              </Button>
            </div>
          ) : (
            <form onSubmit={submit} className="w-full space-y-4">
              <div className="nr-brand mb-6 md:hidden">CYBERSECURITY / 101</div>
              <h2 className="text-2xl font-semibold">{mode === "login" ? "Accedi" : "Crea account"}</h2>
              {mode === "signup" && (
                <HudNotice tone="info">Il primo account creato diventa amministratore della piattaforma.</HudNotice>
              )}
              <HudTextField label="Email" id="email" type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} />
              <HudTextField label="Password" id="pw" type="password" minLength={6} autoComplete={mode === "login" ? "current-password" : "new-password"} required value={password} onChange={(e) => setPassword(e.target.value)} />
              <Button type="submit" className="w-full" disabled={busy}>
                {busy ? "Attendere…" : mode === "login" ? "Accedi" : "Crea account"}
              </Button>
              <Button type="button" variant="ghost" className="w-full" onClick={() => setMode(mode === "login" ? "signup" : "login")}>
                {mode === "login" ? "Non hai un account? Registrati" : "Hai già un account? Accedi"}
              </Button>
            </form>
          )}
        </HudPanel>
      </div>
    </div>
  );
}
