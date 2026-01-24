import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * Update Chapter API
 * Handles PATCH requests to update chapter info and images list
 */
export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string; chapterId: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user.role !== "ADMIN" && session.user.role !== "MODERATOR")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { chapterId } = await params;
        const formData = await req.formData();

        const chapterNumber = parseFloat(formData.get("chapterNumber") as string);
        const title = formData.get("title") as string;
        const caption = formData.get("caption") as string;
        const isPublished = formData.get("isPublished") === "on";
        const thumbnailUrl = formData.get("thumbnailUrl") as string;

        // Get the reordered/updated image URLs array
        const imageUrls = formData.getAll("imageUrls") as string[];

        if (isNaN(chapterNumber) || imageUrls.length === 0) {
            return NextResponse.json(
                { error: "Missing required fields or images" },
                { status: 400 }
            );
        }

        const updatedChapter = await prisma.chapter.update({
            where: { id: parseInt(chapterId) },
            data: {
                chapterNumber,
                title,
                caption: caption || null,
                images: imageUrls,
                thumbnail: thumbnailUrl || null,
                isPublished,
                isFree: chapterNumber <= 1,
            },
        });

        return NextResponse.json(updatedChapter);
    } catch (error) {
        console.error("Chapter update error:", error);
        return NextResponse.json(
            { error: "Failed to update chapter", details: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}
