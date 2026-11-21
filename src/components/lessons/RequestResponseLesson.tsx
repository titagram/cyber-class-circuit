import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Database,
  FileText,
  Folder,
  Globe,
  LockKeyhole,
  Monitor,
  Network,
  ShieldCheck,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { HudButton, HudPanel } from "@/design-system/nightrunner";
import {
  buildRequestTrace,
  phases,
  requestLesson,
  type Hop,
} from "@/content/lessons/request-response";
import "./WebSecurityLessons.css";

const icons: Record<string, LucideIcon> = {
  Browser: Monitor,
  Schermo: Monitor,
  "Resolver DNS": Globe,
  "Cache DNS": Globe,
  "Reverse proxy": Network,
  Sessione: LockKeyhole,
  Autorizzazione: ShieldCheck,
  Database,
  Storage: Folder,
  Repository: Database,
};
const stack = [
  ["Ingresso HTTP", ["Router", "Sessione", "Controller"]],
  ["Logica applicativa", ["Servizio file", "Autorizzazione"]],
  ["Accesso ai dati", ["Repository", "Client storage"]],
  ["Servizi separati", ["Database", "Storage"]],
] as const;

function Handoff({ step }: { step: Hop }) {
  const From = icons[step.from] ?? Workflow;
  const To = icons[step.to] ?? Workflow;
  return (
    <figure className="web-transfer" aria-label={"Da " + step.from + " a " + step.to}>
      <div>
        <From aria-hidden="true" />
        <b>{step.from}</b>
      </div>
      <div className="web-track" data-channel={step.channel}>
        <span>{step.channel}</span>
        <i />
        <ArrowRight aria-hidden="true" />
      </div>
      <div>
        <To aria-hidden="true" />
        <b>{step.to}</b>
      </div>
    </figure>
  );
}

export function RequestResponseLesson() {
  const scene = useRef<HTMLElement>(null);
  const [cached, setCached] = useState(false);
  const [allowed, setAllowed] = useState(true);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [prediction, setPrediction] = useState("");
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
        subtitle="Giulia apre il file 42. Segui la richiesta e osserva quando l’applicazione dispone di un’identità, di un permesso e infine dei byte."
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
                setPrediction("");
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
        <div className="web-split trace-layout">
          <section ref={scene} tabIndex={-1} className="web-detail" aria-label="Passaggio corrente">
            <small>
              Passo {index + 1} di {trace.length} · {phases[step.phase]}
            </small>
            <div
              className="web-reveal"
              key={step.title + step.output}
              aria-live={playing ? "off" : "polite"}
            >
              <h3>{step.title}</h3>
              <Handoff step={step} />
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
              {index === last && (
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
          </section>
          <figure className="web-stack">
            <figcaption>
              {step.phase === 1 ? "Dentro il backend" : "Percorso sulla rete"}
            </figcaption>
            {step.phase === 1 ? (
              stack.map(([layer, nodes]) => (
                <div className="web-level" key={layer}>
                  <small>{layer}</small>
                  <div>
                    {nodes.map((n) => (
                      <span key={n} data-active={n === step.from || n === step.to}>
                        {n}
                      </span>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <>
                <div
                  className="web-dns"
                  data-active={step.from.includes("DNS") || step.to.includes("DNS")}
                >
                  Ramo DNS · {cached ? "Cache locale" : "Resolver"} ↔ Browser
                </div>
                <div className="web-network">
                  {(step.phase === 0
                    ? ["Browser", "Reverse proxy", "Backend"]
                    : ["Backend", "Reverse proxy", "Browser"]
                  ).map((n, i) => (
                    <div key={n}>
                      {i > 0 && <ArrowRight aria-hidden="true" />}
                      <span
                        data-active={
                          n === step.from ||
                          n === step.to ||
                          (n === "Backend" && (step.from === "Controller" || step.to === "Router"))
                        }
                      >
                        {n}
                      </span>
                    </div>
                  ))}
                </div>
                <p>
                  {step.phase === 0
                    ? "Il DNS fornisce l’indirizzo. La richiesta HTTP raggiunge il proxy e poi il backend."
                    : "Il proxy restituisce intestazioni e corpo sul collegamento con il browser."}
                </p>
              </>
            )}
          </figure>
        </div>
      </HudPanel>
      <HudPanel heading="Stesso clic, cambia un permesso">
        <p>
          La stessa sessione valida, lo stesso file, la stessa porta. Se togli a Giulia il permesso
          di lettura, dove si separano le due esecuzioni?
        </p>
        <div className="web-options">
          {["Reverse proxy", "Autorizzazione", "Storage"].map((v) => (
            <button key={v} aria-pressed={prediction === v} onClick={() => setPrediction(v)}>
              {v}
            </button>
          ))}
        </div>
        {prediction && (
          <div aria-live="polite">
            {prediction === "Autorizzazione" ? (
              <>
                <p>Esatto. Fino alla lettura della scheda del file i due percorsi coincidono.</p>
                <div className="web-branches">
                  {[true, false].map((a) => (
                    <div key={String(a)}>
                      <h3>{a ? "Permesso concesso" : "Permesso negato"}</h3>
                      <p>
                        {a
                          ? "Autorizzazione → storage → 200 → PDF"
                          : "Autorizzazione → controller → 403 → messaggio"}
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
              </>
            ) : (
              <p>
                {prediction === "Reverse proxy"
                  ? "Il proxy inoltra entrambe le richieste allo stesso backend. Quale modulo conosce Giulia e i permessi del file?"
                  : "Nel caso negato lo storage resta inattivo. Quale decisione impedisce al servizio di chiamarlo?"}
              </p>
            )}
          </div>
        )}
      </HudPanel>
    </article>
  );
}
