import { useEffect, useRef, useState } from "react";
import { FileText } from "lucide-react";
import { RequestArchitecture } from "./RequestArchitecture";
import { PageHeader } from "@/components/PageHeader";
import { HudButton, HudPanel } from "@/design-system/nightrunner";
import { buildRequestTrace, phases, requestLesson } from "@/content/lessons/request-response";
import "./WebSecurityLessons.css";

export function RequestResponseLesson() {
  const scene = useRef<HTMLDivElement>(null);
  const [cached, setCached] = useState(false);
  const [allowed, setAllowed] = useState(true);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const trace = buildRequestTrace(cached, allowed);
  const step = trace[index] ?? trace[0];
  const last = trace.length - 1;
  function go(i: number) {
    setPlaying(false);
    setIndex(i);
  }
  useEffect(() => {
    if (!playing) return;
    const timer = window.setTimeout(() => {
      if (index < last) setIndex(index + 1);
      if (index + 1 >= last) setPlaying(false);
    }, 5500);
    return () => window.clearTimeout(timer);
  }, [index, last, playing]);
  const common = trace.findIndex((s) => s.to === "Autorizzazione");
  return (
    <article className="web-lesson">
      <PageHeader
        title={requestLesson.title}
        subtitle="Questa volta Giulia apre 42.pdf nel browser. Segui la richiesta e osserva quando l’applicazione dispone di un’identità, di un permesso e infine dei byte."
      />
      <HudPanel heading="Apri file">
        <div className="web-sim-options">
          <label>
            <input
              type="checkbox"
              checked={cached}
              onChange={(e) => {
                setCached(e.target.checked);
                go(0);
              }}
            />{" "}
            Indirizzo DNS già in cache
          </label>
          <label>
            <input
              type="checkbox"
              checked={allowed}
              onChange={(e) => {
                setAllowed(e.target.checked);
                go(0);
              }}
            />{" "}
            Giulia può leggere il file 42
          </label>
        </div>
        <nav className="web-options" aria-label="Fasi della richiesta">
          {phases.map((p, i) => (
            <button
              key={p}
              aria-current={i === step.phase ? "step" : undefined}
              onClick={() => go(trace.findIndex((s) => s.phase === i))}
            >
              {i + 1}. {p}
            </button>
          ))}
        </nav>
        <div className="request-controls">
          {" "}
          <div className="web-options">
            <HudButton disabled={index === 0} onClick={() => go(index - 1)}>
              Indietro
            </HudButton>
            <HudButton disabled={index === last} onClick={() => go(index + 1)}>
              Avanti
            </HudButton>
            <button
              onClick={() => {
                if (playing) setPlaying(false);
                else {
                  if (index === last) setIndex(0);
                  setPlaying(true);
                }
              }}
            >
              {playing ? "Pausa" : index === last ? "Riproduci da capo" : "Riproduci"}
            </button>
          </div>
          <label className="web-select">
            Vai al passaggio
            <select value={index} onChange={(e) => go(Number(e.target.value))}>
              {trace.map((s, i) => (
                <option key={s.title} value={i}>
                  {i + 1}. {s.title}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="request-stage" ref={scene} tabIndex={-1}>
          <RequestArchitecture step={step} />
          <section className="web-detail" aria-label="Passaggio corrente">
            <small>
              Passo {index + 1} di {trace.length} · {phases[step.phase]}
            </small>
            <div
              className="web-reveal"
              key={step.title + step.output}
              aria-live={playing ? "off" : "polite"}
            >
              <h3>{step.title}</h3>
              <div className="web-io">
                <div>
                  <small>In ingresso</small>
                  <pre>{step.input}</pre>
                </div>
                <div>
                  <small>Risultato</small>
                  <pre>{step.output}</pre>
                </div>
              </div>
              <p>{step.why}</p>
              {(step.to === "Schermo" || step.to === "Giulia") && (
                <div className="web-rendered" data-allowed={allowed}>
                  <FileText aria-hidden="true" />
                  <div>
                    <b>{step.output}</b>
                    {allowed && (
                      <div className="web-page-lines" aria-hidden="true">
                        <i />
                        <i />
                        <i />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </HudPanel>
      <HudPanel heading="Stesso clic, cambia un permesso">
        <p>
          Il backend risolve la sessione e legge i metadati del file. Il modulo di autorizzazione
          confronta il soggetto, il tenant e il permesso richiesto prima di accedere ai byte.
          Confronta le due esecuzioni da quel punto.
        </p>
        <div className="web-branches">
          {[true, false].map((a) => (
            <div key={String(a)}>
              <h3>{a ? "Permesso concesso" : "Permesso negato"}</h3>
              <p>
                {a
                  ? "Il servizio apre l’oggetto e trasmette il PDF. Il proxy riceve una risposta 200."
                  : "Il servizio interrompe la lettura. Il proxy riceve un 403 e lo storage non viene chiamato."}
              </p>
              <button
                className="web-link"
                onClick={() => {
                  setAllowed(a);
                  go(common);
                  scene.current?.focus();
                }}
              >
                {a ? "Segui il caso consentito" : "Segui il caso negato"}
              </button>
            </div>
          ))}
        </div>
      </HudPanel>
    </article>
  );
}
