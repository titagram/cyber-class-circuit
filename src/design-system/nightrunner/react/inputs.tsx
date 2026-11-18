import { forwardRef, useId } from 'react';
import type { InputHTMLAttributes } from 'react';

export interface HudTextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
  error?: string;
  inputClassName?: string;
}
export const HudTextField = forwardRef<HTMLInputElement, HudTextFieldProps>(function HudTextField({ label, hint, error, id, className = '', inputClassName = '', 'aria-describedby': describedBy, 'aria-invalid': invalid, ...props }, ref) {
  const generatedId = useId();
  const fieldId = id ?? `nr-field-${generatedId}`;
  const hintId = `${fieldId}-hint`;
  const errorId = `${fieldId}-error`;
  const descriptionIds = [describedBy, hint ? hintId : null, error ? errorId : null].filter(Boolean).join(' ') || undefined;
  return <div className={`nr-field ${className}`}>
    <label className="nr-label" htmlFor={fieldId}>{label}</label>
    <input {...props} ref={ref} id={fieldId} className={`nr-input ${inputClassName}`} aria-describedby={descriptionIds} aria-invalid={error ? true : invalid} />
    {hint ? <p id={hintId} className="nr-hint">{hint}</p> : null}
    {error ? <p id={errorId} className="nr-hint nr-error">{error}</p> : null}
  </div>;
});

export interface HudToggleProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'checked' | 'defaultChecked' | 'onChange' | 'value' | 'children'> {
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export const HudSwitch = forwardRef<HTMLInputElement, HudToggleProps>(function HudSwitch({ label, checked, onCheckedChange, className = '', ...props }, ref) {
  return <label className={`nr-toggle ${className}`}>
    <input {...props} ref={ref} type="checkbox" role="switch" checked={checked} onChange={event => onCheckedChange(event.currentTarget.checked)} />
    <span className="nr-switch-track" aria-hidden="true"><span className="nr-switch-segment nr-switch-off">OFF</span><span className="nr-switch-segment nr-switch-on">ON</span></span>
    <span>{label}</span>
  </label>;
});

export const HudCheckbox = forwardRef<HTMLInputElement, HudToggleProps>(function HudCheckbox({ label, checked, onCheckedChange, className = '', ...props }, ref) {
  return <label className={`nr-toggle ${className}`}>
    <input {...props} ref={ref} type="checkbox" checked={checked} onChange={event => onCheckedChange(event.currentTarget.checked)} />
    <span className="nr-check-box" aria-hidden="true">✓</span><span>{label}</span>
  </label>;
});
