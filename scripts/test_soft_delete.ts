import { prisma } from '../lib/prisma';

async function testSoftDelete() {
    console.log("--- Testing Soft Delete Extension ---");

    try {
        // 1. Create a dummy manga
        const manga = await prisma.manga.create({
            data: {
                title: "Soft Delete Test Manga",
                titleMn: "Soft Delete Test Manga MN",
                status: "ONGOING",
                type: "MANGA",
                isPublished: true,
                coverImage: "/test.jpg"
            }
        });
        console.log(`Created Manga: ${manga.id}`);

        // 2. Create two chapters, delete one
        const c1 = await prisma.chapter.create({
            data: {
                mangaId: manga.id,
                chapterNumber: 1,
                title: "Active Chapter",
                isPublished: true,
                images: ["/img1.jpg"]
            }
        });
        const c2 = await prisma.chapter.create({
            data: {
                mangaId: manga.id,
                chapterNumber: 2,
                title: "Deleted Chapter",
                isPublished: true,
                images: ["/img2.jpg"]
            }
        });

        console.log(`Created Chapters: ${c1.id} (Active), ${c2.id} (To be deleted)`);

        // Soft delete the second chapter
        await prisma.chapter.delete({ where: { id: c2.id } });
        console.log(`Soft deleted Chapter: ${c2.id}`);

        // TEST A: Top-level findMany
        const chaptersA = await prisma.chapter.findMany({
            where: { mangaId: manga.id }
        });
        console.log(`Test A (Top-level findMany): found ${chaptersA.length} chapters (Expected: 1)`);
        chaptersA.forEach(c => console.log(` - ID: ${c.id}, Title: ${c.title}`));

        // TEST B: Nested include
        const mangaB = await prisma.manga.findUnique({
            where: { id: manga.id },
            include: { chapters: true }
        });
        console.log(`Test B (Nested include): found ${mangaB?.chapters.length} chapters (Expected: 1)`);
        mangaB?.chapters.forEach(c => console.log(` - ID: ${c.id}, Title: ${c.title}`));

        // TEST C: Nested count
        const mangaC = await prisma.manga.findUnique({
            where: { id: manga.id },
            include: { _count: { select: { chapters: true } } }
        });
        console.log(`Test C (Nested count): count is ${mangaC?._count.chapters} (Expected: 1)`);

        // Cleanup
        // We need to use base client or raw SQL to truly delete if the extension blocks delete
        // But the extension converts delete to update, so we can't easily clean up via prisma.chapter.delete
        console.log("--- End of Test (Clean up manually or ignore dummy data) ---");

    } catch (error) {
        console.error("Test failed:", error);
    }
}

testSoftDelete();
