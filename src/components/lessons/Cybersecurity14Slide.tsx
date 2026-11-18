import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { DataFlowExplorer } from "@/components/data-flow/DataFlowExplorer";
import { HudNotice, HudPanel, HudTabPanel, HudTabs } from "@/design-system/nightrunner";
import { architecture } from "@/content/lessons/cybersecurity-1-3";
import {
  attackPerspectives,
  attackSurfaceLesson,
  type PerspectiveId,
} from "@/content/lessons/cybersecurity-1-4";

const tabsId = "cybersecurity-1-4-perspectives";
const tabs = Object.entries(attackPerspectives).map(([value, { label }]) => ({ value, label }));

export function Cybersecurity14Slide() {
  const [perspectiveId, setPerspectiveId] = useState<PerspectiveId>("device");
  const perspective = attackPerspectives[perspectiveId];

  return (
    <article>
      <PageHeader title={attackSurfaceLesson.title} subtitle={attackSurfaceLesson.subtitle} />
      <HudPanel heading="Da dove può essere esposto il contratto 42?" className="min-w-0 space-y-4">
        <p>
          La superficie di attacco comprende i punti attraverso cui si può interagire con il sistema
          o raggiungere i suoi dati. Scegli una prospettiva per capire quale accesso conta e quale
          controllo va verificato.
        </p>
        <HudTabs
          id={tabsId}
          className="flex-wrap"
          label="Prospettive sulla superficie di attacco"
          items={tabs}
          value={perspectiveId}
          onValueChange={(value) => setPerspectiveId(value as PerspectiveId)}
        />
        {tabs.map(({ value }) => (
          <HudTabPanel key={value} tabsId={tabsId} value={value} activeValue={perspectiveId}>
            {value === perspectiveId && (
              <dl className="grid gap-3 md:grid-cols-3">
                <div className="border border-border bg-card p-3">
                  <dt className="font-semibold text-accent">Accesso ipotizzato</dt>
                  <dd className="mt-1 text-sm">{perspective.access}</dd>
                </div>
                <div className="border border-border bg-card p-3">
                  <dt className="font-semibold text-accent">Conseguenza sul contratto</dt>
                  <dd className="mt-1 text-sm">{perspective.impact}</dd>
                </div>
                <div className="border border-border bg-card p-3">
                  <dt className="font-semibold text-accent">Controllo da verificare</dt>
                  <dd className="mt-1 text-sm">{perspective.control}</dd>
                </div>
              </dl>
            )}
          </HudTabPanel>
        ))}
        <DataFlowExplorer
          config={architecture}
          level={3}
          highlight={perspective.highlight}
          showTrustBoundaries
        />
        <HudNotice>
          Un confine di fiducia indica dove cambiano le responsabilità o i privilegi. È un punto in
          cui verificare quali identità, operazioni e collegamenti sono ammessi.
        </HudNotice>
      </HudPanel>
    </article>
  );
}
