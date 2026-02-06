import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET: List all recent comments for the Admin Moderation Panel.
 */
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id || (session.user.role !== "ADMIN" && session.user.role !== "MODERATOR")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const comments = await prisma.comment.findMany({
            select: {
                id: true,
                content: true,
                createdAt: true,
                updatedAt: true,
                isHidden: true,
                parentId: true,
                userId: true,
                mangaId: true,
                chapterId: true,
                user: {
                    select: {
                        username: true,
                        email: true
                    }
                },
                manga: {
                    select: {
                        titleMn: true,
                        title: true
                    }
                },
                chapter: {
                    select: {
                        chapterNumber: true
                    }
                }
            },
            orderBy: { createdAt: "desc" },
            take: 100 // Last 100 comments
        });

        return NextResponse.json(comments);
    } catch (error) {
        console.error("Admin fetch comments error:", error);
        return NextResponse.json({ error: "Failed to fetch all comments" }, { status: 500 });
    }
}
