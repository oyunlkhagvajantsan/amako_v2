import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * POST: Toggle like/unlike for a specific comment.
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

        const { id: commentId } = await context.params;

        // Check if already liked
        const existingLike = await (prisma as any).commentLike.findUnique({
            where: {
                userId_commentId: {
                    userId: session.user.id,
                    commentId: commentId
                }
            }
        });

        if (existingLike) {
            // Unlike
            await (prisma as any).commentLike.delete({
                where: {
                    userId_commentId: {
                        userId: session.user.id,
                        commentId: commentId
                    }
                }
            });
            return NextResponse.json({ liked: false });
        } else {
            // Like
            const like = await (prisma as any).commentLike.create({
                data: {
                    userId: session.user.id,
                    commentId: commentId
                }
            });

            // Create Notification for the comment owner
            try {
                const comment = await (prisma.comment as any).findUnique({
                    where: { id: commentId },
                    select: { userId: true, mangaId: true, chapterId: true }
                });

                if (comment && comment.userId !== session.user.id) {
                    const manga = await prisma.manga.findUnique({
                        where: { id: comment.mangaId },
                        select: { titleMn: true }
                    });

                    // Link to chapter if chapterId exists, otherwise link to manga details
                    const link = comment.chapterId
                        ? `/manga/${comment.mangaId}/read/${comment.chapterId}`
                        : `/manga/${comment.mangaId}`;

                    await (prisma as any).notification.create({
                        data: {
                            userId: comment.userId,
                            type: "LIKE",
                            content: `${session.user.name || "Хэрэглэгч"} таны сэтгэгдлийг (${manga?.titleMn}) тааллаа.`,
                            link: link
                        }
                    });
                }
            } catch (err) {
                console.error("Failed to create like notification:", err);
            }

            return NextResponse.json({ liked: true });
        }
    } catch (error: any) {
        console.error("Toggle comment like error:", error);
        return NextResponse.json({ error: "Failed to update like status" }, { status: 500 });
    }
}
