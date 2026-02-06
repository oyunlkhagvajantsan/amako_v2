import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { commentRateLimit, authRateLimit, generalRateLimit } from "@/lib/rate-limit";
import { applySecurityHeaders } from "@/lib/middleware/security";
import { handleRateLimiting } from "@/lib/middleware/rate-limit-handler";

export default withAuth(
    async function middleware(req: NextRequest) {
        const path = req.nextUrl.pathname;
        const host = req.headers.get("host");
        const token = (req as any).nextauth?.token;

        // --- Diagnostic Logs for Mobile Debugging ---
        if (path.startsWith("/login") || path.startsWith("/amako-portal-v7")) {
            console.log(`[Middleware] Path: ${path}, Host: ${host}, HasToken: ${!!token}, Role: ${token?.role}`);
        }

        const ip = req.headers.get("x-forwarded-for")?.split(',')[0] ||
            req.headers.get("x-real-ip") ||
            "127.0.0.1";
        const adminDomain = process.env.ADMIN_DOMAIN;

        // 1. Security Headers
        const response = applySecurityHeaders(NextResponse.next());

        // 2. Admin Domain & Role Protection
        if (path.startsWith("/amako-portal-v7")) {
            // Domain check
            if (adminDomain && host !== adminDomain) {
                console.warn(`[Middleware] Admin domain mismatch: ${host} !== ${adminDomain}`);
                return new NextResponse(null, { status: 404 });
            }

            // Role check - ONLY redirect if logged in but NOT authorized
            if (token && token.role !== "ADMIN" && token.role !== "MODERATOR") {
                console.warn(`[Middleware] Unauthorized role for admin path: ${token.role}`);
                return NextResponse.redirect(new URL("/", req.url));
            }
        }

        // 3. API Rate Limiting & Protection
        if (path.startsWith('/api')) {
            // Allow auth-related API calls
            if (path.startsWith('/api/auth')) {
                return response;
            }

            const limitResponse = await handleRateLimiting(req, ip, path);
            if (limitResponse) return limitResponse;

            // CORS logic
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
                const path = req.nextUrl.pathname;

                // Public paths that don't require login
                const publicPaths = [
                    "/login",
                    "/signup",
                    "/forgot-password",
                    "/reset-password",
                ];

                if (publicPaths.some(p => path.startsWith(p)) || path.startsWith("/api/auth")) {
                    return true;
                }

                // Everything else requires a token
                return !!token;
            },
        },
    }
);

export const config = {
    matcher: [
        "/amako-portal-v7/:path*",
        "/api/:path*",
        "/((?!_next/static|_next/image|favicon.ico|uploads).*)",
    ],
};
