import { describe, it, expect } from 'vitest';
import { buildBundle } from './OnboardingWizard';

const STORE = 'https://example.myshopify.com';

describe('buildBundle', () => {
  it('excludes ssl and domain items for Shopify', () => {
    const items = buildBundle(STORE, 'shopify', []);
    const types = items.map((i) => i.type);
    expect(types).not.toContain('ssl');
    expect(types).not.toContain('domain');
  });

  it('includes ssl and domain items for WooCommerce', () => {
    const items = buildBundle(STORE, 'woocommerce', []);
    const types = items.map((i) => i.type);
    expect(types).toContain('ssl');
    expect(types).toContain('domain');
  });

  it('includes ssl and domain items for other platforms', () => {
    const items = buildBundle(STORE, 'other', []);
    const types = items.map((i) => i.type);
    expect(types).toContain('ssl');
    expect(types).toContain('domain');
  });

  it('appends product slugs for Shopify', () => {
    const items = buildBundle(STORE, 'shopify', ['running-shoes', 'backpack']);
    const productItems = items.filter((i) => i.id.startsWith('product-'));
    expect(productItems).toHaveLength(2);
    expect(productItems[0]!.url).toBe(`${STORE}/products/running-shoes`);
  });

  it('does not append product slugs for non-Shopify platforms', () => {
    const items = buildBundle(STORE, 'woocommerce', ['some-product']);
    expect(items.filter((i) => i.id.startsWith('product-'))).toHaveLength(0);
  });
});
