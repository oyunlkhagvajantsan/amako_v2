import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { commentRateLimit, authRateLimit, generalRateLimit } from "@/lib/rate-limit";

export default withAuth(
    async function middleware(req: NextRequest) {
        const path = req.nextUrl.pathname;
        const host = req.headers.get("host");
        // Get IP from headers (standard for Railway/Vercel/Cloudflare)
        const ip = req.headers.get("x-forwarded-for")?.split(',')[0] ||
            req.headers.get("x-real-ip") ||
            "127.0.0.1";
        const adminDomain = process.env.ADMIN_DOMAIN;

        // 1. Security Headers (CSP, etc.)
        const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
        const cspHeader = `
            default-src 'self';
            script-src 'self' 'unsafe-inline' 'unsafe-eval';
            style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
            img-src 'self' blob: data: https://*.r2.cloudflarestorage.com https://*.r2.dev;
            font-src 'self' https://fonts.gstatic.com;
            connect-src 'self' http://localhost:* ws://localhost:* https://*.upstash.io;
            frame-ancestors 'none';
        `.replace(/\s{2,}/g, ' ').trim();

        const response = NextResponse.next();
        response.headers.set('Content-Security-Policy', cspHeader);
        response.headers.set('X-Content-Type-Options', 'nosniff');
        response.headers.set('X-Frame-Options', 'DENY');
        response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
        response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

        // 2. Admin Domain Protection
        if (path.startsWith("/amako-portal-v7")) {
            if (adminDomain && host !== adminDomain) {
                return new NextResponse(null, { status: 404 });
            }
            const role = (req as any).nextauth?.token?.role;
            if (role !== "ADMIN" && role !== "MODERATOR") {
                return NextResponse.redirect(new URL("/", req.url));
            }
        }

        // 3. API Rate Limiting & Protection
        if (path.startsWith('/api')) {
            // Apply targeted rate limits (Only if configured)
            const isRateLimitConfigured = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN;

            if (isRateLimitConfigured) {
                try {
                    let limitResult;
                    const method = req.method;

                    // Only rate-limit mutations or specific sensitive paths
                    // We mostly want to prevent SPAM and BRUTE FORCE
                    if (path.includes('/comments') && method === 'POST') {
                        limitResult = await commentRateLimit?.limit(ip);
                    } else if (path.includes('/auth') || path.includes('/user/verify-age')) {
                        // Keep auth protection on all relevant methods
                        limitResult = await authRateLimit?.limit(ip);
                    } else if (method !== 'GET') {
                        // Apply general rate limit to all other mutations
                        limitResult = await generalRateLimit?.limit(ip);
                    }
                    // GET requests are exempt from rate limiting for better performance, 
                    // unless they are specific high-cost endpoints.

                    if (limitResult && !limitResult.success) {
                        return NextResponse.json(
                            { error: 'Too Many Requests', details: 'Та хэтэрхий олон хүсэлт илгээсэн байна. Түр хүлээгээд дахин оролдоно уу.' },
                            {
                                status: 429,
                                headers: {
                                    'X-RateLimit-Limit': limitResult.limit.toString(),
                                    'X-RateLimit-Remaining': limitResult.remaining.toString(),
                                    'X-RateLimit-Reset': limitResult.reset.toString(),
                                }
                            }
                        );
                    }
                } catch (err) {
                    console.error("Rate limiting failed (Upstash/Redis error):", err);
                    // Continue to API - don't block user if rate limiting service is down
                }
            }

            // CORS logic (retained and integrated)
            const origin = req.headers.get('origin');
            const allowedOrigins = [
                process.env.NEXT_PUBLIC_FRONTEND_URL,
                'http://localhost:3000',
                'https://localhost:3000',
            ].filter(Boolean) as string[];

            if (origin && allowedOrigins.includes(origin)) {
                response.headers.set('Access-Control-Allow-Origin', origin);
                response.headers.set('Access-Control-Allow-Credentials', 'true');
                response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
                response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
            }

            if (req.method === 'OPTIONS') {
                return new NextResponse(null, { status: 200, headers: response.headers });
            }
        }

        return response;
    },
    {
        callbacks: {
            authorized: ({ token, req }) => {
                if (req.nextUrl.pathname.startsWith("/amako-portal-v7")) {
                    return !!token;
                }
                return true;
            },
        },
    }
);

export const config = {
    matcher: [
        "/amako-portal-v7/:path*",
        "/api/:path*",
        "/((?!_next/static|_next/image|favicon.ico).*)",
    ],
};
