"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { BookOpen, Lock, ArrowUp, ArrowDown } from "lucide-react";

type ChapterListProps = {
    mangaId: number;
    chapters: any[];
    isSubscribed: boolean;
    readChapterIds: number[];
};

export default function ChapterList({ mangaId, chapters, isSubscribed, readChapterIds }: ChapterListProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

    const totalChapters = chapters.length;
    const perPage = 20;

    // Sorting
    const sortedChapters = [...chapters].sort((a, b) => {
        if (sortOrder === "asc") {
            return a.chapterNumber - b.chapterNumber;
        } else {
            return b.chapterNumber - a.chapterNumber;
        }
    });

    const totalPages = Math.max(1, Math.ceil(totalChapters / perPage));
    const paginatedChapters = sortedChapters.slice((currentPage - 1) * perPage, currentPage * perPage);

    const toggleSort = () => {
        setSortOrder(prev => prev === "desc" ? "asc" : "desc");
        setCurrentPage(1); // Reset to page 1 on sort change
    };

    const readChapterSet = new Set(readChapterIds);

    return (
        <div className="mt-16 max-w-5xl mx-auto">
            <div className="flex flex-row items-center justify-between mb-6 border-b border-border pb-2 gap-4">
                <h2 className="text-2xl font-bold text-foreground">Бүлгүүд</h2>
                <div className="flex items-center gap-3">
                    <span className="text-sm text-muted font-medium hidden sm:inline">{totalChapters} бүлэг</span>
                    <button
                        onClick={toggleSort}
                        className="p-1.5 md:p-2 bg-surface rounded-md border border-border hover:bg-surface-elevated transition-colors text-foreground flex items-center justify-center cursor-pointer"
                        title={sortOrder === "asc" ? "Сүүлийнхээсээ" : "Эхнээсээ"}
                    >
                        {sortOrder === "asc" ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
                {paginatedChapters.map((chapter) => {
                    const isLocked = !chapter.isFree && !isSubscribed;
                    const isRead = readChapterSet.has(chapter.id);

                    return (
                        <Link
                            key={chapter.id}
                            href={`/manga/${mangaId}/read/${chapter.id}?from=details`}
                            className={`flex flex-col gap-2 p-2 rounded-xl hover:bg-surface border border-transparent hover:border-border transition-all group ${isRead ? 'opacity-70' : ''}`}
                        >
                            {/* Chapter Thumbnail */}
                            <div className="relative aspect-[16/10] bg-surface rounded-lg overflow-hidden border border-border shadow-sm transition-transform group-hover:scale-[1.02]">
                                {chapter.thumbnail ? (
                                    <Image
                                        src={chapter.thumbnail}
                                        alt={`Chapter ${chapter.chapterNumber}`}
                                        fill
                                        unoptimized
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center bg-surface-elevated text-muted">
                                        <BookOpen size={24} />
                                    </div>
                                )}

                                {/* Locked Overlay */}
                                {isLocked && (
                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                        <div className="bg-white/90 p-1.5 rounded-full shadow-lg">
                                            <Lock size={16} className="text-gray-900" />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="px-1 space-y-0.5">
                                <div className="flex items-center gap-1.5">
                                    <span className={`font-bold text-sm md:text-base ${isRead ? 'text-muted' : 'text-foreground group-hover:text-primary'}`}>
                                        {chapter.chapterNumber}-р бүлэг
                                    </span>
                                </div>
                                {chapter.title && (
                                    <p className="text-xs text-muted">{chapter.title}</p>
                                )}
                            </div>
                        </Link>
                    );
                })}
            </div>
            {chapters.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-gray-500 italic">Одоогоор бүлэг нэмэгдээгүй байна.</p>
                </div>
            )}

            {/* Pagination UI */}
            {totalPages > 1 && (
                <div className="flex flex-wrap justify-center mt-8 gap-1.5 md:gap-2">
                    {/* First */}
                    <button
                        onClick={() => setCurrentPage(1)}
                        className={`px-2.5 md:px-3 py-2 flex items-center justify-center shrink-0 bg-surface text-foreground font-bold text-sm border border-border rounded-lg hover:bg-surface-elevated transition-colors ${currentPage === 1 ? 'opacity-50 pointer-events-none' : ''}`}
                    >
                        &lt;&lt;
                    </button>
                    
                    {/* Prev */}
                    <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        className={`px-2.5 md:px-3 py-2 flex items-center justify-center shrink-0 bg-surface text-foreground font-bold text-sm border border-border rounded-lg hover:bg-surface-elevated transition-colors ${currentPage === 1 ? 'opacity-50 pointer-events-none' : ''}`}
                    >
                        &lt;
                    </button>

                    {/* Pages */}
                    {Array.from({ length: totalPages }).map((_, i) => {
                        const p = i + 1;
                        if (p < currentPage - 2 || p > currentPage + 2) return null;
                        return (
                            <button
                                key={p}
                                onClick={() => setCurrentPage(p)}
                                className={`w-9 h-9 md:w-10 md:h-10 flex shrink-0 items-center justify-center font-bold text-sm border rounded-lg transition-colors ${currentPage === p ? 'bg-[#d8454f] text-white border-[#d8454f]' : 'bg-surface text-foreground border-border hover:bg-surface-elevated'}`}
                            >
                                {p}
                            </button>
                        );
                    })}

                    {/* Next */}
                    <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        className={`px-2.5 md:px-3 py-2 flex items-center justify-center shrink-0 bg-surface text-foreground font-bold text-sm border border-border rounded-lg hover:bg-surface-elevated transition-colors ${currentPage === totalPages ? 'opacity-50 pointer-events-none' : ''}`}
                    >
                        &gt;
                    </button>

                    {/* Last */}
                    <button
                        onClick={() => setCurrentPage(totalPages)}
                        className={`px-2.5 md:px-3 py-2 flex items-center justify-center shrink-0 bg-surface text-foreground font-bold text-sm border border-border rounded-lg hover:bg-surface-elevated transition-colors ${currentPage === totalPages ? 'opacity-50 pointer-events-none' : ''}`}
                    >
                        &gt;&gt;
                    </button>
                </div>
            )}
        </div>
    );
}
