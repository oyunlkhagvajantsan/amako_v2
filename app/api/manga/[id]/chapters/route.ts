import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError } from "@/lib/error-utils";
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
            include: {
                manga: {
                    select: { titleMn: true }
                }
            }
        });

        // Send Notifications to Lifers (Favoriters)
        if (isPublished) {
            const favoriters = await prisma.like.findMany({
                where: { mangaId: parseInt(mangaId) },
                select: { userId: true }
            });

            if (favoriters.length > 0) {
                await prisma.notification.createMany({
                    data: favoriters.map(f => ({
                        userId: f.userId,
                        type: "NEW_CHAPTER",
                        content: `Шинэ бүлэг орлоо: ${chapter.manga.titleMn} - ${chapterNumber}-р бүлэг`,
                        link: `/manga/${mangaId}/read/${chapter.id}`,
                    })),
                });
            }
        }

        return NextResponse.json(chapter, { status: 201 });
    } catch (error) {
        console.error("Chapter creation error details:", error);
        return handleApiError(error, "ChapterCreation");
    }
}
