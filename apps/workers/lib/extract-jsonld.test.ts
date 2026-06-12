import { describe, it, expect } from 'vitest';
import { extractProductFromHtml, htmlHasProductJsonLd } from './extract-jsonld.js';

const PAGE_URL = 'https://shop.example.com/product/blue-runner-42/';

function pageWithJsonLd(jsonLd: unknown): string {
  return `<!doctype html><html><head>
    <title>Fallback Title</title>
    <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
  </head><body><h1>PDP</h1></body></html>`;
}

describe('extractProductFromHtml — JSON-LD Product', () => {
  it('extracts a WooCommerce-style Product nested in @graph', () => {
    const html = pageWithJsonLd({
      '@context': 'https://schema.org/',
      '@graph': [
        { '@type': 'Organization', name: 'Example Shop' },
        {
          '@type': 'Product',
          name: 'Blue Runner 42',
          sku: 'BR-42',
          brand: { '@type': 'Brand', name: 'Runlab' },
          offers: {
            '@type': 'Offer',
            price: '89.95',
            priceCurrency: 'EUR',
            availability: 'https://schema.org/InStock',
          },
        },
      ],
    });

    const product = extractProductFromHtml(html, PAGE_URL);
    expect(product).not.toBeNull();
    expect(product!.title).toBe('Blue Runner 42');
    expect(product!.externalId).toBe('BR-42');
    expect(product!.sku).toBe('BR-42');
    expect(product!.vendor).toBe('Runlab');
    expect(product!.price).toBe('89.95');
    expect(product!.currency).toBe('EUR');
    expect(product!.available).toBe(true);
    expect(product!.handle).toBe('blue-runner-42');
    expect(product!.sourceUrl).toBe(PAGE_URL);
    expect(product!.source).toBe('jsonld');
  });

  it('picks the lowest price from an AggregateOffer with inner offers', () => {
    const html = pageWithJsonLd({
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: 'Trail Pack',
      productID: 'TP-100',
      offers: {
        '@type': 'AggregateOffer',
        lowPrice: '49.00',
        highPrice: '79.00',
        priceCurrency: 'USD',
        offers: [
          { '@type': 'Offer', price: '79.00', priceCurrency: 'USD' },
          { '@type': 'Offer', price: '49.00', priceCurrency: 'USD' },
        ],
      },
    });

    const product = extractProductFromHtml(html, PAGE_URL);
    expect(product!.price).toBe('49');
    expect(product!.externalId).toBe('TP-100');
  });

  it('reads compare-at price from a StrikethroughPrice priceSpecification', () => {
    const html = pageWithJsonLd({
      '@type': 'Product',
      name: 'Sale Hoodie',
      sku: 'SH-1',
      offers: {
        '@type': 'Offer',
        availability: 'http://schema.org/InStock',
        priceSpecification: [
          { '@type': 'UnitPriceSpecification', price: '35.00', priceCurrency: 'GBP' },
          {
            '@type': 'UnitPriceSpecification',
            priceType: 'https://schema.org/StrikethroughPrice',
            price: '50.00',
            priceCurrency: 'GBP',
          },
        ],
      },
    });

    const product = extractProductFromHtml(html, PAGE_URL);
    expect(product!.price).toBe('35');
    expect(product!.compareAtPrice).toBe('50');
    expect(product!.currency).toBe('GBP');
  });

  it('falls back to the first variant of a ProductGroup without group offers', () => {
    const html = pageWithJsonLd({
      '@type': 'ProductGroup',
      name: 'Merino Tee',
      hasVariant: [
        {
          '@type': 'Product',
          sku: 'MT-S',
          offers: { '@type': 'Offer', price: '29.00', priceCurrency: 'USD', availability: 'InStock' },
        },
        {
          '@type': 'Product',
          sku: 'MT-M',
          offers: { '@type': 'Offer', price: '31.00', priceCurrency: 'USD' },
        },
      ],
    });

    const product = extractProductFromHtml(html, PAGE_URL);
    // Variant has no name, so the group name applies
    expect(product!.title).toBe('Merino Tee');
    expect(product!.externalId).toBe('MT-S');
    expect(product!.price).toBe('29');
  });

  it('maps OutOfStock availability to available=false', () => {
    const html = pageWithJsonLd({
      '@type': 'Product',
      name: 'Gone Item',
      sku: 'GI-1',
      offers: { '@type': 'Offer', price: '10.00', availability: 'https://schema.org/OutOfStock' },
    });

    const product = extractProductFromHtml(html, PAGE_URL);
    expect(product!.available).toBe(false);
  });

  it('normalizes EU comma-decimal prices', () => {
    const html = pageWithJsonLd({
      '@type': 'Product',
      name: 'Espresso Machine',
      sku: 'EM-9',
      offers: { '@type': 'Offer', price: '1.299,00', priceCurrency: 'EUR' },
    });

    const product = extractProductFromHtml(html, PAGE_URL);
    expect(product!.price).toBe('1299');
  });

  it('uses the URL pathname as externalId when no productID, sku, or mpn exists', () => {
    const html = pageWithJsonLd({
      '@type': 'Product',
      name: 'Anonymous Product',
      offers: { '@type': 'Offer', price: '5.00' },
    });

    const product = extractProductFromHtml(html, PAGE_URL);
    expect(product!.externalId).toBe('/product/blue-runner-42/');
  });

  it('skips malformed JSON-LD blocks and uses a later valid one', () => {
    const html = `<!doctype html><html><head>
      <script type="application/ld+json">{ not json</script>
      <script type="application/ld+json">${JSON.stringify({
        '@type': 'Product',
        name: 'Valid Product',
        sku: 'VP-1',
        offers: { '@type': 'Offer', price: '12.00' },
      })}</script>
    </head><body></body></html>`;

    const product = extractProductFromHtml(html, PAGE_URL);
    expect(product!.title).toBe('Valid Product');
  });
});

describe('extractProductFromHtml — meta and microdata fallback', () => {
  it('falls back to OpenGraph product meta when no JSON-LD exists', () => {
    const html = `<!doctype html><html><head>
      <title>OG Product Page</title>
      <meta property="og:title" content="OG Sneaker" />
      <meta property="product:price:amount" content="120.00" />
      <meta property="product:price:currency" content="USD" />
      <meta property="og:availability" content="instock" />
    </head><body></body></html>`;

    const product = extractProductFromHtml(html, PAGE_URL);
    expect(product!.title).toBe('OG Sneaker');
    expect(product!.price).toBe('120');
    expect(product!.currency).toBe('USD');
    expect(product!.available).toBe(true);
    expect(product!.source).toBe('html');
    expect(product!.externalId).toBe('/product/blue-runner-42/');
  });

  it('falls back to microdata itemprop price when no meta tags exist', () => {
    const html = `<!doctype html><html><head><title>Micro Product</title></head><body>
      <div itemscope itemtype="https://schema.org/Product">
        <span itemprop="price" content="42.50">42,50 &euro;</span>
        <meta itemprop="priceCurrency" content="EUR" />
      </div>
    </body></html>`;

    const product = extractProductFromHtml(html, PAGE_URL);
    expect(product!.price).toBe('42.5');
    expect(product!.currency).toBe('EUR');
    expect(product!.source).toBe('html');
  });

  it('returns null for a page with no machine-readable product data', () => {
    const html = '<!doctype html><html><head><title>About us</title></head><body><p>Hello</p></body></html>';
    expect(extractProductFromHtml(html, PAGE_URL)).toBeNull();
  });
});

describe('htmlHasProductJsonLd', () => {
  it('returns true for a page with a JSON-LD Product', () => {
    const html = pageWithJsonLd({ '@type': 'Product', name: 'X', offers: { price: '1.00' } });
    expect(htmlHasProductJsonLd(html)).toBe(true);
  });

  it('returns false when JSON-LD has no Product node', () => {
    const html = pageWithJsonLd({ '@type': 'WebSite', name: 'Example' });
    expect(htmlHasProductJsonLd(html)).toBe(false);
  });

  it('returns false for pages without JSON-LD', () => {
    expect(htmlHasProductJsonLd('<html><body>plain</body></html>')).toBe(false);
  });
});
