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

import "./DataFlowLessons.css";

const tabsId = "cybersecurity-1-4-perspectives";
const tabs = Object.entries(attackPerspectives).map(([value, { label }]) => ({ value, label }));

export function Cybersecurity14Slide() {
  const [perspectiveId, setPerspectiveId] = useState<PerspectiveId>("device");
  const perspective = attackPerspectives[perspectiveId];

  return (
    <article className="max-w-[1180px]">
      <PageHeader title={attackSurfaceLesson.title} subtitle={attackSurfaceLesson.subtitle} />
      <HudPanel heading="Da dove può essere esposto il contratto 42?" className="min-w-0 space-y-4">
        <p className="text-muted-foreground">
          Il contratto 42 attraversa più sistemi. Scegli una prospettiva e osserva sulla mappa quali
          componenti e confini sono coinvolti.
        </p>
        <HudTabs
          id={tabsId}
          className="flow-lesson-tabs flex-wrap"
          label="Prospettive sulla superficie di attacco"
          items={tabs}
          value={perspectiveId}
          onValueChange={(value) => setPerspectiveId(value as PerspectiveId)}
        />
        <DataFlowExplorer
          className="surface-map"
          config={architecture}
          level={3}
          highlight={perspective.highlight}
          focusNodeId={perspective.focusNodeId}
          showTrustBoundaries
        />
        {tabs.map(({ value }) => (
          <HudTabPanel key={value} tabsId={tabsId} value={value} activeValue={perspectiveId}>
            {value === perspectiveId && (
              <dl className="grid grid-cols-1 gap-px border border-border border-t-accent bg-border md:grid-cols-3">
                <div className="bg-card p-4">
                  <dt className="font-semibold text-accent">Accesso ipotizzato</dt>
                  <dd className="mt-1 text-sm leading-relaxed">{perspective.access}</dd>
                </div>
                <div className="bg-card p-4">
                  <dt className="font-semibold text-accent">Conseguenza sul contratto</dt>
                  <dd className="mt-1 text-sm leading-relaxed">{perspective.impact}</dd>
                </div>
                <div className="bg-card p-4">
                  <dt className="font-semibold text-accent">Controllo da verificare</dt>
                  <dd className="mt-1 text-sm leading-relaxed">{perspective.control}</dd>
                </div>
              </dl>
            )}
          </HudTabPanel>
        ))}
        <HudNotice>
          La superficie di attacco è l’insieme dei punti in cui si può interagire con il sistema o
          raggiungere i suoi dati. Nei confini di fiducia cambiano le responsabilità o i privilegi e
          vanno verificati gli accessi consentiti.
        </HudNotice>
      </HudPanel>
    </article>
  );
}
