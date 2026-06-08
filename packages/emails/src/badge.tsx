import * as React from 'react';
import { EP, MONO, SEV, type Severity } from './tokens';

export type BadgeKind =
  | 'priceDown'
  | 'priceUp'
  | 'sale'
  | 'newProduct'
  | 'removed'
  | 'stockout'
  | 'restock'
  | 'promo'
  | 'down'
  | 'recovered'
  | 'info';

const BADGE_META: Record<BadgeKind, { sev: Severity; text: string }> = {
  priceDown: { sev: 'positive', text: 'Price drop' },
  priceUp: { sev: 'warning', text: 'Price up' },
  sale: { sev: 'warning', text: 'Sale started' },
  newProduct: { sev: 'info', text: 'New product' },
  removed: { sev: 'info', text: 'Removed' },
  stockout: { sev: 'critical', text: 'Out of stock' },
  restock: { sev: 'positive', text: 'Back in stock' },
  promo: { sev: 'warning', text: 'Promo' },
  down: { sev: 'critical', text: 'Down' },
  recovered: { sev: 'positive', text: 'Recovered' },
  info: { sev: 'info', text: 'Update' },
};

export function Badge({ kind, text }: { kind: BadgeKind; text?: string }) {
  const meta = BADGE_META[kind] ?? BADGE_META.info;
  const s = SEV[meta.sev];
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '3px 9px',
        borderRadius: '999px',
        backgroundColor: s.soft,
        border: `1px solid ${s.c}33`,
        fontFamily: MONO,
        fontSize: '10px',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        color: s.ink,
        whiteSpace: 'nowrap',
      }}
    >
      {text ?? meta.text}
    </span>
  );
}

export function badgeKindFromEventType(type: string | null | undefined): BadgeKind {
  switch (type) {
    case 'price_changed':
      return 'priceDown';
    case 'sale_started':
      return 'sale';
    case 'sale_ended':
      return 'promo';
    case 'product_added':
      return 'newProduct';
    case 'product_removed':
      return 'removed';
    case 'out_of_stock':
      return 'stockout';
    case 'back_in_stock':
      return 'restock';
    case 'promo_detected':
      return 'promo';
    default:
      return 'info';
  }
}
