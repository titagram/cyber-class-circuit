import { useState } from "react";
import { ArrowDown, FileText } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { HudPanel } from "@/design-system/nightrunner";
import {
  layers,
  surfaces,
  viewpoints,
  type SurfaceId,
  type Viewpoint,
} from "@/content/lessons/cybersecurity-1-4";
import "./WebSecurityLessons.css";

const defaults: Record<(typeof layers)[number], SurfaceId> = {
  "Rete pubblica": "edge",
  "Funzioni web": "login",
  "Servizi interni": "redis",
};
const surfaceIds = Object.keys(surfaces) as SurfaceId[];
const firstView: Record<Viewpoint, SurfaceId> = { visitor: "edge", user: "read", service: "redis" };

export function Cybersecurity14Slide() {
  const [view, setView] = useState<Viewpoint>("visitor");
  const [selected, select] = useState<SurfaceId>("edge");
  const [upload, setUpload] = useState(false);
  const [answer, setAnswer] = useState("");
  const item = surfaces[selected];
  const reach =
    view === "service"
      ? ["Percorso utente", "Eseguito qui", "Raggiungibile"]
      : ["Raggiungibile", "Raggiungibile", "Solo dal backend"];
  const choices = surfaceIds.filter(
    (id) => surfaces[id].layer === item.layer && (upload || id !== "upload"),
  );
  function toggleUpload() {
    setUpload(!upload);
    select(upload ? "read" : "upload");
    setAnswer("");
  }
  return (
    <article className="web-lesson">
      <PageHeader
        title="1.4 — Superfici di attacco e confini di fiducia"
        subtitle="Da dove puoi interagire con la webapp? Cambia punto di vista e segui l’ingresso fino a chi decide."
      />
      <HudPanel heading="La superficie di attacco della webapp">
        <p>
          Ogni interfaccia che accetta una connessione, un comando o dei dati offre un punto di
          interazione. Gli anelli mostrano dove si trovano questi ingressi e da chi sono
          raggiungibili.
        </p>
        <div className="web-options" role="group" aria-label="Punto di vista">
          {(Object.keys(viewpoints) as Viewpoint[]).map((v) => (
            <button
              key={v}
              aria-pressed={view === v}
              onClick={() => {
                setView(v);
                select(firstView[v]);
              }}
            >
              {viewpoints[v]}
            </button>
          ))}
        </div>
        <div className="web-split">
          <figure className="web-map">
            <div className="onion">
              {layers.map((name, i) => (
                <button
                  key={name}
                  className={"ring ring-" + i}
                  data-reachable={reach[i] === "Raggiungibile"}
                  aria-label={name}
                  aria-pressed={item.layer === i}
                  onClick={() => select(defaults[name])}
                >
                  <span>
                    {name}
                    <small>{reach[i]}</small>
                  </span>
                </button>
              ))}
              <FileText className="onion-file" aria-hidden="true" />
            </div>
            <figcaption>
              {view === "service"
                ? "Dal backend sono visibili le interfacce private."
                : "Dal browser si entra dal proxy. Il backend contatta i servizi privati."}
            </figcaption>
          </figure>
          <section className="web-detail" aria-label="Interfaccia selezionata">
            <small>
              Anello {item.layer + 1} di 3 · {layers[item.layer]}
            </small>
            <div className="web-options" role="group" aria-label="Ingressi dell’anello">
              {choices.map((id) => (
                <button key={id} aria-pressed={id === selected} onClick={() => select(id)}>
                  {surfaces[id].label}
                </button>
              ))}
            </div>
            <div key={selected + view} className="web-reveal" aria-live="polite">
              <h3>{item.label}</h3>
              <code>{item.input}</code>
              <div className="web-receiver">
                <ArrowDown aria-hidden="true" /> {item.receiver}
              </div>
              <p>{item.observation[view]}</p>
              <small>Confine di fiducia</small>
              <p>{item.boundary}</p>
            </div>
          </section>
        </div>
      </HudPanel>
      <HudPanel heading="Una funzione in più, la stessa porta">
        <p>
          Il gestionale permette di aprire un file. Abilita il caricamento e osserva quale anello
          acquista un nuovo ingresso.
        </p>
        <div className="web-options">
          <button aria-pressed={upload} onClick={toggleUpload}>
            {upload ? "Disattiva caricamento" : "Attiva caricamento"}
          </button>
        </div>
        <figure className="web-fan" aria-label="Operazioni sullo stesso ingresso HTTPS">
          <code>HTTPS · 443</code>
          <ul>
            <li>POST /login</li>
            <li>GET /api/files/42</li>
            {upload && <li className="web-reveal">POST /api/files · caricamento</li>}
          </ul>
        </figure>
        {upload && (
          <div>
            <p>Dove è cresciuta la superficie?</p>
            <div className="web-options">
              {["Sulla porta di rete", "Nelle funzioni web"].map((a) => (
                <button key={a} aria-pressed={answer === a} onClick={() => setAnswer(a)}>
                  {a}
                </button>
              ))}
            </div>
            <p role="status">
              {answer &&
                (answer === "Nelle funzioni web"
                  ? "Esatto. La stessa porta ora accetta anche il nome e i byte di un nuovo file."
                  : "La porta è ancora la 443. Confronta i dati che il gestionale accettava prima e dopo.")}
            </p>
          </div>
        )}
      </HudPanel>
      <HudPanel heading="Due superfici fuori dal percorso principale">
        <div className="web-branches">
          <div>
            <h3>Pagina nel browser</h3>
            <p>
              Il nome del file torna dal server alla pagina. Il componente che lo visualizza deve
              inserirlo come testo, perché quel nome può provenire da un altro utente.
            </p>
          </div>
          <div>
            <h3>Ripristino del backup</h3>
            <p>
              La console di ripristino accetta una richiesta da un operatore autorizzato. Ha un
              ingresso e permessi propri, anche quando nessuno sta aprendo il file.
            </p>
          </div>
        </div>
      </HudPanel>
    </article>
  );
}
