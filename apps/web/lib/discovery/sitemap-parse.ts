export function parseSitemapDirectives(robotsTxt: string): string[] {
  const out: string[] = [];
  for (const line of robotsTxt.split(/\r?\n/)) {
    const m = /^\s*sitemap\s*:\s*(\S+)/i.exec(line);
    if (m?.[1]) out.push(m[1]);
  }
  return out;
}

export function parseSitemapXml(xml: string): { urls: string[]; nestedSitemaps: string[] } {
  const urls: string[] = [];
  const nestedSitemaps: string[] = [];
  const isIndex = /<sitemapindex[\s>]/i.test(xml);
  const locRegex = /<loc>\s*([^<]+?)\s*<\/loc>/gi;
  let match: RegExpExecArray | null;
  while ((match = locRegex.exec(xml)) !== null) {
    const loc = match[1]!.trim();
    if (!loc) continue;
    if (isIndex) nestedSitemaps.push(loc);
    else urls.push(loc);
  }
  return { urls, nestedSitemaps };
}
