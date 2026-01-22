import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Header from "@/app/components/Header";
import ReadHistoryTracker from "@/app/components/ReadHistoryTracker";
import ChapterNav from "../components/ChapterNav";
import ScrollToTop from "@/app/components/ScrollToTop";
import { ChevronLeft, Lock } from "lucide-react";

export default async function ChapterReaderPage({
    params
}: {
    params: { id: string; chapterId: string }
}) {
    // Await params for Next.js 15
    const { id: idParam, chapterId: chapterIdParam } = await params;
    const mangaId = parseInt(idParam);
    const chapterId = parseInt(chapterIdParam);

    const chapter = await prisma.chapter.findUnique({
        where: { id: chapterId },
        include: {
            manga: true
        }
    });

    if (!chapter || chapter.mangaId !== mangaId) {
        notFound();
    }

    // Block access to unpublished chapters
    if (!(chapter as any).isPublished) {
        notFound();
    }

    // --- Subscription Check ---
    const session = await getServerSession(authOptions);
    let isSubscribed = false;

    if (session?.user?.id) {
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { isSubscribed: true, subscriptionEnd: true }
        });

        if (user?.isSubscribed && user.subscriptionEnd && new Date(user.subscriptionEnd) > new Date()) {
            isSubscribed = true;
        }
    }

    const isFreeChapter = (chapter as any).isFree;
    const isAdultManga = (chapter as any).manga?.isAdult;
    const isLocked = !isSubscribed && (isAdultManga || !isFreeChapter);

    // Get prev/next chapters (only published ones)
    const allChapters = await prisma.chapter.findMany({
        where: {
            mangaId,
            isPublished: true
        },
        orderBy: { chapterNumber: "asc" },
        select: { id: true, chapterNumber: true, title: true }
    });

    const currentIndex = allChapters.findIndex(c => c.id === chapterId);
    const prevChapter = currentIndex > 0 ? allChapters[currentIndex - 1] : null;
    const nextChapter = currentIndex < allChapters.length - 1 ? allChapters[currentIndex + 1] : null;

    return (
        <div className="min-h-screen bg-[#1a1a1a] text-white">
            {/* Navbar */}
            <Header isSticky={false} />

            {/* Chapter Header - Non-sticky */}
            <header className="bg-[#1a1a1a] border-b border-gray-800 shadow-md">
                <div className="container mx-auto px-4 h-14 flex items-center justify-between">
                    <Link href={`/manga/${mangaId}`} className="flex items-center gap-2 hover:text-gray-300 transition-colors">
                        <ChevronLeft size={24} />
                        <span className="font-medium truncate max-w-[200px] hidden sm:inline">{(chapter as any).manga?.titleMn}</span>
                    </Link>

                    <ChapterNav
                        mangaId={mangaId}
                        currentChapterId={chapterId}
                        allChapters={allChapters as any[]}
                        prevChapter={prevChapter as any}
                        nextChapter={nextChapter as any}
                        variant="top"
                    />
                </div>
            </header>

            {/* Reader Content - Vertical Scroll */}
            <main className="max-w-3xl mx-auto bg-black min-h-screen relative">
                {isLocked ? (
                    <div className="flex flex-col items-center justify-center py-32 px-4 text-center">
                        <div className="w-24 h-24 bg-gray-900 rounded-full flex items-center justify-center mb-6 text-[#d8454f]">
                            <Lock size={48} />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Цааш нь уншихыг хүсвэл эрхээ сунгана уу.</h2>
                        <Link
                            href="/subscribe"
                            className="px-8 py-3 bg-[#d8454f] hover:bg-[#c13a44] text-white font-bold rounded-lg transition-transform hover:scale-105"
                        >
                            Эрх авах
                        </Link>
                    </div>
                ) : (
                    <>
                        {session?.user && <ReadHistoryTracker chapterId={chapterId} />}
                        {chapter.images.map((imgUrl, index) => (
                            <img
                                key={index}
                                src={imgUrl}
                                alt={`Page ${index + 1}`}
                                className="w-full h-auto block"
                                loading={index < 3 ? "eager" : "lazy"}
                            />
                        ))}
                    </>
                )}
            </main>

            {/* Footer Navigation (Hide if locked) */}
            {!isLocked && (
                <div className="max-w-3xl mx-auto p-8 bg-[#1a1a1a] text-center space-y-6">
                    <ChapterNav
                        mangaId={mangaId}
                        currentChapterId={chapterId}
                        allChapters={allChapters as any[]}
                        prevChapter={prevChapter as any}
                        nextChapter={nextChapter as any}
                        variant="bottom"
                    />
                </div>
            )}

            <ScrollToTop />
        </div>
    );
}
