import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import Image from "next/image";

export const dynamic = "force-dynamic";


import { Lock, Unlock } from "lucide-react";

async function togglePublishStatus(formData: FormData) {
    "use server";
    const settingsId = formData.get("id") as string;
    const currentStatus = formData.get("currentStatus") === "true";

    await prisma.chapter.update({
        where: { id: parseInt(settingsId) },
        data: { isPublished: !currentStatus }
    });

    revalidatePath("/admin/chapters");
}

async function toggleAccessStatus(formData: FormData) {
    "use server";
    const chapterId = formData.get("id") as string;
    const isFree = formData.get("isFree") === "true";

    await prisma.chapter.update({
        where: { id: parseInt(chapterId) },
        data: { isFree: !isFree }
    });

    revalidatePath("/admin/chapters");
}

export default async function ChaptersListPage() {
    const chapters = await prisma.chapter.findMany({
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

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Бүлгүүд</h1>
                <Link
                    href="/admin/chapters/create"
                    className="px-4 py-2 bg-[#d8454f] hover:bg-[#c13a44] text-white rounded-lg text-sm font-medium transition-colors"
                >
                    + Бүлэг нэмэх
                </Link>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-500">
                        <thead className="bg-gray-50 text-gray-700 uppercase font-medium">
                            <tr>
                                <th className="px-6 py-4">Manga</th>
                                <th className="px-6 py-4">Ch #</th>
                                <th className="px-6 py-4">Title</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Access</th>
                                <th className="px-6 py-4">Views</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {chapters.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                                        Одоогоор бүлэг байхгүй байна.
                                    </td>
                                </tr>
                            ) : (
                                chapters.map((chapter) => (
                                    <tr key={chapter.id} className="hover:bg-gray-50 transition-colors">
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
                                        <td className="px-6 py-4">{chapter.viewCount}</td>
                                        <td className="px-6 py-4 text-xs">
                                            {new Date(chapter.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
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
                                                    href={`/admin/chapters/${chapter.id}/edit`}
                                                    className="px-3 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded text-xs font-bold transition-colors"
                                                >
                                                    Edit
                                                </Link>
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
