import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import Header from "@/app/components/Header";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { User, Palette, ShieldAlert, Lock, BookOpen, Layers, ArrowLeft } from "lucide-react";
import CommentSection from "@/app/components/comments/CommentSection";
import LikeButton from "@/app/components/manga/LikeButton";

export const dynamic = "force-dynamic";

export default async function MangaDetailsPage({ params }: { params: { id: string } }) {
    // Await params for Next.js 15 compatibility
    const { id } = await params;
    const mangaId = parseInt(id);

    const manga = await prisma.manga.findUnique({
        where: { id: mangaId },
        include: {
            chapters: {
                where: { isPublished: true },
                orderBy: { chapterNumber: "desc" },
            },
            genres: true,
        },
    });

    if (!manga) {
        notFound();
    }

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
    const statusTranslation = {
        ONGOING: "Гарч байгаа",
        COMPLETED: "Дууссан",
        HIATUS: "Түр зогссон"
    };

    // Translate manga type
    const typeTranslation = {
        MANGA: "Манга",
        MANHWA: "Манхва",
        MANHUA: "Манхуа",
        ONESHOT: "Oneshot"
    };

    return (
        <div className="min-h-screen bg-white">
            <Header hideBorder />

            {/* Return Button */}
            <div className="absolute top-20 left-4 z-20 md:left-8">
                <Link
                    href="/manga"
                    className="flex items-center justify-center w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full shadow-md text-gray-700 hover:text-gray-900 transition-all hover:scale-105"
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
                    <div className="absolute inset-0 bg-gradient-to-t from-white to-transparent" />
                </div>

                <main className="container mx-auto px-4 pt-12 relative z-10">
                    <div className="flex flex-col md:flex-row gap-8">
                        {/* Cover Image */}
                        <div className="w-48 md:w-64 flex-shrink-0 mx-auto md:mx-0">
                            <div className="aspect-[2/3] relative rounded-lg shadow-xl overflow-hidden bg-gray-200">
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
                            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">{manga.titleMn}</h1>

                            <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-8">
                                {/* Status */}
                                <div className="px-3 py-1 bg-blue-100 rounded-full text-sm font-medium text-blue-700 flex items-center gap-1">
                                    {statusTranslation[manga.status]}
                                </div>

                                {/* Chapter Count */}
                                <div className="px-3 py-1 bg-gray-100 rounded-full text-sm font-medium text-gray-700 flex items-center gap-1">
                                    <BookOpen size={14} /> {manga.chapters.length} Бүлэг
                                </div>

                                {/* Manga Type */}
                                <div className="px-3 py-1 bg-purple-100 rounded-full text-sm font-medium text-purple-700 flex items-center gap-1">
                                    <Layers size={14} /> {typeTranslation[manga.type]}
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
                                {manga.isOneshot && (
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

                            <p className="text-gray-700 max-w-2xl mb-8 leading-relaxed">
                                {manga.description}
                            </p>

                            {/* Action */}
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                                {manga.chapters.length > 0 && (
                                    <Link
                                        href={`/manga/${manga.id}/read/${manga.chapters[manga.chapters.length - 1].id}?from=details`} // Link to first chapter (last in array bc desc sort)
                                        className="inline-flex items-center justify-center px-8 py-3 bg-[#d8454f] hover:bg-[#c13a44] text-white font-bold rounded-full transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                    >
                                        Эхнээс нь унших
                                    </Link>
                                )}
                                <LikeButton mangaId={mangaId} />
                            </div>
                        </div>
                    </div>

                    {/* Chapter List */}
                    <div className="mt-16 max-w-5xl mx-auto">
                        <div className="flex items-center justify-between mb-6 border-b pb-2">
                            <h2 className="text-2xl font-bold text-gray-900">Бүлгүүд</h2>
                            <span className="text-sm text-gray-500 font-medium">{manga.chapters.length} бүлэг</span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
                            {manga.chapters.map((chapter) => {
                                const isLocked = !chapter.isFree && !isSubscribed;
                                const isRead = readChapterIds.has(chapter.id);

                                return (
                                    <Link
                                        key={chapter.id}
                                        href={`/manga/${manga.id}/read/${chapter.id}?from=details`}
                                        className={`flex flex-col gap-2 p-2 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all group ${isRead ? 'opacity-70' : ''}`}
                                    >
                                        {/* Chapter Thumbnail */}
                                        <div className="relative aspect-[16/10] bg-gray-100 rounded-lg overflow-hidden border border-gray-100 shadow-sm transition-transform group-hover:scale-[1.02]">
                                            {chapter.thumbnail ? (
                                                <Image
                                                    src={chapter.thumbnail}
                                                    alt={`Chapter ${chapter.chapterNumber}`}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="absolute inset-0 flex items-center justify-center bg-gray-50 text-gray-300">
                                                    <BookOpen size={24} />
                                                </div>
                                            )}

                                            {/* Locked Overlay */}
                                            {isLocked && (
                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[2px]">
                                                    <div className="bg-white/90 p-1.5 rounded-full shadow-lg">
                                                        <Lock size={16} className="text-gray-900" />
                                                    </div>
                                                </div>
                                            )}

                                            {/* Read Badge */}
                                            {isRead && (
                                                <div className="absolute top-2 right-2 bg-[#d8454f] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                                                    УНШСАН
                                                </div>
                                            )}
                                        </div>

                                        <div className="px-1 space-y-0.5">
                                            <div className="flex items-center gap-1.5">
                                                <span className={`font-bold text-sm md:text-base ${isRead ? 'text-gray-500' : 'text-gray-900 group-hover:text-[#d8454f]'}`}>
                                                    {chapter.chapterNumber}-р бүлэг
                                                </span>
                                            </div>
                                            {chapter.title && (
                                                <p className="text-xs text-gray-500">{chapter.title}</p>
                                            )}
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                        {manga.chapters.length === 0 && (
                            <div className="text-center py-12">
                                <p className="text-gray-500 italic">Одоогоор бүлэг нэмэгдээгүй байна.</p>
                            </div>
                        )}
                    </div>

                    {/* Comment Section */}
                    <div className="max-w-4xl mx-auto">
                        <CommentSection mangaId={mangaId} />
                    </div>
                </main>
            </div>
        </div>
    );
}
