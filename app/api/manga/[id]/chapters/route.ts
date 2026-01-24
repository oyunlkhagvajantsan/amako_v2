import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user.role !== "ADMIN" && session.user.role !== "MODERATOR")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id: mangaId } = await params;
        const formData = await req.formData();
        const chapterNumber = parseFloat(formData.get("chapterNumber") as string);
        const title = formData.get("title") as string;
        const caption = formData.get("caption") as string;
        const isPublished = formData.get("isPublished") === "on";
        const thumbnailUrl = formData.get("thumbnailUrl") as string;

        // Get image URLs from the frontend (Vercel Blob storage)
        const imageUrls = formData.getAll("imageUrls") as string[];

        if (isNaN(chapterNumber) || imageUrls.length === 0) {
            return NextResponse.json(
                { error: "Missing required fields or images" },
                { status: 400 }
            );
        }

        // Save Chapter to DB
        const chapter = await prisma.chapter.create({
            data: {
                mangaId: parseInt(mangaId),
                chapterNumber,
                title,
                caption: caption || null,
                images: imageUrls,
                thumbnail: thumbnailUrl || null,
                isPublished,
                isFree: chapterNumber <= 1,
            },
        });

        return NextResponse.json(chapter, { status: 201 });
    } catch (error) {
        console.error("Chapter creation error details:", error);
        return NextResponse.json(
            { error: "Failed to create chapter", details: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}
