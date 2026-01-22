"use client";

import { useEffect } from "react";

export default function ReadHistoryTracker({ chapterId }: { chapterId: number }) {
    useEffect(() => {
        const trackHistory = async () => {
            try {
                await fetch("/api/history", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ chapterId }),
                });
            } catch (error) {
                console.error("Failed to track history:", error);
            }
        };

        trackHistory();
    }, [chapterId]);

    return null;
}
