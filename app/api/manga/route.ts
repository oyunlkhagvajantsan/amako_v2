import { NextResponse } from "next/server";
import { MangaRepository } from "@/lib/repositories/MangaRepository";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { r2Client, R2_BUCKET_NAME, R2_PUBLIC_URL } from "@/lib/r2";
import sharp from "sharp";
import { mangaSchema } from "@/lib/validations/manga";
import { handleApiError } from "@/lib/error-utils";

export async function POST(req: Request) {
    try {
        // Check authentication
        const session = await getServerSession(authOptions);
        if (!session || (session.user.role !== "ADMIN" && session.user.role !== "MODERATOR")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const formData = await req.formData();
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
            genreIds: formData.getAll("genreIds").map(id => parseInt(id as string)),
        };

        const coverImage = formData.get("coverImage") as File;

        // Validate basic fields with Zod
        const validation = mangaSchema.safeParse(rawData);
        if (!validation.success) {
            console.error("Manga validation failed:", validation.error.flatten());
            return NextResponse.json(
                { error: validation.error.issues[0].message },
                { status: 400 }
            );
        }

        if (!coverImage || !(coverImage instanceof File)) {
            return NextResponse.json(
                { error: "Ковер зураг оруулна уу" },
                { status: 400 }
            );
        }

        const { title, titleMn, description, author, artist, status, type, publishYear, isAdult, genreIds } = validation.data;

        // Handle Image Upload with WebP conversion and R2
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

        // Create Manga in DB with genre connections using the Repository pattern
        const manga = await MangaRepository.create({
            title,
            titleMn,
            description,
            author,
            artist,
            publishYear,
            isAdult,
            status: status || "ONGOING",
            type: type || "MANGA",
            coverImage: imageUrl,
            genres: {
                connect: (genreIds || []).map((id: number) => ({ id })),
            },
        });

        return NextResponse.json(manga, { status: 201 });
    } catch (error) {
        return handleApiError(error, "CREATE_MANGA");
    }
}
