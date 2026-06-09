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
