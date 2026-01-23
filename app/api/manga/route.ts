import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { r2Client, R2_BUCKET_NAME, R2_PUBLIC_URL } from "@/lib/r2";
import sharp from "sharp";

export async function POST(req: Request) {
    try {
        // Check authentication
        const session = await getServerSession(authOptions);
        if (!session || (session.user.role !== "ADMIN" && session.user.role !== "MODERATOR")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const formData = await req.formData();
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
        const coverImage = formData.get("coverImage") as File;
        const genreIds = formData.getAll("genreIds") as string[];

        if (!title || !titleMn || !coverImage) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Handle Image Upload with WebP conversion and R2
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

        // Create Manga in DB with genre connections
        const manga = await prisma.manga.create({
            data: {
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
                    connect: genreIds.map((id) => ({ id: parseInt(id) })),
                },
            },
        });

        return NextResponse.json(manga, { status: 201 });
    } catch (error: any) {
        console.error("Manga creation error details:", error);
        return NextResponse.json(
            { error: "Failed to create manga", details: error.message },
            { status: 500 }
        );
    }
}
