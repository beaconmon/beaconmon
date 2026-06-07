import NavBar from '@/components/marketing/NavBar';
import CtaForm from '@/components/marketing/CtaForm';
import { RevealObserver } from '@/components/reveal-observer';
import { JsonLd } from '@/components/json-ld';
import { breadcrumbSchema } from '@/lib/breadcrumb';
import Link from 'next/link';
import { Bot, Activity, Clock, ShieldCheck, Eye, TrendingDown, Bell, Rss } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Beaconmon vs Alternatives: Competitor Intelligence for Shopify Stores',
  description:
    'Honest comparisons for ecommerce store owners. Beaconmon vs Visualping, Prisync, UptimeRobot, Pingdom, and more. Competitor intelligence and uptime monitoring built for Shopify stores.',
  alternates: { canonical: 'https://beaconmon.com/vs' },
};

const FAQ_ITEMS = [
  {
    q: 'What makes Beaconmon different from uptime tools like UptimeRobot or Pingdom?',
    a: "Uptime tools tell you when your site goes down. Beaconmon does that too, but it also tracks competitor prices, product listings, and promotional copy, then delivers a daily Intelligence Digest summarizing every change. UptimeRobot, Pingdom, Better Uptime, and StatusCake do not offer any of that.",
  },
  {
    q: 'Is Beaconmon cheaper than the alternatives?',
    a: "On a per-ecommerce-feature basis, yes. UptimeRobot's paid plan starts at $7/mo but has no competitor monitoring or content tracking. Pingdom has no free plan and starts at $15/mo with no ecommerce features. Better Uptime starts at $25/mo. Beaconmon Starter is $29/mo with competitor monitoring, content change detection, and Intelligence Digest included.",
  },
  {
    q: 'Which tool should I choose if I just need basic ping checks?',
    a: "If you only need simple HTTP uptime monitoring and want the most monitors for free, UptimeRobot's 50-monitor free tier is hard to beat. Beaconmon's free tier (10 monitors, 1 competitor monitor) is better suited to ecommerce stores that will outgrow basic pings and want full competitor intelligence as they grow.",
  },
  {
    q: 'Does Beaconmon have on-call scheduling like Better Uptime?',
    a: 'Not yet. Better Uptime and PagerDuty are strong choices if you run on-call rotations with escalation policies. Beaconmon is designed for ecommerce store owners and small agencies where a Slack alert to the team is sufficient.',
  },
  {
    q: 'What makes content change monitoring unique to Beaconmon?',
    a: 'UptimeRobot, Pingdom, Better Uptime, and StatusCake do not offer content change detection. Beaconmon takes an HTML snapshot on first run and alerts you the moment a CSS-selector target changes. It tracks competitor pricing, product availability, and promotional copy.',
  },
];

type IntelCard = {
  name: string;
  slug: string;
  tagline: string;
  verdict: string;
  comingSoon: true;
  icon: React.ReactNode;
};

type UptimeCard = {
  name: string;
  slug: string;
  tagline: string;
  verdict: string;
  comingSoon?: false;
  icon: React.ReactNode;
};

type CompetitorCard = IntelCard | UptimeCard;

const INTEL_COMPETITORS: CompetitorCard[] = [
  {
    name: 'Visualping',
    slug: 'visualping',
    tagline: 'Visual diff tool with no ecommerce focus.',
    verdict: 'Visualping detects visual page changes but has no competitor intelligence digest, no Shopify context, and no uptime monitoring.',
    comingSoon: true,
    icon: (
      <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(139, 92, 246, 0.12)' }}>
        <Eye size={24} color="#8B5CF6" strokeWidth={1.5} />
      </div>
    ),
  },
  {
    name: 'Prisync',
    slug: 'prisync',
    tagline: 'Price tracking for enterprise ecommerce teams.',
    verdict: 'Prisync is a dedicated price tracking tool with no uptime monitoring, no content change detection outside of pricing, and enterprise pricing.',
    comingSoon: true,
    icon: (
      <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(239, 68, 68, 0.12)' }}>
        <TrendingDown size={24} color="#EF4444" strokeWidth={1.5} />
      </div>
    ),
  },
  {
    name: 'Distill',
    slug: 'distill',
    tagline: 'Browser-based page watcher, no digest or alerts.',
    verdict: 'Distill is a browser extension for personal page watching. No team features, no Slack digest, no uptime monitoring, and no Shopify-specific context.',
    comingSoon: true,
    icon: (
      <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(245, 158, 11, 0.12)' }}>
        <Bell size={24} color="#F59E0B" strokeWidth={1.5} />
      </div>
    ),
  },
  {
    name: 'Hexowatch',
    slug: 'hexowatch',
    tagline: 'General-purpose page monitoring without the intel layer.',
    verdict: 'Hexowatch monitors pages for changes but lacks a curated intelligence digest, Shopify-specific features, and competitor-first workflows.',
    comingSoon: true,
    icon: (
      <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(20, 184, 166, 0.12)' }}>
        <Rss size={24} color="#14B8A6" strokeWidth={1.5} />
      </div>
    ),
  },
];

const UPTIME_COMPETITORS: CompetitorCard[] = [
  {
    name: 'UptimeRobot',
    slug: 'uptimerobot',
    tagline: 'Popular free tier, no ecommerce features.',
    verdict: 'No competitor monitoring, no content tracking. Fine for basic pings. Not built for ecommerce.',
    icon: (
      <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(45, 206, 163, 0.12)' }}>
        <Bot size={24} color="#2DCEA3" strokeWidth={1.5} />
      </div>
    ),
  },
  {
    name: 'Pingdom',
    slug: 'pingdom',
    tagline: 'Enterprise-grade and enterprise-priced.',
    verdict: 'No free plan, no competitor monitoring, enterprise pricing. Beaconmon covers ecommerce needs from $29/mo.',
    icon: (
      <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(88, 147, 248, 0.12)' }}>
        <Activity size={24} color="#5893F8" strokeWidth={1.5} />
      </div>
    ),
  },
  {
    name: 'Better Uptime',
    slug: 'better-uptime',
    tagline: 'Strong on-call scheduling for large teams.',
    verdict: 'Strong on-call scheduling for large DevOps teams. No competitor monitoring. Overkill for most ecommerce stores.',
    icon: (
      <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(249, 115, 22, 0.12)' }}>
        <Clock size={24} color="#F97316" strokeWidth={1.5} />
      </div>
    ),
  },
  {
    name: 'StatusCake',
    slug: 'statuscake',
    tagline: 'Generous free tier, missing ecommerce features.',
    verdict: 'Generous free tier. No competitor monitoring, no content change detection, no Intelligence Digest.',
    icon: (
      <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(74, 222, 128, 0.12)' }}>
        <ShieldCheck size={24} color="#4ADE80" strokeWidth={1.5} />
      </div>
    ),
  },
];

const DIFFERENTIATORS = [
  {
    heading: 'Competitor price and content tracking.',
    body: 'Track when a competitor changes their pricing page, product listings, or homepage copy. Get alerted instantly or via weekly digest.',
  },
  {
    heading: 'Intelligence Digest, delivered to Slack or email.',
    body: 'A scheduled summary (daily or weekly) of every change detected on competitor sites, grouped and ranked. Available on Starter and above.',
  },
  {
    heading: 'AI-powered change summaries.',
    body: 'On Growth and Scale, an AI reads the diff and tells you what changed and why it might matter to your store. No noise, just signal.',
  },
  {
    heading: 'Built for ecommerce stores, not DevOps teams.',
    body: 'Every UX decision is made for a store owner or their agency, not an SRE team with a dedicated monitoring budget.',
  },
];

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ_ITEMS.map(({ q, a }) => ({
    '@type': 'Question',
    name: q,
    acceptedAnswer: {
      '@type': 'Answer',
      text: a,
    },
  })),
};

function CompetitorCard({ card }: { card: CompetitorCard }) {
  if (card.comingSoon) {
    return (
      <div className="reveal bg-brand-bg1 border border-brand-line-soft rounded-2xl p-8 opacity-60">
        <div className="flex items-start justify-between mb-5">
          {card.icon}
          <span className="text-brand-muted text-[11px] font-semibold tracking-[0.08em] uppercase border border-brand-line-soft rounded-full px-2.5 py-1">
            Coming soon
          </span>
        </div>
        <h3 className="text-[20px] font-bold tracking-[-0.02em] mb-2">
          Beaconmon vs {card.name}
        </h3>
        <p className="text-brand-green-ink text-[13px] font-semibold mb-3">{card.tagline}</p>
        <p className="text-brand-dim text-[14px] leading-[1.6]">{card.verdict}</p>
      </div>
    );
  }

  return (
    <Link
      href={`/vs/${card.slug}`}
      className="reveal group bg-brand-bg1 border border-brand-line-soft rounded-2xl p-8 hover:border-[rgba(0,229,122,0.3)] transition-colors"
    >
      <div className="flex items-start justify-between mb-5">
        {card.icon}
        <span className="text-brand-green-ink text-[13px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
          Compare →
        </span>
      </div>
      <h3 className="text-[20px] font-bold tracking-[-0.02em] mb-2">
        Beaconmon vs {card.name}
      </h3>
      <p className="text-brand-green-ink text-[13px] font-semibold mb-3">{card.tagline}</p>
      <p className="text-brand-dim text-[14px] leading-[1.6]">{card.verdict}</p>
    </Link>
  );
}

export default function VsHubPage() {
  return (
    <>
      <JsonLd data={faqSchema} />
      <JsonLd data={breadcrumbSchema({ name: 'Compare', path: '/vs' })} />
      <NavBar />

      {/* Hero */}
      <section className="relative py-[100px] max-[640px]:py-16 overflow-hidden">
        <div
          aria-hidden
          className="absolute pointer-events-none"
          style={{
            top: '-30%',
            right: '-10%',
            width: 700,
            height: 700,
            background: 'radial-gradient(circle, rgba(0,229,122,0.15), transparent 60%)',
            filter: 'blur(40px)',
          }}
        />
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5 relative text-center">
          <span className="inline-block text-[12px] font-semibold tracking-[0.12em] uppercase text-brand-green-ink mb-4">Compare</span>
          <h1 className="text-[clamp(40px,5vw,68px)] leading-[1.05] tracking-[-0.035em] font-extrabold mb-6 max-w-[820px] mx-auto">
            Competitor intelligence and uptime,<br />
            <span className="text-brand-green-ink">compared honestly.</span>
          </h1>
          <p className="text-[18px] leading-[1.55] text-brand-dim max-w-[560px] mx-auto">
            Built for Shopify and WooCommerce stores, not DevOps teams. Opinionated comparisons against the tools your store is already considering.
          </p>
        </div>
      </section>

      {/* Competitor intelligence comparisons */}
      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal mb-8">
            <p className="text-[11px] font-semibold tracking-[0.12em] uppercase text-brand-green-ink mb-2">Competitor intelligence tools</p>
            <p className="text-brand-dim text-[15px] max-w-[500px]">Page change monitoring, price tracking, and visual diff tools that Shopify stores compare against Beaconmon.</p>
          </div>
          <div className="grid grid-cols-2 max-[640px]:grid-cols-1 gap-5 mb-16">
            {INTEL_COMPETITORS.map((card) => (
              <CompetitorCard key={card.slug} card={card} />
            ))}
          </div>

          <div className="reveal mb-8">
            <p className="text-[11px] font-semibold tracking-[0.12em] uppercase text-brand-muted mb-2">Uptime monitoring tools</p>
            <p className="text-brand-dim text-[15px] max-w-[500px]">Traditional uptime monitoring tools that stores often start with before discovering Beaconmon.</p>
          </div>
          <div className="grid grid-cols-2 max-[640px]:grid-cols-1 gap-5">
            {UPTIME_COMPETITORS.map((card) => (
              <CompetitorCard key={card.slug} card={card} />
            ))}
          </div>
        </div>
      </section>

      {/* What makes us different */}
      <section className="py-[100px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal text-center mb-14">
            <h2 className="text-[clamp(28px,3.4vw,42px)] tracking-[-0.03em] font-extrabold mb-3">
              What makes Beaconmon different
            </h2>
            <p className="text-brand-dim text-[16px] max-w-[500px] mx-auto">
              A few things we do that none of the alternatives do quite as well.
            </p>
          </div>
          <div className="grid grid-cols-2 max-[640px]:grid-cols-1 gap-5">
            {DIFFERENTIATORS.map(({ heading, body }) => (
              <div key={heading} className="reveal bg-brand-bg1 border border-brand-line-soft rounded-2xl p-8">
                <h3 className="text-[18px] font-bold tracking-[-0.015em] mb-3 text-brand-green-ink">{heading}</h3>
                <p className="text-brand-dim text-[14px] leading-[1.65]">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-[80px] border-t border-brand-line-soft">
        <div className="max-w-[720px] mx-auto px-8 max-[640px]:px-5">
          <div className="reveal text-center mb-10">
            <h2 className="text-[clamp(24px,3vw,36px)] tracking-[-0.03em] font-extrabold mb-3">Common questions</h2>
          </div>
          <div className="space-y-8">
            {FAQ_ITEMS.map(({ q, a }) => (
              <div key={q} className="reveal border-b border-brand-line-soft pb-8 last:border-b-0 last:pb-0">
                <h3 className="text-[16px] font-semibold tracking-[-0.01em] mb-3">{q}</h3>
                <p className="text-brand-dim text-[14px] leading-[1.7]">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-[120px] border-t border-brand-line-soft relative overflow-hidden">
        <div
          aria-hidden
          className="absolute pointer-events-none"
          style={{
            bottom: '-40%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 800,
            height: 500,
            background: 'radial-gradient(ellipse, rgba(0,229,122,0.15), transparent 60%)',
            filter: 'blur(40px)',
          }}
        />
        <div className="max-w-[720px] mx-auto px-8 max-[640px]:px-5 text-center relative">
          <h2 className="text-[clamp(32px,4vw,52px)] tracking-[-0.03em] font-extrabold mb-5 leading-[1.1]">
            See for yourself.
          </h2>
          <p className="text-brand-dim text-[17px] mb-8">Free forever for 10 monitors. No credit card required.</p>
          <CtaForm className="mx-auto mb-5" />
          <p className="text-brand-dim text-[15px] mt-4">
            Running a Shopify store?{' '}
            <Link href="/for/shopify" className="text-brand-green-ink hover:underline">
              See the Shopify-specific setup →
            </Link>
          </p>
        </div>
      </section>

      <RevealObserver />
    </>
  );
}
