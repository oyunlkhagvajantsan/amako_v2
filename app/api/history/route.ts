import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        return NextResponse.json({ history: [] });
    }

    try {
        // Get the most recently read chapters, one per manga, by taking the latest readAt per manga
        const recentHistory = await prisma.readHistory.findMany({
            where: { userId: session.user.id },
            orderBy: { readAt: "desc" },
            take: 40, // Fetch more to deduplicate by manga
            select: {
                readAt: true,
                chapter: {
                    select: {
                        id: true,
                        chapterNumber: true,
                        manga: {
                            select: {
                                id: true,
                                titleMn: true,
                                coverImage: true,
                                isAdult: true,
                                isOneshot: true,
                                _count: { select: { chapters: true } }
                            }
                        }
                    }
                }
            }
        });

        // Deduplicate: only keep the most recent entry per manga
        const seen = new Set<number>();
        const deduplicated = [];
        for (const entry of recentHistory) {
            const mangaId = entry.chapter.manga.id;
            if (!seen.has(mangaId)) {
                seen.add(mangaId);
                deduplicated.push({
                    mangaId,
                    chapterId: entry.chapter.id,
                    chapterNumber: entry.chapter.chapterNumber,
                    readAt: entry.readAt,
                    manga: entry.chapter.manga
                });
            }
            if (deduplicated.length >= 10) break;
        }

        return NextResponse.json({ history: deduplicated });
    } catch (error) {
        console.error("Error fetching read history:", error);
        return NextResponse.json({ history: [] });
    }
}

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { chapterId, lastPage } = await req.json();

        if (!chapterId) {
            return NextResponse.json({ error: "Chapter ID is required" }, { status: 400 });
        }

        const numericChapterId = typeof chapterId === 'string' ? parseInt(chapterId) : chapterId;
        const numericLastPage = lastPage !== undefined ? Number(lastPage) : undefined;

        // Create or update read history
        await prisma.readHistory.upsert({
            where: {
                userId_chapterId: {
                    userId: session.user.id,
                    chapterId: numericChapterId
                }
            },
            update: {
                readAt: new Date(),
                ...(numericLastPage !== undefined && { lastPage: numericLastPage }),
            },
            create: {
                userId: session.user.id,
                chapterId: numericChapterId,
                readAt: new Date(),
                lastPage: numericLastPage || 0
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error updating read history:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
