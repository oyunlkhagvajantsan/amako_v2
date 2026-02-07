"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect } from "react";

/**
 * SessionGuard ensures that the user is logged out when they quit their browser.
 * It uses a session-only cookie ('amako_session_active') as an indicator.
 * If the user is authenticated but the cookie is missing (meaning the browser was restarted),
 * it triggers a signOut.
 */
export default function SessionGuard({ children }: { children: React.ReactNode }) {
    const { status } = useSession();

    useEffect(() => {
        // Only run this logic if the user is authenticated
        if (status === "authenticated") {
            const checkSession = () => {
                // Check for our session-only indicator cookie
                const cookies = document.cookie.split("; ");
                const sessionActive = cookies.some(c => c.startsWith("amako_session_active="));

                if (!sessionActive) {
                    console.log("[SessionGuard] Browser session expired. Logging out...");
                    signOut({ callbackUrl: "/login" });
                }
            };

            // Run check immediately on mount
            checkSession();
        }
    }, [status]);

    return <>{children}</>;
}
