import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import Header from "@/app/components/Header";
import MangaCard from "@/app/components/MangaCard";

export const dynamic = "force-dynamic";

export default async function MangaListPage() {
    const mangas = await prisma.manga.findMany({
        where: { isPublished: true },
        orderBy: { updatedAt: "desc" },
        include: {
            _count: {
                select: { chapters: true },
            },
        },
    });

    return (
        <div className="min-h-screen bg-white">
            <Header />

            <main className="container mx-auto px-4 py-8">
                <h1 className="text-xl font-bold mb-8 text-gray-900">Бүх гаргалт</h1>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {mangas.map((manga) => (
                        <MangaCard
                            key={manga.id}
                            manga={manga}
                            badge={
                                <div className="absolute top-2 right-2 bg-black/40 text-white text-xs px-2 py-1 rounded">
                                    {manga.status === "ONGOING" ? "Гарч байгаа" :
                                        manga.status === "COMPLETED" ? "Дууссан" : "Түр зогссон"}
                                </div>
                            }
                        />
                    ))}
                </div>

                {mangas.length === 0 && (
                    <div className="text-center py-20 text-gray-500">
                        Гаргалт байхгүй байна.
                    </div>
                )}
            </main>
        </div>
    );
}
