import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import Image from "next/image";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";


import { Lock, Unlock, Trash2, RotateCcw, Eye } from "lucide-react";

async function togglePublishStatus(formData: FormData) {
    "use server";
    const settingsId = formData.get("id") as string;
    const currentStatus = formData.get("currentStatus") === "true";

    await prisma.chapter.update({
        where: { id: parseInt(settingsId) },
        data: { isPublished: !currentStatus }
    });

    revalidatePath("/amako-portal-v7/chapters");
}

async function toggleAccessStatus(formData: FormData) {
    "use server";
    const chapterId = formData.get("id") as string;
    const isFree = formData.get("isFree") === "true";

    await prisma.chapter.update({
        where: { id: parseInt(chapterId) },
        data: { isFree: !isFree }
    });

    revalidatePath("/amako-portal-v7/chapters");
}

async function deleteChapter(formData: FormData) {
    "use server";
    const chapterId = formData.get("id") as string;

    await prisma.chapter.delete({
        where: { id: parseInt(chapterId) }
    });

    revalidatePath("/amako-portal-v7/chapters");
}

async function restoreChapter(formData: FormData) {
    "use server";
    const chapterId = formData.get("id") as string;

    // Restore by setting deletedAt to null
    // We need to use raw update since the middleware filters deleted items
    await prisma.$executeRaw`
        UPDATE "Chapter"
        SET "deletedAt" = NULL
        WHERE id = ${parseInt(chapterId)}
    `;

    revalidatePath("/amako-portal-v7/chapters");
}

import ChapterFilter from "./components/ChapterFilter";
import DeleteChapterButtonInline from "./components/DeleteChapterButtonInline";


export default async function ChaptersListPage({
    searchParams
}: {
    searchParams: Promise<{ mangaId?: string; view?: string }>
}) {
    const { mangaId, view } = await searchParams;
    const filterMangaId = mangaId ? parseInt(mangaId) : undefined;
    const showDeleted = view === "deleted";

    // Get user session to check if admin
    const session = await getServerSession(authOptions);
    const isAdmin = session?.user?.role === "ADMIN";


    // Fetch chapters with optional manga filtering
    // For deleted view, we need to bypass the middleware filter
    const chapters = showDeleted && isAdmin
        ? await prisma.$queryRaw<Array<any>>`
            SELECT 
                c.id, c."mangaId", c."chapterNumber", c.title, c."isFree", 
                c."isPublished", c."viewCount", c."createdAt", c."deletedAt",
                m.title as "mangaTitle", m."coverImage" as "mangaCoverImage"
            FROM "Chapter" c
            INNER JOIN "Manga" m ON c."mangaId" = m.id
            WHERE c."deletedAt" IS NOT NULL
            ${filterMangaId ? Prisma.sql`AND c."mangaId" = ${filterMangaId}` : Prisma.empty}
            ORDER BY c."deletedAt" DESC
            LIMIT 50
        `
        : await prisma.chapter.findMany({
            where: filterMangaId ? { mangaId: filterMangaId } : {},
            orderBy: { createdAt: "desc" },
            take: 50,
            include: {
                manga: {
                    select: {
                        title: true,
                        coverImage: true,
                    }
                }
            }
        });

    // Normalize the data structure for deleted chapters from raw query
    const normalizedChapters = showDeleted && isAdmin
        ? chapters.map((c: any) => ({
            ...c,
            manga: {
                title: c.mangaTitle,
                coverImage: c.mangaCoverImage
            }
        }))
        : chapters;

    // Fetch all mangas for the filter dropdown
    const mangas = await prisma.manga.findMany({
        orderBy: { title: "asc" },
        select: { id: true, title: true }
    });

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Бүлгүүд</h1>
                <Link
                    href="/amako-portal-v7/chapters/create"
                    className="px-4 py-2 bg-[#d8454f] hover:bg-[#c13a44] text-white rounded-lg text-sm font-medium transition-colors"
                >
                    + Бүлэг нэмэх
                </Link>
            </div>

            <ChapterFilter mangas={mangas} />

            {/* Tabs - Only show for admins */}
            {isAdmin && (
                <div className="mb-4 border-b border-gray-200">
                    <nav className="flex gap-4">
                        <Link
                            href="/amako-portal-v7/chapters"
                            className={`px-4 py-2 border-b-2 font-medium text-sm transition-colors ${!showDeleted
                                ? "border-[#d8454f] text-[#d8454f]"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                }`}
                        >
                            Active
                        </Link>
                        <Link
                            href="/amako-portal-v7/chapters?view=deleted"
                            className={`px-4 py-2 border-b-2 font-medium text-sm transition-colors ${showDeleted
                                ? "border-[#d8454f] text-[#d8454f]"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                }`}
                        >
                            Deleted
                        </Link>
                    </nav>
                </div>
            )}

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-500">
                        <thead className="bg-gray-50 text-gray-700 uppercase font-medium">
                            <tr>
                                <th className="px-6 py-4">Manga</th>
                                <th className="px-6 py-4">Ch #</th>
                                <th className="px-6 py-4">Title</th>
                                {!showDeleted && <th className="px-6 py-4">Status</th>}
                                {!showDeleted && <th className="px-6 py-4">Access</th>}
                                <th className="px-6 py-4">Views</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {normalizedChapters.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                                        {showDeleted ? "Устгасан бүлэг байхгүй байна." : "Одоогоор бүлэг байхгүй байна."}
                                    </td>
                                </tr>
                            ) : (
                                normalizedChapters.map((chapter: any) => (
                                    <tr key={chapter.id} className={`hover:bg-gray-50 transition-colors ${showDeleted ? "opacity-60" : ""}`}>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-10 relative rounded overflow-hidden bg-gray-100 flex-shrink-0">
                                                    {chapter.manga.coverImage && (
                                                        <Image
                                                            src={chapter.manga.coverImage}
                                                            alt={chapter.title || ""}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    )}
                                                </div>
                                                <span className="font-medium text-gray-900 line-clamp-1 max-w-[150px]">
                                                    {chapter.manga.title}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-gray-900">
                                            {chapter.chapterNumber}
                                        </td>
                                        <td className="px-6 py-4">
                                            {chapter.title || "-"}
                                        </td>
                                        {!showDeleted && (
                                            <>
                                                <td className="px-6 py-4">
                                                    {!(chapter as any).isPublished ? (
                                                        <span className="px-2 py-1 rounded text-xs font-bold bg-gray-100 text-gray-500 border border-gray-200 uppercase">
                                                            Draft
                                                        </span>
                                                    ) : (
                                                        <span className="px-2 py-1 rounded text-xs font-bold bg-green-100 text-green-700 border border-green-200 uppercase">
                                                            Published
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <form action={toggleAccessStatus}>
                                                        <input type="hidden" name="id" value={chapter.id} />
                                                        <input type="hidden" name="isFree" value={String(chapter.isFree)} />
                                                        <button
                                                            className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-bold border transition-colors ${chapter.isFree
                                                                ? "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200"
                                                                : "bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200"
                                                                }`}
                                                            title={chapter.isFree ? "Click to Lock (Make Premium)" : "Click to Unlock (Make Free)"}
                                                        >
                                                            {chapter.isFree ? (
                                                                <>
                                                                    <Unlock size={12} /> Free
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Lock size={12} /> Premium
                                                                </>
                                                            )}
                                                        </button>
                                                    </form>
                                                </td>
                                            </>
                                        )}
                                        <td className="px-6 py-4">{chapter.viewCount}</td>
                                        <td className="px-6 py-4 text-xs">
                                            {new Date(showDeleted ? chapter.deletedAt : chapter.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {showDeleted ? (
                                                    // Restore button for deleted chapters
                                                    <form action={restoreChapter}>
                                                        <input type="hidden" name="id" value={chapter.id} />
                                                        <button
                                                            className="flex items-center gap-1 px-3 py-1 bg-green-50 text-green-600 hover:bg-green-100 rounded text-xs font-bold transition-colors"
                                                            title="Restore chapter"
                                                        >
                                                            <RotateCcw size={12} />
                                                            Restore
                                                        </button>
                                                    </form>
                                                ) : (
                                                    // Normal actions for active chapters
                                                    <>
                                                        <Link
                                                            href={`/manga/${chapter.mangaId}/read/${chapter.id}`}
                                                            target="_blank"
                                                            className="px-3 py-1 bg-green-50 text-green-600 hover:bg-green-100 rounded text-xs font-bold transition-colors flex items-center gap-1"
                                                            title="View on site"
                                                        >
                                                            <Eye size={12} />

                                                        </Link>
                                                        <form action={togglePublishStatus}>
                                                            <input type="hidden" name="id" value={chapter.id} />
                                                            <input type="hidden" name="currentStatus" value={String(chapter.isPublished)} />
                                                            <button
                                                                className={`px-3 py-1 rounded text-xs font-bold transition-colors ${chapter.isPublished
                                                                    ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                                                                    : "bg-green-100 text-green-700 hover:bg-green-200"
                                                                    }`}
                                                            >
                                                                {chapter.isPublished ? "Unpublish" : "Publish"}
                                                            </button>
                                                        </form>
                                                        <Link
                                                            href={`/amako-portal-v7/chapters/${chapter.id}/edit`}
                                                            className="px-3 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded text-xs font-bold transition-colors"
                                                        >
                                                            Edit
                                                        </Link>
                                                        {isAdmin && (
                                                            <form action={deleteChapter}>
                                                                <input type="hidden" name="id" value={chapter.id} />
                                                                <DeleteChapterButtonInline />
                                                            </form>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
