import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight, BookOpen, Library } from "lucide-react";

type Chapter = {
    id: number;
    chapterNumber: number;
    title: string | null;
    thumbnail: string | null;
};

type ChapterEndNavProps = {
    mangaId: number;
    mangaCoverImage: string;
    mangaTitle?: string;
    prevChapter: Chapter | null;
    nextChapter: Chapter | null;
};

function ChapterCard({
    chapter,
    mangaId,
    mangaCoverImage,
    direction
}: {
    chapter: Chapter;
    mangaId: number;
    mangaCoverImage: string;
    direction: "prev" | "next";
}) {
    const label = direction === "prev" ? "Өмнөх" : "Дараах";
    const thumbnailSrc = chapter.thumbnail || mangaCoverImage;

    return (
        <Link
            href={`/manga/${mangaId}/read/${chapter.id}`}
            className="group flex-1 flex flex-col bg-surface border border-border hover:border-primary rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
        >
            <div className="relative w-full aspect-[16/7] overflow-hidden bg-gray-900">
                {thumbnailSrc ? (
                    <Image
                        src={thumbnailSrc}
                        alt={`Chapter ${chapter.chapterNumber}`}
                        fill
                        className="object-cover object-top opacity-70 group-hover:opacity-90 group-hover:scale-105 transition-all duration-300"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <BookOpen size={32} className="text-gray-600" />
                    </div>
                )}

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Direction badge */}
                <div className={`absolute top-3 ${direction === "prev" ? "left-3" : "right-3"} flex items-center gap-1.5 bg-black/60 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-full`}>
                    {direction === "prev" && <ChevronLeft size={12} />}
                    {label}
                    {direction === "next" && <ChevronRight size={12} />}
                </div>

                {/* Chapter info overlay */}
                <div className={`absolute bottom-3 ${direction === "prev" ? "left-3" : "right-3"} ${direction === "next" ? "text-right" : "text-left"}`}>
                    <p className="text-white font-bold text-sm leading-tight drop-shadow">
                        {chapter.chapterNumber}-р бүлэг
                    </p>
                    {chapter.title && (
                        <p className="text-white/70 text-xs leading-tight drop-shadow truncate max-w-[180px]">
                            {chapter.title}
                        </p>
                    )}
                </div>
            </div>
        </Link>
    );
}

function MangaDetailCard({
    mangaId,
    mangaCoverImage,
    mangaTitle,
    side
}: {
    mangaId: number;
    mangaCoverImage: string;
    mangaTitle?: string;
    side: "left" | "right";
}) {
    return (
        <Link
            href={`/manga/${mangaId}`}
            className="group flex-1 flex flex-col bg-surface border border-border hover:border-primary rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
        >
            <div className="relative w-full aspect-[16/7] overflow-hidden bg-gray-900">
                {mangaCoverImage ? (
                    <Image
                        src={mangaCoverImage}
                        alt="Manga cover"
                        fill
                        className="object-cover object-top opacity-50 group-hover:opacity-70 group-hover:scale-105 transition-all duration-300"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Library size={32} className="text-gray-600" />
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />


                {/* Title */}
                <div className={`absolute bottom-3 ${side === "left" ? "left-3" : "right-3"} ${side === "right" ? "text-right" : "text-left"}`}>
                    <p className="text-white font-bold text-sm leading-tight drop-shadow">
                        {mangaTitle || "Манга"}
                    </p>
                </div>
            </div>
        </Link>
    );
}

export default function ChapterEndNav({
    mangaId,
    mangaCoverImage,
    mangaTitle,
    prevChapter,
    nextChapter,
}: ChapterEndNavProps) {
    return (
        <div className="flex gap-3">
            {prevChapter ? (
                <ChapterCard
                    chapter={prevChapter}
                    mangaId={mangaId}
                    mangaCoverImage={mangaCoverImage}
                    direction="prev"
                />
            ) : (
                <MangaDetailCard
                    mangaId={mangaId}
                    mangaCoverImage={mangaCoverImage}
                    mangaTitle={mangaTitle}
                    side="left"
                />
            )}

            {nextChapter ? (
                <ChapterCard
                    chapter={nextChapter}
                    mangaId={mangaId}
                    mangaCoverImage={mangaCoverImage}
                    direction="next"
                />
            ) : (
                <MangaDetailCard
                    mangaId={mangaId}
                    mangaCoverImage={mangaCoverImage}
                    mangaTitle={mangaTitle}
                    side="right"
                />
            )}
        </div>
    );
}
