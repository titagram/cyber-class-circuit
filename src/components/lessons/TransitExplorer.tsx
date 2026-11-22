import { useState } from "react";
import { DataFlowExplorer } from "@/components/data-flow/DataFlowExplorer";
import { HudNotice } from "@/design-system/nightrunner";
import {
  architecture,
  stateDefinitions,
  stateHighlights,
} from "@/content/lessons/cybersecurity-1-3";

const explanations: Record<string, { action: string; result: string }> = {
  "browser-proxy": {
    action:
      "Quando Giulia clicca su «Scarica PDF», il browser invia al reverse proxy una richiesta HTTPS per il file 42.",
    result:
      "Al ritorno, il proxy invia i byte di 42.pdf al browser sulla connessione HTTPS. Giulia può così salvarne una copia.",
  },
  "proxy-backend": {
    action:
      "Il reverse proxy apre o riutilizza una connessione al server HTTP del backend e gli inoltra la richiesta del file 42.",
    result:
      "Il backend restituisce al proxy la risposta con il PDF. La decisione di lettura precede la risposta. Il proxy inoltra i byte ricevuti dal servizio file.",
  },
  "backend-database": {
    action: "Il backend cerca nel database la scheda del file con ID 42.",
    result:
      "Il database restituisce i metadati, compreso il riferimento che indica al backend dove trovare 42.pdf.",
  },
  "backend-storage": {
    action:
      "Verificati i permessi, il backend usa il riferimento ottenuto dal database per chiedere 42.pdf all’object storage.",
    result:
      "Lo storage invia al backend i byte del PDF. Il backend può quindi rispondere a Giulia, mentre l’originale resta nell’archivio.",
  },
  "backend-cache": {
    action: "Se usa Redis per questa lettura, il backend chiede la scheda del file 42 alla cache.",
    result:
      "Redis restituisce i metadati se la voce è presente. Se manca, il backend deve cercare la scheda nel database.",
  },
  "database-backup": {
    action:
      "Durante un backup, i record del database vengono copiati nell’archivio di ripristino. È un’operazione separata dal download di Giulia.",
    result:
      "Tra i dati trasferiti c’è la scheda del file 42. Quando la copia è stata scritta nel backup, quei metadati sono a riposo.",
  },
  "storage-backup": {
    action:
      "Durante un backup dello storage, i byte di 42.pdf vengono trasferiti all’archivio di ripristino.",
    result:
      "L’archivio conserva una copia del PDF da recuperare in caso di perdita. Il download di Giulia non deve aspettare questo trasferimento.",
  },
  "backend-temp": {
    action:
      "Se un’elaborazione richiede una copia di lavoro, il backend scrive i byte del file in un’area temporanea.",
    result:
      "Il collegamento rappresenta la scrittura, che può avvenire anche su un disco locale. Una volta scritti, i byte della copia sono a riposo.",
  },
  "backend-logs": {
    action:
      "Al termine della richiesta, il backend può inviare ai sistemi di logging un evento con l’ID 42 e l’esito del download.",
    result:
      "Viaggiano i dati dell’evento. Il sistema di logging li registra per permettere di ricostruire cosa è successo.",
  },
};

const nodeLabels = new Map(architecture.nodes.map(({ id, label }) => [id, label]));
const legs = architecture.connections.filter(({ id }) => Object.hasOwn(explanations, id));
const overview = stateHighlights.transit;
const overviewLegs = legs.filter(({ id }) => overview.connections?.includes(id));

export function TransitExplorer() {
  const [selection, setSelection] = useState<{ node: string | null; leg: string } | null>(null);
  const node = selection?.node;
  const choices = node ? legs.filter(({ from, to }) => from === node || to === node) : overviewLegs;
  const active = choices.find(({ id }) => id === selection?.leg);
  const detail = active && explanations[active.id];
  const endpoints = (leg: (typeof legs)[number]) =>
    nodeLabels.get(leg.from) + " ↔ " + nodeLabels.get(leg.to);

  function inspect(id: string) {
    const first =
      overviewLegs.find(({ from }) => from === id) ??
      legs.find(({ from, to }) => from === id || to === id);
    if (first) setSelection(node === id ? null : { node: id, leg: first.id });
  }

  return (
    <>
      <DataFlowExplorer
        config={architecture}
        level={3}
        highlight={
          active ? { nodes: [active.from, active.to], connections: [active.id] } : overview
        }
        nodeSelection={{ id: node ?? null, onChange: inspect }}
      />
      <section aria-label="Dati in transito" className="lesson-panel-stack">
        <div className="journey-state-explanation">
          <section aria-live="polite" aria-atomic="true">
            <span className="lesson-label">
              {stateDefinitions.transit.label}
              {node && " · " + nodeLabels.get(node)}
            </span>
            <h3>{active ? endpoints(active) : stateDefinitions.transit.title}</h3>
            <p>{detail?.action ?? stateDefinitions.transit.description}</p>
          </section>
          <div className="journey-level-controls" role="group" aria-label="Tratti da esplorare">
            {choices.map((leg) => (
              <button
                key={leg.id}
                type="button"
                aria-pressed={leg.id === active?.id}
                onClick={() => setSelection({ node: node ?? null, leg: leg.id })}
              >
                {endpoints(leg)}
              </button>
            ))}
          </div>
        </div>
        <div aria-live="polite">
          <HudNotice>
            {detail?.result ??
              "Scegli un tratto per seguire il download di 42.pdf. Puoi anche selezionare un componente sulla mappa per esplorare i suoi collegamenti."}
          </HudNotice>
        </div>
        {active && (
          <button
            type="button"
            className="journey-trust-reset justify-self-start"
            onClick={() => setSelection(null)}
          >
            Torna alla panoramica
          </button>
        )}
      </section>
    </>
  );
}
