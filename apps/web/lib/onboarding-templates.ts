export type PlatformType = 'shopify' | 'woocommerce' | 'other';

export interface MonitorTemplate {
  label: string;
  path: string | null;
  type: 'http' | 'ssl' | 'domain' | 'content';
  intervalSeconds: number;
  description: string;
}

export const ONBOARDING_TEMPLATES: Record<PlatformType, MonitorTemplate[]> = {
  shopify: [
    { label: 'Homepage',            path: '/',                type: 'content', intervalSeconds: 300,   description: 'Hero copy & promo banner' },
    { label: 'Cart',                path: '/cart',            type: 'content', intervalSeconds: 300,   description: 'Cart page content' },
    { label: 'New Arrivals',        path: '/collections/new', type: 'content', intervalSeconds: 900,   description: 'SEO landing page' },
    { label: 'Checkout',            path: '/cart',            type: 'http',    intervalSeconds: 60,    description: 'Critical revenue path' },
    { label: 'SSL certificate',     path: null,               type: 'ssl',     intervalSeconds: 86400, description: 'Auto-renews 30 days before expiry' },
    { label: 'Domain registration', path: null,               type: 'domain',  intervalSeconds: 86400, description: 'Reminds you before lapse' },
  ],
  woocommerce: [
    { label: 'Homepage',            path: '/',                type: 'content', intervalSeconds: 300,   description: 'Hero copy & promo banner' },
    { label: 'Shop',                path: '/shop',            type: 'content', intervalSeconds: 900,   description: 'Product catalog page' },
    { label: 'Cart',                path: '/cart',            type: 'content', intervalSeconds: 300,   description: 'Cart page content' },
    { label: 'Checkout',            path: '/checkout',        type: 'http',    intervalSeconds: 60,    description: 'Critical revenue path' },
    { label: 'SSL certificate',     path: null,               type: 'ssl',     intervalSeconds: 86400, description: 'Auto-renews 30 days before expiry' },
    { label: 'Domain registration', path: null,               type: 'domain',  intervalSeconds: 86400, description: 'Reminds you before lapse' },
  ],
  other: [
    { label: 'Homepage',            path: '/',                type: 'content', intervalSeconds: 300,   description: 'Front page content' },
    { label: 'Uptime check',        path: '/',                type: 'http',    intervalSeconds: 60,    description: 'Site availability' },
    { label: 'SSL certificate',     path: null,               type: 'ssl',     intervalSeconds: 86400, description: 'Auto-renews 30 days before expiry' },
    { label: 'Domain registration', path: null,               type: 'domain',  intervalSeconds: 86400, description: 'Reminds you before lapse' },
  ],
};

export function reliabilityLabel(platform: PlatformType): { value: string; sub: string } {
  if (platform === 'shopify') return { value: '99.9%', sub: 'recommended for Shopify' };
  if (platform === 'woocommerce') return { value: '99.9%', sub: 'recommended for ecommerce' };
  return { value: '99.9%', sub: 'recommended' };
}
