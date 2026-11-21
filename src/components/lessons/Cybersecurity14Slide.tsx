import { useState } from "react";
import {
  ArrowDownToLine,
  ArrowRight,
  FileText,
  Layers,
  Network,
  Send,
  User,
  Users,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import {
  actions,
  initialInputs,
  initialPortal,
  perform,
  sceneActions,
  scenes,
  type Action,
  type Inputs,
  type PortalExchange,
  type Scene,
} from "@/content/lessons/portal-42";
import "./WebSecurityLessons.css";
import "./Portal42.css";

const layers = ["Ingressi dall’esterno", "Funzioni applicative", "Servizi privati"];
const sceneIcons = [User, FileText, Users] as const;
const fields = [
  [User, "Chi agisce"],
  [Send, "Cosa invia"],
  [Network, "Chi risponde"],
  [ArrowDownToLine, "Cosa cambia"],
] as const;
const first = perform("home", initialPortal, initialInputs);

function SurfaceMap({ trace, inventory }: { trace: PortalExchange; inventory: string[] }) {
  return (
    <figure className="portal-map" aria-label="Mappa a cipolla del portale">
      <figcaption>
        <Layers size={18} aria-hidden="true" /> Mappa a cipolla
      </figcaption>
      <div className="portal-origin">
        <User size={14} aria-hidden="true" /> {trace.actor}
      </div>
      <div className="portal-map-content">
        <div className="onion" aria-hidden="true">
          {layers.map((layer, i) => (
            <div key={layer} className={`ring ring-${i}`} data-active={Boolean(trace.path[i])}>
              <span>{i + 1}</span>
            </div>
          ))}
          <strong className="portal-core">42.pdf</strong>
        </div>
        <ol className="portal-layers">
          {layers.map((layer, i) => (
            <li key={layer} data-active={Boolean(trace.path[i])}>
              <b>{i + 1}</b>
              <div>
                <small>{layer}</small>
                <strong>{trace.path[i] ?? "Fuori dal percorso"}</strong>
              </div>
            </li>
          ))}
        </ol>
      </div>
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

function ExchangeCard({ trace }: { trace: PortalExchange }) {
  const values = [trace.actor, trace.request, trace.responder, trace.effect];
  return (
    <section
      className="portal-card portal-exchange"
      aria-label="Ultimo scambio"
      aria-live="polite"
      aria-atomic="true"
    >
      <h3>{actions[trace.action]}</h3>
      <dl>
        {fields.map(([Icon, field], i) => {
          return (
            <div key={field}>
              <dt>
                <Icon size={16} aria-hidden="true" />
                {field}
              </dt>
              <dd>
                {i === 1 ? <code>{values[i]}</code> : values[i]}
                {i === 2 && <code>{trace.response}</code>}
              </dd>
            </div>
          );
        })}
      </dl>
    </section>
  );
}

const quiz = [
  { label: "Chi agisce", options: ["Giulia", "Il collega", "L’operatore"], correct: "Il collega" },
  {
    label: "Cosa invia",
    options: ["Il token nel link", "La password di Giulia", "I byte del PDF"],
    correct: "Il token nel link",
  },
  {
    label: "Chi decide se rispondere con il file",
    options: ["Lo schermo", "Il browser", "Il gestore delle condivisioni"],
    correct: "Il gestore delle condivisioni",
  },
  {
    label: "Cosa cambia",
    options: [
      "Si crea una nuova versione in archivio",
      "Il collega riceve una copia",
      "Il backup viene ripristinato",
    ],
    correct: "Il collega riceve una copia",
  },
];

function FinalCheck() {
  const [answers, setAnswers] = useState(quiz.map(() => ""));
  const [checked, setChecked] = useState(false);
  const correct = quiz.filter((q, i) => q.correct === answers[i]).length;
  return (
    <section className="portal-card" aria-label="Verifica finale">
      <h3>Verifica finale</h3>
      <p>
        Un collega apre un link ancora valido a 42.pdf dal suo browser. Ricostruisci questo scambio.
      </p>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          setChecked(true);
        }}
      >
        <div className="portal-quiz">
          {quiz.map((q, i) => (
            <label key={q.label}>
              {q.label}
              <select
                value={answers[i]}
                onChange={(event) => {
                  setAnswers(answers.map((a, j) => (i === j ? event.target.value : a)));
                  setChecked(false);
                }}
              >
                <option value="">Scegli…</option>
                {q.options.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
              {checked && q.correct !== answers[i] && <small>Da rivedere</small>}
            </label>
          ))}
        </div>
        <button type="submit" disabled={answers.some((a) => !a)}>
          Verifica lo scambio
        </button>
      </form>
      {checked && (
        <p className="portal-feedback" role="status">
          <strong>{correct}/4.</strong> Il browser del collega invia il token nel link. Il gestore
          trova la concessione attiva per il file 42, legge i byte e ne restituisce una copia.
          L’originale resta in archivio.
        </p>
      )}
    </section>
  );
}

export function Cybersecurity14Slide() {
  const [scene, setScene] = useState<Scene>(0);
  const [portal, setPortal] = useState(first.portal);
  const [inputs, setInputs] = useState(initialInputs);
  const [trace, setTrace] = useState(first.trace);
  const [observations, setObservations] = useState<PortalExchange[]>([first.trace]);
  const inventory = [...new Set(observations.map((item) => item.path[0]))];
  const [finalOpen, setFinalOpen] = useState(false);

  function observe(action: Action, settings = inputs) {
    const next = perform(action, portal, settings);
    setPortal(next.portal);
    setTrace(next.trace);
    setObservations((previous) => [
      ...previous.filter(
        (item) =>
          item.action !== action ||
          item.response.split(" ")[0] !== next.trace.response.split(" ")[0],
      ),
      next.trace,
    ]);
  }
  function enter(target: Scene) {
    if (scene === target) return;
    setScene(target);
    observe(sceneActions[target][0]);
  }
  function changePermission(allowed: boolean) {
    const settings = { ...inputs, allowed };
    setInputs(settings);
    observe("read", settings);
  }
  function settings<K extends keyof Inputs>(key: K, value: Inputs[K]) {
    setInputs((previous) => ({ ...previous, [key]: value }));
  }

  return (
    <article className="web-lesson portal-lesson">
      <PageHeader
        title="1.4 — Superfici di attacco e confini di fiducia"
        subtitle="Chi può interagire con 42.pdf dall’esterno? Ogni ingresso che accetta dati o comandi fa parte della superficie di attacco. Segui la richiesta dal primo anello fino al servizio che la gestisce."
      />
      <div className="portal-workbench">
        <SurfaceMap trace={trace} inventory={inventory} />
        <div className="portal-scenes">
          <nav aria-label="Scene del portale" className="portal-nav">
            {scenes.map((s, i) => {
              const Icon = sceneIcons[i as Scene];
              return (
                <button
                  key={s.name}
                  aria-current={scene === i ? "step" : undefined}
                  onClick={() => enter(i as Scene)}
                >
                  <Icon size={18} aria-hidden="true" />
                  {i + 1} · {s.name}
                </button>
              );
            })}
          </nav>
          <section className="portal-card" aria-label="Azioni del portale">
            <small>Scena {scene + 1} di 3 · Portale simulato</small>
            <h2>{scenes[scene].name}</h2>
            <p>{scenes[scene].intro}</p>
            {scene === 1 && (
              <p className="portal-context">
                Giulia può aggiornare e condividere il file. Il permesso di lettura si può cambiare
                per confrontare le due risposte.
              </p>
            )}
            {scene === 2 && (
              <p className="portal-context">
                Il collega ha il link /s/demo-{portal.link},{" "}
                {portal.revoked ? "revocato" : "attivo"}.{" "}
                {portal.link === 1
                  ? "Era già stato emesso all’inizio della simulazione."
                  : "È il link emesso da Giulia."}{" "}
                La versione corrente del PDF è v{portal.version}.
              </p>
            )}
            <div className="portal-actions">
              {sceneActions[scene].map((action) => (
                <div key={action} className="portal-action">
                  {action === "search" && (
                    <label>
                      Termine da cercare
                      <input
                        value={inputs.term}
                        onChange={(e) => settings("term", e.target.value)}
                      />
                    </label>
                  )}
                  {action === "login" && (
                    <label>
                      Credenziali simulate
                      <select
                        value={inputs.validCredentials ? "valid" : "invalid"}
                        onChange={(e) => settings("validCredentials", e.target.value === "valid")}
                      >
                        <option value="valid">Password corretta</option>
                        <option value="invalid">Password errata</option>
                      </select>
                    </label>
                  )}
                  {action === "read" && (
                    <label className="portal-permission">
                      <input
                        type="checkbox"
                        checked={inputs.allowed}
                        onChange={(e) => changePermission(e.target.checked)}
                      />
                      Permesso di lettura su 42.pdf
                    </label>
                  )}
                  <button
                    aria-pressed={action === trace.action}
                    disabled={action === "revoke" && portal.revoked}
                    onClick={() => observe(action)}
                  >
                    {action === "visitor" && portal.english
                      ? "Download · senza sessione"
                      : actions[action]}
                  </button>
                  {action === "login" && portal.failures >= 3 && (
                    <button
                      onClick={() => {
                        setPortal({ ...portal, failures: 0 });
                      }}
                    >
                      Avanza di 60 s
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>
          <ExchangeCard trace={trace} />
          <details className="portal-record">
            <summary>Rivedi gli scambi osservati ({observations.length})</summary>
            <ul>
              {observations.map((item) => (
                <li key={item.action + item.response.split(" ")[0]}>
                  <strong>
                    {item.actor} · {actions[item.action]}
                  </strong>
                  <code>
                    {item.request.split("\n")[0]} → {item.response}
                  </code>
                </li>
              ))}
            </ul>
          </details>
          {scene !== 2 ? (
            <button className="portal-next" onClick={() => enter(scene === 0 ? 1 : 2)}>
              Prosegui · {scenes[scene === 0 ? 1 : 2].name}
              <ArrowRight size={17} />
            </button>
          ) : (
            <>
              <button
                className="portal-next"
                aria-expanded={finalOpen}
                onClick={() => setFinalOpen(!finalOpen)}
              >
                {finalOpen ? "Chiudi la verifica finale" : "Vai alla verifica finale"}
                <ArrowRight size={17} />
              </button>
              <div hidden={!finalOpen}>
                <FinalCheck />
              </div>
            </>
          )}
        </div>
      </div>
    </article>
  );
}
