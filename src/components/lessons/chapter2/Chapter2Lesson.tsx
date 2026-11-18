import type { ComponentType } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, ExternalLink, Lightbulb } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { HudPanel } from "@/design-system/nightrunner";
import { chapter2, cryptoLessonIds, type CryptoLessonId } from "@/content/lessons/chapter2";
import { AuthenticatedEncryptionLab, IntegrityLab } from "./SymmetricLabs";
import { ModularMathLab } from "./ModularMathLab";
import { KeyLifecycleLab, SignatureLab, TlsHandshakeLab } from "./TrustAndLifecycleLabs";
import "./Chapter2Lesson.css";

const labs = {
  "cybersecurity-2-1": AuthenticatedEncryptionLab,
  "cybersecurity-2-2": IntegrityLab,
  "cybersecurity-2-3": ModularMathLab,
  "cybersecurity-2-4": SignatureLab,
  "cybersecurity-2-5": TlsHandshakeLab,
  "cybersecurity-2-6": KeyLifecycleLab,
} satisfies Record<CryptoLessonId, ComponentType>;

export function Chapter2Lesson({ id }: { id: CryptoLessonId }) {
  const lesson = chapter2[id];
  const Lab = labs[id];
  const index = cryptoLessonIds.indexOf(id);
  const previous = cryptoLessonIds[index - 1];
  const next = cryptoLessonIds[index + 1];

  return (
    <article className="crypto-lesson">
      <PageHeader title={lesson.title} subtitle={lesson.subtitle} />

      <HudPanel heading={lesson.question} className="crypto-intro">
        <p>{lesson.scenario}</p>
      </HudPanel>

      <div className="crypto-lab">
        <Lab />
      </div>

      <section className="crypto-takeaway" aria-label="Che cosa portiamo con noi">
        <Lightbulb aria-hidden="true" />
        <div>
          <h2>Che cosa portiamo con noi</h2>
          <p>{lesson.takeaway}</p>
          <a href={lesson.reference.href} target="_blank" rel="noreferrer">
            {lesson.reference.label} <ExternalLink aria-hidden="true" />
          </a>
        </div>
      </section>

      <nav className="crypto-pagination" aria-label="Altre lezioni del modulo">
        {previous && (
          <Button variant="outline" asChild>
            <Link to="/capitoli/$chapterId" params={{ chapterId: previous }}>
              <ArrowLeft aria-hidden="true" /> {chapter2[previous].title}
            </Link>
          </Button>
        )}
        {next && (
          <Button variant="outline" asChild>
            <Link to="/capitoli/$chapterId" params={{ chapterId: next }}>
              {chapter2[next].title} <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        )}
      </nav>
    </article>
  );
}
