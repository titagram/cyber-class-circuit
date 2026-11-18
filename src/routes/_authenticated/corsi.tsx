import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { HudPanel } from "@/design-system/nightrunner";
import { EmptyState, PageHeader } from "@/components/PageHeader";

export const Route = createFileRoute("/_authenticated/corsi")({
  head: () => ({
    meta: [
      { title: "Corsi — Cybersecurity 101" },
      { name: "description", content: "Corsi e capitoli disponibili sulla piattaforma." },
      { property: "og:title", content: "Corsi — Cybersecurity 101" },
      { property: "og:description", content: "Corsi e capitoli disponibili sulla piattaforma." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CorsiPage,
});

function CorsiPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["courses", "full"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("id, title, description, chapters(id, title, position), class_courses(classes(name))")
        .order("title");
      if (error) throw error;
      return data;
    },
  });
  return (
    <div>
      <PageHeader title="Corsi" subtitle="Corsi e capitoli disponibili. Si collegano alle classi dalla pagina della classe." />
      {isLoading ? (
        <p className="text-muted-foreground">Caricamento…</p>
      ) : !data?.length ? (
        <EmptyState title="Nessun corso ancora">I corsi e i loro capitoli compariranno qui appena verranno pubblicati.</EmptyState>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {data.map((c) => {
            const chapters = [...c.chapters].sort((a, b) => a.position - b.position);
            const classes = c.class_courses.map((x) => x.classes?.name).filter(Boolean);
            return (
              <HudPanel key={c.id} heading={c.title}>
                {c.description && <p className="mb-3 text-sm text-muted-foreground">{c.description}</p>}
                <ol className="list-decimal space-y-1 pl-5 text-sm">
                  {chapters.map((ch) => <li key={ch.id}>{ch.title}</li>)}
                </ol>
                {!chapters.length && <p className="text-sm text-muted-foreground">Nessun capitolo.</p>}
                <p className="mt-4 text-xs text-muted-foreground">Classi: {classes.length ? classes.join(", ") : "nessuna"}</p>
              </HudPanel>
            );
          })}
        </div>
      )}
    </div>
  );
}
