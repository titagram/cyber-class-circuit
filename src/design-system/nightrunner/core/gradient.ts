import { tokens } from './tokens';

export interface MenuGradient {
  intensity: number;
  colors: readonly [string, string, string, string, string];
  locations: typeof tokens.gradients.locations;
  css: string;
}

function mixHex(from: string, to: string, ratio: number): string {
  const channels = [1, 3, 5].map(offset => {
    const a = parseInt(from.slice(offset, offset + 2), 16);
    const b = parseInt(to.slice(offset, offset + 2), 16);
    return Math.round(a + (b - a) * ratio).toString(16).padStart(2, '0');
  });
  return `#${channels.join('')}`;
}

/** 0 = fondo uniforme, 65 = screenshot scuro, 100 = screenshot più luminoso. */
export function getMenuGradient(intensity: number = tokens.gradients.defaultIntensity): MenuGradient {
  const value = Number.isFinite(intensity) ? Math.min(100, Math.max(0, intensity)) : tokens.gradients.defaultIntensity;
  const colors = tokens.gradients.dark.map((color, index) => value <= 65
    ? mixHex(tokens.colors.background, color, value / 65)
    : mixHex(color, tokens.gradients.vivid[index] ?? color, (value - 65) / 35)) as [string, string, string, string, string];
  const locations = tokens.gradients.locations;
  return {
    intensity: value, colors, locations,
    css: `linear-gradient(180deg, ${colors.map((color, index) => `${color} ${(locations[index] ?? 1) * 100}%`).join(', ')})`
  };
}

export interface ThemeOptions { gradientIntensity?: number; highContrast?: boolean; scanlines?: boolean; mode?: 'dark' | 'light' }

/** Variabili condivise da CSS generato e adattatore React. Nessuna dipendenza DOM. */
export function themeVariables(options: ThemeOptions = {}): Record<`--nr-${string}`, string> {
  const colors = Object.fromEntries(Object.entries(tokens.colors).map(([key, value]) => [`--nr-${key.replace(/[A-Z]/g, c => `-${c.toLowerCase()}`)}`, value]));
  const appearance = options.mode === 'light' ? {} : {
    ...colors,
    '--nr-border': options.highContrast ? tokens.colors.coral : tokens.colors.border,
    '--nr-menu-gradient': getMenuGradient(options.gradientIntensity).css,
  };
  return {
    ...appearance,
    '--nr-display-font': tokens.typography.web.display,
    '--nr-body-font': tokens.typography.web.body,
    '--nr-scan-opacity': options.scanlines ? '.045' : '0',
    '--nr-button-cut': `${tokens.geometry.buttonCut}px`,
    '--nr-panel-cut': `${tokens.geometry.panelCut}px`,
    '--nr-fast': `${tokens.motion.fast}ms`
  };
}
