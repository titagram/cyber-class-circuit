import { useState } from "react";
import { FileText } from "lucide-react";
import { FileSurfaceLab } from "./FileSurfaceLab";
import { PageHeader } from "@/components/PageHeader";
import { HudPanel } from "@/design-system/nightrunner";
import { describeLayer, layers, readCases, readRequest } from "@/content/lessons/cybersecurity-1-4";
import "./WebSecurityLessons.css";

export function Cybersecurity14Slide() {
  const [session, setSession] = useState(false);
  const [permission, setPermission] = useState(false);
  const [inspection, setInspection] = useState<(typeof layers)[number] | null>(null);
  const result = !session ? "visitor" : permission ? "allowed" : "denied";
  const outcome = readCases[result];
  const reachedStorage = result === "allowed";
  const selected = inspection ?? (reachedStorage ? "Storage privato" : "Lettura del file");
  const ringLabels = ["Porta 443 raggiunta", outcome.stage, outcome.storage];

  return (
    <article className="web-lesson">
      <PageHeader
        title="1.4 — Superfici di attacco e confini di fiducia"
        subtitle="Chiunque raggiunga il sito può chiedere 42.pdf. Chi decide se il browser riceverà i byte?"
      />
      <HudPanel heading="Una richiesta, due controlli">
        <p>
          Nella simulazione il browser chiede sempre lo stesso file. Il primo controllo stabilisce
          chi lo sta chiedendo. Il secondo verifica se quella persona può leggerlo.
        </p>
        <div className="surface-request">
          <code>{readRequest}</code>
          <span>files.example · HTTPS · porta 443</span>
        </div>
        <div className="surface-controls">
          <fieldset>
            <legend>1 · Sessione del browser</legend>
            <div className="web-options">
              {([false, true] as const).map((value) => (
                <button
                  type="button"
                  key={String(value)}
                  aria-pressed={session === value}
                  onClick={() => {
                    setSession(value);
                    setInspection(null);
                  }}
                >
                  {value ? "Sessione di Giulia" : "Senza sessione"}
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset disabled={!session}>
            <legend>2 · Permesso di Giulia su 42.pdf</legend>
            <div className="web-options">
              {([false, true] as const).map((value) => (
                <button
                  type="button"
                  key={String(value)}
                  aria-pressed={session && permission === value}
                  onClick={() => {
                    setPermission(value);
                    setInspection(null);
                  }}
                >
                  {value ? "Con lettura" : "Senza lettura"}
                </button>
              ))}
            </div>
            {!session && <small>Attiva la sessione di Giulia per confrontare i due esiti.</small>}
          </fieldset>
        </div>
        <div className="web-split">
          <figure className="web-map" aria-label="Mappa a cipolla della richiesta">
            <div className="onion">
              {layers.map((layer, i) => (
                <button
                  key={layer}
                  type="button"
                  className={"ring ring-" + i}
                  data-reachable={i < 2 || reachedStorage}
                  data-stop={i === 1 && !reachedStorage}
                  aria-describedby={"surface-ring-state-" + i}
                  aria-label={layer}
                  aria-pressed={selected === layer}
                  onClick={() => setInspection(layer)}
                >
                  <span>
                    {layer}
                    <small id={"surface-ring-state-" + i}>{ringLabels[i]}</small>
                  </span>
                </button>
              ))}
              <FileText className="onion-file" aria-hidden="true" />
            </div>
            <figcaption>
              Gli anelli rappresentano interfacce. Selezionane una per vedere chi può chiamarla.
            </figcaption>
          </figure>
          <div className="web-detail">
            <section
              role="status"
              aria-label="Esito della richiesta"
              aria-atomic="true"
              className="surface-outcome"
              data-delivered={reachedStorage}
            >
              <strong>{outcome.status}</strong>
              <h3>{outcome.title}</h3>
              <ol className="surface-trace" aria-label="Controlli eseguiti">
                <li>
                  Sessione <b>{session ? "Giulia identificata" : "Stop"}</b>
                </li>
                <li>
                  Permesso sul file{" "}
                  <b>{!session ? "Non valutato" : permission ? "Concesso" : "Stop"}</b>
                </li>
                <li>
                  Storage <b>{outcome.storage}</b>
                </li>
              </ol>
              <p>{outcome.why}</p>
            </section>
            <section
              className="surface-inspection"
              aria-live="polite"
              aria-label="Interfaccia selezionata"
            >
              <h3>{selected}</h3>
              <p>{describeLayer(selected, result)}</p>
            </section>
          </div>
        </div>
        <p className="surface-takeaway">
          La superficie di attacco comprende gli ingressi attraverso cui un chiamante può fornire
          dati o chiedere un’operazione. A un confine di fiducia il destinatario deve verificare su
          quali dati e identità può fare affidamento. Il backend verifica Giulia e il suo permesso
          sul file. Lo storage verifica chi lo chiama con le credenziali del servizio.
        </p>
      </HudPanel>
      <details className="web-detail">
        <summary>Quali altri ingressi ci sono fuori da questa richiesta?</summary>
        <p>
          Il login riceve le credenziali e può creare una sessione. Se il backend usa Redis,
          presenta la propria identità per leggere i metadati in cache. La pagina del browser riceve
          nomi di file da mostrare come testo. La console di ripristino del backup accetta comandi
          dagli operatori autorizzati.
        </p>
      </details>
      <FileSurfaceLab />
    </article>
  );
}
