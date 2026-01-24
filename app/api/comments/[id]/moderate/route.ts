import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * PATCH: Hide/Show a comment (Moderation).
 * Only for Admins and Moderators.
 */
export async function PATCH(
    req: NextRequest,
    context: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id || (session.user.role !== "ADMIN" && session.user.role !== "MODERATOR")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id: commentId } = await context.params;
        const { isHidden } = await req.json();

        const updatedComment = await (prisma.comment as any).update({
            where: { id: commentId },
            data: { isHidden }
        });

        return NextResponse.json(updatedComment);
    } catch (error: any) {
        console.error("Moderate comment error:", error);
        return NextResponse.json({ error: "Failed to update comment status" }, { status: 500 });
    }
}

/**
 * DELETE: Permanently delete a comment.
 * Allows Admins, Moderators, and the Comment Owner.
 */
export async function DELETE(
    req: NextRequest,
    context: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id: commentId } = await context.params;

        // Fetch the comment to check ownership
        const comment = await (prisma.comment as any).findUnique({
            where: { id: commentId },
            select: { userId: true }
        });

        if (!comment) {
            return NextResponse.json({ error: "Comment not found" }, { status: 404 });
        }

        // Allow deletion if the user is the owner OR an admin/moderator
        const isOwner = comment.userId === session.user.id;
        const isAdmin = session.user.role === "ADMIN" || session.user.role === "MODERATOR";

        if (!isOwner && !isAdmin) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        await (prisma.comment as any).delete({
            where: { id: commentId }
        });

        return NextResponse.json({ success: true, message: "Comment deleted" });
    } catch (error: any) {
        console.error("Delete comment error:", error);
        return NextResponse.json({ error: "Failed to delete comment" }, { status: 500 });
    }
}
