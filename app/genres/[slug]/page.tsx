import { prisma } from "@/lib/prisma";
import Header from "@/app/components/Header";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";

export default async function GenrePage({ params }: { params: { slug: string } }) {
    const { slug } = await params;

    const genre = await prisma.genre.findUnique({
        where: { slug },
        include: {
            mangas: {
                where: { isPublished: true },
                orderBy: { updatedAt: "desc" },
                include: {
                    _count: {
                        select: { chapters: true },
                    },
                },
            },
        },
    });

    if (!genre) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <main className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <Link href="/genres" className="text-[#d8454f] hover:underline mb-2 inline-block">
                        ← Бүх төрөл
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">{genre.nameMn}</h1>
                    <p className="text-gray-600 mt-2">{genre.mangas.length} гаргалт</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {genre.mangas.map((manga) => (
                        <Link
                            key={manga.id}
                            href={`/manga/${manga.id}`}
                            className="group"
                        >
                            <div className="bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-lg transition-all">
                                <div className="relative aspect-[3/4] bg-gray-100">
                                    {manga.coverImage ? (
                                        <Image
                                            src={manga.coverImage}
                                            alt={manga.title}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                            No Image
                                        </div>
                                    )}
                                </div>
                                <div className="p-3">
                                    <h3 className="font-semibold text-sm text-gray-900 group-hover:text-[#d8454f] line-clamp-2 mb-1">
                                        {manga.titleMn}
                                    </h3>
                                    <p className="text-xs text-gray-500">
                                        {manga._count.chapters} бүлэг
                                    </p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {genre.mangas.length === 0 && (
                    <div className="text-center py-20 text-gray-500">
                        Энэ төрөлд гаргалт байхгүй байна.
                    </div>
                )}
            </main>
        </div>
    );
}
