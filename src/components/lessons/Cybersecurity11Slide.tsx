import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowLeft,
  ArrowRight,
  Contact,
  FileText,
  KeyRound,
  Landmark,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/PageHeader";
import {
  HudNotice,
  HudPanel,
  HudTabPanel,
  HudTabs,
} from "@/design-system/nightrunner";
import {
  assets,
  conclusion,
  crimeFactors,
  lesson,
  moments,
  nextQuestion,
  reduction,
  riskConcepts,
  riskNote,
  type FactorId,
  type Moment,
} from "@/content/lessons/cybersecurity-1-1";
import "./Cybersecurity11Slide.css";

const assetIcons: Record<string, LucideIcon> = {
  account: UserRound,
  "dati-personali": Contact,
  documenti: FileText,
  economia: Landmark,
  configurazioni: KeyRound,
};

const nextLabels: Partial<Record<Moment, string>> = {
  domanda: "Identifica gli asset",
  asset: "Esplora il triangolo",
  triangolo: "Riduciamo le opportunità",
};

const defaultAsset = assets[0]!;
const defaultFactor = crimeFactors[0]!;
const defaultSituation = reduction.situations[0]!;

export function Cybersecurity11Slide() {
  const [moment, setMoment] = useState<Moment>("domanda");
  const [assetId, setAssetId] = useState<(typeof assets)[number]["id"]>(defaultAsset.id);
  const [factorId, setFactorId] = useState<FactorId>("capacita");
  const [situationId, setSituationId] = useState<"A" | "B">("A");

  const selectedAsset = assets.find((asset) => asset.id === assetId) ?? defaultAsset;
  const selectedFactor = crimeFactors.find((factor) => factor.id === factorId) ?? defaultFactor;
  const situation = reduction.situations.find((item) => item.id === situationId) ?? defaultSituation;

  return (
    <article className="cyber-lesson" aria-labelledby="lesson-title">
      <div id="lesson-title">
        <PageHeader title={lesson.title} subtitle={lesson.subtitle} />
      </div>

      <HudTabs
        id="cybersecurity-1-1-moments"
        className="lesson-moments"
        label="Momenti della slide"
        items={moments}
        value={moment}
        onValueChange={(value) => setMoment(value as Moment)}
      />

      <HudTabPanel tabsId="cybersecurity-1-1-moments" value="domanda" activeValue={moment}>
        <HudPanel heading="Partiamo dalla nostra applicazione" className="lesson-panel-stack">
          <blockquote>«{lesson.openingQuestion}»</blockquote>
          <p>{lesson.openingText}</p>
          <p className="lesson-scenario">{lesson.scenario}</p>
          <MomentActions moment="domanda" onChange={setMoment} />
        </HudPanel>
      </HudTabPanel>

      <HudTabPanel tabsId="cybersecurity-1-1-moments" value="asset" activeValue={moment}>
        <HudPanel heading="Quali asset hanno valore?" className="lesson-panel-stack">
          <p className="lesson-scenario">
            {lesson.scenario} Seleziona un asset per esaminare contenuto, valore, accessi legittimi e possibili danni.
          </p>
          <div className="lesson-assets-layout">
            <ul className="lesson-asset-list" aria-label="Asset del gestionale SaaS">
              {assets.map((asset) => {
                const Icon = assetIcons[asset.id] ?? FileText;
                return (
                  <li key={asset.id}>
                    <button
                      type="button"
                      className="lesson-asset-button"
                      aria-pressed={asset.id === selectedAsset.id}
                      onClick={() => setAssetId(asset.id)}
                    >
                      <Icon className="h-5 w-5" aria-hidden="true" />
                      <span>{asset.name}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
            <section className="lesson-asset-detail" aria-live="polite" aria-label={`Dettagli: ${selectedAsset.name}`}>
              <h3>{selectedAsset.name}</h3>
              <p className="text-sm text-muted-foreground">{selectedAsset.summary}</p>
              <dl className="lesson-detail-grid">
                <div>
                  <dt>Che cosa contiene</dt>
                  <dd>{selectedAsset.contains}</dd>
                </div>
                <div>
                  <dt>Perché ha valore</dt>
                  <dd>{selectedAsset.value}</dd>
                </div>
                <div>
                  <dt>Chi dovrebbe accedervi</dt>
                  <dd>{selectedAsset.access}</dd>
                </div>
                <div>
                  <dt>Possibili danni</dt>
                  <dd>{selectedAsset.damages}</dd>
                </div>
              </dl>
            </section>
          </div>
          <MomentActions moment="asset" onChange={setMoment} />
        </HudPanel>
      </HudTabPanel>

      <HudTabPanel tabsId="cybersecurity-1-1-moments" value="triangolo" activeValue={moment}>
        <div className="lesson-panel-stack">
          <HudPanel heading="Che cosa serve perché un attaccante possa colpire?">
            <p className="lesson-scenario">
              Il Crime Triangle mette a fuoco tre condizioni di un attacco intenzionale. Seleziona ciascun vertice per esplorarlo.
            </p>
            <div className="lesson-triangle-layout mt-6">
              <CrimeTriangle selected={factorId} onSelect={setFactorId} />
              <section className="lesson-factor-detail" aria-live="polite" aria-label={`Fattore: ${selectedFactor.title}`}>
                <h3>
                  {selectedFactor.title} <span className="text-sm text-muted-foreground">({selectedFactor.english})</span>
                </h3>
                <p>{selectedFactor.description}</p>
                <p className="lesson-example">
                  <span className="lesson-label">Esempio nel SaaS</span>
                  {selectedFactor.example}
                </p>
                <p>
                  <span className="lesson-label">Come contribuisce all'attacco</span>
                  {selectedFactor.contribution}
                </p>
              </section>
            </div>
          </HudPanel>

          <HudPanel heading="Distinguere minaccia, vulnerabilità e rischio">
            <dl className="lesson-risk-grid">
              {riskConcepts.map((concept) => (
                <div key={concept.term}>
                  <dt>{concept.term}</dt>
                  <dd>{concept.definition}</dd>
                </div>
              ))}
            </dl>
            <HudNotice className="mt-4">{riskNote}</HudNotice>
            <MomentActions moment="triangolo" onChange={setMoment} />
          </HudPanel>
        </div>
      </HudTabPanel>

      <HudTabPanel tabsId="cybersecurity-1-1-moments" value="opportunita" activeValue={moment}>
        <div className="lesson-panel-stack">
          <HudPanel heading={reduction.title}>
            <p className="lesson-scenario">{reduction.scenario}</p>
            <div className="lesson-situation-controls mt-5" role="group" aria-label="Confronta i due controlli dell'endpoint">
              {reduction.situations.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="lesson-situation-button"
                  aria-pressed={situationId === item.id}
                  onClick={() => setSituationId(item.id)}
                >
                  {item.title}
                </button>
              ))}
            </div>
            <div className="lesson-reduction-layout">
              <CrimeTriangle reduced={situationId === "B"} />
              <section className="lesson-situation-detail" aria-live="polite" aria-label={situation.title}>
                <h3>{situation.title}</h3>
                <p>{situation.description}</p>
                <p className="font-semibold">{situation.outcome}</p>
              </section>
            </div>
            <HudNotice tone={situationId === "A" ? "warning" : "info"} className="mt-6">
              {reduction.message}
            </HudNotice>
          </HudPanel>

          <section className="lesson-conclusion" aria-labelledby="lesson-conclusion-title">
            <h2 id="lesson-conclusion-title">Che cosa portiamo con noi</h2>
            <p>«{conclusion}»</p>
            <div className="lesson-next-question">
              <span className="lesson-label">Nella prossima slide</span>
              <strong>«{nextQuestion}»</strong>
            </div>
            <MomentActions moment="opportunita" onChange={setMoment} />
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
    <div className="lesson-step-actions">
      {previous && (
        <Button variant="outline" onClick={() => onChange(previous.value)}>
          <ArrowLeft /> Indietro
        </Button>
      )}
      {next && (
        <Button onClick={() => onChange(next.value)}>
          {nextLabels[moment] ?? "Continua"} <ArrowRight />
        </Button>
      )}
    </div>
  );
}

function CrimeTriangle({
  selected,
  onSelect,
  reduced = false,
}: {
  selected?: FactorId;
  onSelect?: (factor: FactorId) => void;
  reduced?: boolean;
}) {
  return (
    <div
      className={`lesson-triangle${reduced ? " lesson-triangle-reduced" : ""}`}
      role={onSelect ? "group" : "img"}
      aria-label={
        onSelect
          ? "Crime Triangle: seleziona un fattore"
          : reduced
            ? "Crime Triangle: l'opportunità specifica è attenuata e i suoi lati sono interrotti"
            : "Crime Triangle: capacità, motivazione e opportunità sono presenti"
      }
    >
      <svg className="lesson-triangle-svg" viewBox="0 0 600 450" aria-hidden="true">
        <line className="lesson-triangle-line" x1="300" y1="64" x2="86" y2="370" />
        <line className="lesson-triangle-line lesson-line-opportunity" x1="514" y1="370" x2="300" y2="64" />
        <line className="lesson-triangle-line lesson-line-opportunity" x1="86" y1="370" x2="514" y2="370" />
      </svg>
      {crimeFactors.map((factor) => {
        const className = `lesson-factor lesson-factor-${factor.id}`;
        const content = (
          <>
            {factor.title}
            <small>{factor.english}</small>
          </>
        );
        return onSelect ? (
          <button
            key={factor.id}
            type="button"
            className={className}
            aria-pressed={selected === factor.id}
            onClick={() => onSelect(factor.id)}
          >
            {content}
          </button>
        ) : (
          <div key={factor.id} className={className}>
            {content}
          </div>
        );
      })}
      <div className="lesson-triangle-center">
        POSSIBILITÀ
        <br />
        DI ATTACCO
      </div>
    </div>
  );
}
