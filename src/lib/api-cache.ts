import { NextResponse } from 'next/server';

export interface CacheOptions {
    /** Seconds the response is considered fresh by the browser (default 0 = do not cache). */
    browser?: number;
    /** Seconds the response is considered fresh by shared caches / CDN (default 30). */
    cdn?: number;
    /** Seconds a stale response may be served while revalidation happens (default 60). */
    swr?: number;
    /** HTTP status code. Defaults to 200. */
    status?: number;
}

/**
 * Build a JSON response with stale-while-revalidate cache headers tuned for
 * read-mostly API routes. Revalidation still happens in the background, but
 * the first paint is instant from the cache.
 */
export function cachedJson<T>(payload: T, opts: CacheOptions = {}): NextResponse {
    const browser = opts.browser ?? 0;
    const cdn = opts.cdn ?? 30;
    const swr = opts.swr ?? 60;
    const status = opts.status ?? 200;

    const cacheControl =
        browser > 0
            ? `private, max-age=${browser}, s-maxage=${cdn}, stale-while-revalidate=${swr}`
            : `private, no-cache, s-maxage=${cdn}, stale-while-revalidate=${swr}`;

    return NextResponse.json(payload, {
        status,
        headers: {
            'Cache-Control': cacheControl,
            'CDN-Cache-Control': `s-maxage=${cdn}, stale-while-revalidate=${swr}`,
        },
    });
}

/**
 * Response helper for mutations — always uncached, optionally with a custom status.
 */
export function json<T>(payload: T, status = 200): NextResponse {
    return NextResponse.json(payload, {
        status,
        headers: { 'Cache-Control': 'private, no-store' },
    });
}

/**
 * Convenience for error responses.
 */
export function errorJson(error: string, status = 500): NextResponse {
    return json({ error }, status);
}
