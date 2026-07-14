export const EP = {
  page: '#EBEDF4',
  paper: '#FFFFFF',
  ink: '#0B0D14',
  body: '#3E4554',
  muted: '#8B92A4',
  faint: '#AEB4C2',
  line: '#E8EAF1',
  line2: '#DCDFEA',
  surface: '#F7F8FB',
  surface2: '#F1F3F9',
  brand: '#00E57A',
  brandDeep: '#06A45F',
  brandInk: '#06231A',
  inkBtn: '#0B0D14',
  crit: '#E5484D',
  critSoft: '#FCEFEF',
  critInk: '#C0333A',
  warn: '#E08A00',
  warnSoft: '#FCF4E4',
  warnInk: '#945C00',
  info: '#3B6FED',
  infoSoft: '#EEF2FE',
  infoInk: '#2A52C0',
  pos: '#0FA968',
  posSoft: '#E9FBF1',
  posInk: '#077A47',
} as const;

export const SANS = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
export const MONO = '"SFMono-Regular", ui-monospace, "JetBrains Mono", Menlo, Consolas, monospace';

export type Severity = 'critical' | 'warning' | 'info' | 'positive' | 'brand';

export const SEV: Record<Severity, { c: string; soft: string; ink: string }> = {
  critical: { c: EP.crit, soft: EP.critSoft, ink: EP.critInk },
  warning: { c: EP.warn, soft: EP.warnSoft, ink: EP.warnInk },
  info: { c: EP.info, soft: EP.infoSoft, ink: EP.infoInk },
  positive: { c: EP.pos, soft: EP.posSoft, ink: EP.posInk },
  brand: { c: EP.brandDeep, soft: EP.posSoft, ink: EP.brandInk },
};

// Dark-mode counterparts. Colored soft/chip pairs (AlertBanner, Badge, DurationBox)
// stay self-contained in dark mode — a pastel chip reads fine floating on a dark
// card. Only the neutral chrome and "ink on a plain surface" pairings need a flip,
// since those go illegible if the surface goes dark but the text color doesn't.
export const EP_DARK = {
  page: '#0A0B10',
  paper: '#101219',
  surface: '#171923',
  surface2: '#1D2029',
  ink: '#F1F2F6',
  body: '#B4B8C4',
  muted: '#82869A',
  faint: '#5B5F70',
  line: '#262835',
  line2: '#2E3140',
  btnPrimaryBg: '#F1F2F6',
  btnPrimaryText: '#0A0B10',
} as const;

export const SEV_DARK: Record<Severity, { ink: string }> = {
  critical: { ink: '#FF7A7E' },
  warning: { ink: '#FFC46B' },
  info: { ink: '#7FAAFF' },
  positive: { ink: '#3FE39A' },
  brand: { ink: '#3FE39A' },
};

const NEUTRAL_DARK_RULES: Array<[selector: string, prop: string, value: string]> = [
  ['.em-page', 'background-color', EP_DARK.page],
  ['.em-paper', 'background-color', EP_DARK.paper],
  ['.em-surface', 'background-color', EP_DARK.surface],
  ['.em-surface2', 'background-color', EP_DARK.surface2],
  ['.em-ink', 'color', EP_DARK.ink],
  ['.em-body-c', 'color', EP_DARK.body],
  ['.em-muted-c', 'color', EP_DARK.muted],
  ['.em-faint-c', 'color', EP_DARK.faint],
  ['.em-line', 'border-color', EP_DARK.line],
  ['.em-line2', 'border-color', EP_DARK.line2],
  ['.em-line-bg', 'background-color', EP_DARK.line],
  ['.em-btn-primary', 'background-color', EP_DARK.btnPrimaryBg],
];

const SEV_DARK_RULES: Array<[selector: string, prop: string, value: string]> = (
  Object.keys(SEV_DARK) as Severity[]
).map((sev) => [`.em-sev-ink-${sev}`, 'color', SEV_DARK[sev].ink]);

function darkRuleBlock(prefix: string): string {
  return [...NEUTRAL_DARK_RULES, ...SEV_DARK_RULES]
    .map(([sel, prop, val]) => `${prefix}${sel}{${prop}:${val} !important}`)
    .join('') + `${prefix}.em-btn-primary{color:${EP_DARK.btnPrimaryText} !important}`;
}

// Targets both real prefers-color-scheme dark mode and Outlook.com's dark-mode
// hook ([data-ogsc]), which ignores the media query entirely.
export const EMAIL_DARK_STYLE = `@media (prefers-color-scheme: dark){${darkRuleBlock('')}}${darkRuleBlock('[data-ogsc] ')}`;
