import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Copy,
  FileCheck2,
  FileText,
  LockKeyhole,
  RotateCcw,
  ShieldAlert,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/PageHeader";
import {
  HudBadge,
  HudNotice,
  HudPanel,
  HudTabPanel,
  HudTabs,
} from "@/design-system/nightrunner";
import {
  authenticityNote,
  conclusion,
  contract,
  countermeasures,
  countermeasuresNote,
  incidents,
  lesson,
  moments,
  nextQuestion,
  originalStates,
  precautions,
  properties,
  simulatorNote,
  statusLabels,
  type Incident,
  type IncidentId,
  type Moment,
  type PropertyId,
  type ScenarioId,
} from "@/content/lessons/cybersecurity-1-2";
import "./Cybersecurity12Slide.css";

const nextLabels: Partial<Record<Moment, string>> = {
  domanda: "Esplora gli incidenti",
  incidenti: "Scopri le contromisure",
  proprieta: "Confronta e concludi",
};

export function Cybersecurity12Slide() {
  const [moment, setMoment] = useState<Moment>("domanda");
  const [scenarioId, setScenarioId] = useState<ScenarioId>("originale");
  const [comparisonId, setComparisonId] = useState<IncidentId>("A");

  const scenario = incidents.find((incident) => incident.id === scenarioId);
  const comparison = incidents.find((incident) => incident.id === comparisonId) ?? incidents[0]!;

  return (
    <article className="cia-lesson" aria-labelledby="lesson-1-2-title">
      <div id="lesson-1-2-title">
        <PageHeader title={lesson.title} subtitle={lesson.subtitle} />
      </div>

      <HudTabs
        id="cybersecurity-1-2-moments"
        className="lesson-moments"
        label="Momenti della slide 1.2"
        items={moments}
        value={moment}
        onValueChange={(value) => setMoment(value as Moment)}
      />

      <HudTabPanel tabsId="cybersecurity-1-2-moments" value="domanda" activeValue={moment}>
        <HudPanel heading="Partiamo da un documento" className="lesson-panel-stack">
          <blockquote>«{lesson.openingQuestion}»</blockquote>
          <p>{lesson.openingText}</p>
          <p className="lesson-scenario">{lesson.scenario}</p>
          <p className="lesson-duration">Durata indicativa della spiegazione: {lesson.duration}</p>
          <div className="lesson-opening-document">
            <ContractDocument />
          </div>
          <MomentActions moment="domanda" onChange={setMoment} />
        </HudPanel>
      </HudTabPanel>

      <HudTabPanel tabsId="cybersecurity-1-2-moments" value="incidenti" activeValue={moment}>
        <HudPanel heading="Che cosa può succedere a questo documento?" className="lesson-panel-stack">
          <p className="lesson-scenario">
            Seleziona un evento sulla linea temporale e osserva come cambiano il documento e le sue proprietà.
          </p>
          <HudNotice>{simulatorNote}</HudNotice>
          <IncidentTimeline value={scenarioId} onChange={setScenarioId} />
          <div className="lesson-restore-row">
            <Button
              variant="outline"
              onClick={() => setScenarioId("originale")}
              disabled={scenarioId === "originale"}
            >
              <RotateCcw aria-hidden="true" /> Ripristina documento originale
            </Button>
          </div>
          <div className="lesson-simulator-layout">
            <div className="lesson-document-stage">
              <IncidentDocument scenarioId={scenarioId} />
              <section className="lesson-event-explanation" aria-live="polite">
                <span className="lesson-label">
                  {scenario ? `Scenario ${scenario.id}` : "Stato originale"}
                </span>
                <h3>{scenario?.title ?? "Documento originale"}</h3>
                <p>
                  {scenario?.event ??
                    "Il contratto è nella versione approvata, accessibile ai soli soggetti autorizzati."}
                </p>
                <p className="lesson-consequence">
                  {scenario?.consequence ?? "Nessun incidente in corso."}
                </p>
              </section>
            </div>
            <PropertyPanel scenario={scenario} />
          </div>
          <MomentActions moment="incidenti" onChange={setMoment} />
        </HudPanel>
      </HudTabPanel>

      <HudTabPanel tabsId="cybersecurity-1-2-moments" value="proprieta" activeValue={moment}>
        <div className="lesson-panel-stack">
          <HudPanel heading="La triade CIA e una proprietà ulteriore">
            <p className="lesson-scenario">
              La triade CIA comprende riservatezza, integrità e disponibilità. L'autenticità è una proprietà
              importante aggiuntiva, non un quarto elemento della triade originaria.
            </p>
            <div className="lesson-cia-grid">
              {properties
                .filter((property) => property.inCiaTriad)
                .map((property) => (
                  <PropertyDefinition key={property.id} propertyId={property.id} />
                ))}
            </div>
            <div className="lesson-authenticity-extension">
              <PropertyDefinition propertyId="autenticita" />
              <HudNotice>{authenticityNote}</HudNotice>
            </div>
          </HudPanel>

          <HudPanel heading="Come possiamo proteggere queste proprietà?">
            <p className="lesson-scenario">{countermeasuresNote}</p>
            <div className="lesson-controls-grid">
              {properties.map((property) => (
                <section key={property.id} className="lesson-control-card">
                  <h3>{property.name}</h3>
                  <span className="lesson-english">{property.english}</span>
                  <ul>
                    {countermeasures[property.id].map((control) => (
                      <li key={control}>
                        <Check aria-hidden="true" /> <span>{control}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
            <div className="lesson-precautions">
              {precautions.map((precaution) => (
                <HudNotice key={precaution} tone="warning">
                  {precaution}
                </HudNotice>
              ))}
            </div>
            <MomentActions moment="proprieta" onChange={setMoment} />
          </HudPanel>
        </div>
      </HudTabPanel>

      <HudTabPanel tabsId="cybersecurity-1-2-moments" value="confronto" activeValue={moment}>
        <div className="lesson-panel-stack">
          <HudPanel heading="Originale e incidente a confronto">
            <p className="lesson-scenario">
              Confronta simultaneamente il contratto originale con uno degli scenari per collegare cambiamento,
              proprietà, danno e controlli.
            </p>
            <IncidentTimeline value={comparisonId} onChange={setComparisonId} />
            <div className="lesson-comparison-documents">
              <div>
                <span className="lesson-label">Originale</span>
                <ContractDocument />
              </div>
              <div>
                <span className="lesson-label">Scenario {comparison.id}</span>
                <IncidentDocument scenarioId={comparison.id} compact />
              </div>
            </div>
            <ComparisonSummary incident={comparison} />
          </HudPanel>

          <section className="lesson-conclusion" aria-labelledby="lesson-1-2-conclusion-title">
            <h2 id="lesson-1-2-conclusion-title">Che cosa portiamo con noi</h2>
            <p>«{conclusion}»</p>
            <div className="lesson-next-question">
              <span className="lesson-label">Nella prossima slide</span>
              <strong>«{nextQuestion}»</strong>
            </div>
            <MomentActions moment="confronto" onChange={setMoment} />
          </section>
        </div>
      </HudTabPanel>
    </article>
  );
}

function IncidentTimeline({
  value,
  onChange,
}: {
  value: ScenarioId;
  onChange: (id: IncidentId) => void;
}) {
  return (
    <div className="lesson-incident-timeline" role="group" aria-label="Sequenza degli incidenti">
      {incidents.map((incident) => (
        <button
          key={incident.id}
          type="button"
          className="lesson-incident-button"
          aria-pressed={value === incident.id}
          onClick={() => onChange(incident.id)}
        >
          <span className="lesson-incident-code">{incident.id}</span>
          <span>{incident.title}</span>
        </button>
      ))}
    </div>
  );
}

function ContractDocument({ scenarioId }: { scenarioId?: ScenarioId }) {
  const isAltered = scenarioId === "B";
  const isUnavailable = scenarioId === "C";
  const isFake = scenarioId === "D";

  return (
    <section
      className={`lesson-contract${isUnavailable ? " lesson-contract-unavailable" : ""}`}
      aria-label={isUnavailable ? "Contratto di fornitura non disponibile" : "Contratto di fornitura"}
    >
      <div className="lesson-contract-heading">
        <FileText aria-hidden="true" />
        <div>
          <h3>{contract.title}</h3>
          <span>{contract.fictionalNotice}</span>
        </div>
        <HudBadge>{contract.classification}</HudBadge>
      </div>
      <dl className="lesson-contract-fields">
        <div>
          <dt>Cliente</dt>
          <dd>{contract.customer}</dd>
        </div>
        <div>
          <dt>Fornitore</dt>
          <dd>{contract.supplier}</dd>
        </div>
        <div className="lesson-contract-amount">
          <dt>Importo</dt>
          {isAltered ? (
            <dd className="lesson-amount-change">
              <span>
                <small>Originale</small>
                {contract.amount}
              </span>
              <ArrowRight aria-hidden="true" />
              <strong>
                <small>Alterato</small>
                {contract.alteredAmount}
              </strong>
            </dd>
          ) : (
            <dd>{contract.amount}</dd>
          )}
        </div>
        <div>
          <dt>Stato</dt>
          <dd>{isFake ? "Approvato (dichiarazione non verificata)" : contract.status}</dd>
        </div>
        <div>
          <dt>Firmatario dichiarato</dt>
          <dd>{contract.signer}</dd>
        </div>
        <div>
          <dt>Classificazione</dt>
          <dd>{contract.classification}</dd>
        </div>
      </dl>
      {isFake && (
        <div className="lesson-provenance-warning">
          <ShieldAlert aria-hidden="true" />
          <span>Provenienza verificata: non approvato da Mario Rossi</span>
        </div>
      )}
      {isUnavailable && (
        <div className="lesson-unavailable-overlay">
          <LockKeyhole aria-hidden="true" />
          <strong>Archivio non disponibile</strong>
          <span>Il documento non può essere consultato</span>
        </div>
      )}
    </section>
  );
}

function IncidentDocument({ scenarioId, compact = false }: { scenarioId: ScenarioId; compact?: boolean }) {
  return (
    <div className={`lesson-incident-document${compact ? " lesson-incident-document-compact" : ""}`}>
      <ContractDocument scenarioId={scenarioId} />
      {scenarioId === "A" && (
        <div className="lesson-external-copy">
          <Copy aria-hidden="true" />
          <UserRound aria-hidden="true" />
          <div>
            <strong>Copia acquisita</strong>
            <span>Soggetto esterno non autorizzato</span>
          </div>
        </div>
      )}
      {scenarioId === "D" && (
        <div className="lesson-provenance-comparison">
          <div>
            <span>Provenienza dichiarata</span>
            <strong>Mario Rossi</strong>
          </div>
          <div>
            <span>Provenienza effettivamente verificata</span>
            <strong>Non approvato da Mario Rossi</strong>
          </div>
        </div>
      )}
    </div>
  );
}

function PropertyPanel({ scenario }: { scenario: Incident | undefined }) {
  const states = scenario?.states ?? originalStates;
  return (
    <section className="lesson-property-panel" aria-live="polite" aria-label="Stato delle proprietà">
      <div className="lesson-property-panel-heading">
        <FileCheck2 aria-hidden="true" />
        <div>
          <h3>Proprietà del documento</h3>
          <p>{scenario ? `Scenario ${scenario.id}` : "Stato originale"}</p>
        </div>
      </div>
      <div className="lesson-property-list">
        {properties.map((property) => {
          const state = states[property.id];
          return (
            <article
              key={property.id}
              className={`lesson-property lesson-property-${state.status}`}
              data-testid={`property-${property.id}`}
            >
              <div className="lesson-property-heading">
                <h4>{property.name}</h4>
                <span className="lesson-property-status">{statusLabels[state.status]}</span>
              </div>
              <span className="lesson-english">{property.english}</span>
              <p className="lesson-property-definition">{property.definition}</p>
              <p className="lesson-property-reason">{state.reason}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function PropertyDefinition({ propertyId }: { propertyId: PropertyId }) {
  const property = properties.find((item) => item.id === propertyId)!;
  return (
    <section className="lesson-property-definition-card">
      <span className="lesson-label">{property.inCiaTriad ? "Triade CIA" : "Proprietà aggiuntiva"}</span>
      <h3>{property.name}</h3>
      <span className="lesson-english">{property.english}</span>
      <p>{property.definition}</p>
    </section>
  );
}

function ComparisonSummary({ incident }: { incident: Incident }) {
  const compromised = properties.filter(
    (property) => incident.states[property.id].status === "compromessa",
  );

  return (
    <section className="lesson-comparison-summary" aria-live="polite" aria-label="Sintesi del confronto">
      <h3>Che cosa ci dice questo confronto</h3>
      <dl>
        <div>
          <dt>Che cosa è cambiato</dt>
          <dd>{incident.changed}</dd>
        </div>
        <div>
          <dt>Proprietà compromesse</dt>
          <dd>{compromised.map((property) => property.name).join(", ")}</dd>
        </div>
        <div>
          <dt>Possibile danno</dt>
          <dd>{incident.consequence}</dd>
        </div>
        <div>
          <dt>Controlli che possono contrastare il problema</dt>
          <dd>
            <ul>
              {incident.controls.map((control) => (
                <li key={control}>{control}</li>
              ))}
            </ul>
          </dd>
        </div>
      </dl>
    </section>
  );
}

function MomentActions({ moment, onChange }: { moment: Moment; onChange: (moment: Moment) => void }) {
  const index = moments.findIndex((item) => item.value === moment);
  const previous = moments[index - 1];
  const next = moments[index + 1];

  return (
    <div className="lesson-step-actions">
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
