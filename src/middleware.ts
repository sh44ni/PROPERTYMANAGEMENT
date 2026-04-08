import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Routes that don't require authentication
const publicRoutes = [
    '/login',
    '/setup',
    '/forgot-password',
    '/reset-password',
    '/api/auth',
    '/api/setup',
    '/showcase',
];

async function getMode(request: NextRequest) {
    try {
        const url = new URL('/api/setup/status', request.url);
        const res = await fetch(url, { headers: { 'accept': 'application/json' } });
        const json = await res.json().catch(() => null) as any;
        return (json?.data?.mode as string) || 'notConfigured';
    } catch {
        return 'notConfigured';
    }
}

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Check if route is public
    const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

    // Allow public routes and static files
    if (isPublicRoute || pathname.startsWith('/_next') || pathname.startsWith('/favicon') || pathname.includes('.')) {
        return NextResponse.next();
    }

    // Setup gating: if not activated/configured yet, force /setup
    const mode = await getMode(request);
    if (mode !== 'live') {
        // demo/notConfigured: allow app access after login, but first-run should go to /setup
        if (mode === 'notConfigured') {
            if (pathname.startsWith('/api/')) {
                return NextResponse.json({ error: 'Not activated' }, { status: 409 });
            }
            const setupUrl = new URL('/setup', request.url);
            return NextResponse.redirect(setupUrl);
        }
    }

    // Check for authentication token
    const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET || 'telal-super-secret-key-change-in-production',
    });

    // If not authenticated:
    // - For API routes, return JSON 401 (avoid HTML redirects that break client JSON parsing)
    // - For pages, redirect to login
    if (!token) {
        if (pathname.startsWith('/api/')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\..*|api/auth).*)',
    ],
};
