import { NextResponse } from "next/server";
import { MangaRepository } from "@/lib/repositories/MangaRepository";
import { Prisma } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { r2Client, R2_BUCKET_NAME, R2_PUBLIC_URL } from "@/lib/r2";
import sharp from "sharp";
import { mangaSchema } from "@/lib/validations/manga";
import { handleApiError } from "@/lib/error-utils";
import { recordAuditAction } from "@/lib/audit";

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
        const ip = req.headers.get("x-forwarded-for")?.split(',')[0] || "127.0.0.1";

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
            isOneshot: formData.get("isOneshot") === "on",
            genreIds: formData.getAll("genreIds").map(gid => parseInt(gid as string)),
        };

        const isPublished = formData.get("isPublished") === "on";

        // Validate basic fields with Zod (using .partial() for updates)
        const validation = mangaSchema.partial().safeParse(rawData);
        if (!validation.success) {
            console.error("Manga validation failed:", validation.error.flatten());
            return NextResponse.json(
                { error: validation.error.issues[0].message },
                { status: 400 }
            );
        }

        const { genreIds, ...otherUpdates } = validation.data;

        const updateData: Prisma.MangaUpdateInput = {
            ...otherUpdates,
            isPublished,
            genres: genreIds ? {
                set: genreIds.map(gid => ({ id: gid })),
            } : undefined,
        };

        // Handle Image Upload if provided
        // Handle Image Upload if provided or URL
        const coverImage = formData.get("coverImage") as File | null;
        const coverImageUrl = formData.get("coverImageUrl") as string | null;

        if (coverImageUrl) {
            updateData.coverImage = coverImageUrl;
        } else if (coverImage && coverImage.size > 0) {
            const buffer = Buffer.from(await coverImage.arrayBuffer());

            // Convert to WebP using sharp in memory
            const webpBuffer = await sharp(buffer)
                .webp({ quality: 90, effort: 6 })
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

        const manga = await MangaRepository.update(parseInt(id), updateData);

        // Record Audit Log
        await recordAuditAction({
            userId: session.user.id,
            action: "UPDATE_MANGA",
            targetType: "MANGA",
            targetId: id,
            ipAddress: ip,
            details: { title: manga.title }
        });

        return NextResponse.json(manga);
    } catch (error) {
        return handleApiError(error, "UPDATE_MANGA");
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
        const ip = req.headers.get("x-forwarded-for")?.split(',')[0] || "127.0.0.1";

        await MangaRepository.delete(parseInt(id));

        // Record Audit Log
        await recordAuditAction({
            userId: session.user.id,
            action: "DELETE_MANGA",
            targetType: "MANGA",
            targetId: id,
            ipAddress: ip
        });

        return NextResponse.json({ message: "Manga deleted successfully" });
    } catch (error) {
        return handleApiError(error, "DELETE_MANGA");
    }
}
