export const DNS_PROVIDER_INFO: Record<string, { label: string; buildUrl: (domain: string) => string }> = {
  cloudflare: { label: 'Cloudflare', buildUrl: () => 'https://dash.cloudflare.com/' },
  godaddy: { label: 'GoDaddy', buildUrl: () => 'https://dcc.godaddy.com/manage/dns' },
  namecheap: {
    label: 'Namecheap',
    buildUrl: (domain) => {
      const apex = domain.split('.').slice(-2).join('.');
      return `https://ap.www.namecheap.com/Domains/DomainControlPanel/${apex}/advancedns`;
    },
  },
  squarespace: { label: 'Squarespace Domains', buildUrl: () => 'https://domains.squarespace.com/' },
  route53: { label: 'AWS Route 53', buildUrl: () => 'https://console.aws.amazon.com/route53/v2/hostedzones' },
  porkbun: { label: 'Porkbun', buildUrl: () => 'https://porkbun.com/account/domainsSpeedy' },
};
