const BASE = 'https://beaconmon.com';

type Crumb = { name: string; path: string };

export function breadcrumbSchema(...crumbs: Crumb[]) {
  return {
    '@context': 'https://schema.org' as const,
    '@type': 'BreadcrumbList' as const,
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: BASE },
      ...crumbs.map(({ name, path }, i) => ({
        '@type': 'ListItem' as const,
        position: i + 2,
        name,
        item: `${BASE}${path}`,
      })),
    ],
  };
}
