import Header from "./components/Header";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import MangaCard from "./components/MangaCard";

export const dynamic = "force-dynamic";

export default async function Home() {
  // Get popular manga (top 10 by view count)
  const popularManga = await prisma.manga.findMany({
    where: { isPublished: true },
    orderBy: { viewCount: "desc" },
    take: 10,
    select: {
      id: true,
      titleMn: true,
      coverImage: true,
      viewCount: true,

      _count: {
        select: { chapters: true }
      }
    }
  });

  // Get latest chapter updates (individual chapters)
  const latestChapters = await prisma.chapter.findMany({
    where: {
      isPublished: true,
      manga: {
        isPublished: true
      }
    } as any,
    orderBy: {
      publishedAt: "desc"
    },
    take: 20,
    include: {
      manga: {
        select: {
          id: true,
          titleMn: true,
          coverImage: true,
        }
      }
    }
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#d8454f] to-[#c13a44] text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Amako</h1>
          <p className="text-lg md:text-xl mb-8 opacity-90">
            Юүри орчуулга
          </p>
          <Link
            href="/manga"
            className="inline-block px-8 py-3 bg-white text-[#d8454f] font-bold rounded-lg hover:bg-gray-100 transition-colors"
          >
            Бүх гаргалт
          </Link>
        </div>
      </section>

      <main className="container mx-auto px-4 py-8 space-y-12">
        {/* Popular Manga Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Алдартай</h2>
            <Link href="/manga" className="text-[#d8454f] hover:underline">
              Бүгд →
            </Link>
          </div>

          {popularManga.length > 0 ? (
            <div className="relative">
              <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                {popularManga.map((manga) => (
                  <MangaCard
                    key={manga.id}
                    manga={manga}
                    className="w-40 snap-start"
                  />
                ))}
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Манга байхгүй байна</p>
          )}
        </section>

        {/* Latest Updates Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Сүүлд нэмэгдсэн</h2>
            <Link href="/manga" className="text-[#d8454f] hover:underline">
              Бүгд →
            </Link>
          </div>

          {latestChapters.length > 0 ? (
            <div className="relative">
              <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                {(latestChapters as any[]).map((chapter) => {
                  const timeAgo = getTimeAgo(chapter.createdAt);

                  return (
                    <MangaCard
                      key={chapter.id}
                      manga={chapter.manga}
                      customLink={`/manga/${chapter.manga?.id}/read/${chapter.id}`}
                      badge={
                        <div className="absolute top-2 right-2 bg-[#d8454f] text-white px-2 py-1 rounded text-xs font-bold">
                          {chapter.chapterNumber}-р бүлэг
                        </div>
                      }
                      subtitle={timeAgo}
                      className="w-40 snap-start"
                    />
                  );
                })}
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Шинэчлэлт байхгүй байна</p>
          )}
        </section>
      </main>

      {/* Footer */}

    </div>
  );
}

// Helper function to get relative time
function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 60) {
    return `${diffMins} минутын өмнө`;
  } else if (diffHours < 24) {
    return `${diffHours} цагийн өмнө`;
  } else if (diffDays < 7) {
    return `${diffDays} өдрийн өмнө`;
  } else {
    return new Date(date).toLocaleDateString('mn-MN');
  }
}
