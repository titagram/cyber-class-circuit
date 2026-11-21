import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/PageHeader";
import { HudPanel, HudTabPanel, HudTabs } from "@/design-system/nightrunner";
import { CopiesExplorer } from "./CopiesExplorer";
import { ArchitectureLevelExplorer } from "./ArchitectureLevelExplorer";
import { StoredOrProcessedExplorer } from "./StoredOrProcessedExplorer";
import { TransitExplorer } from "./TransitExplorer";
import { FileOpeningScene } from "./FileOpeningScene";
import { TrustBoundaryExplorer } from "./TrustBoundaryExplorer";
import { DataFlowExplorer } from "@/components/data-flow/DataFlowExplorer";
import type { ArchitectureLevel } from "@/components/data-flow/types";
import {
  architecture,
  conclusion,
  conclusionHighlight,
  lesson,
  levels,
  moments,
  nextQuestion,
  stateDefinitions,
  trustBoundaryDefinition,
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
        <HudPanel heading="Giulia vuole scaricare un PDF" className="lesson-panel-stack">
          {moment === "domanda" && <FileOpeningScene />}
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
          <ArchitectureLevelExplorer key={architectureLevel} level={architectureLevel} />
          <MomentActions moment="espansione" onChange={setMoment} />
        </HudPanel>
      </HudTabPanel>

      <HudTabPanel tabsId="cybersecurity-1-3-moments" value="richiesta" activeValue={moment}>
        <HudPanel heading="Segui una richiesta" className="lesson-panel-stack">
          <p className="lesson-scenario">
            Giulia scarica 42.pdf. Avvia la sequenza, mettila in pausa oppure scegli direttamente un evento: richiesta e risposta sono simulate localmente.
          </p>
          {moment === "richiesta" && (
            <DataFlowExplorer config={architecture} level={2} mode="simulate" />
          )}
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
          {dataState === "transit" ? (
            <TransitExplorer />
          ) : (
            <StoredOrProcessedExplorer state={dataState} />
          )}
          <MomentActions moment="stati" onChange={setMoment} />
        </HudPanel>
      </HudTabPanel>

      <HudTabPanel tabsId="cybersecurity-1-3-moments" value="copie" activeValue={moment}>
        <HudPanel heading="Quante copie esistono?" className="lesson-panel-stack">
          <CopiesExplorer />
          <MomentActions moment="copie" onChange={setMoment} />
        </HudPanel>
      </HudTabPanel>

      <HudTabPanel tabsId="cybersecurity-1-3-moments" value="confini" activeValue={moment}>
        <HudPanel heading="Trust boundary: dove cambia la fiducia" className="lesson-panel-stack">
          <p className="lesson-scenario">{trustBoundaryDefinition}</p>
          <TrustBoundaryExplorer />
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
