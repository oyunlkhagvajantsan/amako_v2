import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { sendEmail } from "@/lib/mail";

/**
 * GET /api/cron/check-subscriptions
 * Triggered by a scheduled job (e.g., Upstash Cron, GitHub Action)
 */
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const secret = searchParams.get("secret");

    // Secure the endpoint
    if (secret !== process.env.CRON_SECRET) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(now.getDate() + 1);

        // 1. Find users whose subscription ends in ~24 hours
        // We'll target users whose subscriptionEnd is tomorrow
        const expiringSoon = await prisma.user.findMany({
            where: {
                isSubscribed: true,
                subscriptionEnd: {
                    gte: now,
                    lte: tomorrow,
                },
            },
            select: { id: true, email: true, name: true, subscriptionEnd: true }
        });

        logger.info(`Found ${expiringSoon.length} expiring subscriptions.`);

        for (const user of expiringSoon) {
            // Check if we already sent a reminder today for this user
            // This prevents duplicate spam if the cron runs more than once
            const reminderSentToday = await prisma.notification.findFirst({
                where: {
                    userId: user.id,
                    type: "SUBSCRIPTION_EXPIRING",
                    createdAt: {
                        gte: new Date(new Date().setHours(0, 0, 0, 0)),
                    },
                },
            });

            if (!reminderSentToday) {
                await prisma.notification.create({
                    data: {
                        userId: user.id,
                        type: "SUBSCRIPTION_EXPIRING",
                        content: "Таны эрх маргааш дуусах гэж байна.",
                        link: "/subscribe",
                    },
                });
            }
        }

        // 2. Find users whose subscription has actually ended
        const expired = await prisma.user.findMany({
            where: {
                isSubscribed: true,
                subscriptionEnd: {
                    lt: now,
                },
            },
            select: { id: true, email: true, name: true }
        });

        logger.info(`Found ${expired.length} newly expired subscriptions.`);

        for (const user of expired) {
            // Update user status
            await prisma.user.update({
                where: { id: user.id },
                data: { isSubscribed: false },
            });

            // Send expiration notification
            await prisma.notification.create({
                data: {
                    userId: user.id,
                    type: "SUBSCRIPTION_EXPIRED",
                    content: "Таны эрх дууссан байна.",
                    link: "/subscribe",
                },
            });
        }

        return NextResponse.json({
            success: true,
            reminders: expiringSoon.length,
            expirations: expired.length
        });

    } catch (error) {
        logger.error("Subscription check cron failed:", { context: { error } });
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
