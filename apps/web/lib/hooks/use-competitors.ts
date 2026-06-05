'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api-fetch';

// ─── List types ───────────────────────────────────────────────────────────────

export interface CompetitorItem {
  id: string;
  name: string;
  domain: string;
  platform: string;
  isActive: boolean;
}

// ─── Detail types ─────────────────────────────────────────────────────────────

export interface CompetitorDetail {
  id: string;
  name: string;
  domain: string;
  platform: string;
  isActive: boolean;
  createdAt: string;
}

export interface CompetitorDecisionData {
  id: string;
  response: string;
  note: string | null;
}

export interface CompetitorEventRow {
  id: string;
  competitorId: string;
  productId: string | null;
  pageId: string | null;
  type: string;
  payload: Record<string, unknown>;
  significance?: string | null;
  detectedAt: string;
  decision?: CompetitorDecisionData | null;
}

export interface CompetitorProductRow {
  id: string;
  title: string;
  handle: string;
  currentPrice: unknown;
  compareAtPrice: unknown;
  isAvailable: boolean;
  currency: string;
  lastSeenAt: string;
}

export interface CompetitorPageRow {
  id: string;
  label: string;
  url: string;
  selector: string | null;
  intervalSeconds: number;
  isActive: boolean;
  lastSnapshotHash: string | null;
  lastCheckedAt: string | null;
}

export interface CompetitorChannelRow {
  id: string;
  name: string;
  type: string;
  isActive: boolean;
}

// ─── List hooks ───────────────────────────────────────────────────────────────

export function useCompetitors() {
  return useQuery<CompetitorItem[]>({
    queryKey: ['competitors'],
    queryFn: async () => {
      const res = await apiFetch('/api/competitors');
      if (!res.ok) throw new Error('Failed to fetch competitors');
      return res.json();
    },
    refetchInterval: 60_000,
  });
}

export function useInvalidateCompetitors() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: ['competitors'] });
}

// ─── Detail hooks ─────────────────────────────────────────────────────────────

export function useCompetitor(id: string) {
  return useQuery<CompetitorDetail>({
    queryKey: ['competitor', id],
    queryFn: async () => {
      const res = await apiFetch(`/api/competitors/${id}`);
      if (!res.ok) throw new Error('Failed to fetch competitor');
      return res.json();
    },
  });
}

export function useCompetitorProducts(id: string) {
  return useQuery<CompetitorProductRow[]>({
    queryKey: ['competitor-products', id],
    queryFn: async () => {
      const res = await apiFetch(`/api/competitors/${id}/products`);
      if (!res.ok) throw new Error('Failed to fetch competitor products');
      return res.json();
    },
  });
}

export function useCompetitorPages(id: string) {
  return useQuery<CompetitorPageRow[]>({
    queryKey: ['competitor-pages', id],
    queryFn: async () => {
      const res = await apiFetch(`/api/competitors/${id}/pages`);
      if (!res.ok) throw new Error('Failed to fetch competitor pages');
      return res.json();
    },
  });
}

export function useCompetitorChannels(id: string) {
  return useQuery<CompetitorChannelRow[]>({
    queryKey: ['competitor-channels', id],
    queryFn: async () => {
      const res = await apiFetch(`/api/competitors/${id}/channels`);
      if (!res.ok) throw new Error('Failed to fetch competitor channels');
      return res.json();
    },
  });
}

// ─── Channel mutations ────────────────────────────────────────────────────────

export function useAddCompetitorChannel(competitorId: string) {
  const qc = useQueryClient();
  return useMutation<void, Error, { channelId: string }>({
    mutationFn: async ({ channelId }) => {
      const res = await apiFetch(`/api/competitors/${competitorId}/channels`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelId }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error ?? 'Failed to add channel');
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['competitor-channels', competitorId] });
    },
  });
}

export function useRemoveCompetitorChannel(competitorId: string) {
  const qc = useQueryClient();
  return useMutation<void, Error, { channelId: string }>({
    mutationFn: async ({ channelId }) => {
      const res = await apiFetch(`/api/competitors/${competitorId}/channels/${channelId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to remove channel');
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['competitor-channels', competitorId] });
    },
  });
}

// ─── Events cursor hook ───────────────────────────────────────────────────────

interface EventsState {
  events: CompetitorEventRow[];
  hasMore: boolean;
  isLoading: boolean;
  isError: boolean;
  cursor: string | null;
  loadMore: () => void;
  refresh: () => void;
  updateEventDecision: (eventId: string, decision: CompetitorDecisionData | null) => void;
}

export function useCompetitorEvents(id: string): EventsState {
  const [events, setEvents] = useState<CompetitorEventRow[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [cursor, setCursor] = useState<string | null>(null);
  const idRef = useRef(id);

  const fetchPage = useCallback(
    async (before?: string, append = false) => {
      const capturedId = id;
      try {
        const params = new URLSearchParams({ limit: '50' });
        if (before) params.set('before', before);
        const res = await apiFetch(`/api/competitors/${capturedId}/events?${params.toString()}`);
        if (!res.ok) throw new Error('Failed to fetch competitor events');
        const data: { events: CompetitorEventRow[]; nextCursor: string | null } = await res.json();
        if (idRef.current !== capturedId) return;
        setEvents((prev) => (append ? [...prev, ...data.events] : data.events));
        setHasMore(data.nextCursor !== null);
        setCursor(data.nextCursor);
      } catch {
        if (idRef.current === capturedId) setIsError(true);
      } finally {
        if (idRef.current === capturedId) setIsLoading(false);
      }
    },
    [id]
  );

  useEffect(() => {
    if (idRef.current !== id) {
      idRef.current = id;
      setEvents([]);
      setCursor(null);
      setIsLoading(true);
      setIsError(false);
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetchPage only calls setState after await, not synchronously
    void fetchPage(undefined, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadMore = useCallback(() => {
    if (!hasMore || isLoading || !cursor) return;
    setIsLoading(true);
    setIsError(false);
    void fetchPage(cursor, true);
  }, [hasMore, isLoading, cursor, fetchPage]);

  const updateEventDecision = useCallback((eventId: string, decision: CompetitorDecisionData | null) => {
    setEvents((prev) => prev.map((e) => (e.id === eventId ? { ...e, decision } : e)));
  }, []);

  const refresh = useCallback(() => {
    setEvents([]);
    setCursor(null);
    setIsLoading(true);
    setIsError(false);
    void fetchPage(undefined, false);
  }, [fetchPage]);

  return { events, hasMore, isLoading, isError, cursor, loadMore, refresh, updateEventDecision };
}

// ─── Price history ────────────────────────────────────────────────────────────

export interface PriceHistoryPoint {
  price: string;
  detectedAt: string;
}

export function usePriceHistory(competitorId: string, productId: string, enabled: boolean) {
  return useQuery<PriceHistoryPoint[]>({
    queryKey: ['price-history', competitorId, productId],
    queryFn: async () => {
      const res = await apiFetch(`/api/competitors/${competitorId}/products/${productId}/price-history`);
      if (!res.ok) throw new Error('Failed to fetch price history');
      return res.json();
    },
    enabled,
    staleTime: 5 * 60_000,
  });
}

// ─── Bulk dismiss ─────────────────────────────────────────────────────────────

export function useDismissBulk(competitorId: string) {
  const _qc = useQueryClient();
  return useMutation<{ count: number }, Error, void>({
    mutationFn: async () => {
      const res = await apiFetch(`/api/competitors/${competitorId}/events/dismiss-bulk`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to dismiss events');
      return res.json();
    },
    onSuccess: () => {
      // useCompetitorEvents uses its own state — caller must pass { onSuccess: refresh } to mutate()
    },
  });
}

// ─── Legacy feed (kept for backward compat) ───────────────────────────────────

export interface CompetitorFeedItem {
  monitorId: string;
  monitorName: string;
  monitorUrl: string;
  snapshotId: string;
  capturedAt: string;
}

interface FeedResponse {
  items: CompetitorFeedItem[];
  hasMore: boolean;
  activeCount: number;
}

export function useCompetitorFeed() {
  return useQuery<FeedResponse>({
    queryKey: ['competitor-feed'],
    queryFn: async () => {
      const res = await apiFetch('/api/competitors/feed?limit=20');
      if (!res.ok) throw new Error('Failed to fetch competitor feed');
      return res.json();
    },
    refetchInterval: 60_000,
  });
}

export function useInvalidateCompetitorFeed() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: ['competitor-feed'] });
}
