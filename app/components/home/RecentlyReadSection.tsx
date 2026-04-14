"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import MangaCard from "../MangaCard";

interface ReadEntry {
    mangaId: number;
    chapterId: number;
    chapterNumber: number;
    readAt: string;
    lastPage?: number;
    totalPages?: number;
    manga: {
        id: number;
        titleMn: string | null;
        coverImage: string | null;
        isAdult: boolean;
        isOneshot: boolean;
        _count: { chapters: number };
    };
}

// Helper function to get relative time
function getTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = Math.max(0, now.getTime() - new Date(date).getTime());
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    if (diffMins < 60) return `${Math.max(1, diffMins)} минутын өмнө`;
    if (diffHours < 24) return `${diffHours} цагийн өмнө`;
    if (diffDays < 30) return `${diffDays} өдрийн өмнө`;
    if (diffMonths < 12) return `${diffMonths} сарын өмнө`;
    return `${diffYears} жилийн өмнө`;
}

export default function RecentlyReadSection() {
    const [history, setHistory] = useState<ReadEntry[]>([]);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        fetch("/api/history")
            .then((res) => res.json())
            .then((data) => {
                setHistory(data.history || []);
                setLoaded(true);
            })
            .catch(() => setLoaded(true));
    }, []);

    // Don't render anything until loaded, and don't render if empty
    if (!loaded || history.length === 0) return null;

    return (
        <section>
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-foreground flex items-center gap-3">
                    <span className="w-2 h-8 bg-[#d8454f] rounded-full" />
                    Сүүлд уншсан
                </h2>
            </div>

            <div className="relative group">
                <div className="flex gap-4 overflow-x-auto pb-6 -mx-1 px-1 snap-x snap-mandatory no-scrollbar">
                    {history.map((entry) => {
                        const lastPage = entry.lastPage || 0;
                        const totalPages = entry.totalPages || 0;
                        const percentage = totalPages > 0 ? Math.round(((lastPage + 1) / totalPages) * 100) : 0;
                        const displayPercentage = percentage > 100 ? 100 : percentage;

                        return (
                            <MangaCard
                                key={entry.mangaId}
                                manga={{
                                    ...entry.manga,
                                    titleMn: entry.manga.titleMn || "",
                                    coverImage: entry.manga.coverImage || "",
                                }}
                                customLink={`/manga/${entry.manga.id}/read/${entry.chapterId}`}
                                coverOverlay={
                                    totalPages > 0 && (
                                        <>
                                            <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] font-bold text-white shadow-md z-10 border border-white/5">
                                                {displayPercentage}%
                                            </div>
                                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/40 z-10 backdrop-blur-sm">
                                                <div className="h-full bg-primary transition-all duration-300" style={{ width: `${displayPercentage}%` }} />
                                            </div>
                                        </>
                                    )
                                }
                                subtitle={
                                    <div className="flex justify-between items-center w-full mt-1">
                                        <span className="font-medium text-foreground">{entry.chapterNumber}-р бүлэг</span>
                                        <span className="text-[10px] text-muted-foreground">{getTimeAgo(new Date(entry.readAt))}</span>
                                    </div>
                                }
                                className="w-40 md:w-44 snap-start flex-shrink-0"
                            />
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
