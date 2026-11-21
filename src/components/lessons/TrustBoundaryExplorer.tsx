import { useState } from "react";
import { DataFlowExplorer } from "@/components/data-flow/DataFlowExplorer";
import {
  architecture,
  trustAnswer,
  trustHighlight,
  trustLegs,
  trustQuestion,
} from "@/content/lessons/cybersecurity-1-3";

const labels = new Map(architecture.nodes.map((node) => [node.id, node.label]));
const legs = trustLegs.map((leg) => {
  const connection = architecture.connections.find((c) => c.id === leg.id)!;
  return {
    ...leg,
    ...connection,
    endpoints: labels.get(connection.from) + " ↔ " + labels.get(connection.to),
  };
});

export function TrustBoundaryExplorer() {
  const [selection, setSelection] = useState<{ node: string; leg: string } | null>(null);
  const selected = architecture.nodes.find((node) => node.id === selection?.node);
  const choices = legs.filter((leg) => leg.from === selected?.id || leg.to === selected?.id);
  const current = choices.find((leg) => leg.id === selection?.leg);
  function inspect(node: string) {
    // At the public entry and the backend, follow the request towards the next tier.
    const outgoing = node === "proxy" || node === "backend";
    const primary = legs.find((leg) => leg.from === node || (!outgoing && leg.to === node));
    if (primary) setSelection(selection?.node === node ? null : { node, leg: primary.id });
  }
  return (
    <>
      <DataFlowExplorer
        config={architecture}
        level={3}
        showTrustBoundaries
        nodeSelection={{ id: selection?.node ?? null, onChange: inspect }}
        highlight={
          current
            ? {
                nodes: [current.from, current.to],
                connections: [current.id],
                boundaries: current.boundary ? [current.boundary] : [],
              }
            : trustHighlight
        }
      />
      <section className="journey-trust-question" aria-label="Un tratto alla volta">
        <span className="lesson-label">Un tratto alla volta</span>
        {selected && current ? (
          <>
            <h3>{selected.label}</h3>
            {choices.length > 1 && (
              <div
                className="journey-level-controls"
                role="group"
                aria-label={"Collegamenti di " + selected.label}
              >
                {choices.map((leg) => (
                  <button
                    type="button"
                    key={leg.id}
                    aria-pressed={current.id === leg.id}
                    onClick={() => setSelection({ node: selected.id, leg: leg.id })}
                  >
                    {leg.endpoints}
                  </button>
                ))}
              </div>
            )}
            <div aria-live="polite" aria-atomic="true">
              <strong>
                {current.endpoints} · {current.label}
              </strong>
              <h4>{current.question}</h4>
              <p>{current.answer}</p>
            </div>
            <details>
              <summary>Ruolo di {selected.label}</summary>
              <p>{selected.description}</p>
              <ul>
                {selected.responsibilities.map((text) => (
                  <li key={text}>{text}</li>
                ))}
              </ul>
            </details>
            <button
              type="button"
              className="journey-trust-reset"
              onClick={() => setSelection(null)}
            >
              Torna alla panoramica
            </button>
          </>
        ) : (
          <>
            <h3>«{trustQuestion}»</h3>
            <p>{trustAnswer}</p>
            <p>Seleziona un componente sulla mappa per esaminare i suoi collegamenti.</p>
          </>
        )}
      </section>
      {!current && (
        <div className="journey-trust-links" aria-label="Valutazione dei singoli collegamenti">
          {legs
            .filter((leg) => trustHighlight.connections?.includes(leg.id))
            .map((leg) => (
              <div className="journey-trust-link" key={leg.id}>
                <strong>{leg.endpoints}</strong>
                <span>{leg.protection}</span>
              </div>
            ))}
        </div>
      )}
    </>
  );
}
