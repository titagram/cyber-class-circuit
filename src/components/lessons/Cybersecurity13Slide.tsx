import { useState } from "react";
import { ArrowLeft, ArrowRight, ArrowRightCircle, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/PageHeader";
import { HudBadge, HudNotice, HudPanel, HudTabPanel, HudTabs } from "@/design-system/nightrunner";
import { DataFlowExplorer } from "@/components/data-flow/DataFlowExplorer";
import type { ArchitectureLevel } from "@/components/data-flow/types";
import {
  architecture,
  conclusion,
  conclusionHighlight,
  contract,
  copiesHighlight,
  copyLocations,
  deletionAnswer,
  deletionQuestion,
  lesson,
  levels,
  moments,
  nextQuestion,
  stateDefinitions,
  stateHighlights,
  stateMessage,
  trustAnswer,
  trustBoundaryDefinition,
  trustHighlight,
  trustQuestion,
  type DataState,
  type Moment,
} from "@/content/lessons/cybersecurity-1-3";
import "./Cybersecurity13Slide.css";

const nextLabels: Partial<Record<Moment, string>> = {
  domanda: "Costruisci l'architettura",
  essenziale: "Espandi l'architettura",
  espansione: "Segui una richiesta",
  richiesta: "Esplora gli stati del dato",
  stati: "Cerca le copie",
  copie: "Esamina i confini",
  confini: "Vai alla conclusione",
};

export function Cybersecurity13Slide() {
  const [moment, setMoment] = useState<Moment>("domanda");
  const [architectureLevel, setArchitectureLevel] = useState<ArchitectureLevel>(2);
  const [dataState, setDataState] = useState<DataState>("transit");
  const currentLevel = levels.find((item) => item.value === architectureLevel)!;
  const currentState = stateDefinitions[dataState];
  const trustConnections = architecture.connections.filter((connection) =>
    ["browser-proxy", "proxy-backend", "backend-database", "backend-cache"].includes(connection.id),
  );

  return (
    <article className="journey-lesson" aria-labelledby="lesson-1-3-title">
      <div id="lesson-1-3-title">
        <PageHeader title={lesson.title} subtitle={lesson.subtitle} />
      </div>

      <HudTabs
        id="cybersecurity-1-3-moments"
        className="lesson-moments"
        label="Momenti della slide 1.3"
        items={moments}
        value={moment}
        onValueChange={(value) => setMoment(value as Moment)}
      />

      <HudTabPanel tabsId="cybersecurity-1-3-moments" value="domanda" activeValue={moment}>
        <HudPanel heading="Partiamo dal contratto" className="lesson-panel-stack">
          <blockquote>«{lesson.openingQuestion}»</blockquote>
          <p>{lesson.openingText}</p>
          <p className="lesson-scenario">{lesson.scenario}</p>
          <p className="lesson-duration">Durata indicativa della spiegazione guidata: {lesson.duration}</p>
          <ContractDocument />
          <MomentActions moment="domanda" onChange={setMoment} />
        </HudPanel>
      </HudTabPanel>

      <HudTabPanel tabsId="cybersecurity-1-3-moments" value="essenziale" activeValue={moment}>
        <HudPanel heading="Livello 1 — Architettura essenziale" className="lesson-panel-stack">
          <p className="lesson-scenario">
            Per ora esistono soltanto tre componenti. Selezionali per scoprire come collaborano: la risposta completa arriverà seguendo il percorso del documento.
          </p>
          <DataFlowExplorer config={architecture} level={1} />
          <MomentActions moment="essenziale" onChange={setMoment} />
        </HudPanel>
      </HudTabPanel>

      <HudTabPanel tabsId="cybersecurity-1-3-moments" value="espansione" activeValue={moment}>
        <HudPanel heading="Costruiamo l'architettura un livello alla volta" className="lesson-panel-stack">
          <div className="journey-level-controls" role="group" aria-label="Livello di approfondimento dell'architettura">
            {levels.map((level) => (
              <button
                key={level.value}
                type="button"
                aria-pressed={architectureLevel === level.value}
                onClick={() => setArchitectureLevel(level.value)}
              >
                {level.label}
              </button>
            ))}
          </div>
          <div className="journey-level-description" aria-live="polite">
            <h3>{currentLevel.title}</h3>
            <p>{currentLevel.description}</p>
          </div>
          <DataFlowExplorer config={architecture} level={architectureLevel} />
          {architectureLevel >= 2 && (
            <div className="journey-metadata-notice">
              <div>
                <h3>Nel database: i metadati</h3>
                <p>Titolo, ID 42, tenant, classificazione e riferimento <code>{contract.fileReference}</code>.</p>
              </div>
              <div>
                <h3>Nell'object storage: il contenuto</h3>
                <p>Il file 42.pdf con il contratto vero e proprio. Metadati e contenuto hanno ruoli e luoghi distinti.</p>
              </div>
            </div>
          )}
          <MomentActions moment="espansione" onChange={setMoment} />
        </HudPanel>
      </HudTabPanel>

      <HudTabPanel tabsId="cybersecurity-1-3-moments" value="richiesta" activeValue={moment}>
        <HudPanel heading="Segui una richiesta" className="lesson-panel-stack">
          <p className="lesson-scenario">
            L'utente apre il contratto 42. Avvia la sequenza, mettila in pausa oppure scegli direttamente un evento: richiesta e risposta sono simulate localmente.
          </p>
          <DataFlowExplorer config={architecture} level={2} mode="simulate" />
          <MomentActions moment="richiesta" onChange={setMoment} />
        </HudPanel>
      </HudTabPanel>

      <HudTabPanel tabsId="cybersecurity-1-3-moments" value="stati" activeValue={moment}>
        <HudPanel heading="Dove si trova il dato?" className="lesson-panel-stack">
          <div className="journey-state-controls" role="group" aria-label="Stato dell'informazione">
            {(Object.keys(stateDefinitions) as DataState[]).map((state) => (
              <button
                key={state}
                type="button"
                aria-pressed={dataState === state}
                onClick={() => setDataState(state)}
              >
                {stateDefinitions[state].label}
              </button>
            ))}
          </div>
          <DataFlowExplorer config={architecture} level={3} highlight={stateHighlights[dataState]} />
          <div className="journey-state-explanation" aria-live="polite">
            <section>
              <span className="lesson-label">{currentState.label}</span>
              <h3>{currentState.title}</h3>
              <p>{currentState.description}</p>
            </section>
            <ul className="journey-example-list">
              {currentState.examples.map((example) => (
                <li key={example}><ArrowRightCircle aria-hidden="true" /> {example}</li>
              ))}
            </ul>
          </div>
          <HudNotice>{stateMessage}</HudNotice>
          <MomentActions moment="stati" onChange={setMoment} />
        </HudPanel>
      </HudTabPanel>

      <HudTabPanel tabsId="cybersecurity-1-3-moments" value="copie" activeValue={moment}>
        <HudPanel heading="Quante copie esistono?" className="lesson-panel-stack">
          <p className="lesson-scenario">
            Partiamo dal documento 42. Le copie realmente presenti nello scenario sono distinte dalle informazioni derivate e dalle copie che altre configurazioni potrebbero produrre.
          </p>
          <DataFlowExplorer config={architecture} level={3} highlight={copiesHighlight} />
          <div className="journey-copies-grid">
            {copyLocations.map((copy) => (
              <section className="journey-copy-card" key={copy.place}>
                <div className="journey-copy-card-heading">
                  <h3>{copy.place}</h3>
                  <span className={`journey-copy-status journey-copy-status-${copy.status}`}>
                    {copy.status === "presente" ? "Presente nello scenario" : copy.status === "derivata" ? "Informazione derivata" : "Copia possibile"}
                  </span>
                </div>
                <p>{copy.detail}</p>
              </section>
            ))}
          </div>
          <section className="journey-copy-question">
            <span className="lesson-label">La domanda da non saltare</span>
            <h3>«{deletionQuestion}»</h3>
            <p>{deletionAnswer}</p>
          </section>
          <MomentActions moment="copie" onChange={setMoment} />
        </HudPanel>
      </HudTabPanel>

      <HudTabPanel tabsId="cybersecurity-1-3-moments" value="confini" activeValue={moment}>
        <HudPanel heading="Trust boundary: dove cambia la fiducia" className="lesson-panel-stack">
          <p className="lesson-scenario">{trustBoundaryDefinition}</p>
          <DataFlowExplorer
            config={architecture}
            level={3}
            highlight={trustHighlight}
            showTrustBoundaries
          />
          <div className="journey-trust-links" aria-label="Valutazione dei singoli collegamenti">
            {trustConnections.map((connection) => (
              <div className="journey-trust-link" key={connection.id}>
                <strong>{connection.label}</strong>
                <span>{connection.protection}</span>
              </div>
            ))}
          </div>
          <section className="journey-trust-question">
            <span className="lesson-label">Un tratto alla volta</span>
            <h3>«{trustQuestion}»</h3>
            <p>{trustAnswer}</p>
          </section>
          <MomentActions moment="confini" onChange={setMoment} />
        </HudPanel>
      </HudTabPanel>

      <HudTabPanel tabsId="cybersecurity-1-3-moments" value="conclusione" activeValue={moment}>
        <div className="lesson-panel-stack">
          <HudPanel heading="La mappa completa del viaggio">
            <p className="lesson-scenario">
              In ciano i componenti che elaborano il documento, in giallo quelli che conservano dati o possibili copie. Le linee mostrano le trasmissioni e i confini di fiducia.
            </p>
            <DataFlowExplorer
              config={architecture}
              level={3}
              highlight={conclusionHighlight}
              showTrustBoundaries
            />
          </HudPanel>
          <section className="journey-conclusion" aria-labelledby="lesson-1-3-conclusion-title">
            <h2 id="lesson-1-3-conclusion-title">Che cosa portiamo con noi</h2>
            <p>«{conclusion}»</p>
            <div className="journey-next-question">
              <span className="lesson-label">Nella prossima slide</span>
              <strong>«{nextQuestion}»</strong>
            </div>
            <MomentActions moment="conclusione" onChange={setMoment} />
          </section>
        </div>
      </HudTabPanel>
    </article>
  );
}

function ContractDocument() {
  return (
    <section className="journey-opening-document" aria-label="Contratto di fornitura — ID 42">
      <div className="journey-document-heading">
        <FileText aria-hidden="true" />
        <div>
          <h3>{contract.title}</h3>
          <span>Documento simulato · Tutti i dati sono fittizi</span>
        </div>
        <HudBadge tone="warning">{contract.classification}</HudBadge>
      </div>
      <dl className="journey-document-fields">
        <div><dt>Cliente</dt><dd>{contract.customer}</dd></div>
        <div><dt>Fornitore</dt><dd>{contract.supplier}</dd></div>
        <div><dt>Importo</dt><dd>{contract.amount}</dd></div>
      </dl>
    </section>
  );
}

function MomentActions({ moment, onChange }: { moment: Moment; onChange: (moment: Moment) => void }) {
  const index = moments.findIndex((item) => item.value === moment);
  const previous = moments[index - 1];
  const next = moments[index + 1];

  return (
    <div className="journey-step-actions">
      {previous && (
        <Button variant="outline" onClick={() => onChange(previous.value)}>
          <ArrowLeft aria-hidden="true" /> Indietro
        </Button>
      )}
      {next && (
        <Button onClick={() => onChange(next.value)}>
          {nextLabels[moment] ?? "Continua"} <ArrowRight aria-hidden="true" />
        </Button>
      )}
    </div>
  );
}
