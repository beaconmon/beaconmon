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

function renderHtml(posts: typeof BLOG_POSTS) {
  const items = posts
    .map((post) => {
      const url = `${BASE_URL}/blog/${post.slug}`;
      const date = new Date(post.publishedAt).toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
      const tags = post.tags
        .map((tag) => `<span class="tag">${escapeXml(tag)}</span>`)
        .join('');
      return `<a class="card" href="${url}">
        <div class="item-title">${escapeXml(post.title)}</div>
        <div class="muted">${date}</div>
        <p class="item-desc">${escapeXml(post.description)}</p>
        <div class="tags">${tags}</div>
      </a>`;
    })
    .join('');

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Beaconmon Blog — RSS Feed</title>
<style>
  :root { color-scheme: light dark; }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Inter, sans-serif;
    background: #ffffff;
    color: #0a0a0f;
    line-height: 1.5;
  }
  @media (prefers-color-scheme: dark) {
    body { background: #0c0c14; color: #efeff5; }
    .card { background: #16161f !important; border-color: #26262f !important; }
    .muted { color: #9a9aa8 !important; }
    .tag { background: #1e1e28 !important; border-color: #2c2c38 !important; color: #cfcfda !important; }
    header { border-color: #26262f !important; }
  }
  header { max-width: 720px; margin: 0 auto; padding: 40px 20px 24px; border-bottom: 1px solid #eceef1; }
  .brand { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
  .brand img { width: 28px; height: 28px; }
  .brand span { font-weight: 700; font-size: 15px; letter-spacing: -0.01em; }
  h1 { font-size: 26px; margin: 0 0 8px; letter-spacing: -0.02em; }
  .desc { margin: 0 0 20px; color: #55555f; font-size: 15px; }
  .notice {
    display: inline-flex; align-items: center; gap: 8px; font-size: 13px;
    background: hsl(152 60% 96%); color: hsl(152 70% 22%);
    border: 1px solid hsl(152 50% 85%); padding: 8px 12px; border-radius: 8px;
  }
  @media (prefers-color-scheme: dark) {
    .notice { background: hsl(152 40% 12%); color: hsl(152 70% 70%); border-color: hsl(152 40% 22%); }
  }
  main { max-width: 720px; margin: 0 auto; padding: 24px 20px 60px; }
  .card {
    display: block; border: 1px solid #eceef1; border-radius: 12px; padding: 20px;
    margin-bottom: 14px; text-decoration: none; color: inherit; background: #fff;
  }
  .card:hover { border-color: hsl(152 100% 45%); }
  .item-title { font-size: 17px; font-weight: 650; margin: 0 0 6px; letter-spacing: -0.01em; }
  .muted { color: #75757f; font-size: 13px; }
  .item-desc { margin: 10px 0 0; font-size: 14px; color: #3f3f47; }
  @media (prefers-color-scheme: dark) { .item-desc { color: #c7c7d2; } }
  .tags { margin-top: 12px; display: flex; flex-wrap: wrap; gap: 6px; }
  .tag { font-size: 11px; padding: 3px 8px; border-radius: 999px; background: #f4f5f7; border: 1px solid #e7e8ec; color: #55555f; }
  footer { max-width: 720px; margin: 0 auto; padding: 0 20px 60px; font-size: 13px; color: #8a8a93; }
  a { color: hsl(152 70% 32%); }
  @media (prefers-color-scheme: dark) { a { color: hsl(152 80% 62%); } }
</style>
</head>
<body>
  <header>
    <div class="brand"><img src="${BASE_URL}/icon.svg" alt="" /><span>Beaconmon</span></div>
    <h1>Beaconmon Blog</h1>
    <p class="desc">Competitor monitoring and ecommerce strategy for Shopify merchants.</p>
    <span class="notice">
      This is an RSS feed. Paste this page's URL into your reader, or
      <a href="${BASE_URL}/feed.xml?format=xml" style="margin-left:2px;">view the raw XML</a>.
    </span>
  </header>
  <main>${items}</main>
  <footer>Powered by <a href="${BASE_URL}/blog">Beaconmon</a> — store and competitor monitoring for e-commerce.</footer>
</body>
</html>`;
}

export function GET(request: Request) {
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

  const url = new URL(request.url);
  const wantsBrowserView = url.searchParams.get('format') !== 'xml' && request.headers.get('sec-fetch-dest') === 'document';

  if (wantsBrowserView) {
    return new Response(renderHtml(posts), {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  return new Response(xml, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  });
}
