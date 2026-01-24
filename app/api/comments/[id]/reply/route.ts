import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { replyCommentSchema } from "@/lib/validations/comment";

/**
 * POST: Create a reply to an existing comment.
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

        const reply = await (prisma.comment as any).create({
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
                        name: true,
                        role: true
                    }
                }
            }
        });

        if (reply) {
            console.log("Reply created successfully, ID:", reply.id);
            if ((parentComment as any).userId !== session.user.id) {
                console.log("Preparing notification for user:", (parentComment as any).userId);
                try {
                    const manga = await prisma.manga.findUnique({
                        where: { id: (parentComment as any).mangaId },
                        select: { titleMn: true }
                    });

                    // Link to chapter if chapterId exists, otherwise link to manga details
                    const currentChapterId = chapterId || (parentComment as any).chapterId;
                    const link = currentChapterId
                        ? `/manga/${mangaId}/read/${currentChapterId}`
                        : `/manga/${mangaId}`;

                    console.log("Created notification data:", {
                        userId: (parentComment as any).userId,
                        type: "REPLY",
                        content: `${session.user.name || "Хэрэглэгч"} таны сэтгэгдэлд (${manga?.titleMn}) хариу бичлээ.`,
                        link: link
                    });

                    if (!(prisma as any).notification) {
                        console.error("CRITICAL: prisma.notification is not defined!");
                    } else {
                        const newNotif = await (prisma as any).notification.create({
                            data: {
                                userId: (parentComment as any).userId,
                                type: "REPLY",
                                content: `${session.user.name || "Хэрэглэгч"} таны сэтгэгдэлд (${manga?.titleMn}) хариу бичлээ.`,
                                link: link
                            }
                        });
                        console.log("Notification created successfully! ID:", newNotif.id);
                    }
                } catch (err) {
                    console.error("Failed to create notification:", err);
                }
            } else {
                console.log("Skipping notification: User replied to their own comment.");
            }
        }

        return NextResponse.json(reply);
    } catch (error: any) {
        console.error("Create reply error:", error);
        return NextResponse.json({ error: "Failed to post reply" }, { status: 500 });
    }
}
