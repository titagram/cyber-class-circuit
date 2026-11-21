import { useState } from "react";
import { DataFlowExplorer } from "@/components/data-flow/DataFlowExplorer";
import {
  architecture,
  copyLabels,
  copyOutcomes,
  deletionAnswer,
  deletionQuestion,
} from "@/content/lessons/cybersecurity-1-3";

const completeFiles = architecture.nodes.filter(
  ({ kind }) => copyOutcomes[kind].category === "file",
);
const overview = { nodes: completeFiles.map(({ id }) => id) };

export function CopiesExplorer() {
  const [id, setId] = useState<string | null>(null);
  const selected = architecture.nodes.find((node) => node.id === id);
  const outcome = selected && copyOutcomes[selected.kind];
  function select(nodeId: string) {
    setId((current) => (current === nodeId ? null : nodeId));
  }

  return (
    <>
      <p className="lesson-scenario">
        Giulia ha finito di scaricare 42.pdf. In questo esempio la scheda è ancora in cache e il
        servizio ha registrato l’esito del download. Seleziona un componente per scoprire che cosa
        vi è rimasto.
      </p>
      <DataFlowExplorer
        config={architecture}
        level={3}
        nodeSelection={{ id, onChange: select }}
        highlight={selected ? { nodes: [selected.id] } : overview}
      />
      <section className="lesson-panel-stack" aria-label="Dopo il download di 42.pdf">
        <div className="journey-copy-card" aria-live="polite" aria-atomic="true">
          {selected && outcome ? (
            <>
              <div className="journey-copy-card-heading">
                <h3>{selected.label}</h3>
                <span className={"journey-copy-status journey-copy-status-" + outcome.category}>
                  {copyLabels[outcome.category]}
                </span>
              </div>
              <p>
                <strong>{outcome.remains}</strong>
              </p>
              <p>{outcome.why}</p>
            </>
          ) : (
            <>
              <h3>Un originale e due copie</h3>
              <p>
                La mappa evidenzia i tre luoghi che contengono il PDF completo. L’originale era
                nello storage e una copia era già nel backup. Il download ha creato la seconda copia
                sul computer di Giulia.
              </p>
            </>
          )}
        </div>
        <div className="journey-level-controls" role="group" aria-label="Confronta i componenti">
          {architecture.nodes.map((node) => (
            <button
              key={node.id}
              type="button"
              aria-pressed={id === node.id}
              onClick={() => select(node.id)}
            >
              {node.label}
            </button>
          ))}
        </div>
        {selected ? (
          <button
            type="button"
            className="journey-trust-reset justify-self-start"
            onClick={() => setId(null)}
          >
            Torna alla panoramica
          </button>
        ) : (
          <details className="journey-copy-question">
            <summary>{deletionQuestion}</summary>
            <p>{deletionAnswer}</p>
          </details>
        )}
      </section>
    </>
  );
}
