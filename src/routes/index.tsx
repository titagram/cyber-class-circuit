import { createFileRoute, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Cybersecurity 101 — Piattaforma didattica" },
      { name: "description", content: "Gestisci classi, studenti e corsi della piattaforma Cybersecurity 101." },
      { property: "og:title", content: "Cybersecurity 101 — Piattaforma didattica" },
      { property: "og:description", content: "Gestisci classi, studenti e corsi della piattaforma Cybersecurity 101." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    throw redirect(data.session ? { to: "/classi" } : { to: "/auth", search: { next: "/classi" } });
  },
});
