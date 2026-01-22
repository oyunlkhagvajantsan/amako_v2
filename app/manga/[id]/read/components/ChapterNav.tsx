"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight, List } from "lucide-react";

type Chapter = {
    id: number;
    chapterNumber: number;
    title: string | null;
};

type ChapterNavProps = {
    mangaId: number;
    currentChapterId: number;
    allChapters: Chapter[];
    prevChapter: Chapter | null;
    nextChapter: Chapter | null;
    variant?: "top" | "bottom";
};

export default function ChapterNav({
    mangaId,
    currentChapterId,
    allChapters,
    prevChapter,
    nextChapter,
    variant = "top"
}: ChapterNavProps) {
    const isTop = variant === "top";

    return (
        <div className={`flex items-center ${isTop ? 'gap-2' : 'gap-4 flex-wrap justify-center'}`}>
            {prevChapter ? (
                <Link
                    href={`/manga/${mangaId}/read/${prevChapter.id}`}
                    className={`${isTop ? 'px-3 py-1' : 'px-6 py-3'} bg-gray-800 hover:bg-gray-700 rounded${isTop ? '' : '-lg'} text-sm transition-colors flex items-center gap-1`}
                    title="Өмнөх бүлэг"
                >
                    <ChevronLeft size={isTop ? 16 : 20} />
                    {!isTop && "Өмнөх"}
                </Link>
            ) : (
                isTop && <button disabled className="px-3 py-1 bg-gray-900 text-gray-600 rounded text-sm cursor-not-allowed flex items-center gap-1">
                    <ChevronLeft size={16} />
                </button>
            )}

            {/* Chapter Dropdown */}
            <div className="relative">
                <select
                    value={currentChapterId}
                    onChange={(e) => {
                        const selectedId = e.target.value;
                        window.location.href = `/manga/${mangaId}/read/${selectedId}`;
                    }}
                    className={`${isTop ? 'px-3 py-1 pr-8' : 'px-4 py-3 pr-8'} bg-gray-800 text-white rounded${isTop ? '' : '-lg'} text-sm border border-gray-700 focus:outline-none focus:border-[#d8454f] appearance-none cursor-pointer`}
                >
                    {allChapters.map((ch) => (
                        <option key={ch.id} value={ch.id}>
                            Бүлэг {ch.chapterNumber}{ch.title ? ` - ${ch.title}` : ''}
                        </option>
                    ))}
                </select>
            </div>

            {nextChapter ? (
                <Link
                    href={`/manga/${mangaId}/read/${nextChapter.id}`}
                    className={`${isTop ? 'px-3 py-1' : 'px-6 py-3'} bg-[#d8454f] hover:bg-[#c13a44] text-white rounded${isTop ? '' : '-lg'} text-sm transition-colors flex items-center gap-1`}
                    title="Дараах бүлэг"
                >
                    {!isTop && "Дараах"}
                    <ChevronRight size={isTop ? 16 : 20} />
                </Link>
            ) : (
                <>
                    {isTop && <button disabled className="px-3 py-1 bg-gray-900 text-gray-600 rounded text-sm cursor-not-allowed flex items-center gap-1">
                        <ChevronRight size={16} />
                    </button>}
                    {!isTop && (
                        <Link
                            href={`/manga/${mangaId}`}
                            className="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-2"
                        >
                            <List size={20} />

                        </Link>
                    )}
                </>
            )}
        </div>
    );
}
