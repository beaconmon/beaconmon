'use client';

import { useEffect, useRef, useState } from 'react';
import { apiFetch } from '@/lib/api-fetch';

interface BumpResponse {
  previousLastSeenAt: string | null;
  lastSeenAt: string;
}

interface UseIntelligenceLastSeenResult {
  previousLastSeenAt: Date | null;
  isReady: boolean;
}

export function useIntelligenceLastSeen(): UseIntelligenceLastSeenResult {
  const [previousLastSeenAt, setPreviousLastSeenAt] = useState<Date | null>(null);
  const [isReady, setIsReady] = useState(false);
  const didRunRef = useRef(false);

  useEffect(() => {
    if (didRunRef.current) return;
    didRunRef.current = true;

    let cancelled = false;
    void (async () => {
      try {
        const res = await apiFetch('/api/intelligence/last-seen', { method: 'POST' });
        if (!res.ok) {
          if (!cancelled) setIsReady(true);
          return;
        }
        const data = (await res.json()) as BumpResponse;
        if (cancelled) return;
        setPreviousLastSeenAt(data.previousLastSeenAt ? new Date(data.previousLastSeenAt) : null);
        setIsReady(true);
      } catch {
        if (!cancelled) setIsReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return { previousLastSeenAt, isReady };
}
