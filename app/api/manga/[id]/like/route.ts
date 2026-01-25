import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * POST: Toggle Like for a manga
 */
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const mangaId = parseInt(id);

        // Check if already liked
        const existingLike = await prisma.like.findUnique({
            where: {
                userId_mangaId: {
                    userId: session.user.id,
                    mangaId: mangaId
                }
            }
        });

        if (existingLike) {
            // Unlike
            await prisma.like.delete({
                where: { id: existingLike.id }
            });

            // Decrement manga like count
            await prisma.manga.update({
                where: { id: mangaId },
                data: { likeCount: { decrement: 1 } }
            });

            return NextResponse.json({ liked: false });
        } else {
            // Like
            await prisma.like.create({
                data: {
                    userId: session.user.id,
                    mangaId: mangaId
                }
            });

            // Increment manga like count
            await prisma.manga.update({
                where: { id: mangaId },
                data: { likeCount: { increment: 1 } }
            });

            return NextResponse.json({ liked: true });
        }
    } catch (error) {
        console.error("Manga Like Toggle Error:", error);
        return NextResponse.json({ error: "Failed to toggle like" }, { status: 500 });
    }
}

/**
 * GET: Get like status for current user
 */
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const mangaId = parseInt(id);
        const session = await getServerSession(authOptions);

        let isLiked = false;
        if (session?.user?.id) {
            const like = await prisma.like.findUnique({
                where: {
                    userId_mangaId: {
                        userId: session.user.id,
                        mangaId: mangaId
                    }
                }
            });
            isLiked = !!like;
        }

        const manga = await prisma.manga.findUnique({
            where: { id: mangaId },
            select: { likeCount: true }
        });

        return NextResponse.json({
            isLiked,
            likeCount: manga?.likeCount || 0
        });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch like status" }, { status: 500 });
    }
}
