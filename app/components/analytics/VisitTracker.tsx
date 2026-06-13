"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function VisitTracker() {
    const pathname = usePathname();

    useEffect(() => {
        // Skip tracking visits to the admin portal
        if (pathname?.startsWith("/amako-portal-v7")) {
            return;
        }

        // Check if amako_visited cookie is already set
        const hasVisited = document.cookie
            .split("; ")
            .find(row => row.startsWith("amako_visited="));

        if (!hasVisited) {
            // Set session cookie for 30 minutes
            const expiryTime = new Date(Date.now() + 30 * 60 * 1000).toUTCString();
            document.cookie = `amako_visited=true; path=/; expires=${expiryTime}; SameSite=Lax`;

            // Log the unique session visit
            fetch("/api/track-visit", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    referrer: document.referrer || "Direct",
                    entryPath: window.location.pathname
                })
            }).catch((err) => {
                console.error("Analytics visit log failed:", err);
            });
        }
    }, [pathname]);

    return null;
}
