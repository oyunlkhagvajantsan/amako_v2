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

import ProtectedReader from "@/app/components/ProtectedReader";
import AgeVerificationGuard from "@/app/components/AgeVerificationGuard";
import CommentSection from "@/app/components/comments/CommentSection";
import ErrorBoundary from "@/app/components/ErrorBoundary";
import { ChapterWithManga } from "@/lib/types";

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
    }) as ChapterWithManga | null;

    if (!chapter || chapter.mangaId !== mangaId) {
        notFound();
    }

    // Block access to unpublished chapters
    if (!chapter.isPublished) {
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

    const isFreeChapter = chapter.isFree;
    const isAdultManga = chapter.manga?.isAdult;

    // Only lock if it's NOT free AND user is NOT subscribed
    // Adult content being free is now allowed but will require age verification below
    const isLocked = !isSubscribed && !isFreeChapter;
    const needsAgeVerification = isFreeChapter && isAdultManga;

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

    // Increment View Counts ONLY if the chapter is NOT locked
    if (!isLocked) {
        // Non-blocking increments
        Promise.all([
            prisma.chapter.update({
                where: { id: chapterId },
                data: { viewCount: { increment: 1 } }
            }),
            prisma.manga.update({
                where: { id: mangaId },
                data: { viewCount: { increment: 1 } }
            })
        ]).catch(err => console.error("Failed to increment views:", err));
    }

    return (
        <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
            {/* Navbar */}
            <Header isSticky={false} />

            {/* Chapter Header - Non-sticky */}
            <header className="bg-background/90 backdrop-blur-md border-b border-border sticky top-0 z-40 transition-all">
                <div className="container mx-auto px-4 h-14 flex items-center justify-between">
                    <Link href={`/manga/${mangaId}`} className="flex items-center gap-2 hover:text-primary transition-colors">
                        <ChevronLeft size={24} />
                        <span className="font-medium truncate max-w-[200px] hidden sm:inline">{chapter.manga?.titleMn}</span>
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
            {isLocked ? (
                <main className="max-w-3xl mx-auto bg-background min-h-screen flex flex-col items-center justify-center py-32 px-4 text-center">
                    <div className="w-24 h-24 bg-surface rounded-full flex items-center justify-center mb-6 text-primary border border-border">
                        <Lock size={48} />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Цааш нь уншихыг хүсвэл эрхээ сунгана уу.</h2>
                    <Link
                        href="/subscribe"
                        className="px-8 py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-lg transition-transform hover:scale-105"
                    >
                        Эрх авах
                    </Link>
                </main>
            ) : (
                <AgeVerificationGuard active={needsAgeVerification}>
                    <ProtectedReader>
                        {session?.user && <ReadHistoryTracker chapterId={chapterId} />}
                        {chapter.images.map((imgUrl, index) => (
                            <img
                                key={index}
                                src={imgUrl}
                                alt={`Page ${index + 1}`}
                                className="w-full h-auto block select-none pointer-events-none"
                                draggable="false"
                                loading={index < 3 ? "eager" : "lazy"}
                            />
                        ))}

                        {/* Chapter Caption (Author's note) */}

                    </ProtectedReader>

                </AgeVerificationGuard>
            )}

            {/* Navigation & Discussion Section */}
            {!isLocked && (
                <div className={`max-w-3xl mx-auto pb-20 mt-4 px-4 ${chapter.caption ? "space-y-6" : "space-y-0"}`}>
                    {/* Chapter Navigation (Bottom) */}
                    <div className="bg-surface text-center p-4 rounded-3xl">
                        <ChapterNav
                            mangaId={mangaId}
                            currentChapterId={chapterId}
                            allChapters={allChapters as any[]}
                            prevChapter={prevChapter as any}
                            nextChapter={nextChapter as any}
                            variant="bottom"
                        />
                    </div>

                    {/* Chapter Caption (Simple Text) */}
                    {chapter.caption && (
                        <div className="px-4 py-2">
                            <h3 className="text-xs font-bold text-muted uppercase tracking-widest mb-1">
                                Amako
                            </h3>
                            <p className="text-foreground/80 text-sm leading-relaxed whitespace-pre-wrap">
                                {chapter.caption}
                            </p>
                        </div>
                    )}

                    {/* Comment Section (Chapter specific) */}
                    <div className="px-4 pt-4">
                        <ErrorBoundary>
                            <CommentSection mangaId={mangaId} chapterId={chapterId} variant="dark" />
                        </ErrorBoundary>
                    </div>
                </div>
            )}

            <ScrollToTop />
        </div>
    );
}
