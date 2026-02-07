import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import ChapterForm from "../../components/ChapterForm";
import DeleteChapterButton from "../../components/DeleteChapterButton";

export default async function EditChapterPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const chapterId = parseInt(id);

    const chapter = await prisma.chapter.findUnique({
        where: { id: chapterId },
        include: {
            manga: true
        }
    });

    const session = await getServerSession(authOptions);
    const isAdmin = session?.user?.role === "ADMIN";

    if (!chapter) {
        return <div className="p-8">Chapter not found</div>;
    }

    const mangas = await prisma.manga.findMany({
        orderBy: { title: "asc" },
        select: { id: true, title: true, coverImage: true }
    });

    // Translate the simple Prisma model to the initialData expected by ChapterForm
    const initialData = {
        id: chapter.id,
        mangaId: chapter.mangaId,
        chapterNumber: chapter.chapterNumber,
        title: chapter.title,
        images: chapter.images,
        thumbnail: (chapter as any).thumbnail,
        caption: (chapter as any).caption || null,
        isPublished: (chapter as any).isPublished || false
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
                <Link href="/amako-portal-v7/chapters" className="text-gray-500 hover:text-gray-900">
                    ← Back
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">Edit Chapter {chapter.chapterNumber}</h1>
            </div>

            <ChapterForm
                mangas={mangas}
                mode="edit"
                initialData={initialData}
            />

            {isAdmin && (
                <div className="mt-12 pt-8 border-t border-gray-100">
                    <div className="bg-red-50 border border-red-100 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div>
                            <h3 className="text-red-800 font-bold">Danger Zone: Delete Chapter</h3>
                            <p className="text-red-600 text-sm">Move this chapter to deleted items. Can be restored later from the chapters list.</p>
                        </div>
                        <form action={async () => {
                            "use server";
                            await prisma.chapter.delete({ where: { id: chapterId } });
                            revalidatePath("/amako-portal-v7/chapters");
                            redirect("/amako-portal-v7/chapters");
                        }}>
                            <DeleteChapterButton />
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
