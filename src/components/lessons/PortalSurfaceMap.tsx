import { useEffect, useState } from "react";
import {
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Layers,
  Pause,
  Play,
  RotateCcw,
  User,
  X,
} from "lucide-react";
import type { PortalExchange } from "@/content/lessons/portal-42";
import { portalJourney, stops } from "@/content/lessons/portal-journey";

const layers = ["Ingressi dall’esterno", "Funzioni applicative", "Servizi privati"];
const phaseNames = {
  request: "Richiesta",
  stop: "Download fermato",
  allow: "Lettura consentita",
  response: "Risposta",
};

function Journey({ trace, started }: { trace: PortalExchange; started: boolean }) {
  const steps = portalJourney(trace);
  const last = steps.length - 1;
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(
    () => started && !window.matchMedia?.("(prefers-reduced-motion: reduce)").matches,
  );
  const current = steps[index]!;
  const position = stops[current.at];
  const previous = stops[(steps[index - 1] ?? current).at];
  const heading = Math.atan2(position.y - previous.y, position.x - previous.x);
  const visited = steps.slice(0, index + 1);
  const decision = visited.find((s) => s.phase === "stop" || s.phase === "allow");
  const decisionPoint = decision && stops[decision.at];
  const DecisionIcon = decision?.phase === "stop" ? X : Check;
  const Marker = current.phase === "stop" ? X : current.phase === "allow" ? Check : ArrowRight;

  useEffect(() => {
    if (!playing || index === last) return;
    const timer = window.setTimeout(
      () => {
        setIndex(index + 1);
        if (index + 1 === last) setPlaying(false);
      },
      current.phase === "stop" || current.phase === "allow" ? 4000 : 2600,
    );
    return () => window.clearTimeout(timer);
  }, [playing, index, last, current.phase]);

  function seek(next: number) {
    setPlaying(false);
    setIndex(next);
  }

  return (
    <>
      <div className="portal-map-content">
        <div className="onion" aria-hidden="true">
          {layers.map((layer, i) => (
            <div
              key={layer}
              className={`ring ring-${i}`}
              data-active={visited.some((s) => stops[s.at].ring === i + 1)}
              data-current={position.ring === i + 1}
            >
              <span>{i + 1}</span>
            </div>
          ))}
          <strong className="portal-core">42.pdf</strong>
          <svg className="portal-trail" viewBox="0 0 100 100" aria-hidden="true">
            <polyline points={visited.map((s) => `${stops[s.at].x},${stops[s.at].y}`).join(" ")} />
          </svg>
          {decisionPoint && (
            <span
              className="portal-decision-pin"
              data-phase={decision.phase}
              style={{ left: decisionPoint.x + "%", top: decisionPoint.y + "%" }}
            >
              <DecisionIcon />
            </span>
          )}
          <span
            className="portal-packet"
            data-phase={current.phase}
            style={{ left: position.x + "%", top: position.y + "%" }}
          >
            <Marker
              style={Marker === ArrowRight ? { transform: `rotate(${heading}rad)` } : undefined}
            />
          </span>
        </div>
        <ol className="portal-layers">
          {layers.map((layer, i) => (
            <li
              key={layer}
              data-active={visited.some((s) => stops[s.at].ring === i + 1)}
              aria-current={position.ring === i + 1 ? "step" : undefined}
            >
              <b>{i + 1}</b>
              <div>
                <small>{layer}</small>
                <strong>{trace.path[i] ?? "Fuori dal percorso"}</strong>
              </div>
            </li>
          ))}
        </ol>
      </div>
      <div className="portal-step" data-phase={current.phase} aria-live="polite" aria-atomic="true">
        <small>
          {index + 1}/{steps.length} · {position.ring ? `Anello ${position.ring}` : "Esterno"} ·{" "}
          {phaseNames[current.phase]}
        </small>
        <strong>{current.title}</strong>
        <p>{current.why}</p>
        {decision && current.phase === "response" && (
          <small>
            {decision.phase === "stop" ? "Fermata" : "Autorizzata"} all’anello {decisionPoint?.ring}{" "}
            · {decision.title}
          </small>
        )}
      </div>
      <div className="portal-playback" role="group" aria-label="Movimento sulla cipolla">
        <button
          aria-label="Passaggio precedente"
          disabled={index === 0}
          onClick={() => seek(index - 1)}
        >
          <ChevronLeft size={16} />
        </button>
        <button
          onClick={() => {
            if (index === last) setIndex(0);
            setPlaying(!playing);
          }}
        >
          {playing ? (
            <Pause size={14} />
          ) : index === last ? (
            <RotateCcw size={14} />
          ) : (
            <Play size={14} />
          )}
          {playing ? "Pausa" : index === last ? "Rivedi" : "Riproduci"}
        </button>
        <button
          aria-label="Passaggio successivo"
          disabled={index === last}
          onClick={() => seek(index + 1)}
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </>
  );
}

export function PortalSurfaceMap({
  trace,
  inventory,
  run,
}: {
  trace: PortalExchange;
  inventory: string[];
  run: number;
}) {
  return (
    <figure className="portal-map" aria-label="Mappa a cipolla del portale">
      <figcaption>
        <Layers size={18} aria-hidden="true" /> Mappa a cipolla
      </figcaption>
      <div className="portal-origin">
        <User size={14} aria-hidden="true" /> {trace.actor}
      </div>
      <Journey key={run} trace={trace} started={run > 0} />
      <details className="portal-inventory">
        <summary>Ingressi osservati ({inventory.length})</summary>
        <p>{inventory.join(" · ")}</p>
        <p>
          Il confine di fiducia è il punto in cui cambia chi deve autorizzare la richiesta. Per
          esempio, per leggere il PDF lo storage riconosce il backend tramite le sue credenziali di
          servizio.
        </p>
      </details>
    </figure>
  );
}
