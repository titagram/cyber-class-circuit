import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, MapPin, RotateCcw, ShieldCheck, Workflow } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { DataFlowExplorer } from "@/components/data-flow/DataFlowExplorer";
import { HudButton, HudNotice, HudPanel, HudTabPanel, HudTabs } from "@/design-system/nightrunner";
import { architecture } from "@/content/lessons/cybersecurity-1-3";
import {
  attackPerspectives,
  attackSurfaceLesson,
  surfaceScenarios,
  type PerspectiveId,
  type ScenarioId,
} from "@/content/lessons/cybersecurity-1-4";

import "./DataFlowLessons.css";

const tabsId = "cybersecurity-1-4-perspectives";
const tabs = Object.entries(attackPerspectives).map(([value, { label }]) => ({ value, label }));
const scenarios = Object.entries(surfaceScenarios) as [
  ScenarioId,
  (typeof surfaceScenarios)[ScenarioId],
][];
const phases = [
  { label: "Accesso ipotizzato", icon: MapPin },
  { label: "Percorso e confine", icon: Workflow },
  { label: "Controllo ed esito", icon: ShieldCheck },
] as const;
const advanceLabels = ["Segui il percorso", "Verifica il controllo", "Ricomincia"] as const;

export function Cybersecurity14Slide() {
  const [selection, setSelection] = useState<{ id: ScenarioId; phase: number }>({
    id: "browser",
    phase: 0,
  });
  const heading = useRef<HTMLHeadingElement>(null);
  const focusFromMap = useRef(false);
  const { id, phase } = selection;
  const scenario = surfaceScenarios[id];
  const focusNodeIds = useMemo(
    () => (phase === 0 ? [scenario.focus] : [scenario.start, scenario.focus]),
    [phase, scenario],
  );
  const choices = scenarios.filter(([, option]) => option.perspective === scenario.perspective);
  const highlight =
    phase === 0
      ? { nodes: [scenario.start] }
      : phase === 2
        ? { ...scenario.highlight, nodes: [scenario.focus] }
        : scenario.highlight;

  useEffect(() => {
    if (focusFromMap.current) {
      focusFromMap.current = false;
      heading.current?.focus();
    }
  }, [selection]);

  function selectScenario(nextId: ScenarioId) {
    setSelection({ id: nextId, phase: 0 });
  }

  return (
    <article className="max-w-[1180px]">
      <PageHeader title={attackSurfaceLesson.title} subtitle={attackSurfaceLesson.subtitle} />
      <HudPanel heading="Segui un tentativo di accesso" className="min-w-0 space-y-4">
        <p className="text-muted-foreground">
          Una superficie di attacco comprende i punti in cui una persona o un servizio può
          interagire con il gestionale o i suoi dati. Seleziona un’icona sulla mappa o scegli una
          prospettiva. Poi segui il tentativo e il controllo che protegge il contratto.
        </p>
        <HudTabs
          id={tabsId}
          className="flow-lesson-tabs flex-wrap"
          label="Prospettive sulla superficie di attacco"
          items={tabs}
          value={scenario.perspective}
          onValueChange={(value) =>
            selectScenario(attackPerspectives[value as PerspectiveId].first)
          }
        />
        {tabs.map(({ value }) => (
          <HudTabPanel key={value} tabsId={tabsId} value={value} activeValue={scenario.perspective}>
            {value === scenario.perspective && (
              <div className="surface-story">
                <div className="surface-story-heading">
                  <h3 ref={heading} tabIndex={-1}>
                    {scenario.label}
                  </h3>
                  {choices.length > 1 && (
                    <label className="surface-picker">
                      Componente
                      <select
                        value={id}
                        onChange={(event) =>
                          selectScenario(event.currentTarget.value as ScenarioId)
                        }
                      >
                        {choices.map(([key, option]) => (
                          <option key={key} value={key}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}
                </div>
                <ol className="surface-phases" aria-label="Passi del percorso">
                  {phases.map(({ label, icon: Icon }, index) => (
                    <li key={label}>
                      <button
                        type="button"
                        aria-current={index === phase ? "step" : undefined}
                        onClick={() => setSelection({ id, phase: index })}
                      >
                        <Icon aria-hidden="true" />
                        <span>
                          {index + 1}. {label}
                        </span>
                      </button>
                    </li>
                  ))}
                </ol>
                <div className="surface-scene" aria-live="polite">
                  {phase === 0 && (
                    <div>
                      <h4>Accesso ipotizzato</h4>
                      <p>{scenario.access}</p>
                    </div>
                  )}
                  {phase === 1 && (
                    <div>
                      <h4>{scenario.path}</h4>
                      <p className="surface-boundary">Confine · {scenario.boundary}</p>
                      <p>{scenario.crossing}</p>
                    </div>
                  )}
                  {phase === 2 && (
                    <>
                      <div>
                        <h4>Controllo da verificare</h4>
                        <p>{scenario.control}</p>
                      </div>
                      <div className="surface-outcome">
                        <h4>
                          <ShieldCheck aria-hidden="true" /> {scenario.outcome}
                        </h4>
                        <p>
                          <strong>Rischio senza il controllo.</strong> {scenario.impact}
                        </p>
                      </div>
                    </>
                  )}
                </div>
                <div className="surface-story-actions">
                  <HudButton
                    onClick={() => setSelection({ id, phase: (phase + 1) % phases.length })}
                  >
                    {advanceLabels[phase]}
                    {phase === 2 ? (
                      <RotateCcw aria-hidden="true" />
                    ) : (
                      <ArrowRight aria-hidden="true" />
                    )}
                  </HudButton>
                </div>
              </div>
            )}
          </HudTabPanel>
        ))}
        <DataFlowExplorer
          className="surface-map"
          config={architecture}
          level={3}
          highlight={highlight}
          focusNodeIds={focusNodeIds}
          nodeSelection={{
            id: id === "network" ? null : scenario.focus,
            onChange: (nodeId) => {
              const match = scenarios.find(([key]) => key === nodeId);
              if (match) {
                focusFromMap.current = true;
                selectScenario(match[0]);
              }
            },
          }}
          showTrustBoundaries
        />
        <HudNotice>
          Al confine di fiducia cambiano le regole di accesso. Un utente può entrare nel gestionale
          e avere comunque bisogno di un permesso sul singolo contratto. Un servizio interno può
          raggiungere un archivio e avere comunque bisogno di un permesso sui dati che custodisce.
        </HudNotice>
      </HudPanel>
    </article>
  );
}
