'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Tiny zero-dependency stale-while-revalidate hook.
 *
 * Features:
 *   - In-memory cache keyed by URL → instant paint when revisiting a page.
 *   - Single in-flight request per key (dedupe across components).
 *   - `stale-while-revalidate`: returns cached data instantly, refreshes in the
 *     background, and updates every subscriber when fresh data arrives.
 *   - `mutate()` for optimistic updates.
 *   - `refetch()` for manual refresh (after a POST/PUT/DELETE).
 */

type Listener<T> = (value: CacheEntry<T>) => void;

interface CacheEntry<T> {
    data?: T;
    error?: Error;
    updatedAt: number;
    isValidating: boolean;
}

const cache = new Map<string, CacheEntry<unknown>>();
const listeners = new Map<string, Set<Listener<unknown>>>();
const inflight = new Map<string, Promise<unknown>>();

function notify<T>(key: string) {
    const entry = cache.get(key) as CacheEntry<T> | undefined;
    if (!entry) return;
    const subs = listeners.get(key);
    if (!subs) return;
    subs.forEach((l) => l(entry as CacheEntry<unknown>));
}

function subscribe<T>(key: string, listener: Listener<T>): () => void {
    let set = listeners.get(key);
    if (!set) {
        set = new Set();
        listeners.set(key, set);
    }
    set.add(listener as Listener<unknown>);
    return () => {
        set?.delete(listener as Listener<unknown>);
        if (set?.size === 0) listeners.delete(key);
    };
}

async function fetchAndCache<T>(key: string, fetcher: (url: string) => Promise<T>): Promise<T> {
    const existing = inflight.get(key) as Promise<T> | undefined;
    if (existing) return existing;

    const current = (cache.get(key) as CacheEntry<T> | undefined) ?? {
        updatedAt: 0,
        isValidating: true,
    };
    cache.set(key, { ...current, isValidating: true });
    notify<T>(key);

    const p = fetcher(key)
        .then((data) => {
            cache.set(key, { data, updatedAt: Date.now(), isValidating: false });
            notify<T>(key);
            return data;
        })
        .catch((err: Error) => {
            const prev = cache.get(key) as CacheEntry<T> | undefined;
            cache.set(key, {
                data: prev?.data,
                error: err,
                updatedAt: Date.now(),
                isValidating: false,
            });
            notify<T>(key);
            throw err;
        })
        .finally(() => {
            inflight.delete(key);
        });

    inflight.set(key, p as Promise<unknown>);
    return p;
}

export interface UseApiResult<T> {
    data: T | undefined;
    error: Error | undefined;
    isLoading: boolean;       // no data yet
    isValidating: boolean;    // refresh in progress
    refetch: () => Promise<T | undefined>;
    mutate: (updater: T | ((current: T | undefined) => T)) => void;
}

export interface UseApiOptions {
    /** Skip the fetch when false. Useful for conditional loading. */
    enabled?: boolean;
    /** Re-fetch on window focus (default: true). */
    revalidateOnFocus?: boolean;
    /** Consider cached data fresh for N ms (default: 15000). */
    dedupeMs?: number;
}

const defaultFetcher = async (url: string) => {
    const res = await fetch(url, { credentials: 'same-origin' });
    if (!res.ok) throw new Error(`Request failed: ${res.status}`);
    return res.json();
};

export function useApi<T = unknown>(
    key: string | null,
    options: UseApiOptions = {},
): UseApiResult<T> {
    const { enabled = true, revalidateOnFocus = true, dedupeMs = 15_000 } = options;

    const [, force] = useState(0);
    const mountedRef = useRef(true);
    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
        };
    }, []);

    // Subscribe for updates.
    useEffect(() => {
        if (!key || !enabled) return;
        const unsub = subscribe<T>(key, () => {
            if (mountedRef.current) force((x) => x + 1);
        });
        return unsub;
    }, [key, enabled]);

    // Trigger the request.
    useEffect(() => {
        if (!key || !enabled) return;
        const existing = cache.get(key) as CacheEntry<T> | undefined;
        const isFresh = existing && Date.now() - existing.updatedAt < dedupeMs;
        if (isFresh) return;
        fetchAndCache<T>(key, defaultFetcher).catch(() => {
            /* error already captured in cache */
        });
    }, [key, enabled, dedupeMs]);

    // Re-validate on focus.
    useEffect(() => {
        if (!key || !enabled || !revalidateOnFocus) return;
        const handler = () => {
            fetchAndCache<T>(key, defaultFetcher).catch(() => {});
        };
        window.addEventListener('focus', handler);
        return () => window.removeEventListener('focus', handler);
    }, [key, enabled, revalidateOnFocus]);

    const entry = key ? (cache.get(key) as CacheEntry<T> | undefined) : undefined;

    const refetch = useCallback(async (): Promise<T | undefined> => {
        if (!key) return undefined;
        inflight.delete(key);
        try {
            return await fetchAndCache<T>(key, defaultFetcher);
        } catch {
            return undefined;
        }
    }, [key]);

    const mutate = useCallback(
        (updater: T | ((current: T | undefined) => T)) => {
            if (!key) return;
            const current = cache.get(key) as CacheEntry<T> | undefined;
            const nextData =
                typeof updater === 'function'
                    ? (updater as (c: T | undefined) => T)(current?.data)
                    : updater;
            cache.set(key, {
                data: nextData,
                updatedAt: Date.now(),
                isValidating: current?.isValidating ?? false,
            });
            notify<T>(key);
        },
        [key],
    );

    return {
        data: entry?.data,
        error: entry?.error,
        isLoading: enabled && !!key && !entry?.data && !entry?.error,
        isValidating: !!entry?.isValidating,
        refetch,
        mutate,
    };
}

/**
 * Invalidate one or more cache keys (prefix match) — call after a mutation.
 *   invalidate('/api/properties')
 */
export function invalidate(prefix: string) {
    const keys = Array.from(cache.keys()).filter((k) => k.startsWith(prefix));
    keys.forEach((k) => {
        inflight.delete(k);
        const entry = cache.get(k);
        if (!entry) return;
        // Mark as stale so useApi re-fetches on next access while keeping old
        // data visible for a fluid transition.
        cache.set(k, { ...entry, updatedAt: 0 });
        fetchAndCache(k, defaultFetcher).catch(() => {});
    });
}

/**
 * Pre-warm the cache for a URL without blocking. Use on hover/prefetch events.
 */
export function prefetch(key: string) {
    const existing = cache.get(key);
    if (existing && Date.now() - existing.updatedAt < 15_000) return;
    fetchAndCache(key, defaultFetcher).catch(() => {});
}
