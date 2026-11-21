import { useState } from "react";
import { ArchiveRestore, FileText, Image, Link2, Upload } from "lucide-react";
import { HudPanel } from "@/design-system/nightrunner";
import { features } from "@/content/lessons/cybersecurity-1-4";

const icons = { upload: Upload, preview: Image, share: Link2, restore: ArchiveRestore };

export function FileSurfaceLab() {
  const [count, setCount] = useState(0);
  const [selected, setSelected] = useState(0);
  const [revoked, setRevoked] = useState(false);
  const active = features.slice(0, count);
  const current = active[selected];
  const next = features[count];
  const last = active[count - 1];

  function changeCount(value: number) {
    setCount(value);
    setSelected(Math.max(0, value - 1));
    if (!features.slice(0, value).some((feature) => feature.id === "share")) setRevoked(false);
  }

  return (
    <HudPanel heading="Laboratorio · Come cresce la superficie di 42.pdf">
      <p>
        Parti dal download. In questa simulazione Giulia può anche caricare e condividere il file
        quando abiliti le relative funzioni. Attivale una alla volta e segui i dati fino a chi li
        riceve.
      </p>
      {next && <p className="surface-next-question">{next.question}</p>}
      <div className="web-options" role="group" aria-label="Funzioni della simulazione">
        {next && (
          <button type="button" onClick={() => changeCount(count + 1)}>
            {next.activate}
          </button>
        )}
        {last && (
          <button type="button" onClick={() => changeCount(count - 1)}>
            {last.undo}
          </button>
        )}
      </div>
      <figure className="file-surface-map" aria-label="Mappa delle funzioni di 42.pdf">
        <div className="file-surface-hub">
          <FileText aria-hidden="true" />
          <strong>42.pdf</strong>
          <small>Archivio del servizio</small>
        </div>
        {features.map((feature, index) => {
          const enabled = index < count;
          const Icon = icons[feature.id];
          return (
            <div
              key={feature.id}
              className={"file-surface-arm arm-" + feature.id}
              data-enabled={enabled}
              data-selected={current?.id === feature.id}
            >
              <button
                type="button"
                disabled={!enabled}
                aria-label={feature.label}
                aria-pressed={current?.id === feature.id}
                onClick={() => setSelected(index)}
              >
                <strong>
                  <Icon aria-hidden="true" />
                  {feature.label}
                </strong>
                {enabled ? (
                  <>
                    <span>
                      {feature.id === "share" && revoked
                        ? "Gestore del link → accesso negato"
                        : feature.route}
                    </span>
                    <small>
                      {feature.id === "share" && revoked
                        ? "Nessun byte al destinatario"
                        : feature.payload}
                    </small>
                  </>
                ) : (
                  <small>Da attivare</small>
                )}
              </button>
            </div>
          );
        })}
      </figure>
      <section className="surface-inspection" aria-label="Percorso selezionato" aria-live="polite">
        {current ? (
          <div className="web-reveal" key={current.id}>
            <h3>{current.label}</h3>
            <p>
              {current.id === "share" && revoked
                ? "Il destinatario presenta lo stesso link. Il gestore verifica il token, trova la revoca e ferma la lettura prima di chiedere il PDF allo storage."
                : current.flow}
            </p>
            <p>
              <strong>Perché cresce la superficie?</strong> {current.growth}
            </p>
          </div>
        ) : (
          <p>
            Con la sola lettura, il backend verifica il permesso di Giulia e il browser riceve i
            byte del PDF. Lo storage conserva l’originale.
          </p>
        )}
      </section>
      {current?.id === "upload" && <UploadQuestion />}
      {current?.id === "share" && (
        <div className="web-options">
          <button type="button" onClick={() => setRevoked(!revoked)}>
            {revoked ? "Prova con un nuovo link" : "Revoca il link"}
          </button>
        </div>
      )}
    </HudPanel>
  );
}

function UploadQuestion() {
  const [answer, setAnswer] = useState("");
  return (
    <>
      <p>Dove è cresciuta la superficie di attacco?</p>
      <div className="web-options">
        {["Sulla porta di rete", "Nelle funzioni web"].map((choice) => (
          <button
            type="button"
            key={choice}
            aria-pressed={answer === choice}
            onClick={() => setAnswer(choice)}
          >
            {choice}
          </button>
        ))}
      </div>
      <p role="status" aria-label="Risposta sul caricamento">
        {answer &&
          (answer === "Nelle funzioni web"
            ? "Esatto. Sulla stessa porta arriva ora una richiesta di scrittura. Il backend deve verificare chi può caricare un file e controllarne nome, dimensione e contenuto prima di salvarlo."
            : "Guarda la porta prima e dopo: è sempre la 443. Quale nuova operazione può chiedere il browser?")}
      </p>
    </>
  );
}
