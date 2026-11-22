import { useState } from "react";
import { ArrowRight, Layers, Route, Server, User } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { HudPanel } from "@/design-system/nightrunner";
import type { ReviewCase } from "@/content/lessons/web-module";
import "./WebSecurityLessons.css";
import "./WebReview.css";

export function ReviewPath({ route }: { route: readonly string[] }) {
  const icons = [User, Route, Server, Layers];
  return (
    <ol className="review-path" aria-label="Percorso nel modello">
      {route.map((label, i) => {
        const Icon = icons[i] ?? Server;
        return (
          <li key={label}>
            {i > 0 && <ArrowRight className="review-arrow" aria-hidden="true" />}
            <Icon aria-hidden="true" />
            <span>{label}</span>
          </li>
        );
      })}
    </ol>
  );
}

export function WebReviewExplorer({
  title,
  intro,
  heading,
  cases,
}: {
  title: string;
  intro: string;
  heading: string;
  cases: readonly ReviewCase[];
}) {
  const [index, setIndex] = useState(0);
  const current = cases[index]!;
  const [alternate, setAlternate] = useState(false);
  const sample = (alternate && current.variant) || current;
  function choose(i: number) {
    setIndex(i);
    setAlternate(false);
  }
  return (
    <article className="web-lesson">
      <PageHeader title={title} subtitle={intro} />
      <HudPanel heading={heading}>
        {current.variant ? (
          <div className="web-options" role="group" aria-label={heading}>
            {cases.map((c, i) => (
              <button key={c.name} aria-pressed={index === i} onClick={() => choose(i)}>
                {c.name}
              </button>
            ))}
          </div>
        ) : (
          <div className="review-map" role="group" aria-label={heading}>
            {cases.map((c, i) => (
              <button key={c.name} aria-pressed={index === i} onClick={() => choose(i)}>
                <strong>{c.name}</strong>
                <span>
                  {c.route[0]} → {c.route[1]}
                </span>
              </button>
            ))}
          </div>
        )}
        <section className="review-case" aria-label="Analisi del percorso" aria-live="polite">
          {current.variant && (
            <div className="web-options" role="group" aria-label="Confronta gli scambi">
              <button aria-pressed={!alternate} onClick={() => setAlternate(false)}>
                Richiesta di riferimento
              </button>
              <button aria-pressed={alternate} onClick={() => setAlternate(true)}>
                {current.variant.label}
              </button>
            </div>
          )}
          <ReviewPath route={sample.route} />
          <h3>{current.name}</h3>
          <code>{sample.input}</code>
          <p>{sample.decision}</p>
          <div className="web-branches">
            <div>
              <h3>Possibile esposizione</h3>
              <p>{current.risk}</p>
            </div>
            <div>
              <h3>Dove intervenire</h3>
              <p>{current.control}</p>
            </div>
          </div>
          {current.implementation && (
            <details className="review-code">
              <summary>Controllo nel codice · pseudocodice</summary>
              <pre>{current.implementation}</pre>
            </details>
          )}
          <h3>Evidenza da verificare</h3>
          <p>{current.evidence}</p>
        </section>
      </HudPanel>
    </article>
  );
}
