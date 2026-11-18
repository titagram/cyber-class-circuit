import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Users, BookOpen } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ClassDialog } from "@/components/ClassDialog";
import { EmptyState, PageHeader } from "@/components/PageHeader";

export const Route = createFileRoute("/_authenticated/classi/")({
  head: () => ({
    meta: [
      { title: "Classi — Cybersecurity 101" },
      { name: "description", content: "Crea e gestisci le classi della piattaforma." },
      { property: "og:title", content: "Classi — Cybersecurity 101" },
      { property: "og:description", content: "Crea e gestisci le classi della piattaforma." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ClassiPage,
});

function ClassiPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const { data, isLoading } = useQuery({
    queryKey: ["classes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("classes")
        .select("id, name, description, class_students(count), class_courses(count)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
  const create = useMutation({
    mutationFn: async (v: { name: string; description: string }) => {
      const { error } = await supabase.from("classes").insert({ name: v.name, description: v.description || null });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Classe creata");
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["classes"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div>
      <PageHeader
        title="Classi"
        subtitle="Gruppi di studenti a cui collegare i corsi."
        actions={<Button onClick={() => setOpen(true)}><Plus /> Nuova classe</Button>}
      />
      {isLoading ? (
        <p className="text-muted-foreground">Caricamento…</p>
      ) : !data?.length ? (
        <EmptyState title="Nessuna classe ancora">
          Crea la prima classe, poi aggiungi gli studenti.
          <div className="mt-4"><Button onClick={() => setOpen(true)}><Plus /> Nuova classe</Button></div>
        </EmptyState>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {data.map((c) => (
            <Link key={c.id} to="/classi/$id" params={{ id: c.id }} className="nr-app-card block border p-5 transition-colors hover:border-accent">
              <h3 className="text-xl text-accent">{c.name}</h3>
              {c.description && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{c.description}</p>}
              <div className="mt-4 flex gap-4 text-sm">
                <span className="flex items-center gap-1"><Users className="h-4 w-4" /> {c.class_students[0]?.count ?? 0} studenti</span>
                <span className="flex items-center gap-1"><BookOpen className="h-4 w-4" /> {c.class_courses[0]?.count ?? 0} corsi</span>
              </div>
            </Link>
          ))}
        </div>
      )}
      {open && <ClassDialog open={open} onOpenChange={setOpen} onSave={(v) => create.mutate(v)} busy={create.isPending} />}
    </div>
  );
}
