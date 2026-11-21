import { useEffect, useState } from "react";
import { Archive, ArrowRight, FileText, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HudBadge } from "@/design-system/nightrunner";

type Phase = "list" | "checking" | "sending" | "open";

const transferLabels: Record<Phase, string> = {
  list: "Gestionale",
  checking: "Verifica permesso",
  sending: "Byte del PDF",
  open: "Byte ricevuti",
};

const explanations: Record<Phase, string> = {
  list: "Il gestionale ha inviato al browser il nome del file e la sua classificazione. Questi dati bastano per comporre la riga dell’elenco.",
  checking:
    "Il clic chiede al gestionale il contenuto di 42.pdf. Prima di leggerlo dall’archivio, il gestionale controlla se Giulia ha il permesso di aprirlo.",
  sending:
    "Giulia ha il permesso di lettura. Il gestionale legge il PDF dall’archivio e invia i suoi byte al browser.",
  open: "Il browser usa i byte ricevuti per disegnare la prima pagina. Giulia la vede sullo schermo e il file originale è ancora nell’archivio.",
};

function PdfPage() {
  return (
    <div className="opening-pdf" aria-hidden="true">
      <strong>PDF</strong>
      <i />
      <i />
      <i />
      <i />
    </div>
  );
}

export function FileOpeningScene() {
  const [phase, setPhase] = useState<Phase>("list");
  useEffect(() => {
    if (phase !== "checking" && phase !== "sending") return;
    const timer = window.setTimeout(
      () => setPhase(phase === "checking" ? "sending" : "open"),
      phase === "checking" ? 1600 : 2400,
    );
    return () => window.clearTimeout(timer);
  }, [phase]);

  return (
    <>
      <p className="lesson-scenario">
        Giulia entra nel gestionale della sua azienda e trova 42.pdf nell’elenco. Che cosa ha già
        ricevuto il suo browser?
      </p>
      <div className="opening-map" data-phase={phase}>
        <section className="opening-storage" aria-label="Archivio del gestionale">
          <h3>
            <Archive aria-hidden="true" /> Archivio del gestionale
          </h3>
          <div className="opening-preview">
            <PdfPage />
            <div>
              <strong>42.pdf</strong>
              <small>File originale</small>
            </div>
          </div>
        </section>
        <div className="opening-bridge" aria-hidden="true">
          <span>{transferLabels[phase]}</span>
          <div className="opening-track">
            {phase === "sending" && (
              <>
                <i />
                <i />
                <i />
              </>
            )}
            {(phase === "sending" || phase === "open") && <ArrowRight />}
          </div>
        </div>
        <section className="opening-browser" aria-label="Browser di Giulia">
          <h3>
            <Monitor aria-hidden="true" /> Browser di Giulia
          </h3>
          <div className="opening-row">
            <FileText aria-hidden="true" />
            <strong>42.pdf</strong>
            <HudBadge tone="warning">Riservato</HudBadge>
            <Button
              disabled={phase === "checking" || phase === "sending"}
              onClick={() => setPhase(phase === "open" ? "list" : "checking")}
            >
              {phase === "open" ? "Torna all’elenco" : "Apri file"}
            </Button>
          </div>
          {phase === "open" && (
            <div className="opening-preview">
              <PdfPage />
              <div>
                <strong>Prima pagina di 42.pdf</strong>
                <small>Visualizzata nel browser</small>
              </div>
            </div>
          )}
        </section>
      </div>
      <p className="opening-caption" role="status" aria-atomic="true">
        {explanations[phase]}
      </p>
      {phase === "open" && (
        <p>Chi ha verificato il permesso, chi ha recuperato i byte e chi ha disegnato la pagina?</p>
      )}
    </>
  );
}
