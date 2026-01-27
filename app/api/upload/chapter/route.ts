import { NextRequest, NextResponse } from 'next/server';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { r2Client, R2_BUCKET_NAME, R2_PUBLIC_URL } from '@/lib/r2';
import sharp from 'sharp';

/**
 * Chapter Image Upload API Route
 * Now using Cloudflare R2 instead of Vercel Blob
 * 
 * Accepts: multipart/form-data OR JSON with clientPayload
 * Returns: { url: string } - Public URL of uploaded image
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        // Check authentication
        const session = await getServerSession(authOptions);
        console.log("Upload session check:", JSON.stringify(session, null, 2)); // DEBUG LOG

        if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'MODERATOR')) {
            console.log("Unauthorized upload attempt. Role:", session?.user?.role);
            return NextResponse.json(
                { error: 'Unauthorized', role: session?.user?.role || 'none' },
                { status: 401 }
            );
        }

        const contentType = request.headers.get('content-type');

        // Handle multipart form data (direct file upload)
        if (contentType?.includes('multipart/form-data')) {
            const formData = await request.formData();
            const file = formData.get('file') as File;
            const mangaId = formData.get('mangaId') as string || 'unassigned';
            const chapterNumber = formData.get('chapterNumber') as string || '0';

            console.log(`[R2 Upload] Processing file: ${file?.name}, Size: ${file?.size} bytes, Manga: ${mangaId}, Chapter: ${chapterNumber}`);

            if (!file) {
                return NextResponse.json(
                    { error: 'No file provided' },
                    { status: 400 }
                );
            }

            // Validate file type
            const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
            if (!allowedTypes.includes(file.type)) {
                return NextResponse.json(
                    { error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.' },
                    { status: 400 }
                );
            }

            // Convert file to buffer and process with Sharp
            const buffer = Buffer.from(await file.arrayBuffer());
            console.log(`[R2 Upload] Buffer created: ${buffer.length} bytes. Starting Sharp processing...`);

            const startTime = Date.now();
            const webpBuffer = await sharp(buffer)
                .webp({ quality: 90, effort: 4 }) // Effort 4 is faster than 6
                .toBuffer();
            const endTime = Date.now();

            console.log(`[R2 Upload] Sharp processing completed in ${endTime - startTime}ms. Final size: ${webpBuffer.length} bytes.`);

            // Generate unique filename with folder structure
            const timestamp = Date.now();
            const originalName = file.name || 'image.webp';
            const sanitizedFilename = originalName.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9.-]/g, '_');
            const key = `chapters/manga-${mangaId}/chapter-${chapterNumber}/${timestamp}-${sanitizedFilename}.webp`;

            // Upload to R2
            const command = new PutObjectCommand({
                Bucket: R2_BUCKET_NAME,
                Key: key,
                Body: webpBuffer,
                ContentType: 'image/webp',
                CacheControl: 'public, max-age=31536000, immutable',
            });

            await r2Client.send(command);

            // Return public URL
            const publicUrl = `${R2_PUBLIC_URL}/${key}`;

            return NextResponse.json({ url: publicUrl });
        }

        // Handle JSON payload (for @vercel/blob client compatibility)
        // This maintains backward compatibility with existing frontend code
        const body = await request.json();

        // For now, return error if using old blob client
        // Frontend should be updated to use direct file upload
        return NextResponse.json(
            { error: 'Please use multipart/form-data upload instead of blob client' },
            { status: 400 }
        );

    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json(
            { error: 'Upload failed', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
