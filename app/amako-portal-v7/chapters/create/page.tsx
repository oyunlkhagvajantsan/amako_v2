import { prisma } from "@/lib/prisma";
import ChapterForm from "../components/ChapterForm";

export const dynamic = "force-dynamic";

export default async function CreateChapterPage({
    searchParams,
}: {
    searchParams: Promise<{ mangaId?: string }>;
}) {
    const { mangaId } = await searchParams;
    const mangas = await prisma.manga.findMany({
        orderBy: { title: "asc" },
        select: { id: true, title: true, coverImage: true }
    });

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Chapter</h1>
            <ChapterForm
                mangas={mangas}
                preselectedMangaId={mangaId}
                mode="create"
            />
        </div>
    );
}
