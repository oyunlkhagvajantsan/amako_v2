import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { r2Client, R2_BUCKET_NAME, R2_PUBLIC_URL } from "@/lib/r2";
import sharp from "sharp";

export async function PATCH(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const params = await props.params;
        const session = await getServerSession(authOptions);
        if (!session || (session.user.role !== "ADMIN" && session.user.role !== "MODERATOR")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = params;
        const formData = await req.formData();

        console.log("Received update request for ID:", id);

        const title = formData.get("title") as string;
        const titleMn = formData.get("titleMn") as string;
        const description = formData.get("description") as string;
        const author = formData.get("author") as string;
        const artist = formData.get("artist") as string;
        const status = formData.get("status") as "ONGOING" | "COMPLETED" | "HIATUS";
        const type = formData.get("type") as "MANGA" | "MANHWA" | "MANHUA";
        const publishYearStr = formData.get("publishYear") as string;
        const publishYear = publishYearStr ? parseInt(publishYearStr) : null;
        const isAdult = formData.get("isAdult") === "on";
        const isPublished = formData.get("isPublished") === "on";
        const genreIds = formData.getAll("genreIds") as string[];

        console.log("Parsed Data:", {
            title, status, type, publishYear, isAdult, isPublished, genreIds
        });

        if (!title || !titleMn) {
            console.log("Missing required fields");
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        const updateData: any = {
            title,
            titleMn,
            description,
            author,
            artist,
            status,
            publishYear,
            isAdult,
            isPublished,
        };

        // Only update type if it's provided and valid
        if (type) {
            updateData.type = type;
        }

        // Handle Image Upload if provided
        const coverImage = formData.get("coverImage") as File | null;
        if (coverImage && coverImage.size > 0) {
            const buffer = Buffer.from(await coverImage.arrayBuffer());

            // Convert to WebP using sharp in memory
            const webpBuffer = await sharp(buffer)
                .webp({ quality: 85 })
                .toBuffer();

            const filename = `covers/cover-${Date.now()}-${coverImage.name.replace(/\s/g, "-").replace(/\.[^.]+$/, "")}.webp`;

            // Upload to R2
            const command = new PutObjectCommand({
                Bucket: R2_BUCKET_NAME,
                Key: filename,
                Body: webpBuffer,
                ContentType: 'image/webp',
                CacheControl: 'public, max-age=31536000, immutable',
            });

            await r2Client.send(command);
            const imageUrl = `${R2_PUBLIC_URL}/${filename}`;

            updateData.coverImage = imageUrl;

            // Optional: Delete old cover image logic could go here
        }

        const manga = await prisma.manga.update({
            where: { id: parseInt(id) },
            data: {
                ...updateData,
                genres: {
                    set: genreIds.map((gid) => ({ id: parseInt(gid) })),
                }
            },
        });

        return NextResponse.json(manga);
    } catch (error: any) {
        console.error("Update error detailed:", error);
        return NextResponse.json(
            { error: "Failed to update manga", details: error.message },
            { status: 500 }
        );
    }
}

export async function DELETE(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const params = await props.params;
        const session = await getServerSession(authOptions);
        if (!session || (session.user.role !== "ADMIN" && session.user.role !== "MODERATOR")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = params;

        await prisma.manga.delete({
            where: { id: parseInt(id) },
        });

        return NextResponse.json({ message: "Manga deleted successfully" });
    } catch (error) {
        console.error("Delete error:", error);
        return NextResponse.json(
            { error: "Failed to delete manga" },
            { status: 500 }
        );
    }
}
