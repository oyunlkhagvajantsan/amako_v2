"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import MangaCard from "../MangaCard";

interface ReadEntry {
    mangaId: number;
    chapterId: number;
    chapterNumber: number;
    readAt: string;
    manga: {
        id: number;
        titleMn: string | null;
        coverImage: string | null;
        isAdult: boolean;
        isOneshot: boolean;
        _count: { chapters: number };
    };
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
                    {history.map((entry) => (
                        <MangaCard
                            key={entry.mangaId}
                            manga={entry.manga}
                            subtitle={`${entry.chapterNumber}-р бүлэг`}
                            className="w-40 md:w-44 snap-start flex-shrink-0"
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
