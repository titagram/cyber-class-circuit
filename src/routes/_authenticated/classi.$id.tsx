import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Pencil, Trash2, UserPlus, X, Link2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { HudPanel } from "@/design-system/nightrunner";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PageHeader } from "@/components/PageHeader";
import { ClassDialog } from "@/components/ClassDialog";

export const Route = createFileRoute("/_authenticated/classi/$id")({
  head: () => ({
    meta: [
      { title: "Dettaglio classe — Cybersecurity 101" },
      { name: "description", content: "Studenti e corsi collegati alla classe." },
      { property: "og:title", content: "Dettaglio classe — Cybersecurity 101" },
      { property: "og:description", content: "Studenti e corsi collegati alla classe." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ClassDetail,
});

function ClassDetail() {
  const { id } = Route.useParams();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [adding, setAdding] = useState(false);
  const [linking, setLinking] = useState(false);

  const { data: cls, isLoading } = useQuery({
    queryKey: ["class", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("classes")
        .select("id, name, description, class_students(student_id, students(id, first_name, last_name, email)), class_courses(course_id, courses(id, title))")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["class", id] });
    qc.invalidateQueries({ queryKey: ["classes"] });
    qc.invalidateQueries({ queryKey: ["students"] });
  };

  const update = useMutation({
    mutationFn: async (v: { name: string; description: string }) => {
      const { error } = await supabase.from("classes").update({ name: v.name, description: v.description || null }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Classe aggiornata"); setEditing(false); refresh(); },
    onError: (e: Error) => toast.error(e.message),
  });
  const remove = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("classes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Classe eliminata"); qc.invalidateQueries({ queryKey: ["classes"] }); navigate({ to: "/classi" }); },
    onError: (e: Error) => toast.error(e.message),
  });
  const removeStudent = useMutation({
    mutationFn: async (sid: string) => {
      const { error } = await supabase.from("class_students").delete().eq("class_id", id).eq("student_id", sid);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Studente rimosso dalla classe"); refresh(); },
    onError: (e: Error) => toast.error(e.message),
  });
  const unlinkCourse = useMutation({
    mutationFn: async (cid: string) => {
      const { error } = await supabase.from("class_courses").delete().eq("class_id", id).eq("course_id", cid);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Corso scollegato"); refresh(); },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) return <p className="text-muted-foreground">Caricamento…</p>;
  if (!cls)
    return (
      <div>
        <p className="text-muted-foreground">Questa classe non esiste più.</p>
        <Button asChild variant="outline" className="mt-4"><Link to="/classi"><ArrowLeft /> Torna alle classi</Link></Button>
      </div>
    );

  const students = cls.class_students.map((r) => r.students).filter(Boolean) as { id: string; first_name: string; last_name: string; email: string | null }[];
  students.sort((a, b) => a.last_name.localeCompare(b.last_name));
  const courses = cls.class_courses.map((r) => r.courses).filter(Boolean) as { id: string; title: string }[];

  return (
    <div>
      <Link to="/classi" className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-accent"><ArrowLeft className="h-4 w-4" /> Classi</Link>
      <PageHeader
        title={cls.name}
        subtitle={cls.description ?? undefined}
        actions={
          <>
            <Button variant="outline" onClick={() => setEditing(true)}><Pencil /> Modifica</Button>
            <Button variant="destructive" onClick={() => setConfirmDelete(true)}><Trash2 /> Elimina</Button>
          </>
        }
      />
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <HudPanel heading={`Studenti (${students.length})`}>
          <div className="mb-4"><Button size="sm" onClick={() => setAdding(true)}><UserPlus /> Aggiungi studenti</Button></div>
          {students.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nessuno studente in questa classe.</p>
          ) : (
            <ul className="divide-y divide-border">
              {students.map((s) => (
                <li key={s.id} className="flex items-center justify-between gap-3 py-2">
                  <div className="min-w-0">
                    <div className="font-semibold">{s.last_name} {s.first_name}</div>
                    {s.email && <div className="truncate text-xs text-muted-foreground">{s.email}</div>}
                  </div>
                  <Button size="icon" variant="ghost" aria-label={`Rimuovi ${s.first_name} ${s.last_name}`} onClick={() => removeStudent.mutate(s.id)}><X /></Button>
                </li>
              ))}
            </ul>
          )}
        </HudPanel>
        <HudPanel heading={`Corsi collegati (${courses.length})`}>
          <div className="mb-4"><Button size="sm" variant="outline" onClick={() => setLinking(true)}><Link2 /> Collega corso</Button></div>
          {courses.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nessun corso collegato.</p>
          ) : (
            <ul className="divide-y divide-border">
              {courses.map((c) => (
                <li key={c.id} className="flex items-center justify-between gap-3 py-2">
                  <span className="font-semibold">{c.title}</span>
                  <Button size="icon" variant="ghost" aria-label={`Scollega ${c.title}`} onClick={() => unlinkCourse.mutate(c.id)}><X /></Button>
                </li>
              ))}
            </ul>
          )}
        </HudPanel>
      </div>

      {editing && <ClassDialog open={editing} onOpenChange={setEditing} initial={cls} onSave={(v) => update.mutate(v)} busy={update.isPending} />}
      {adding && <AddStudentsDialog classId={id} existing={students.map((s) => s.id)} onClose={() => setAdding(false)} onDone={refresh} />}
      {linking && <LinkCourseDialog classId={id} existing={courses.map((c) => c.id)} onClose={() => setLinking(false)} onDone={refresh} />}

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminare la classe “{cls.name}”?</AlertDialogTitle>
            <AlertDialogDescription>Gli studenti restano in anagrafica, ma non saranno più associati a questa classe.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={() => remove.mutate()}>Elimina</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function AddStudentsDialog({ classId, existing, onClose, onDone }: { classId: string; existing: string[]; onClose: () => void; onDone: () => void }) {
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const { data, isLoading } = useQuery({
    queryKey: ["students"],
    queryFn: async () => {
      const { data, error } = await supabase.from("students").select("id, first_name, last_name, email").order("last_name");
      if (error) throw error;
      return data;
    },
  });
  const available = useMemo(
    () =>
      (data ?? [])
        .filter((s) => !existing.includes(s.id))
        .filter((s) => `${s.first_name} ${s.last_name} ${s.email ?? ""}`.toLowerCase().includes(q.toLowerCase())),
    [data, existing, q],
  );
  async function save() {
    setBusy(true);
    const { error } = await supabase.from("class_students").insert(selected.map((student_id) => ({ class_id: classId, student_id })));
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success(selected.length === 1 ? "Studente aggiunto" : `${selected.length} studenti aggiunti`);
    onDone();
    onClose();
  }
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>Aggiungi studenti</DialogTitle></DialogHeader>
        <Input placeholder="Cerca per nome o email" value={q} onChange={(e) => setQ(e.target.value)} />
        <div className="max-h-72 space-y-1 overflow-y-auto">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Caricamento…</p>
          ) : available.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {(data ?? []).length === 0 ? "Non ci sono ancora studenti. " : "Nessuno studente disponibile. "}
              <Link to="/studenti" className="text-accent underline">Crea uno studente</Link>
            </p>
          ) : (
            available.map((s) => (
              <label key={s.id} className="flex cursor-pointer items-center gap-3 px-2 py-2 hover:bg-muted">
                <Checkbox
                  checked={selected.includes(s.id)}
                  onCheckedChange={(c) => setSelected((prev) => (c ? [...prev, s.id] : prev.filter((x) => x !== s.id)))}
                />
                <span className="min-w-0">
                  <span className="font-semibold">{s.last_name} {s.first_name}</span>
                  {s.email && <span className="ml-2 text-xs text-muted-foreground">{s.email}</span>}
                </span>
              </label>
            ))
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Annulla</Button>
          <Button disabled={!selected.length || busy} onClick={save}>{busy ? "Aggiunta…" : `Aggiungi${selected.length ? ` (${selected.length})` : ""}`}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function LinkCourseDialog({ classId, existing, onClose, onDone }: { classId: string; existing: string[]; onClose: () => void; onDone: () => void }) {
  const { data, isLoading } = useQuery({
    queryKey: ["courses"],
    queryFn: async () => {
      const { data, error } = await supabase.from("courses").select("id, title, chapters(count)").order("title");
      if (error) throw error;
      return data;
    },
  });
  const available = (data ?? []).filter((c) => !existing.includes(c.id));
  async function link(course_id: string) {
    const { error } = await supabase.from("class_courses").insert({ class_id: classId, course_id });
    if (error) { toast.error(error.message); return; }
    toast.success("Corso collegato");
    onDone();
    onClose();
  }
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>Collega un corso</DialogTitle></DialogHeader>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Caricamento…</p>
        ) : available.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {(data ?? []).length === 0 ? "Non ci sono ancora corsi sulla piattaforma." : "Tutti i corsi sono già collegati a questa classe."}
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {available.map((c) => (
              <li key={c.id} className="flex items-center justify-between gap-3 py-2">
                <span><span className="font-semibold">{c.title}</span> <span className="text-xs text-muted-foreground">· {c.chapters[0]?.count ?? 0} capitoli</span></span>
                <Button size="sm" onClick={() => link(c.id)}>Collega</Button>
              </li>
            ))}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  );
}
