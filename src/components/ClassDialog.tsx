import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { HudTextField } from "@/design-system/nightrunner";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function ClassDialog({
  open,
  onOpenChange,
  initial,
  onSave,
  busy,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  initial?: { name: string; description: string | null };
  onSave: (v: { name: string; description: string }) => void;
  busy?: boolean;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initial ? "Modifica classe" : "Nuova classe"}</DialogTitle>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (name.trim()) onSave({ name: name.trim(), description: description.trim() });
          }}
        >
          <HudTextField label="Nome" id="class-name" required autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Es. 3A Informatica" />
          <div className="space-y-2">
            <Label htmlFor="class-desc">Descrizione (facoltativa)</Label>
            <Textarea id="class-desc" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Annulla</Button>
            <Button type="submit" disabled={busy || !name.trim()}>{busy ? "Salvataggio…" : "Salva"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

