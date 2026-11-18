import { useRef } from 'react';
import type { HTMLAttributes, KeyboardEvent } from 'react';
import type { MenuItem } from '../core/index';

const itemId = (base: string, value: string) => `${base}-${encodeURIComponent(value)}`;

export interface HudTabsProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  id: string;
  label: string;
  items: readonly MenuItem[];
  value: string;
  onValueChange: (value: string) => void;
}
export function HudTabs({ id, label, items, value, onValueChange, className = '', ...props }: HudTabsProps) {
  const buttons = useRef(new Map<string, HTMLButtonElement>());
  const enabled = items.filter(item => !item.disabled);
  const focusValue = enabled.find(item => item.value === value)?.value ?? enabled[0]?.value;
  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>, current: string) {
    if (!enabled.length) return;
    const index = enabled.findIndex(item => item.value === current);
    let next: MenuItem | undefined;
    if (event.key === 'ArrowRight') next = enabled[(index + 1) % enabled.length];
    else if (event.key === 'ArrowLeft') next = enabled[(index + enabled.length - 1) % enabled.length];
    else if (event.key === 'Home') next = enabled[0];
    else if (event.key === 'End') next = enabled.at(-1);
    else return;
    event.preventDefault();
    if (next) { onValueChange(next.value); buttons.current.get(next.value)?.focus(); }
  }
  return <div {...props} id={id} role="tablist" aria-label={label} className={`nr-tabs ${className}`}>
    {items.map(item => <button key={item.value} ref={node => { if (node) buttons.current.set(item.value, node); else buttons.current.delete(item.value); }}
      id={`${itemId(id, item.value)}-tab`} type="button" role="tab" className="nr-tab" disabled={item.disabled}
      aria-selected={value === item.value} aria-controls={`${itemId(id, item.value)}-panel`} tabIndex={item.value === focusValue ? 0 : -1}
      onClick={() => onValueChange(item.value)} onKeyDown={event => onKeyDown(event, item.value)}>{item.label}</button>)}
  </div>;
}

export interface HudTabPanelProps extends HTMLAttributes<HTMLDivElement> { tabsId: string; value: string; activeValue: string }
export function HudTabPanel({ tabsId, value, activeValue, children, className = '', ...props }: HudTabPanelProps) {
  return <div {...props} id={`${itemId(tabsId, value)}-panel`} role="tabpanel" aria-labelledby={`${itemId(tabsId, value)}-tab`} hidden={value !== activeValue} className={`nr-tab-panel ${className}`}>
    {children}
  </div>;
}

export interface HudMenuProps extends Omit<HTMLAttributes<HTMLElement>, 'onChange'> {
  label: string;
  items: readonly MenuItem[];
  value: string;
  onValueChange: (value: string) => void;
}
export function HudMenu({ label, items, value, onValueChange, className = '', ...props }: HudMenuProps) {
  return <nav {...props} aria-label={label} className={`nr-menu ${className}`}>
    {items.map(item => <button key={item.value} type="button" className="nr-menu-button" disabled={item.disabled} aria-current={item.value === value ? 'page' : undefined} onClick={() => onValueChange(item.value)}>{item.label}</button>)}
  </nav>;
}
