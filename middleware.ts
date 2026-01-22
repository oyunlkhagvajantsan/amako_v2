import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
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
    matcher: ["/admin/:path*"],
};
