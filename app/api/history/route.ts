import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { chapterId } = await req.json();

        if (!chapterId) {
            return NextResponse.json({ error: "Chapter ID is required" }, { status: 400 });
        }

        const numericChapterId = typeof chapterId === 'string' ? parseInt(chapterId) : chapterId;

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
                // You could also track progress here if sent from client
            },
            create: {
                userId: session.user.id,
                chapterId: numericChapterId,
                readAt: new Date()
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error updating read history:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
