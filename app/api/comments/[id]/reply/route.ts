import { NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/error-utils";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { replyCommentSchema } from "@/lib/validations/comment";

/**
 * POST: Create a reply to an existing comment.
 */
export async function POST(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id: parentId } = await context.params;
        const body = await req.json();

        // Validate request body
        const validation = replyCommentSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { error: validation.error.issues[0].message },
                { status: 400 }
            );
        }

        const { content, mangaId, chapterId } = validation.data;

        // Verify parent exists
        const parentComment = await prisma.comment.findUnique({
            where: { id: parentId }
        });

        if (!parentComment) {
            return NextResponse.json({ error: "Parent comment not found" }, { status: 404 });
        }

        const reply = await prisma.comment.create({
            data: {
                content,
                mangaId: typeof mangaId === 'string' ? parseInt(mangaId) : mangaId,
                chapterId: chapterId ? (typeof chapterId === 'string' ? parseInt(chapterId) : chapterId) : null,
                userId: session.user.id,
                parentId: parentId
            },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        role: true
                    }
                }
            }
        });

        if (reply) {
            console.log("Reply created successfully, ID:", reply.id);
            if (parentComment.userId !== session.user.id) {
                console.log("Preparing notification for user:", parentComment.userId);
                try {
                    const manga = await prisma.manga.findUnique({
                        where: { id: parentComment.mangaId },
                        select: { titleMn: true }
                    });

                    // Link to chapter if chapterId exists, otherwise link to manga details
                    const currentChapterId = chapterId || parentComment.chapterId;
                    const link = currentChapterId
                        ? `/manga/${mangaId}/read/${currentChapterId}`
                        : `/manga/${mangaId}`;

                    console.log("Created notification data:", {
                        userId: parentComment.userId,
                        type: "REPLY",
                        content: `${session.user.username || "Хэрэглэгч"} таны сэтгэгдэлд (${manga?.titleMn}) хариу бичлээ.`,
                        link: link
                    });

                    const newNotif = await prisma.notification.create({
                        data: {
                            userId: parentComment.userId,
                            type: "REPLY",
                            content: `${session.user.username || "Хэрэглэгч"} таны сэтгэгдэлд (${manga?.titleMn}) хариу бичлээ.`,
                            link: link
                        }
                    });
                    console.log("Notification created successfully! ID:", newNotif.id);
                } catch (err) {
                    console.error("Failed to create notification:", err);
                }
            } else {
                console.log("Skipping notification: User replied to their own comment.");
            }
        }

        return NextResponse.json(reply);
    } catch (error) {
        return handleApiError(error, "POST_REPLY");
    }
}
