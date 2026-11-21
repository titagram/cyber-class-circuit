import { useEffect, useState } from "react";
import { ArrowRight, FileText, FolderDown, Monitor, Server } from "lucide-react";
import { Button } from "@/components/ui/button";

type Phase = "ready" | "request" | "transfer" | "saved";

const captions: Record<Phase, string> = {
  ready: "Giulia vede il link a 42.pdf nella pagina. Il file si trova sul server.",
  request: "Il browser chiede al server il file 42.pdf.",
  transfer: "Il server invia i byte di 42.pdf al computer di Giulia.",
  saved:
    "Il download è completo. Giulia ha una copia di 42.pdf nella cartella Download. L’originale è ancora sul server.",
};

export function FileOpeningScene() {
  const [phase, setPhase] = useState<Phase>("ready");
  useEffect(() => {
    if (phase !== "request" && phase !== "transfer") return;
    const timer = window.setTimeout(
      () => setPhase(phase === "request" ? "transfer" : "saved"),
      phase === "request" ? 1500 : 2200,
    );
    return () => window.clearTimeout(timer);
  }, [phase]);

  return (
    <>
      <div className="opening-map" data-phase={phase}>
        <section aria-label="Server">
          <h3>
            <Server aria-hidden="true" /> Server
          </h3>
          <div className="opening-file">
            <FileText aria-hidden="true" />
            <div>
              <strong>42.pdf</strong>
              <small>File originale</small>
            </div>
          </div>
        </section>
        <div className="opening-bridge" aria-hidden="true">
          {phase !== "ready" && (
            <>
              <span>
                {phase === "request"
                  ? "Richiesta"
                  : phase === "transfer"
                    ? "Byte del PDF"
                    : "File ricevuto"}
              </span>
              <div className="opening-track">
                {phase === "transfer" && (
                  <>
                    <i />
                    <i />
                    <i />
                  </>
                )}
                <ArrowRight />
              </div>
            </>
          )}
        </div>
        <section aria-label="Computer di Giulia">
          <h3>
            <Monitor aria-hidden="true" /> Computer di Giulia
          </h3>
          <div className="opening-row">
            <span>42.pdf</span>
            <Button
              disabled={phase === "request" || phase === "transfer"}
              onClick={() => setPhase(phase === "saved" ? "ready" : "request")}
            >
              {phase === "saved" ? "Rivedi dall’inizio" : "Scarica PDF"}
            </Button>
          </div>
          {phase === "saved" && (
            <div className="opening-file">
              <FolderDown aria-hidden="true" />
              <div>
                <small>Cartella Download</small>
                <strong>42.pdf</strong>
              </div>
            </div>
          )}
        </section>
      </div>
      <p className="opening-caption" role="status" aria-atomic="true">
        {captions[phase]}
      </p>
    </>
  );
}
