import { useState } from "react";
import { DataFlowExplorer } from "@/components/data-flow/DataFlowExplorer";
import type { ArchitectureNodeKind } from "@/components/data-flow/types";
import {
  architecture,
  stateDefinitions,
  stateHighlights,
} from "@/content/lessons/cybersecurity-1-3";

type State = "rest" | "use";
type Example = { data: string; why: string };

const examples: Record<State, Record<ArchitectureNodeKind, Example>> = {
  rest: {
    client: {
      data: "Al termine del download, sul disco del computer di Giulia c’è una copia di 42.pdf nella cartella Download.",
      why: "Il browser salva i byte ricevuti perché Giulia ha scelto di scaricare il file. Potrà riaprirlo anche chiudendo il browser.",
    },
    gateway: {
      data: "In questo esempio il reverse proxy non archivia una copia di 42.pdf.",
      why: "Il suo compito è inoltrare la risposta. I blocchi che attraversano i suoi buffer in memoria servono solo mentre li trasmette.",
    },
    compute: {
      data: "In questo download il backend non salva il PDF sul proprio disco.",
      why: "Può leggere dallo storage e inviare un blocco alla volta. L’originale rimane nello storage.",
    },
    database: {
      data: "Nella riga 42 ci sono i metadati del file, tra cui il proprietario e il riferimento all’oggetto nello storage.",
      why: "La scheda permette al backend di verificare il permesso di Giulia e di trovare il file alla richiesta successiva.",
    },
    cache: {
      data: "Redis può tenere in RAM una scheda temporanea del file 42. Questa simulazione non prevede una copia su disco della cache.",
      why: "La scheda accelera le letture successive. Se si attivasse la persistenza di Redis, anche i metadati scritti su disco sarebbero dati a riposo.",
    },
    storage: {
      data: "Nell’object storage rimangono i byte dell’originale di 42.pdf, anche dopo il download.",
      why: "L’archivio conserva il file perché il backend possa leggerlo di nuovo quando arriva una richiesta autorizzata.",
    },
    backup: {
      data: "Il backup conserva una copia del PDF e dei suoi metadati risalente all’ultimo salvataggio.",
      why: "Serve a ripristinare quella versione in caso di perdita. È il processo di backup a crearla, indipendentemente dal clic di Giulia.",
    },
    temporary: {
      data: "Il semplice download non crea un file di lavoro. Se un’elaborazione scrivesse parte del PDF su disco, quei byte sarebbero a riposo.",
      why: "Un file temporaneo permette di riprendere un’elaborazione. Resta leggibile sul disco fino alla sua cancellazione.",
    },
    logging: {
      data: "Nel registro del servizio può restare un evento con l’ID 42 e l’esito della richiesta.",
      why: "L’evento permette di ricostruire il download. Per questo bastano i metadati dell’operazione.",
    },
  },
  use: {
    client: {
      data: "Mentre riceve la risposta, il browser tiene in memoria i blocchi di 42.pdf che sta scrivendo nella cartella Download.",
      why: "Usa ciascun blocco per costruire la copia locale. A download concluso, i byte salvati sul disco sono a riposo.",
    },
    gateway: {
      data: "Il reverse proxy legge in memoria le intestazioni HTTP dopo la terminazione TLS e gestisce i blocchi della risposta.",
      why: "Le intestazioni gli indicano dove inoltrare la richiesta. Al ritorno prepara i blocchi per la connessione HTTPS verso il browser.",
    },
    compute: {
      data: "Il backend usa la sessione di Giulia, l’ID 42 e i permessi della scheda. Dopo il controllo gestisce in memoria i blocchi del PDF.",
      why: "Deve prima decidere se Giulia può leggere il file. Solo allora apre il flusso dallo storage e prepara la risposta.",
    },
    database: {
      data: "Il database elabora l’ID 42 della query e legge i campi della riga corrispondente.",
      why: "Per rispondere al backend deve individuare la scheda e restituire i metadati. I byte del PDF restano nello storage.",
    },
    cache: {
      data: "Se il backend consulta Redis, Redis elabora la chiave della scheda 42 e controlla se la voce è ancora valida.",
      why: "Quando trova la voce restituisce i metadati al backend. Se manca, il backend li cerca nel database.",
    },
    storage: {
      data: "Il servizio di storage verifica la richiesta del backend e legge i blocchi dell’oggetto 42.pdf.",
      why: "Deve consegnare i byte richiesti. I blocchi letti sono in uso mentre la copia durevole rimane nell’archivio.",
    },
    backup: {
      data: "Durante il download di Giulia il backup resta inattivo. Un processo di backup o ripristino userebbe i blocchi del PDF e i relativi metadati.",
      why: "È la lettura dei blocchi per copiarli o ripristinarli a metterli in uso. La richiesta di Giulia viene servita dallo storage.",
    },
    temporary: {
      data: "Questo download non legge file temporanei. In un’elaborazione che ne usasse uno, sarebbe il backend a leggerne i blocchi in memoria.",
      why: "L’area temporanea è un posto dove scrivere. È il processo che legge o trasforma i byte a elaborarli.",
    },
    logging: {
      data: "Se riceve l’evento del download, il servizio di logging elabora l’ID 42 e l’esito.",
      why: "Prepara la voce da registrare. Durante questa operazione i campi sono in uso, poi la voce scritta nel registro è a riposo.",
    },
  },
};

export function StoredOrProcessedExplorer({ state }: { state: State }) {
  const [id, setId] = useState<string | null>(null);
  const selected = architecture.nodes.find((node) => node.id === id);
  const example = selected && examples[state][selected.kind];
  const definition = stateDefinitions[state];
  const highlight = stateHighlights[state];
  const overviewNodes = architecture.nodes.filter((node) => highlight.nodes?.includes(node.id));
  function select(nodeId: string) {
    setId((current) => (current === nodeId ? null : nodeId));
  }

  return (
    <>
      <DataFlowExplorer
        config={architecture}
        level={3}
        highlight={highlight}
        nodeSelection={{ id, onChange: select }}
      />
      <section className="lesson-panel-stack" aria-label={definition.title}>
        <div className="journey-state-explanation">
          <section aria-live="polite" aria-atomic="true">
            <span className="lesson-label">{definition.label}</span>
            <h3>{selected?.label ?? definition.title}</h3>
            <p>{example?.data ?? definition.description}</p>
          </section>
          {example ? (
            <section aria-live="polite" aria-atomic="true">
              <h3>Perché</h3>
              <p>{example.why}</p>
            </section>
          ) : (
            <div className="journey-level-controls" role="group" aria-label="Esplora un esempio">
              {overviewNodes.map((node) => (
                <button type="button" key={node.id} onClick={() => select(node.id)}>
                  {node.label}
                </button>
              ))}
            </div>
          )}
        </div>
        {selected && (
          <button
            type="button"
            className="journey-trust-reset justify-self-start"
            onClick={() => setId(null)}
          >
            Torna alla panoramica
          </button>
        )}
      </section>
    </>
  );
}
