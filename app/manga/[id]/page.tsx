import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import Header from "@/app/components/Header";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { User, Palette, ShieldAlert, Lock, BookOpen, Layers, ArrowLeft, ArrowUp, ArrowDown } from "lucide-react";
import CommentSection from "@/app/components/comments/CommentSection";
import LikeButton from "@/app/components/manga/LikeButton";
import ChapterList from "@/app/components/manga/ChapterList";

export const dynamic = "force-dynamic";

export default async function MangaDetailsPage({ params }: { params: { id: string } }) {
    // Await params for Next.js 15 compatibility
    const { id } = await params;
    const mangaId = parseInt(id);

    const manga = await prisma.manga.findUnique({
        where: { id: mangaId },
        include: {
            genres: true,
        },
    });

    if (!manga) {
        notFound();
    }

    const allChapters = await prisma.chapter.findMany({
        where: { mangaId, isPublished: true },
        orderBy: { chapterNumber: "desc" },
    });

    const totalChapters = allChapters.length;
    const firstChapter = allChapters.slice().reverse().find(c => true);

    // Increment View Count (Non-blocking)
    prisma.manga.update({
        where: { id: mangaId },
        data: { viewCount: { increment: 1 } }
    }).catch(err => console.error("Failed to increment manga view:", err));

    // Check Subscription and Read History
    const session = await getServerSession(authOptions);
    let isSubscribed = false;
    const readChapterIds = new Set<number>();

    if (session?.user?.id) {
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: {
                readHistory: {
                    where: {
                        chapter: {
                            mangaId: mangaId
                        }
                    },
                    select: { chapterId: true }
                }
            }
        });

        if (user) {
            const userData = user as any;
            if (userData.isSubscribed && userData.subscriptionEnd && new Date(userData.subscriptionEnd) > new Date()) {
                isSubscribed = true;
            }
            userData.readHistory?.forEach((h: any) => readChapterIds.add(h.chapterId));
        }
    }

    // Translate status to Mongolian
    const statusTranslation: Record<string, string> = {
        ONGOING: "Гарч байгаа",
        COMPLETED: "Дууссан",
        HIATUS: "Завсарласан",
        CANCELLED: "Цуцлагдсан"
    };

    // Translate manga type
    const typeTranslation: Record<string, string> = {
        MANGA: "Манга",
        MANHWA: "Манхва",
        MANHUA: "Манхуа",
        ONESHOT: "Oneshot"
    };

    return (
        <div className="min-h-screen bg-background transition-colors duration-300">
            <Header hideBorder />

            {/* Return Button */}
            <div className="absolute top-20 left-4 z-20 md:left-8">
                <Link
                    href="/manga"
                    className="flex items-center justify-center w-10 h-10 bg-surface/80 backdrop-blur-sm rounded-full shadow-md text-foreground/70 hover:text-foreground transition-all hover:scale-105 border border-border"
                >
                    <ArrowLeft size={20} />
                </Link>
            </div>

            <div className="relative">
                {/* Background Blur */}
                <div className="absolute inset-0 h-96 bg-gray-900 overflow-hidden">
                    {manga.coverImage && (
                        <Image
                            src={manga.coverImage}
                            alt="bg"
                            fill
                            className="object-cover opacity-30 blur-xl scale-110"
                        />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
                </div>

                <main className="container mx-auto px-4 pt-12 relative z-10">
                    <div className="flex flex-col md:flex-row gap-8">
                        {/* Cover Image */}
                        <div className="w-48 md:w-64 flex-shrink-0 mx-auto md:mx-0">
                            <div className="aspect-[2/3] relative rounded-lg shadow-xl overflow-hidden bg-surface border border-border">
                                {manga.coverImage && (
                                    <Image
                                        src={manga.coverImage}
                                        alt={manga.title}
                                        fill
                                        className="object-cover"
                                    />
                                )}
                            </div>
                        </div>

                        {/* Info */}
                        <div className="flex-1 text-center md:text-left pt-4 md:pt-0">
                            <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-6">{manga.titleMn}</h1>

                            <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-8">
                                {/* Status */}
                                <div className="px-3 py-1 bg-blue-100 rounded-full text-sm font-medium text-blue-700 flex items-center gap-1">
                                    {statusTranslation[manga.status] || manga.status}
                                </div>

                                {/* Chapter Count */}
                                <div className="px-3 py-1 bg-surface-elevated rounded-full text-sm font-medium text-muted flex items-center gap-1 border border-border">
                                    <BookOpen size={14} /> {totalChapters} бүлэг
                                </div>

                                {/* Manga Type */}
                                <div className="px-3 py-1 bg-purple-100 rounded-full text-sm font-medium text-purple-700 flex items-center gap-1">
                                    <Layers size={14} /> {typeTranslation[manga.type] || manga.type}
                                </div>

                                {/* Author */}
                                {manga.author && (
                                    <div className="px-3 py-1 bg-gray-100 rounded-full text-sm font-medium text-gray-700 flex items-center gap-1">
                                        <User size={14} /> {manga.author}
                                    </div>
                                )}

                                {/* Artist */}
                                {manga.artist && (
                                    <div className="px-3 py-1 bg-gray-100 rounded-full text-sm font-medium text-gray-700 flex items-center gap-1">
                                        <Palette size={14} /> {manga.artist}
                                    </div>
                                )}

                                {/* 18+ Indicator */}
                                {manga.isAdult && (
                                    <div className="px-3 py-1 bg-red-100 rounded-full text-sm font-medium text-red-700 flex items-center gap-1">
                                        <ShieldAlert size={14} /> 18+
                                    </div>
                                )}

                                {/* Oneshot Indicator */}
                                {(manga as any).isOneshot && (
                                    <div className="px-3 py-1 bg-blue-100 rounded-full text-sm font-medium text-blue-700 flex items-center gap-1">
                                        <Layers size={14} /> Oneshot
                                    </div>
                                )}

                                {/* Genres */}
                                {manga.genres.map((genre) => (
                                    <div key={genre.id} className="px-3 py-1 bg-[#d8454f]/10 rounded-full text-sm font-medium text-[#d8454f]">
                                        {genre.nameMn}
                                    </div>
                                ))}
                            </div>

                            <p className="text-foreground/80 max-w-2xl mb-8 leading-relaxed">
                                {manga.description}
                            </p>

                            {/* Action */}
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                                {totalChapters > 0 && firstChapter && (
                                    <Link
                                        href={`/manga/${manga.id}/read/${firstChapter.id}?from=details`} // Link to first chapter
                                        className="inline-flex items-center justify-center px-8 py-3 bg-[#d8454f] hover:bg-[#c13a44] text-white font-bold rounded-full transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                    >
                                        Эхнээс нь унших
                                    </Link>
                                )}
                                <LikeButton mangaId={mangaId} />
                            </div>
                        </div>
                    </div>

                    {/* Chapter List Client */}
                    <ChapterList 
                        mangaId={mangaId} 
                        chapters={allChapters}
                        isSubscribed={isSubscribed}
                        readChapterIds={Array.from(readChapterIds)}
                    />

                    {/* Comment Section */}
                    <div className="max-w-4xl mx-auto mt-16">
                        <CommentSection mangaId={mangaId} />
                    </div>
                </main>
            </div>
        </div>
    );
}
