import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createCommentSchema } from "@/lib/validations/comment";

/**
 * GET: Fetch comments for a specific manga.
 * Returns hierarchical structure (threading).
 */
export async function GET(
    req: NextRequest,
    context: { params: { id: string } }
) {
    try {
        const { id } = await context.params;
        const mangaId = parseInt(id);
        const { searchParams } = new URL(req.url);
        const chapterId = searchParams.get("chapterId") ? parseInt(searchParams.get("chapterId")!) : null;

        const session = await getServerSession(authOptions);
        const isAdmin = session?.user?.role === "ADMIN" || session?.user?.role === "MODERATOR";

        // Fetch top-level comments and their first-level replies
        const comments = await (prisma.comment as any).findMany({
            where: {
                mangaId,
                chapterId, // Filter by chapter if provided, else null for manga-level
                parentId: null, // Only top-level
                // Hide if content is hidden, unless the viewer is an admin
                OR: isAdmin
                    ? [
                        { isHidden: true },
                        { isHidden: false }
                    ]
                    : [{ isHidden: false }]
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        role: true
                    }
                },
                _count: {
                    select: {
                        likes: true,
                        replies: true
                    }
                },
                // Check if the current user Liked this comment
                likes: session?.user?.id
                    ? { where: { userId: session.user.id } }
                    : false,
                // Include replies
                replies: {
                    where: {
                        OR: isAdmin
                            ? [
                                { isHidden: true },
                                { isHidden: false }
                            ]
                            : [{ isHidden: false }]
                    },
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                role: true
                            }
                        },
                        _count: {
                            select: {
                                likes: true
                            }
                        },
                        likes: session?.user?.id
                            ? { where: { userId: session.user.id } }
                            : false,
                    },
                    orderBy: { createdAt: "asc" }
                }
            },
            orderBy: { createdAt: "desc" }
        });

        return NextResponse.json(comments);
    } catch (error: any) {
        console.error("Fetch comments error:", error);
        return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
    }
}

/**
 * POST: Create a new top-level comment.
 */
export async function POST(
    req: NextRequest,
    context: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await context.params;
        const mangaId = parseInt(id);
        const body = await req.json();

        // Validate request body
        const validation = createCommentSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { error: validation.error.issues[0].message },
                { status: 400 }
            );
        }

        const { content, chapterId } = validation.data;

        const comment = await (prisma.comment as any).create({
            data: {
                content,
                mangaId,
                chapterId: chapterId || null,
                userId: session.user.id
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        role: true
                    }
                }
            }
        });

        return NextResponse.json(comment);
    } catch (error: any) {
        console.error("Create comment error:", error);
        return NextResponse.json({ error: "Failed to post comment" }, { status: 500 });
    }
}
