import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { HudPanel } from "@/design-system/nightrunner";
import { exposurePoints } from "@/content/lessons/cybersecurity-1-5";
import { webTitles } from "@/content/lessons/web-module";
import { ReviewPath } from "./WebReviewExplorer";

export function Cybersecurity15Slide() {
  const [revoked, setRevoked] = useState(false);
  const [selected, setSelected] = useState(0);
  const point = exposurePoints[selected]!;
  const observation = point.observe(revoked);
  return (
    <article className="web-lesson">
      <PageHeader
        title={webTitles["cybersecurity-1-5"]!}
        subtitle="Il collega ha già scaricato e salvato 42.pdf. Giulia può revocare il link. Osserva quale percorso viene chiuso e quali altre identità possono ancora trattare il contenuto."
      />
      <HudPanel heading="Esposizione del file prima e dopo la revoca">
        <div className="web-options" role="group" aria-label="Stato del link">
          <button aria-pressed={!revoked} onClick={() => setRevoked(false)}>
            Prima della revoca
          </button>
          <button aria-pressed={revoked} onClick={() => setRevoked(true)}>
            Dopo la revoca
          </button>
        </div>
        <div className="web-options" role="group" aria-label="Punto di osservazione">
          {exposurePoints.map((p, i) => (
            <button key={p.label} aria-pressed={i === selected} onClick={() => setSelected(i)}>
              {p.label}
            </button>
          ))}
        </div>
        <section className="review-case" aria-label="Evidenza sul file" aria-live="polite">
          <ReviewPath route={observation.route} />
          <h3>{point.label}</h3>
          <p>{point.identity}</p>
          <code>{observation.artifact}</code>
          <div className="web-branches">
            <div>
              <h3>Cosa dimostra</h3>
              <p>{observation.meaning}</p>
            </div>
            <div>
              <h3>Controllo da presidiare</h3>
              <p>{point.control}</p>
            </div>
          </div>
        </section>
      </HudPanel>
    </article>
  );
}
