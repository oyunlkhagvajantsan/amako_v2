import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { handleApiError } from "@/lib/error-utils";

/**
 * GET: Fetch the current user's notifications.
 */
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const notifications = await prisma.notification.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: "desc" },
            take: 50 // Last 50 notifications
        });

        return NextResponse.json(notifications);
    } catch (error) {
        return handleApiError(error, "GET_NOTIFICATIONS");
    }
}

/**
 * PATCH: Mark all notifications as read or mark a specific one.
 */
export async function PATCH(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await req.json();

        if (id) {
            // Mark specific notification as read
            await prisma.notification.update({
                where: { id, userId: session.user.id },
                data: { isRead: true }
            });
        } else {
            // Mark all as read
            await prisma.notification.updateMany({
                where: { userId: session.user.id, isRead: false },
                data: { isRead: true }
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return handleApiError(error, "UPDATE_NOTIFICATIONS");
    }
}
