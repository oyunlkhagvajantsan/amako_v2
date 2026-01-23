import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Handle CORS for API routes (for Cloudflare Pages frontend)
export function middleware(request: NextRequest) {
    // CORS handling for API routes
    if (request.nextUrl.pathname.startsWith('/api')) {
        const origin = request.headers.get('origin');
        const allowedOrigins = [
            process.env.NEXT_PUBLIC_FRONTEND_URL, // Cloudflare Pages URL
            'http://localhost:3000', // Local development
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

        // Handle preflight requests
        if (request.method === 'OPTIONS') {
            return new NextResponse(null, { status: 200, headers: response.headers });
        }

        return response;
    }

    // For non-API routes, continue with existing middleware
    return NextResponse.next();
}

// Admin authentication middleware
export const authMiddleware = withAuth(
    function middleware(req) {
        // If accessing admin route
        if (req.nextUrl.pathname.startsWith("/admin")) {
            const role = req.nextauth.token?.role;

            // If not admin or moderator, redirect to home
            if (role !== "ADMIN" && role !== "MODERATOR") {
                return NextResponse.redirect(new URL("/", req.url));
            }
        }
        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token,
        },
    }
);

export const config = {
    matcher: ["/admin/:path*", "/api/:path*"],
};
