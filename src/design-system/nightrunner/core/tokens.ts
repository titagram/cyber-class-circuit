/** Campioni calibrati della demo; non sono token ufficiali CDPR. */
export const tokens = {
  colors: {
    background: '#05090e', panel: '#100e1a', panelEnd: '#0a0c14',
    yellow: '#fcee0a', cyan: '#76fdf7', coral: '#e15a62',
    text: '#e6edef', muted: '#9bb9bf', border: '#592431',
    onText: '#08161b', off: '#81242e', offText: '#ff9298',
    offBorder: '#b34450', inactiveOff: '#1f0e18', inactiveOffText: '#6f3541',
    inactiveOn: '#0c2023', inactiveOnText: '#376164',
    disabled: '#13141d', disabledText: '#82838d', disabledBorder: '#59606b'
  },
  gradients: {
    dark: ['#30101b', '#240d15', '#0d080f', '#05070c', '#05090e'],
    vivid: ['#57242e', '#47212e', '#1d1323', '#110e20', '#110e21'],
    locations: [0, 0.15, 0.4, 0.65, 1],
    defaultIntensity: 65
  },
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, section: 32 },
  typography: {
    web: { display: "'Rajdhani', 'Arial Narrow', sans-serif", body: 'system-ui, -apple-system, sans-serif', mono: 'ui-monospace, monospace' },
    native: { regular: 'Rajdhani-Regular', medium: 'Rajdhani-Medium', semibold: 'Rajdhani-SemiBold', bold: 'Rajdhani-Bold' },
    size: { caption: 12, label: 14, body: 16, control: 18, title: 24, display: 32 }
  },
  geometry: { buttonCut: 11, panelCut: 15, border: 1, touchTarget: 44 },
  motion: { fast: 120, normal: 180 }
} as const;

export type ButtonVariant = 'primary' | 'secondary' | 'danger';
export type Tone = 'info' | 'warning' | 'danger';
export interface MenuItem { value: string; label: string; disabled?: boolean }
export const buttonColors = {
  primary: { fill: tokens.colors.yellow, text: tokens.colors.onText, border: tokens.colors.yellow },
  secondary: { fill: tokens.colors.panel, text: tokens.colors.cyan, border: tokens.colors.border },
  danger: { fill: tokens.colors.off, text: tokens.colors.offText, border: tokens.colors.offBorder }
} as const;

export function toneColor(tone: Tone): string {
  return tone === 'warning' ? tokens.colors.yellow : tone === 'danger' ? tokens.colors.coral : tokens.colors.cyan;
}
