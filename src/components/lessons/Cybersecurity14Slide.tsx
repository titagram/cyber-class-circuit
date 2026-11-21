import { useState } from "react";
import { FileText, Globe, Search, Upload } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { HudPanel } from "@/design-system/nightrunner";
import {
  catalog,
  exchange,
  home,
  layerNames,
  readFile,
  type Exchange,
  type Finding,
} from "@/content/lessons/portal-42";
import "./WebSecurityLessons.css";
import "./Portal42.css";

type Discovery = { finding: Finding; source: string; evidence: string };
type Login = "valid" | "password" | "unknown";

export function Cybersecurity14Slide() {
  const [trace, setTrace] = useState(home);
  const [choice, setChoice] = useState<number | null>(null);
  const [verified, setVerified] = useState(false);
  const [discoveries, setDiscoveries] = useState<Discovery[]>([]);
  const [layer, setLayer] = useState(0);
  const [page, setPage] = useState<"home" | "catalog" | "results">("home");
  const [english, setEnglish] = useState(false);
  const [term, setTerm] = useState("bilancio");
  const [submitted, setSubmitted] = useState("");
  const [loginCase, setLoginCase] = useState<Login>("valid");
  const [signed, setSigned] = useState(false);
  const [allowed, setAllowed] = useState(false);
  const [failures, setFailures] = useState(0);
  const [revision, setRevision] = useState(1);
  const [uploads, setUploads] = useState(0);
  const [revoked, setRevoked] = useState(false);
  const [linkNumber, setLinkNumber] = useState(0);
  const hasFile = page === "catalog" || (page === "results" && matches(submitted));

  function observe(event: Exchange) {
    setTrace(event);
    setVerified(false);
    setChoice(null);
  }

  function verify() {
    if (choice === null || verified) return;
    const newNodes = trace.findings.filter(
      ([, name]) => !discoveries.some((d) => d.finding[1] === name),
    );
    setDiscoveries([
      ...discoveries,
      ...newNodes.map((finding) => ({
        finding,
        evidence: trace.evidence,
        source: trace.request.split("\n")[0] + " → " + trace.response.split("\n")[0],
      })),
    ]);
    setLayer((newNodes.at(-1) ?? trace.findings[0])[0]);
    setVerified(true);
  }

  function login() {
    if (signed) {
      setSigned(false);
      observe(
        exchange(
          "logout",
          "POST /logout\nCookie: session=demo",
          "204 No Content\nCookie di sessione scaduto",
        ),
      );
      return;
    }
    const account = loginCase === "unknown" ? "utente-demo" : "Giulia";
    const request = "POST /login\nAccount: " + account + "\nPassword: •••• (demo)";
    if (failures >= 3) {
      observe(exchange("limited", request, "429 Too Many Requests\nRetry-After: 60"));
    } else if (loginCase !== "valid") {
      setFailures(failures + 1);
      observe(exchange("loginError", request, "401 Unauthorized\nCredenziali non valide"));
    } else {
      setSigned(true);
      setFailures(0);
      observe(
        exchange("signed", request, "200 OK\nSet-Cookie: session=demo; HttpOnly; Secure\nGiulia"),
      );
    }
  }

  function changeLanguage() {
    const lang = english ? "it" : "en";
    setEnglish(!english);
    observe(
      exchange(
        "language",
        "GET /locales/" + lang + ".json",
        "200 OK · application/json\n" +
          JSON.stringify({
            catalog: english ? "Catalogo" : "Catalogue",
            search: english ? "Cerca" : "Search",
          }),
      ),
    );
  }

  function search() {
    const value = term.trim();
    setSubmitted(value);
    setPage("results");
    observe(
      exchange(
        "search",
        "GET /api/search?q=" + encodeURIComponent(value),
        "200 OK · application/json\n" +
          JSON.stringify({ term: value, results: matches(value) ? ["42.pdf"] : [] }),
      ),
    );
  }

  function upload() {
    setUploads(uploads + 1);
    setRevision(uploads + 2);
    observe(
      exchange(
        "upload",
        "POST /api/documents\nCookie: session=demo\nmultipart/form-data · id 42 · 42.pdf · byte PDF simulati",
        "200 OK\n42.pdf · versione " + (uploads + 2),
      ),
    );
  }

  function share() {
    setLinkNumber(linkNumber + 1);
    setRevoked(false);
    observe(
      exchange(
        "share",
        "POST /api/documents/42/links\nCookie: session=demo",
        `201 Created\n/s/demo-${linkNumber + 1} · lettura di 42.pdf`,
      ),
    );
  }

  return (
    <article className="web-lesson portal-lesson">
      <PageHeader
        title="1.4 — Superfici di attacco e confini di fiducia"
        subtitle="Esplora il portale di 42.pdf. Osserva uno scambio, scegli una spiegazione e confrontala con il comportamento del servizio simulato."
      />
      <div className="portal-workbench">
        <section
          id="portal42-window"
          className="portal-window"
          aria-label="Portale simulato di 42.pdf"
        >
          <div className="portal-address">
            <Globe aria-hidden="true" /> files.example <span>Simulazione locale</span>
          </div>
          <div className="portal-body">
            <div className="portal-heading">
              <h2>{english ? "Document portal" : "Portale documenti"}</h2>
              <span>{signed ? "Giulia" : english ? "Guest" : "Visitatore"}</span>
            </div>
            <nav className="web-options" aria-label="Pagine del portale">
              <button
                type="button"
                aria-current={page === "home" ? "page" : undefined}
                onClick={() => {
                  setPage("home");
                  observe(home());
                }}
              >
                Home
              </button>
              <button
                type="button"
                aria-current={page === "catalog" ? "page" : undefined}
                onClick={() => {
                  setPage("catalog");
                  observe(catalog());
                }}
              >
                {english ? "Catalogue" : "Catalogo"}
              </button>
              <button type="button" onClick={changeLanguage}>
                {english ? "Lingua: Italiano" : "Lingua: English"}
              </button>
            </nav>
            <form
              className="portal-search"
              onSubmit={(e) => {
                e.preventDefault();
                search();
              }}
            >
              <label htmlFor="portal42-search">
                {english ? "Search the public catalogue" : "Cerca nel catalogo pubblico"}
              </label>
              <div>
                <input
                  id="portal42-search"
                  maxLength={80}
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                />
                <button type="submit">
                  <Search aria-hidden="true" />
                  {english ? "Search" : "Cerca"}
                </button>
              </div>
            </form>
            <div className="portal-listing">
              {page === "home" && (
                <p>
                  {english
                    ? "Open the catalogue to see the public file listing."
                    : "Apri il catalogo per vedere la scheda pubblica del file."}
                </p>
              )}
              {page === "results" && (
                <p>
                  {english ? "Results for" : "Risultati per"} «{submitted}» · {hasFile ? 1 : 0}
                </p>
              )}
              {hasFile && (
                <div className="portal-document">
                  <FileText aria-hidden="true" />
                  <div>
                    <strong>42.pdf</strong>
                    <small>{english ? "Annual report" : "Bilancio annuale"}</small>
                  </div>
                  <button
                    type="button"
                    onClick={() => observe(readFile(signed, allowed, revision))}
                  >
                    {english ? "Open PDF" : "Apri PDF"}
                  </button>
                </div>
              )}
            </div>
            {(trace.kind === "allowed" ||
              trace.kind === "preview" ||
              trace.kind === "sharedRead") && (
              <div className="portal-paper" aria-label="Rappresentazione simulata del PDF">
                <FileText aria-hidden="true" />
                <small>{trace.kind === "preview" ? "Miniatura" : "PDF ricevuto"}</small>
                <strong>Bilancio annuale</strong>
                <span>42.pdf · versione {revision}</span>
              </div>
            )}
            {(trace.kind === "visitor" ||
              trace.kind === "denied" ||
              trace.kind === "loginError" ||
              trace.kind === "limited") && (
              <p className="portal-feedback">
                {trace.kind === "visitor"
                  ? "Accedi per aprire il file."
                  : trace.kind === "denied"
                    ? "Lettura del file non consentita."
                    : trace.kind === "limited"
                      ? "Accesso temporaneamente sospeso. Riprova tra 60 secondi."
                      : "Credenziali non valide."}
              </p>
            )}
            <div className="portal-account">
              <label htmlFor="portal42-account">
                {english ? "Demo account" : "Account dimostrativo"}
              </label>
              <div className="web-options">
                {!signed && (
                  <select
                    id="portal42-account"
                    aria-label="Credenziali simulate"
                    value={loginCase}
                    onChange={(e) => setLoginCase(e.target.value as Login)}
                  >
                    <option value="valid">Giulia · credenziali valide</option>
                    <option value="password">Giulia · password errata</option>
                    <option value="unknown">Account sconosciuto</option>
                  </select>
                )}
                <button type="button" onClick={login}>
                  {signed ? "Esci" : "Accedi come demo"}
                </button>
                {!signed && failures >= 3 && (
                  <button
                    type="button"
                    onClick={() => {
                      setFailures(0);
                    }}
                  >
                    Avanza di 60 s nel simulatore
                  </button>
                )}
              </div>
              {signed && (
                <div className="portal-permit">
                  <label>
                    <input
                      type="checkbox"
                      checked={allowed}
                      onChange={(e) => {
                        setAllowed(e.target.checked);
                        observe(readFile(true, e.target.checked, revision));
                      }}
                    />{" "}
                    Consenti a Giulia la lettura di 42.pdf e riprova
                  </label>
                </div>
              )}
            </div>
            <div className="portal-upload">
              <strong>
                <Upload aria-hidden="true" /> {english ? "Upload" : "Caricamento"}
              </strong>
              <p>
                {signed
                  ? "Giulia può aggiornare il file. Usa il PDF dimostrativo già selezionato."
                  : "Accedi con Giulia per aggiornare il PDF dimostrativo."}
              </p>
              <button type="button" disabled={!signed} onClick={upload}>
                Carica una versione di 42.pdf
              </button>
              {uploads > 0 && (
                <div className="web-options" role="group" aria-label="Altre operazioni sul file">
                  <button
                    type="button"
                    disabled={!signed || !allowed}
                    onClick={() =>
                      observe(
                        exchange(
                          "preview",
                          "GET /api/documents/42/preview\nCookie: session=demo",
                          "200 OK · image/png\nMiniatura della versione " + revision,
                        ),
                      )
                    }
                  >
                    Genera anteprima
                  </button>
                  <button type="button" disabled={!signed || !allowed} onClick={share}>
                    {linkNumber > 0 ? "Crea un nuovo link" : "Crea link condiviso"}
                  </button>
                  {linkNumber > 0 && (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          observe(
                            revoked
                              ? exchange(
                                  "sharedGone",
                                  `GET /s/demo-${linkNumber} · browser del collega`,
                                  "410 Gone\nNessun byte del PDF",
                                )
                              : exchange(
                                  "sharedRead",
                                  `GET /s/demo-${linkNumber} · browser del collega`,
                                  "200 OK · application/pdf\n42.pdf · versione " + revision,
                                ),
                          )
                        }
                      >
                        Apri link come collega
                      </button>
                      <button
                        type="button"
                        disabled={revoked || !signed}
                        onClick={() => {
                          setRevoked(true);
                          observe(
                            exchange(
                              "revoke",
                              `DELETE /api/documents/42/links/demo-${linkNumber}\nCookie: session=demo`,
                              "204 No Content\nConcessione revocata",
                            ),
                          );
                        }}
                      >
                        Revoca il link
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setRevision(1);
                      observe(
                        exchange(
                          "restore",
                          "POST /admin/restores\nSessione: operatore demo\nFile 42 · copia v1",
                          "200 OK\nVersione corrente ripristinata: 1",
                        ),
                      );
                    }}
                  >
                    Ripristina v1 come operatore demo
                  </button>
                </div>
              )}
            </div>
            <a className="portal-jump" href="#portal42-trace">
              Osserva lo scambio ↓
            </a>
          </div>
        </section>
        <section
          id="portal42-trace"
          className="portal-inspector"
          aria-label="Taccuino di osservazione"
        >
          <h2>Scambio osservato</h2>
          <div aria-live="polite">
            <h3>Richiesta</h3>
            <pre>{trace.request}</pre>
            <h3>Risposta</h3>
            <pre>{trace.response}</pre>
          </div>
          <fieldset className="portal-choices">
            <legend>{trace.question}</legend>
            {trace.hypotheses.map((option, i) => (
              <label key={option}>
                <input
                  type="radio"
                  name="portal42-hypothesis"
                  disabled={verified}
                  checked={choice === i}
                  onChange={() => setChoice(i)}
                />
                {option}
              </label>
            ))}
          </fieldset>
          <button type="button" disabled={choice === null || verified} onClick={verify}>
            Verifica l’ipotesi
          </button>
          <div role="status" aria-label="Verifica del portale">
            {verified && (
              <div className="portal-proof">
                <strong>
                  {choice === trace.correct ? "Ipotesi confermata" : "Ipotesi smentita"}
                </strong>
                <pre aria-label="Traccia interna simulata">{trace.evidence}</pre>
                <p>{trace.proof}</p>
                <small>Sulla mappa · {trace.findings.map(([, name]) => name).join(" · ")}</small>
              </div>
            )}
          </div>
          <a className="portal-jump" href="#portal42-window">
            Torna al portale ↑
          </a>
        </section>
      </div>
      <HudPanel heading="La tua mappa a cipolla">
        <div className="web-split" aria-label="Scoperte verificate">
          <figure className="web-map" aria-label="Mappa a cipolla del portale">
            <div className="onion">
              {layerNames.map((name, i) => {
                const nodes = discoveries.filter((d) => d.finding[0] === i);
                return nodes.length ? (
                  <button
                    key={name}
                    type="button"
                    className={"ring ring-" + i}
                    aria-pressed={i === layer}
                    aria-label={name}
                    onClick={() => setLayer(i)}
                  >
                    <span>
                      {name}
                      <small>
                        {nodes.length} {nodes.length === 1 ? "scoperta" : "scoperte"}
                      </small>
                    </span>
                  </button>
                ) : null;
              })}
              <div className="portal-map-file">
                <FileText aria-hidden="true" />
                <strong>42.pdf</strong>
              </div>
            </div>
            <figcaption>
              {discoveries.length
                ? "Seleziona un anello per rivedere le evidenze raccolte."
                : "La prima verifica farà comparire un anello."}
            </figcaption>
          </figure>
          <section
            className="web-detail"
            aria-live="polite"
            aria-label="Inventario delle superfici"
          >
            <h3>{discoveries.length ? layerNames[layer] : "Nessuna superficie verificata"}</h3>
            {discoveries.length ? (
              <ul className="portal-findings">
                {discoveries
                  .filter((d) => d.finding[0] === layer)
                  .map((d) => (
                    <li key={d.finding[1]}>
                      <strong>{d.finding[1]}</strong>
                      <code>{d.source}</code>
                      <small>{d.evidence}</small>
                    </li>
                  ))}
              </ul>
            ) : (
              <p>
                Nel taccuino trovi già la risposta che ha aperto la home. Scegli un’ipotesi e
                verificala, poi continua a esplorare.
              </p>
            )}
          </section>
        </div>
      </HudPanel>
    </article>
  );
}

function matches(term: string) {
  return "42.pdf bilancio annuale annual report".includes(term.toLowerCase());
}
