#!/usr/bin/env python3
"""
Analyze a seo-fix audit export (Issues + Fixes CSV) to judge whether the
findings are trustworthy enough to act on.

The export is two CSV tables back to back in one file:
  Issues
  rule_id,rule_name,category,severity,priority,message,url,fixable,fix_type
  ...
  <blank line>
  Fixes
  id,fix_type,rule_id,target_url,field,status,risk_level,priority,description,error
  ...

What this does:
  1. Parses both tables correctly (a naive csv.DictReader over the whole
     file misaligns columns once it hits the second header).
  2. Summarizes volume: rows per rule, per category, per severity, and how
     many distinct pages were crawled.
  3. Flags "sitewide" rules -- ones firing on almost every page -- since
     those are really one fix applied N times, not N distinct problems.
     This matters for judging real effort-to-fix, not raw row count.
  4. Live-verifies a set of deterministic, independently-checkable rules
     (title present/length, meta description present/length, canonical,
     h1 count, robots.txt, llms.txt, sitemap.xml, og tags, breadcrumb
     schema) by refetching each flagged URL and re-running the check
     ourselves. Reports true positive / false positive / unverifiable
     counts per rule so we can estimate how much of the total to trust.

Usage:
  python3 analyze_seo_audit.py /path/to/audit-48.csv [--no-fetch] [--out report.md]
"""

import argparse
import csv
import io
import re
import sys
import urllib.request
import urllib.error
from collections import Counter, defaultdict

UA = "Mozilla/5.0 (compatible; BeaconmonAuditVerifier/1.0)"


def parse_export(path):
    with open(path, encoding="utf-8") as f:
        lines = f.readlines()

    # find section boundaries by looking for the "Issues" / "Fixes" marker
    # lines and their following header lines.
    idx = {}
    for i, line in enumerate(lines):
        s = line.strip()
        if s == "Issues":
            idx["issues_start"] = i + 1  # header is next line
        elif s == "Fixes":
            idx["fixes_start"] = i + 1

    if "issues_start" not in idx:
        sys.exit("Could not find 'Issues' section marker in file")

    issues_end = idx.get("fixes_start", len(lines) + 1) - 2  # blank + 'Fixes' line before header
    # walk back from fixes marker to strip the blank separator line
    fixes_marker_line = idx.get("fixes_start", None)
    if fixes_marker_line is not None:
        issues_block_end = fixes_marker_line - 2  # exclude blank line and 'Fixes' line
    else:
        issues_block_end = len(lines)

    issues_text = "".join(lines[idx["issues_start"]:issues_block_end])
    issues = list(csv.DictReader(io.StringIO(issues_text)))
    issues = [r for r in issues if r.get("rule_id")]

    fixes = []
    if "fixes_start" in idx:
        fixes_text = "".join(lines[idx["fixes_start"]:])
        fixes = list(csv.DictReader(io.StringIO(fixes_text)))
        fixes = [r for r in fixes if r.get("id")]

    return issues, fixes


NETWORK_SELF_DIAGNOSTIC_RE = re.compile(
    r"timeout|could not connect|network error|unreachable|connection (?:refused|reset)",
    re.I,
)


def crawl_health(issues):
    print()
    print("=" * 70)
    print("CRAWL HEALTH (is the crawler itself the problem?)")
    print("=" * 70)

    self_diag = [r for r in issues if NETWORK_SELF_DIAGNOSTIC_RE.search(r.get("message", ""))]
    if self_diag:
        print(f"{len(self_diag)} row(s) contain the crawler's own network-failure language "
              f"(timeout/unreachable/connection error), not a real page defect:")
        for r in self_diag[:10]:
            print(f"  [{r['rule_id']}] {r['message']!r}  url={r.get('url') or '(site-level)'}")
        print()

    urls = [r["url"] for r in issues if r.get("url")]
    counts = Counter(urls)
    if len(counts) >= 4:
        vals = sorted(counts.values())
        median = vals[len(vals) // 2]
        outliers_low = [(u, n) for u, n in counts.items() if n <= median * 0.6]
        outliers_high = [(u, n) for u, n in counts.items() if n >= median * 1.6]
        print(f"Issue count per page: median={median}, min={vals[0]}, max={vals[-1]}")
        if outliers_low:
            print(f"{len(outliers_low)} page(s) have suspiciously FEW issues (<=60% of median) "
                  f"-- possible sign these are the only pages that crawled cleanly, "
                  f"which would mean the rest got a broken/partial fetch rather than "
                  f"genuinely having 2-3x more real problems:")
            for u, n in sorted(outliers_low, key=lambda x: x[1]):
                print(f"  {n:4d}  {u}")
        if outliers_high:
            print(f"{len(outliers_high)} page(s) have suspiciously MANY issues (>=160% of median).")
    print()


def summarize(issues, fixes):
    urls = sorted(set(r["url"] for r in issues if r.get("url")))
    n_urls = len(urls)

    print("=" * 70)
    print("VOLUME")
    print("=" * 70)
    print(f"Total issue rows:     {len(issues)}")
    print(f"Distinct pages hit:   {n_urls}")
    print(f"Avg issues per page:  {len(issues) / n_urls:.1f}")
    print(f"Fix suggestions gen'd: {len(fixes)}  ({len(fixes) / len(issues) * 100:.1f}% of issues have a concrete fix)")

    print()
    print("=" * 70)
    print("BY SEVERITY")
    print("=" * 70)
    for sev, n in Counter(r["severity"] for r in issues).most_common():
        print(f"  {n:5d}  {sev}")

    print()
    print("=" * 70)
    print("BY CATEGORY")
    print("=" * 70)
    for cat, n in Counter(r["category"] for r in issues).most_common():
        print(f"  {n:5d}  {cat}")

    print()
    print("=" * 70)
    print("SITEWIDE VS PAGE-SPECIFIC RULES")
    print("(rules hitting >=90% of crawled pages are really one fix, not N)")
    print("=" * 70)
    rule_counts = Counter(r["rule_id"] for r in issues)
    sitewide = [(rid, n) for rid, n in rule_counts.items() if n >= 0.9 * n_urls]
    sitewide.sort(key=lambda x: -x[1])
    print(f"{len(sitewide)} rules are sitewide, accounting for {sum(n for _, n in sitewide)} of {len(issues)} rows "
          f"({sum(n for _, n in sitewide) / len(issues) * 100:.0f}%)")
    print(f"-> collapsing sitewide dupes: {len(issues) - sum(n for _, n in sitewide) + len(sitewide)} 'real' distinct fixes needed, "
          f"not {len(issues)}")
    for rid, n in sitewide[:20]:
        print(f"  {n:5d}  {rid}")

    print()
    print("=" * 70)
    print("FIXABLE FLAG (app's own claim of what it can auto-fix)")
    print("=" * 70)
    for v, n in Counter(r["fixable"] for r in issues).most_common():
        print(f"  {n:5d}  fixable={v}")


# ---------------------------------------------------------------------------
# Live verification: refetch each URL once, run our own checks, compare to
# what the app claimed.
# ---------------------------------------------------------------------------

_page_cache = {}


def fetch(url):
    if url in _page_cache:
        return _page_cache[url]
    try:
        req = urllib.request.Request(url, headers={"User-Agent": UA})
        with urllib.request.urlopen(req, timeout=15) as resp:
            body = resp.read().decode("utf-8", errors="replace")
            status = resp.status
    except urllib.error.HTTPError as e:
        body, status = "", e.code
    except Exception:
        body, status = "", None
    _page_cache[url] = (status, body)
    return status, body


def get_title(html):
    m = re.search(r"<title[^>]*>(.*?)</title>", html, re.I | re.S)
    return re.sub(r"\s+", " ", m.group(1)).strip() if m else None


def get_meta_desc(html):
    m = re.search(r'<meta[^>]+name=["\']description["\'][^>]+content=["\'](.*?)["\']', html, re.I | re.S)
    if not m:
        m = re.search(r'<meta[^>]+content=["\'](.*?)["\'][^>]+name=["\']description["\']', html, re.I | re.S)
    return m.group(1).strip() if m else None


def get_canonical(html):
    m = re.search(r'<link[^>]+rel=["\']canonical["\'][^>]+href=["\'](.*?)["\']', html, re.I)
    return m.group(1) if m else None


def count_h1(html):
    return len(re.findall(r"<h1[\s>]", html, re.I))


def has_og(html, prop):
    return bool(re.search(rf'<meta[^>]+property=["\']og:{prop}["\']', html, re.I))


def has_breadcrumb_schema(html):
    for m in re.finditer(r'<script[^>]+type=["\']application/ld\+json["\'][^>]*>(.*?)</script>', html, re.I | re.S):
        if "BreadcrumbList" in m.group(1):
            return True
    return False


def origin_of(url):
    m = re.match(r"(https?://[^/]+)", url)
    return m.group(1) if m else url


# Each verifier returns True if the issue is a REAL problem (app was right),
# False if the app's claim doesn't hold up (false positive), or None if we
# can't determine it from a plain HTML fetch.
VERIFIERS = {
    "core-title-present": lambda html, url: get_title(html) is None or get_title(html) == "",
    "core-title-length": lambda html, url: (lambda t: t is not None and not (30 <= len(t) <= 60))(get_title(html)),
    "core-description-length": lambda html, url: (lambda d: d is None or not (120 <= len(d) <= 160))(get_meta_desc(html)),
    "core-canonical-present": lambda html, url: get_canonical(html) is None,
    "core-h1-present": lambda html, url: count_h1(html) == 0,
    "core-h1-single": lambda html, url: count_h1(html) > 1,
    "social-og-image": lambda html, url: not has_og(html, "image"),
    "social-og-url": lambda html, url: not has_og(html, "url"),
    "schema-breadcrumb": lambda html, url: not has_breadcrumb_schema(html),
}

# rules that aren't about the page body itself -- checked against the origin,
# once per site rather than once per URL.
SITE_LEVEL_CHECKS = {
    "technical-robots-txt-exists": lambda origin: fetch(origin + "/robots.txt")[0] != 200,
    "geo-llms-txt": lambda origin: fetch(origin + "/llms.txt")[0] != 200,
}


def verify(issues, do_fetch=True, max_pages=None):
    print()
    print("=" * 70)
    print("LIVE VERIFICATION (refetching flagged pages and re-checking)")
    print("=" * 70)
    if not do_fetch:
        print("(skipped: --no-fetch)")
        return

    checkable_rule_ids = set(VERIFIERS) | set(SITE_LEVEL_CHECKS)
    by_rule = defaultdict(list)
    for r in issues:
        if r["rule_id"] in checkable_rule_ids:
            by_rule[r["rule_id"]].append(r)

    results = {}  # rule_id -> Counter(confirmed/false_positive/error)

    site_origins_checked = set()

    for rid, rows in by_rule.items():
        tally = Counter()
        if rid in SITE_LEVEL_CHECKS:
            check = SITE_LEVEL_CHECKS[rid]
            for r in rows:
                origin = origin_of(r["url"]) if r.get("url") else None
                if not origin:
                    tally["error"] += 1
                    continue
                key = (rid, origin)
                if key not in site_origins_checked:
                    site_origins_checked.add(key)
                real = check(origin)
                tally["confirmed" if real else "false_positive"] += 1
        else:
            check = VERIFIERS[rid]
            n = len(rows) if not max_pages else min(len(rows), max_pages)
            for r in rows[:n]:
                status, html = fetch(r["url"])
                if status != 200 or not html:
                    tally["fetch_error"] += 1
                    continue
                real = check(html, r["url"])
                tally["confirmed" if real else "false_positive"] += 1
        results[rid] = tally

    total_confirmed = total_fp = total_err = 0
    print(f"{'rule_id':<30} {'flagged':>8} {'confirmed':>10} {'false_pos':>10} {'error':>7}  fp_rate")
    for rid, tally in sorted(results.items(), key=lambda kv: -sum(kv[1].values())):
        flagged = sum(tally.values())
        confirmed = tally["confirmed"]
        fp = tally["false_positive"]
        err = tally["fetch_error"] + tally["error"]
        checked = confirmed + fp
        fp_rate = f"{fp / checked * 100:.0f}%" if checked else "n/a"
        print(f"{rid:<30} {flagged:>8} {confirmed:>10} {fp:>10} {err:>7}  {fp_rate}")
        total_confirmed += confirmed
        total_fp += fp
        total_err += err

    checked_total = total_confirmed + total_fp
    print()
    if checked_total:
        print(f"Overall, on the {len(checkable_rule_ids)} independently-checkable rules "
              f"({sum(len(v) for v in by_rule.values())} rows):")
        print(f"  confirmed real:  {total_confirmed}")
        print(f"  false positives: {total_fp}  ({total_fp / checked_total * 100:.0f}% of checked)")
        print(f"  fetch errors:    {total_err}")

    uncheckable = Counter(r["rule_id"] for r in issues if r["rule_id"] not in checkable_rule_ids)
    print()
    print(f"{len(issues) - sum(len(v) for v in by_rule.values())} rows across {len(uncheckable)} other rules "
          f"were not independently checked by this script (would need deeper per-rule logic, "
          f"e.g. word count, image alt text, freshness dates, LLM-graded EEAT/GEO rules).")

    return results


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("csv_path")
    ap.add_argument("--no-fetch", action="store_true", help="skip live verification (offline stats only)")
    ap.add_argument("--out", help="write a markdown report to this path")
    args = ap.parse_args()

    issues, fixes = parse_export(args.csv_path)

    buf = io.StringIO()
    if args.out:
        tee = Tee(sys.stdout, buf)
        old_stdout = sys.stdout
        sys.stdout = tee

    summarize(issues, fixes)
    crawl_health(issues)
    verify(issues, do_fetch=not args.no_fetch)

    if args.out:
        sys.stdout = old_stdout
        with open(args.out, "w") as f:
            f.write(buf.getvalue())
        print(f"\nWrote report to {args.out}")


class Tee:
    def __init__(self, *streams):
        self.streams = streams

    def write(self, data):
        for s in self.streams:
            s.write(data)

    def flush(self):
        for s in self.streams:
            s.flush()


if __name__ == "__main__":
    main()
