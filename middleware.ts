import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default withAuth(
    function middleware(req) {
        const path = req.nextUrl.pathname;
        const host = req.headers.get("host");
        const adminDomain = process.env.ADMIN_DOMAIN; // e.g., secret-admin.amako.mn

        // 1. Domain-based protection for secret admin path
        if (path.startsWith("/amako-portal-v7")) {
            // If an admin domain is set, only allow access if the host matches
            if (adminDomain && host !== adminDomain) {
                // If the host doesn't match, return 404 (make it invisible)
                return new NextResponse(null, { status: 404 });
            }

            // Role-based protection (NextAuth withAuth handled the login check)
            const role = req.nextauth.token?.role;
            if (role !== "ADMIN" && role !== "MODERATOR") {
                return NextResponse.redirect(new URL("/", req.url));
            }
        }

        // 2. CORS handling for API routes
        if (path.startsWith('/api')) {
            const origin = req.headers.get('origin');
            const allowedOrigins = [
                process.env.NEXT_PUBLIC_FRONTEND_URL,
                'http://localhost:3000',
                'https://localhost:3000',
            ].filter(Boolean) as string[];

            const response = NextResponse.next();

            if (origin && allowedOrigins.includes(origin)) {
                response.headers.set('Access-Control-Allow-Origin', origin);
                response.headers.set('Access-Control-Allow-Credentials', 'true');
                response.headers.set(
                    'Access-Control-Allow-Methods',
                    'GET, POST, PUT, DELETE, OPTIONS, PATCH'
                );
                response.headers.set(
                    'Access-Control-Allow-Headers',
                    'Content-Type, Authorization, X-Requested-With'
                );
            }

            if (req.method === 'OPTIONS') {
                return new NextResponse(null, { status: 200, headers: response.headers });
            }

            return response;
        }

        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: ({ token, req }) => {
                // Always authorize if not on /admin or /api (let the middleware function handle logic)
                // or if it's an API route that might need auth, let it through to check session manually if needed
                // But generally, /admin MUST have a token
                if (req.nextUrl.pathname.startsWith("/amako-portal-v7")) {
                    return !!token;
                }
                return true;
            },
        },
    }
);

export const config = {
    matcher: ["/amako-portal-v7/:path*", "/api/:path*"],
};
