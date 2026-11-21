import { forwardRef } from 'react';
import type { CSSProperties, HTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';
import { themeVariables } from '../core/index';
import type { ButtonVariant, ThemeOptions, Tone } from '../core/index';

export interface HudThemeProps extends HTMLAttributes<HTMLDivElement>, ThemeOptions {}
export function HudTheme({ gradientIntensity = 65, highContrast = false, scanlines = false, mode = 'dark', className = '', style, ...props }: HudThemeProps) {
  return <div {...props} className={`nr-theme ${mode === 'light' ? 'nr-light' : ''} ${className}`} style={{ ...themeVariables({ gradientIntensity, highContrast, scanlines, mode }), ...style } as CSSProperties} />;
}

export interface HudButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> { variant?: ButtonVariant }
export const HudButton = forwardRef<HTMLButtonElement, HudButtonProps>(function HudButton({ variant = 'primary', type = 'button', className = '', ...props }, ref) {
  return <button {...props} ref={ref} type={type} data-variant={variant} className={`nr-button ${className}`} />;
});

export interface HudPanelProps extends HTMLAttributes<HTMLElement> { heading?: ReactNode }
export function HudPanel({ heading, children, className = '', ...props }: HudPanelProps) {
  return <section {...props} className={`nr-panel ${className}`}>
    {heading != null ? <h2 className="nr-panel-heading">{heading}</h2> : null}
    {children}
  </section>;
}

export interface HudBadgeProps extends HTMLAttributes<HTMLSpanElement> { tone?: Tone }
export function HudBadge({ tone = 'info', className = '', ...props }: HudBadgeProps) {
  return <span {...props} data-tone={tone} className={`nr-badge ${className}`} />;
}

export interface HudNoticeProps extends HTMLAttributes<HTMLDivElement> { tone?: Tone }
export function HudNotice({ tone = 'info', className = '', role = tone === 'danger' ? 'alert' : 'status', ...props }: HudNoticeProps) {
  return <div {...props} role={role} data-tone={tone} className={`nr-notice ${className}`} />;
}
