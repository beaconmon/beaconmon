export type PlatformType = 'shopify' | 'woocommerce' | 'other';

export interface MonitorTemplate {
  label: string;
  path: string | null;
  type: 'http' | 'ssl' | 'domain' | 'content';
  intervalSeconds: number;
}

export const ONBOARDING_TEMPLATES: Record<PlatformType, MonitorTemplate[]> = {
  shopify: [
    { label: 'Homepage',            path: '/',                type: 'content', intervalSeconds: 300   },
    { label: 'Cart',                path: '/cart',            type: 'content', intervalSeconds: 300   },
    { label: 'New Arrivals',        path: '/collections/new', type: 'content', intervalSeconds: 900   },
    { label: 'Checkout',            path: '/cart',            type: 'http',    intervalSeconds: 60    },
    { label: 'SSL certificate',     path: null,               type: 'ssl',     intervalSeconds: 86400 },
    { label: 'Domain registration', path: null,               type: 'domain',  intervalSeconds: 86400 },
  ],
  woocommerce: [
    { label: 'Homepage',            path: '/',                type: 'content', intervalSeconds: 300   },
    { label: 'Shop',                path: '/shop',            type: 'content', intervalSeconds: 900   },
    { label: 'Cart',                path: '/cart',            type: 'content', intervalSeconds: 300   },
    { label: 'Checkout',            path: '/checkout',        type: 'http',    intervalSeconds: 60    },
    { label: 'SSL certificate',     path: null,               type: 'ssl',     intervalSeconds: 86400 },
    { label: 'Domain registration', path: null,               type: 'domain',  intervalSeconds: 86400 },
  ],
  other: [
    { label: 'Homepage',            path: '/',                type: 'content', intervalSeconds: 300   },
    { label: 'Uptime check',        path: '/',                type: 'http',    intervalSeconds: 60    },
    { label: 'SSL certificate',     path: null,               type: 'ssl',     intervalSeconds: 86400 },
    { label: 'Domain registration', path: null,               type: 'domain',  intervalSeconds: 86400 },
  ],
};

export function reliabilityLabel(platform: PlatformType): string {
  return platform === 'other'
    ? '99.9% recommended'
    : '99.9% recommended for ecommerce';
}
