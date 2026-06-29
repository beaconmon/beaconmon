'use client';

import { useState } from 'react';

interface ShareButtonsProps {
  tweetText: string;
  url?: string;
}

export default function ShareButtons({ tweetText, url }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  function resolvedUrl(): string {
    if (url) return url;
    return typeof window !== 'undefined' ? window.location.href : '';
  }

  function openTweet() {
    const params = new URLSearchParams({ text: tweetText, url: resolvedUrl() });
    window.open(`https://twitter.com/intent/tweet?${params.toString()}`, '_blank', 'noopener,noreferrer');
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(resolvedUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable (insecure context or denied permission).
    }
  }

  return (
    <div className="mt-3 flex items-center gap-2">
      <button
        type="button"
        onClick={openTweet}
        className="inline-flex items-center gap-2 h-[36px] px-4 text-[13px] font-semibold rounded-lg border border-brand-line text-brand-dim hover:text-brand-text hover:border-brand-green-border-25 transition-colors"
      >
        <XIcon />
        Share on X
      </button>
      <button
        type="button"
        onClick={copyLink}
        className="inline-flex items-center gap-2 h-[36px] px-4 text-[13px] font-semibold rounded-lg border border-brand-line text-brand-dim hover:text-brand-text hover:border-brand-green-border-25 transition-colors"
      >
        {copied ? (
          <>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path d="M3 7.5l2.5 2.5L11 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Copied
          </>
        ) : (
          'Copy link'
        )}
      </button>
    </div>
  );
}

function XIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden>
      <path d="M10.3 1H12.4L8.1 5.9 13.2 13H9.1L5.9 8.7 2.3 13H0.2L4.8 7.7 0 1H4.2L7.1 4.9 10.3 1ZM9.6 11.8H10.8L3.6 2.2H2.3L9.6 11.8Z" />
    </svg>
  );
}
