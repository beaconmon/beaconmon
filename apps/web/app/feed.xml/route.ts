import { BLOG_POSTS } from '@/lib/blog';

const BASE_URL = 'https://beaconmon.com';

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function GET() {
  const posts = [...BLOG_POSTS].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );

  const items = posts
    .map((post) => {
      const url = `${BASE_URL}/blog/${post.slug}`;
      const categories = post.tags.map((tag) => `<category>${escapeXml(tag)}</category>`).join('');
      return `<item><title>${escapeXml(post.title)}</title><link>${url}</link><guid isPermaLink="true">${url}</guid><pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate><description>${escapeXml(post.description)}</description>${categories}</item>`;
    })
    .join('');

  const lastBuildDate = posts[0] ? new Date(posts[0].publishedAt).toUTCString() : new Date().toUTCString();

  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>Beaconmon Blog</title><link>${BASE_URL}/blog</link><description>Competitor monitoring and ecommerce strategy for Shopify merchants.</description><language>en-us</language><lastBuildDate>${lastBuildDate}</lastBuildDate><atom:link href="${BASE_URL}/feed.xml" rel="self" type="application/rss+xml" />${items}</channel></rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
    },
  });
}
