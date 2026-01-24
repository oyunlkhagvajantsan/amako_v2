import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

async function toggleMangaPublishStatus(formData: FormData) {
    "use server";
    const mangaId = formData.get("id") as string;
    const currentStatus = formData.get("currentStatus") === "true";

    await prisma.manga.update({
        where: { id: parseInt(mangaId) },
        data: { isPublished: !currentStatus }
    });

    revalidatePath("/amako-portal-v7/manga");
}

export default async function MangaListPage() {
    const mangas = await prisma.manga.findMany({
        orderBy: { updatedAt: "desc" },
        include: {
            _count: {
                select: { chapters: true },
            },
        },
    });

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Манга жагсаалт</h1>
                <Link
                    href="/amako-portal-v7/manga/create"
                    className="px-4 py-2 bg-[#d8454f] hover:bg-[#c13a44] text-white rounded-lg text-sm font-medium transition-colors"
                >
                    + Гаргалт нэмэх
                </Link>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-500">
                        <thead className="bg-gray-50 text-gray-700 uppercase font-medium">
                            <tr>
                                <th className="px-6 py-4">Cover</th>
                                <th className="px-6 py-4">Title</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Publish</th>
                                <th className="px-6 py-4">Chapters</th>
                                <th className="px-6 py-4">Views</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {mangas.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                                        Одоогоор байхгүй байна.
                                    </td>
                                </tr>
                            ) : (
                                mangas.map((manga) => (
                                    <tr key={manga.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="w-12 h-16 relative rounded overflow-hidden bg-gray-100">
                                                {manga.coverImage ? (
                                                    <Image
                                                        src={manga.coverImage}
                                                        alt={manga.title}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                                                        No Img
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-gray-900">
                                                {manga.title}
                                            </div>
                                            <div className="text-gray-500 text-xs">{manga.titleMn}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${manga.status === "ONGOING"
                                                    ? "bg-green-100 text-green-700"
                                                    : manga.status === "COMPLETED"
                                                        ? "bg-blue-100 text-blue-700"
                                                        : "bg-yellow-100 text-yellow-700"
                                                    }`}
                                            >
                                                {manga.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {!manga.isPublished ? (
                                                <span className="px-2 py-1 rounded text-xs font-bold bg-gray-100 text-gray-500 border border-gray-200 uppercase">
                                                    Draft
                                                </span>
                                            ) : (
                                                <span className="px-2 py-1 rounded text-xs font-bold bg-green-100 text-green-700 border border-green-200 uppercase">
                                                    Published
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">{manga._count.chapters}</td>
                                        <td className="px-6 py-4">{manga.viewCount}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <form action={toggleMangaPublishStatus}>
                                                    <input type="hidden" name="id" value={manga.id} />
                                                    <input type="hidden" name="currentStatus" value={String(manga.isPublished)} />
                                                    <button
                                                        className={`px-3 py-1 rounded text-xs font-bold transition-colors ${manga.isPublished
                                                            ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                                                            : "bg-green-100 text-green-700 hover:bg-green-200"
                                                            }`}
                                                    >
                                                        {manga.isPublished ? "Unpublish" : "Publish"}
                                                    </button>
                                                </form>
                                                <Link
                                                    href={`/amako-portal-v7/chapters/create?mangaId=${manga.id}`}
                                                    className="px-3 py-1 bg-purple-50 text-purple-600 hover:bg-purple-100 rounded text-xs font-bold transition-colors"
                                                >
                                                    + Бүлэг
                                                </Link>
                                                <Link
                                                    href={`/amako-portal-v7/manga/${manga.id}/edit`}
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
