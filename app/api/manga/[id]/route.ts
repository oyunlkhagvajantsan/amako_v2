import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { r2Client, R2_BUCKET_NAME, R2_PUBLIC_URL } from "@/lib/r2";
import sharp from "sharp";
import { mangaSchema } from "@/lib/validations/manga";

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

        const rawData = {
            title: formData.get("title"),
            titleMn: formData.get("titleMn"),
            description: formData.get("description"),
            author: formData.get("author") || undefined,
            artist: formData.get("artist") || undefined,
            status: formData.get("status"),
            type: formData.get("type"),
            publishYear: formData.get("publishYear") ? parseInt(formData.get("publishYear") as string) : undefined,
            isAdult: formData.get("isAdult") === "on",
            genreIds: formData.getAll("genreIds").map(gid => parseInt(gid as string)),
        };

        const isPublished = formData.get("isPublished") === "on";

        // Validate basic fields with Zod (using .partial() for updates)
        const validation = mangaSchema.partial().safeParse(rawData);
        if (!validation.success) {
            return NextResponse.json(
                { error: validation.error.issues[0].message },
                { status: 400 }
            );
        }

        const updateData: Prisma.MangaUpdateInput = {
            ...validation.data,
            isPublished,
            genres: validation.data.genreIds ? {
                set: validation.data.genreIds.map(gid => ({ id: gid })),
            } : undefined,
        };

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
            data: updateData,
        });

        return NextResponse.json(manga);
    } catch (error) {
        console.error("Update error detailed:", error);
        return NextResponse.json(
            { error: "Failed to update manga", details: error instanceof Error ? error.message : "Unknown error" },
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
