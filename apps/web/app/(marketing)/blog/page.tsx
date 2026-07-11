import type { Metadata } from 'next';
import NavBar from '@/components/marketing/NavBar';
import Link from 'next/link';
import { BLOG_POSTS } from '@/lib/blog';
import { JsonLd } from '@/components/json-ld';

export const metadata: Metadata = {
  title: 'Competitor Monitoring Blog for Shopify Merchants | Beaconmon',
  description:
    'Practical guides on Shopify competitor monitoring: price monitoring, competitive tactics, and turning competitor data into margin-protecting decisions.',
  alternates: { canonical: 'https://beaconmon.com/blog' },
  openGraph: { url: 'https://beaconmon.com/blog' },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function BlogIndexPage() {
  const blogSchema = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'Beaconmon Blog',
    description:
      'Competitor monitoring and ecommerce strategy for Shopify merchants.',
    url: 'https://beaconmon.com/blog',
    author: {
      '@type': 'Person',
      name: 'Haimanot Getu',
      url: 'https://www.linkedin.com/in/haimanot-getu/',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Beaconmon',
      url: 'https://beaconmon.com',
    },
  };

  return (
    <>
      <JsonLd data={blogSchema} />
      <NavBar />

      {/* Hero */}
      <section className="py-[80px] max-[640px]:py-14">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5">
          <nav className="text-[13px] text-brand-muted mb-8 flex items-center gap-2">
            <Link href="/" className="hover:text-brand-text transition-colors">Home</Link>
            <span>/</span>
            <span className="text-brand-dim">Blog</span>
          </nav>
          <span className="inline-block text-[12px] font-semibold tracking-[0.12em] uppercase text-brand-green-ink mb-4">
            Beaconmon Blog
          </span>
          <h1 className="text-[clamp(34px,4vw,56px)] leading-[1.05] tracking-[-0.035em] font-extrabold mb-4 max-w-[700px]">
            Competitor monitoring for Shopify merchants
          </h1>
          <p className="text-[17px] text-brand-dim leading-[1.6] max-w-[520px]">
            Practical guides on price monitoring, competitive tactics, and how to turn competitor data into decisions that protect your margin.
          </p>
        </div>
      </section>

      {/* Posts */}
      <section className="pb-[100px] border-t border-brand-line-soft">
        <div className="max-w-[1200px] mx-auto px-8 max-[640px]:px-5 pt-14">
          <div className="grid grid-cols-3 max-[900px]:grid-cols-2 max-[600px]:grid-cols-1 gap-6">
            {BLOG_POSTS.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group bg-brand-bg1 border border-brand-line-soft rounded-2xl p-6 hover:border-brand-line transition-colors flex flex-col"
              >
                <span className="inline-block text-[10px] font-semibold tracking-[0.1em] uppercase text-brand-text bg-brand-green-dim px-2.5 py-1 rounded-full mb-4 self-start">
                  {post.tags[0]}
                </span>
                <h2 className="text-[15px] font-bold tracking-[-0.01em] text-brand-text leading-[1.35] mb-3 group-hover:text-brand-green-ink transition-colors flex-1">
                  {post.title}
                </h2>
                <p className="text-[13px] text-brand-dim leading-[1.65] mb-5">
                  {post.description}
                </p>
                <div className="flex items-center justify-between text-[12px] text-brand-muted pt-4 border-t border-brand-line-soft">
                  <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
                  <span>{post.readingTime} min read</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
