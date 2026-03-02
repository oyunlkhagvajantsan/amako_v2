"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * SessionGuard ensures that the user is logged out when they quit their browser.
 * It uses a session-only cookie ('amako_session_active') as an indicator.
 * If the user is authenticated but the cookie is missing (meaning the browser was restarted),
 * it triggers a signOut.
 */
export default function SessionGuard({ children }: { children: React.ReactNode }) {
    const { status } = useSession();
    const pathname = usePathname();

    useEffect(() => {
        // Don't run this logic on public auth pages to avoid redirect loops
        const publicPaths = ["/login", "/signup", "/forgot-password", "/reset-password"];
        if (publicPaths.includes(pathname)) return;

        // Only run this logic if the user is authenticated
        if (status === "authenticated") {
            const checkSession = () => {
                // Check for our session-only indicator cookie
                const cookies = document.cookie.split("; ");
                const sessionActive = cookies.some(c => c.startsWith("amako_session_active="));

                if (!sessionActive) {
                    console.log("[SessionGuard] Browser session expired. Logging out...");
                    // Using a full URL to break out of any subdomain hijacks
                    const mainDomain = "amakomanga.com";
                    const isProd = window.location.hostname.endsWith(mainDomain);
                    const callbackUrl = isProd ? `https://${mainDomain}/login` : "/login";
                    signOut({ callbackUrl });
                }
            };

            // Run check immediately on mount
            checkSession();
        }
    }, [status, pathname]);

    return <>{children}</>;
}
