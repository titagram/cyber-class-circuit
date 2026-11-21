import { useState } from "react";
import { DataFlowExplorer } from "@/components/data-flow/DataFlowExplorer";
import type { ArchitectureLevel, ArchitectureNodeKind } from "@/components/data-flow/types";
import { architecture, contract } from "@/content/lessons/cybersecurity-1-3";

const downloadDetails: Record<ArchitectureNodeKind, string> = {
  client:
    "Giulia clicca su «Scarica PDF». Il browser chiede il file 42 e salva i byte ricevuti nella cartella Download.",
  gateway:
    "Il proxy riceve la richiesta del browser e la inoltra al backend. Al ritorno trasmette al browser i byte di 42.pdf.",
  compute:
    "Il backend verifica se Giulia può scaricare il file 42. Se la lettura è consentita, usa la scheda del file per recuperare il PDF e rispondere.",
  database:
    "Alla ricerca dell’ID 42, il database restituisce la scheda del file. Il riferimento nella scheda indica al backend dove leggere il PDF.",
  cache:
    "Se la scheda del file 42 è già in cache, il backend può riutilizzarla. Alla scadenza della voce dovrà recuperarla di nuovo.",
  storage:
    "Lo storage riceve dal backend la richiesta per 42.pdf e restituisce i byte. Dopo il download l’originale resta qui.",
  backup:
    "Il processo di backup può copiare i metadati del database e il PDF dello storage. Queste copie servono al ripristino e hanno tempi di conservazione propri.",
  temporary:
    "Se il backend deve elaborare 42.pdf, può scriverne una copia di lavoro. L’elaborazione deve prevedere quando cancellarla.",
  logging:
    "Il backend può registrare l’ID 42 e l’esito del download. Questi dati permettono di ricostruire l’evento senza conservare il PDF nei log.",
};

const levelSummaries = {
  1: [
    ["Chi chiede il file?", "Il browser chiede 42.pdf al backend per conto di Giulia."],
    [
      "Chi cerca la scheda?",
      "Il backend consulta il database per identificare il file e verificare se Giulia può leggerlo.",
    ],
  ],
  2: [
    [
      "Nel database: i metadati",
      <>
        Titolo, ID 42, azienda, classificazione e riferimento <code>{contract.fileReference}</code>.
      </>,
    ],
    [
      "Nell’object storage: il contenuto",
      "Qui si trovano i byte di 42.pdf. Il backend usa il riferimento ottenuto dal database per recuperarli.",
    ],
  ],
  3: [
    [
      "Backup e file temporanei",
      "Una copia di backup serve a ripristinare il file. Una copia temporanea può servire durante un’elaborazione.",
    ],
    [
      "Nei log: la traccia del download",
      "Un evento può indicare quale file è stato richiesto e con quale esito. Per registrare il download bastano questi dati.",
    ],
  ],
} as const;

export function ArchitectureLevelExplorer({ level }: { level: ArchitectureLevel }) {
  const [nodeId, setNodeId] = useState<string | null>(null);
  const selected = architecture.nodes.find((node) => node.id === nodeId);
  return (
    <>
      <DataFlowExplorer
        config={architecture}
        level={level}
        nodeSelection={{
          id: nodeId,
          onChange: (id) => setNodeId((current) => (current === id ? null : id)),
        }}
      />
      <section
        className="journey-metadata-notice"
        aria-label="Dettagli dell’architettura"
        aria-live="polite"
      >
        {selected ? (
          <>
            <div>
              <h3>{selected.label}</h3>
              <p>{selected.description}</p>
              <details key={selected.id}>
                <summary>Responsabilità</summary>
                <ul>
                  {selected.responsibilities.map((text) => (
                    <li key={text}>{text}</li>
                  ))}
                </ul>
              </details>
            </div>
            <div>
              <h3>Nel download di 42.pdf</h3>
              <p>{downloadDetails[selected.kind]}</p>
              <button type="button" className="journey-trust-reset" onClick={() => setNodeId(null)}>
                Torna al riepilogo del livello
              </button>
            </div>
          </>
        ) : (
          levelSummaries[level].map(([title, body]) => (
            <div key={title}>
              <h3>{title}</h3>
              <p>{body}</p>
            </div>
          ))
        )}
      </section>
    </>
  );
}
