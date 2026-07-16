import NavBar from '@/components/marketing/NavBar';
import CtaForm from '@/components/marketing/CtaForm';
import { JsonLd } from '@/components/json-ld';
import { breadcrumbSchema } from '@/lib/breadcrumb';
import Link from 'next/link';

const AUTHOR = {
  name: 'Haimanot Getu',
  role: 'Founder, Beaconmon',
  bio: 'Haimanot built Beaconmon after watching Shopify merchants lose sales to competitors they never saw coming. He writes about competitive intelligence, ecommerce pricing strategy, and how merchants can turn competitor data into decisions that protect margin.',
  linkedIn: 'https://www.linkedin.com/in/haimanot-getu/',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

type BlogPostLayoutProps = {
  title: string;
  description: string;
  slug: string;
  publishedAt: string;
  dateModified?: string;
  readingTime: number;
  tag: string;
  schemas?: object[];
  showDatasetLink?: boolean;
  children: React.ReactNode;
};

// Typography helpers for blog post files
export function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[clamp(20px,2.2vw,26px)] font-bold tracking-[-0.02em] text-brand-text mt-12 mb-4 leading-[1.25]">
      {children}
    </h2>
  );
}

export function H3({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[18px] font-semibold tracking-[-0.01em] text-brand-text mt-8 mb-3">
      {children}
    </h3>
  );
}

export function P({ children }: { children: React.ReactNode }) {
  return <p className="text-[16px] text-brand-dim leading-[1.8] mb-5">{children}</p>;
}

export function UL({ children }: { children: React.ReactNode }) {
  return <ul className="list-disc pl-6 mb-6 space-y-2">{children}</ul>;
}

export function OL({ children }: { children: React.ReactNode }) {
  return <ol className="list-decimal pl-6 mb-6 space-y-3">{children}</ol>;
}

export function LI({ children }: { children: React.ReactNode }) {
  return <li className="text-[16px] text-brand-dim leading-[1.75]">{children}</li>;
}

export function Strong({ children }: { children: React.ReactNode }) {
  return <strong className="font-semibold text-brand-text">{children}</strong>;
}

export function A({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="text-brand-green-ink underline underline-offset-2 hover:opacity-80 transition-opacity"
    >
      {children}
    </Link>
  );
}

export function Callout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-brand-bg1 border-l-[3px] border-brand-green rounded-r-xl px-6 py-4 my-7">
      <p className="text-[15px] text-brand-dim leading-[1.75] m-0">{children}</p>
    </div>
  );
}

export function Quote({ children, cite, role }: { children: React.ReactNode; cite: string; role?: string }) {
  return (
    <blockquote className="border-l-[3px] border-brand-green-ink pl-6 my-8">
      <p className="text-[18px] text-brand-text leading-[1.65] italic m-0">{children}</p>
      <footer className="text-[13px] text-brand-muted mt-3 not-italic">
        {cite}{role ? `, ${role}` : ''}
      </footer>
    </blockquote>
  );
}

export function KeyTakeaways({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-[var(--brand-green-glow-10)] border border-[var(--brand-green-border-25)] rounded-xl px-6 py-5 my-8">
      <p className="text-[11px] font-bold tracking-[0.1em] uppercase text-brand-green-ink mb-3">
        Key Takeaways
      </p>
      <ul className="space-y-[10px] m-0 p-0 list-none">{children}</ul>
    </div>
  );
}

export function KeyTakeaway({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-[10px] text-[15px] text-brand-dim leading-[1.7]">
      <span className="text-brand-green-ink shrink-0 font-bold">→</span>
      <span>{children}</span>
    </li>
  );
}

export function SummaryStatement({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-l-[3px] border-brand-green pl-5 my-7">
      <p className="text-[17px] font-semibold text-brand-text leading-[1.65] m-0">{children}</p>
    </div>
  );
}

export function StatGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-3 max-[600px]:grid-cols-1 gap-4 my-8">{children}</div>
  );
}

export function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center p-6 bg-brand-bg1 border border-brand-line-soft rounded-xl">
      <div className="text-[clamp(30px,3.5vw,44px)] font-extrabold tracking-[-0.04em] text-brand-green-ink">
        {value}
      </div>
      <div className="text-[13px] text-brand-muted mt-1 leading-[1.5]">{label}</div>
    </div>
  );
}

export function DecisionGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-2 max-[600px]:grid-cols-1 gap-4 my-8">{children}</div>
  );
}

export function DecisionCard({
  label,
  color,
  children,
}: {
  label: string;
  color: 'green' | 'amber' | 'red' | 'blue';
  children: React.ReactNode;
}) {
  const colorMap = {
    green: 'border-[var(--brand-green-border-25)] bg-[var(--brand-green-glow-10)] text-brand-green-ink',
    amber: 'border-brand-amber bg-brand-bg1 text-brand-amber',
    red: 'border-brand-red bg-brand-bg1 text-brand-red',
    blue: 'border-[rgba(99,179,237,0.4)] bg-brand-bg1 text-[rgb(99,179,237)]',
  };
  return (
    <div className={`border rounded-xl p-5 ${colorMap[color]}`}>
      <div className="text-[11px] font-bold tracking-[0.1em] uppercase mb-2">{label}</div>
      <p className="text-[14px] text-brand-dim leading-[1.65] m-0">{children}</p>
    </div>
  );
}

export function ComparisonTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: string[][];
}) {
  return (
    <div className="overflow-x-auto my-8 rounded-xl border border-brand-line-soft">
      <table className="w-full text-[14px] border-collapse">
        <thead>
          <tr className="bg-brand-bg1 border-b border-brand-line-soft">
            {headers.map((h, i) => (
              <th
                key={i}
                className="text-left px-4 py-3 text-[12px] font-bold tracking-[0.08em] uppercase text-brand-muted"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-brand-line-soft last:border-0">
              {row.map((cell, j) => (
                <td
                  key={j}
                  className={`px-4 py-3 leading-[1.65] align-top ${
                    j === 0
                      ? 'font-semibold text-brand-text w-[35%]'
                      : 'text-brand-dim'
                  }`}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function FAQ({ items }: { items: { q: string; a: string }[] }) {
  return (
    <div className="mt-12 space-y-4">
      <h2 className="text-[clamp(20px,2.2vw,26px)] font-bold tracking-[-0.02em] text-brand-text mb-6">
        Frequently asked questions
      </h2>
      {items.map(({ q, a }) => (
        <div key={q} className="bg-brand-bg1 border border-brand-line-soft rounded-xl p-5">
          <h3 className="text-[15px] font-semibold text-brand-text mb-2">{q}</h3>
          <p className="text-[14px] text-brand-dim leading-[1.7] m-0">{a}</p>
        </div>
      ))}
    </div>
  );
}

export default function BlogPostLayout({
  title,
  description,
  slug,
  publishedAt,
  dateModified,
  readingTime,
  tag,
  schemas = [],
  showDatasetLink = false,
  children,
}: BlogPostLayoutProps) {
  const blogPostingSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description,
    image: {
      '@type': 'ImageObject',
      url: `https://beaconmon.com/blog/${slug}/opengraph-image`,
      width: 1200,
      height: 630,
    },
    datePublished: publishedAt,
    dateModified: dateModified ?? publishedAt,
    author: {
      '@type': 'Person',
      name: AUTHOR.name,
      '@id': AUTHOR.linkedIn,
      url: AUTHOR.linkedIn,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Beaconmon',
      url: 'https://beaconmon.com',
    },
    url: `https://beaconmon.com/blog/${slug}`,
    mainEntityOfPage: `https://beaconmon.com/blog/${slug}`,
  };

  return (
    <>
      <JsonLd data={blogPostingSchema} />
      <JsonLd
        data={breadcrumbSchema(
          { name: 'Blog', path: '/blog' },
          { name: title, path: `/blog/${slug}` },
        )}
      />
      {schemas.map((s, i) => (
        <JsonLd key={i} data={s} />
      ))}
      <NavBar />

      <article className="py-16 max-[640px]:py-10">
        <div className="max-w-[760px] mx-auto px-8 max-[640px]:px-5">

          {/* Breadcrumb */}
          <nav className="text-[13px] text-brand-muted mb-8 flex items-center gap-2">
            <Link href="/" className="hover:text-brand-text transition-colors">Home</Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-brand-text transition-colors">Blog</Link>
            <span>/</span>
            <span className="text-brand-dim truncate max-w-[200px]">{tag}</span>
          </nav>

          {/* Tag */}
          <span className="inline-block text-[11px] font-semibold tracking-[0.1em] uppercase text-brand-text bg-brand-green-dim px-3 py-1 rounded-full mb-5">
            {tag}
          </span>

          {/* Title */}
          <h1 className="text-[clamp(28px,3.8vw,46px)] leading-[1.1] tracking-[-0.035em] font-extrabold text-brand-text mb-6">
            {title}
          </h1>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] text-brand-muted mb-10">
            <span>
              By{' '}
              <a
                href={AUTHOR.linkedIn}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-dim hover:text-brand-text transition-colors"
              >
                {AUTHOR.name}
              </a>
            </span>
            <span aria-hidden>·</span>
            <time dateTime={publishedAt}>{formatDate(publishedAt)}</time>
            <span aria-hidden>·</span>
            <span>{readingTime} min read</span>
          </div>

          <div className="border-t border-brand-line-soft mb-10" />

          {/* Content */}
          <div>{children}</div>

          <div className="border-t border-brand-line-soft mt-12 mb-8" />

          {/* Author bio */}
          <div className="flex items-start gap-4 p-5 bg-brand-bg1 border border-brand-line-soft rounded-xl">
            <div className="w-10 h-10 rounded-full bg-brand-green-dim flex items-center justify-center shrink-0 text-[16px] font-bold text-brand-green-ink">
              H
            </div>
            <div>
              <div className="text-[14px] font-semibold text-brand-text">{AUTHOR.name}</div>
              <div className="text-[12px] text-brand-muted mb-2">{AUTHOR.role}</div>
              <p className="text-[13px] text-brand-dim leading-[1.65] m-0">{AUTHOR.bio}</p>
            </div>
          </div>

        </div>
      </article>

      {/* CTA */}
      <section className="py-[80px] border-t border-brand-line-soft bg-brand-bg-section">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5 text-center">
          <h2 className="text-[clamp(26px,3vw,38px)] font-extrabold tracking-[-0.03em] mb-3">
            Start monitoring your competitors today
          </h2>
          <p className="text-brand-dim text-[16px] mb-8 max-w-[480px] mx-auto">
            Free for 10 monitors. No credit card required. Get your first alert in under 5 minutes.
          </p>
          <CtaForm className="mx-auto" />
          {showDatasetLink && (
            <p className="text-brand-dim text-[14px] mt-6">
              <Link href="/research" className="text-brand-green-ink hover:underline">
                See the full dataset →
              </Link>
            </p>
          )}
        </div>
      </section>
    </>
  );
}
