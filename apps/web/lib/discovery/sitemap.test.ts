import { describe, it, expect } from 'vitest';
import { parseSitemapDirectives, parseSitemapXml } from './sitemap-parse';

describe('parseSitemapDirectives', () => {
  it('extracts a single Sitemap: directive', () => {
    expect(parseSitemapDirectives('Sitemap: https://x.com/sitemap.xml')).toEqual([
      'https://x.com/sitemap.xml',
    ]);
  });

  it('extracts multiple sitemap directives', () => {
    const robots = [
      'User-agent: *',
      'Sitemap: https://x.com/sitemap-main.xml',
      'Disallow: /admin',
      'sitemap: https://x.com/sitemap-blog.xml',
    ].join('\n');
    expect(parseSitemapDirectives(robots)).toEqual([
      'https://x.com/sitemap-main.xml',
      'https://x.com/sitemap-blog.xml',
    ]);
  });

  it('returns an empty array when no Sitemap: directive is present', () => {
    expect(parseSitemapDirectives('User-agent: *\nDisallow: /admin')).toEqual([]);
  });

  it('handles CRLF line endings', () => {
    const robots = 'User-agent: *\r\nSitemap: https://x.com/s.xml\r\n';
    expect(parseSitemapDirectives(robots)).toEqual(['https://x.com/s.xml']);
  });
});

describe('parseSitemapXml', () => {
  it('parses a simple urlset', () => {
    const xml = `<?xml version="1.0"?>
      <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        <url><loc>https://x.com/a</loc></url>
        <url><loc>https://x.com/b</loc></url>
      </urlset>`;
    const result = parseSitemapXml(xml);
    expect(result.urls).toEqual(['https://x.com/a', 'https://x.com/b']);
    expect(result.nestedSitemaps).toEqual([]);
  });

  it('parses a sitemap index into nestedSitemaps', () => {
    const xml = `<?xml version="1.0"?>
      <sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        <sitemap><loc>https://x.com/s1.xml</loc></sitemap>
        <sitemap><loc>https://x.com/s2.xml</loc></sitemap>
      </sitemapindex>`;
    const result = parseSitemapXml(xml);
    expect(result.nestedSitemaps).toEqual(['https://x.com/s1.xml', 'https://x.com/s2.xml']);
    expect(result.urls).toEqual([]);
  });

  it('trims whitespace inside <loc>', () => {
    const xml = `<urlset><url><loc>
      https://x.com/spaced
    </loc></url></urlset>`;
    expect(parseSitemapXml(xml).urls).toEqual(['https://x.com/spaced']);
  });

  it('returns empty arrays for non-sitemap XML', () => {
    const result = parseSitemapXml('<html><body>not xml</body></html>');
    expect(result.urls).toEqual([]);
    expect(result.nestedSitemaps).toEqual([]);
  });

  it('returns empty arrays for malformed input', () => {
    const result = parseSitemapXml('garbage <not> xml');
    expect(result.urls).toEqual([]);
    expect(result.nestedSitemaps).toEqual([]);
  });
});
