import { useEffect, useId, useRef, type ReactNode } from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import "./TutorialFrame.css";

export type TutorialStep = {
  label: string;
  title: string;
  explanation: ReactNode;
};

type TutorialFrameProps = {
  steps: readonly TutorialStep[];
  activeStep: number;
  onStepChange: (index: number) => void;
  nextLabel?: string;
  canAdvance?: boolean;
  actions?: ReactNode;
  children: ReactNode;
};

export function TutorialFrame({
  steps,
  activeStep,
  onStepChange,
  nextLabel = "Passo successivo",
  canAdvance = true,
  actions,
  children,
}: TutorialFrameProps) {
  const titleId = useId();
  const heading = useRef<HTMLHeadingElement>(null);
  const previousStep = useRef(activeStep);
  const step = steps[activeStep];

  useEffect(() => {
    if (previousStep.current !== activeStep) {
      previousStep.current = activeStep;
      heading.current?.focus();
    }
  }, [activeStep]);

  if (!step) return null;

  return (
    <section className="crypto-tutorial" aria-labelledby={titleId}>
      <ol
        className="crypto-tutorial-progress"
        aria-label="Passi del tutorial"
        style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}
      >
        {steps.map(({ label }, index) => (
          <li
            key={label}
            data-past={index < activeStep ? true : undefined}
            aria-current={index === activeStep ? "step" : undefined}
          >
            <span className="crypto-tutorial-index" aria-hidden="true">
              {index < activeStep ? <Check /> : index + 1}
            </span>
            <span>{label}</span>
          </li>
        ))}
      </ol>

      <div className="crypto-tutorial-intro">
        <h2 id={titleId} ref={heading} tabIndex={-1}>
          {step.title}
        </h2>
        <div className="crypto-tutorial-explanation">{step.explanation}</div>
      </div>

      {children}

      <div className="crypto-tutorial-actions" role="group" aria-label="Comandi del tutorial">
        {activeStep > 0 && (
          <Button type="button" variant="outline" onClick={() => onStepChange(activeStep - 1)}>
            <ArrowLeft aria-hidden="true" /> Passo precedente
          </Button>
        )}
        {actions}
        {activeStep < steps.length - 1 && (
          <Button
            type="button"
            className="crypto-tutorial-next"
            disabled={!canAdvance}
            onClick={() => onStepChange(activeStep + 1)}
          >
            {nextLabel} <ArrowRight aria-hidden="true" />
          </Button>
        )}
      </div>
    </section>
  );
}
