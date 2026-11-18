import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { HudTextField } from "@/design-system/nightrunner";
import { EmptyState, PageHeader } from "@/components/PageHeader";

export const Route = createFileRoute("/_authenticated/studenti")({
  head: () => ({
    meta: [
      { title: "Studenti — Cybersecurity 101" },
      { name: "description", content: "Anagrafica studenti e iscrizione alle classi." },
      { property: "og:title", content: "Studenti — Cybersecurity 101" },
      { property: "og:description", content: "Anagrafica studenti e iscrizione alle classi." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: StudentiPage,
});

type Student = { id: string; first_name: string; last_name: string; email: string | null; class_students: { class_id: string; classes: { id: string; name: string } | null }[] };

function StudentiPage() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<Student | "new" | null>(null);
  const [deleting, setDeleting] = useState<Student | null>(null);
  const { data, isLoading } = useQuery({
    queryKey: ["students", "full"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("students")
        .select("id, first_name, last_name, email, class_students(class_id, classes(id, name))")
        .order("last_name");
      if (error) throw error;
      return data as Student[];
    },
  });
  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("students").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Studente eliminato"); setDeleting(null); qc.invalidateQueries(); },
    onError: (e: Error) => toast.error(e.message),
  });
  const list = (data ?? []).filter((s) => `${s.first_name} ${s.last_name} ${s.email ?? ""}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <div>
      <PageHeader
        title="Studenti"
        subtitle="Anagrafica degli studenti e classi di appartenenza."
        actions={<Button onClick={() => setEditing("new")}><Plus /> Nuovo studente</Button>}
      />
      {isLoading ? (
        <p className="text-muted-foreground">Caricamento…</p>
      ) : !data?.length ? (
        <EmptyState title="Nessuno studente ancora">
          Aggiungi gli studenti e assegnali alle classi.
          <div className="mt-4"><Button onClick={() => setEditing("new")}><Plus /> Nuovo studente</Button></div>
        </EmptyState>
      ) : (
        <>
          <Input className="mb-4 max-w-sm" placeholder="Cerca per nome o email" value={q} onChange={(e) => setQ(e.target.value)} />
          <div className="nr-app-card overflow-x-auto border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="p-3">Studente</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Classi</th>
                  <th className="p-3 text-right"><span className="sr-only">Azioni</span></th>
                </tr>
              </thead>
              <tbody>
                {list.map((s) => (
                  <tr key={s.id} className="border-b last:border-0">
                    <td className="p-3 font-semibold">{s.last_name} {s.first_name}</td>
                    <td className="p-3 text-muted-foreground">{s.email ?? "—"}</td>
                    <td className="p-3">
                      {s.class_students.length ? s.class_students.map((c) => c.classes?.name).filter(Boolean).join(", ") : <span className="text-muted-foreground">Nessuna</span>}
                    </td>
                    <td className="whitespace-nowrap p-3 text-right">
                      <Button size="icon" variant="ghost" aria-label="Modifica" onClick={() => setEditing(s)}><Pencil /></Button>
                      <Button size="icon" variant="ghost" aria-label="Elimina" onClick={() => setDeleting(s)}><Trash2 /></Button>
                    </td>
                  </tr>
                ))}
                {list.length === 0 && (
                  <tr><td colSpan={4} className="p-6 text-center text-muted-foreground">Nessun risultato per “{q}”.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
      {editing && <StudentDialog student={editing === "new" ? null : editing} onClose={() => setEditing(null)} />}
      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminare {deleting?.first_name} {deleting?.last_name}?</AlertDialogTitle>
            <AlertDialogDescription>Lo studente verrà rimosso anche da tutte le classi.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleting && remove.mutate(deleting.id)}>Elimina</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function StudentDialog({ student, onClose }: { student: Student | null; onClose: () => void }) {
  const qc = useQueryClient();
  const [first, setFirst] = useState(student?.first_name ?? "");
  const [last, setLast] = useState(student?.last_name ?? "");
  const [email, setEmail] = useState(student?.email ?? "");
  const [classIds, setClassIds] = useState<string[]>(student?.class_students.map((c) => c.class_id) ?? []);
  const [busy, setBusy] = useState(false);
  const { data: classes } = useQuery({
    queryKey: ["classes", "names"],
    queryFn: async () => {
      const { data, error } = await supabase.from("classes").select("id, name").order("name");
      if (error) throw error;
      return data;
    },
  });

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const payload = { first_name: first.trim(), last_name: last.trim(), email: email.trim() || null };
    let id = student?.id;
    if (id) {
      const { error } = await supabase.from("students").update(payload).eq("id", id);
      if (error) { setBusy(false); toast.error(error.code === "23505" ? "Email già usata da un altro studente" : error.message); return; }
    } else {
      const { data, error } = await supabase.from("students").insert(payload).select("id").single();
      if (error) { setBusy(false); toast.error(error.code === "23505" ? "Email già usata da un altro studente" : error.message); return; }
      id = data.id;
    }
    const before = student?.class_students.map((c) => c.class_id) ?? [];
    const toAdd = classIds.filter((c) => !before.includes(c));
    const toRemove = before.filter((c) => !classIds.includes(c));
    if (toAdd.length) await supabase.from("class_students").insert(toAdd.map((class_id) => ({ class_id, student_id: id! })));
    if (toRemove.length) await supabase.from("class_students").delete().eq("student_id", id!).in("class_id", toRemove);
    setBusy(false);
    toast.success(student ? "Studente aggiornato" : "Studente creato");
    qc.invalidateQueries();
    onClose();
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>{student ? "Modifica studente" : "Nuovo studente"}</DialogTitle></DialogHeader>
        <form className="space-y-4" onSubmit={save}>
          <div className="grid gap-4 sm:grid-cols-2">
            <HudTextField label="Nome" id="s-first" required autoFocus value={first} onChange={(e) => setFirst(e.target.value)} />
            <HudTextField label="Cognome" id="s-last" required value={last} onChange={(e) => setLast(e.target.value)} />
          </div>
          <HudTextField label="Email (facoltativa)" id="s-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <div className="space-y-2">
            <Label>Classi</Label>
            {!classes?.length ? (
              <p className="text-sm text-muted-foreground">Nessuna classe creata.</p>
            ) : (
              <div className="max-h-40 space-y-1 overflow-y-auto">
                {classes.map((c) => (
                  <label key={c.id} className="flex cursor-pointer items-center gap-3 px-2 py-1.5 hover:bg-muted">
                    <Checkbox checked={classIds.includes(c.id)} onCheckedChange={(v) => setClassIds((p) => (v ? [...p, c.id] : p.filter((x) => x !== c.id)))} />
                    {c.name}
                  </label>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Annulla</Button>
            <Button type="submit" disabled={busy || !first.trim() || !last.trim()}>{busy ? "Salvataggio…" : "Salva"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
