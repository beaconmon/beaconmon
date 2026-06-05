import { describe, it, expect } from 'vitest';
import { scoreRuleBased, scoreSiteChange } from './significance.js';
import { NoopProvider } from './providers/noop.js';

describe('scoreRuleBased', () => {
  it('price_changed >=5% delta → high', () => {
    expect(scoreRuleBased('price_changed', { oldPrice: '100', newPrice: '94' })).toBe('high');
  });

  it('price_changed exactly 5% delta → high', () => {
    expect(scoreRuleBased('price_changed', { oldPrice: '100', newPrice: '95' })).toBe('high');
  });

  it('price_changed <5% delta → medium', () => {
    expect(scoreRuleBased('price_changed', { oldPrice: '100', newPrice: '97' })).toBe('medium');
  });

  it('price_changed with zero old price → medium (no division)', () => {
    expect(scoreRuleBased('price_changed', { oldPrice: '0', newPrice: '10' })).toBe('medium');
  });

  it('out_of_stock → high', () => {
    expect(scoreRuleBased('out_of_stock', {})).toBe('high');
  });

  it('back_in_stock → high', () => {
    expect(scoreRuleBased('back_in_stock', {})).toBe('high');
  });

  it('sale_started → high', () => {
    expect(scoreRuleBased('sale_started', {})).toBe('high');
  });

  it('sale_ended → high', () => {
    expect(scoreRuleBased('sale_ended', {})).toBe('high');
  });

  it('product_added → medium', () => {
    expect(scoreRuleBased('product_added', {})).toBe('medium');
  });

  it('product_removed → medium', () => {
    expect(scoreRuleBased('product_removed', {})).toBe('medium');
  });

  it('stock_changed → medium', () => {
    expect(scoreRuleBased('stock_changed', {})).toBe('medium');
  });

  it('promo_detected → medium', () => {
    expect(scoreRuleBased('promo_detected', {})).toBe('medium');
  });

  it('site_changed (default) → medium', () => {
    expect(scoreRuleBased('site_changed', {})).toBe('medium');
  });

  it('unknown type → medium', () => {
    expect(scoreRuleBased('unknown_type', {})).toBe('medium');
  });
});

describe('scoreSiteChange', () => {
  it('noop provider → medium without LLM call', async () => {
    const result = await scoreSiteChange('Price dropped 50%', new NoopProvider());
    expect(result).toBe('medium');
  });

  it('noop provider with empty diff → medium', async () => {
    const result = await scoreSiteChange('', new NoopProvider());
    expect(result).toBe('medium');
  });
});
