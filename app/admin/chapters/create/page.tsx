import { prisma } from "@/lib/prisma";
import CreateChapterForm from "./CreateChapterForm";

export const dynamic = "force-dynamic";

export default async function CreateChapterPage({
    searchParams,
}: {
    searchParams: { mangaId?: string };
}) {
    const params = await searchParams; // Await for Next.js 15
    const mangas = await prisma.manga.findMany({
        orderBy: { title: "asc" },
        select: { id: true, title: true, coverImage: true }
    });

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-6 text-gray-900">Шинэ бүлэг нэмэх (Create Chapter)</h1>
            <CreateChapterForm mangas={mangas} preselectedMangaId={params.mangaId} />
        </div>
    );
}
