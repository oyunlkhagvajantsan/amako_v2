
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { PrismaClient } from '@prisma/client';

// Env vars should be loaded by the runner
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'manga-images';
const R2_ENDPOINT = process.env.R2_ENDPOINT;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || '';

if (!R2_ENDPOINT || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
    console.error('Missing R2 environment variables.');
    process.exit(1);
}

const r2Client = new S3Client({
    region: 'auto',
    endpoint: R2_ENDPOINT,
    credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
});

const prisma = new PrismaClient();

interface ChapterData {
    number: number;
    images: string[];
}

interface MangaData {
    id: number;
    chapters: Record<number, ChapterData>;
    coverImage?: string;
}

// Map: MangaID -> MangaData
const contentMap: Record<number, MangaData> = {};

async function fetchAllKeys() {
    let continuationToken: string | undefined = undefined;
    const keys: string[] = [];

    console.log('Fetching all keys from R2...');

    do {
        const command: ListObjectsV2Command = new ListObjectsV2Command({
            Bucket: R2_BUCKET_NAME,
            ContinuationToken: continuationToken,
        });
        const response: any = await r2Client.send(command);
        if (response.Contents) {
            response.Contents.forEach((c: any) => {
                if (c.Key) keys.push(c.Key);
            });
        }
        continuationToken = response.NextContinuationToken;
    } while (continuationToken);

    console.log(`Found ${keys.length} total objects.`);
    return keys;
}

function parseKeys(keys: string[]) {
    // Expected format: chapters/manga-[id]/chapter-[number]/[filename]
    // Example: chapters/manga-11/chapter-0/image.jpg

    for (const key of keys) {
        const parts = key.split('/');

        // Basic validation of path structure
        if (parts.length < 4 || parts[0] !== 'chapters') continue;

        // Parse Manga ID
        // parts[1] should be "manga-11"
        const mangaPart = parts[1];
        if (!mangaPart.startsWith('manga-')) continue;
        const mangaId = parseInt(mangaPart.replace('manga-', ''), 10);
        if (isNaN(mangaId)) continue;

        // Parse Chapter Number
        // parts[2] should be "chapter-0"
        const chapterPart = parts[2];
        if (!chapterPart.startsWith('chapter-')) continue;
        const chapterNumber = parseFloat(chapterPart.replace('chapter-', ''));
        if (isNaN(chapterNumber)) continue;

        // Filename matches, so path is valid
        // Assuming R2_PUBLIC_URL needs full key

        if (!contentMap[mangaId]) {
            contentMap[mangaId] = { id: mangaId, chapters: {} };
        }

        if (!contentMap[mangaId].chapters[chapterNumber]) {
            contentMap[mangaId].chapters[chapterNumber] = { number: chapterNumber, images: [] };
        }

        contentMap[mangaId].chapters[chapterNumber].images.push(key);
    }
}

async function syncToDb() {
    console.log('Syncing to database...');

    for (const mangaId of Object.keys(contentMap)) {
        const id = parseInt(mangaId, 10);
        const data = contentMap[id];

        console.log(`Processing Manga ID ${id} with ${Object.keys(data.chapters).length} chapters...`);

        // 1. Upsert Manga
        const sortedChapterNums = Object.keys(data.chapters).map(Number).sort((a, b) => a - b);
        let coverImage = 'placeholder.jpg';
        if (sortedChapterNums.length > 0) {
            const firstChap = data.chapters[sortedChapterNums[0]];
            if (firstChap.images.length > 0) {
                // sort images
                firstChap.images.sort();
                coverImage = (R2_PUBLIC_URL ? `${R2_PUBLIC_URL}/` : '') + firstChap.images[0];
            }
        }

        await prisma.manga.upsert({
            where: { id: id },
            update: {}, // Don't overwrite if exists
            create: {
                id: id,
                title: `Restored Manga ${id}`, // Placeholder
                titleMn: `Сэргээгдсэн Манга ${id}`,
                coverImage: coverImage,
                status: 'ONGOING',
                type: 'MANGA',
            }
        });

        // 2. Upsert Chapters
        for (const chapNum of sortedChapterNums) {
            const chap = data.chapters[chapNum];

            // Identify thumbnail and regular images
            const thumbnailKey = chap.images.find(key => key.toLowerCase().includes('thumbnail'));
            const regularImages = chap.images.filter(key => !key.toLowerCase().includes('thumbnail'));

            // Sort regular images naturally
            regularImages.sort();

            const imageUrls = regularImages.map(key => (R2_PUBLIC_URL ? `${R2_PUBLIC_URL}/` : '') + key);
            const thumbnailUrl = thumbnailKey ? (R2_PUBLIC_URL ? `${R2_PUBLIC_URL}/` : '') + thumbnailKey : null;

            await prisma.chapter.upsert({
                where: {
                    mangaId_chapterNumber: {
                        mangaId: id,
                        chapterNumber: chapNum
                    }
                },
                update: {
                    images: imageUrls,
                    thumbnail: thumbnailUrl,
                },
                create: {
                    mangaId: id,
                    chapterNumber: chapNum,
                    title: `Chapter ${chapNum}`,
                    images: imageUrls,
                    thumbnail: thumbnailUrl,
                    isPublished: true,
                }
            });
        }
    }
    console.log('Sync completed!');
}

async function main() {
    try {
        const keys = await fetchAllKeys();
        parseKeys(keys);
        await syncToDb();
    } catch (e) {
        console.error(e);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
