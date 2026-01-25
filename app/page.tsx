import Header from "./components/Header";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import MangaCard from "./components/MangaCard";
import TrendingHero from "./components/home/TrendingHero";
import { ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function Home() {
  // Get popular manga
  const popularManga = await prisma.manga.findMany({
    where: { isPublished: true },
    orderBy: { viewCount: "desc" },
    take: 10,
    select: {
      id: true,
      titleMn: true,
      coverImage: true,
      viewCount: true,
      status: true,
      type: true,
      isAdult: true,
      _count: { select: { chapters: true } }
    }
  });

  // Get latest chapter updates
  const latestChapters = await prisma.chapter.findMany({
    where: {
      isPublished: true,
      manga: { isPublished: true }
    },
    orderBy: { publishedAt: "desc" },
    take: 15,
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

  // Get ongoing manga
  const ongoingManga = await prisma.manga.findMany({
    where: { isPublished: true, status: "ONGOING" },
    orderBy: { updatedAt: "desc" },
    take: 10,
    select: {
      id: true,
      titleMn: true,
      coverImage: true,
      _count: { select: { chapters: true } }
    }
  });

  // Get completed manga
  const completedManga = await prisma.manga.findMany({
    where: { isPublished: true, status: "COMPLETED" },
    orderBy: { updatedAt: "desc" },
    take: 10,
    select: {
      id: true,
      titleMn: true,
      coverImage: true,
      _count: { select: { chapters: true } }
    }
  });

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Trending Hero Section */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
              <span className="w-2 h-8 bg-[#d8454f] rounded-full" />
              Алдартай
            </h2>
            <Link href="/manga" className="text-sm text-gray-400 hover:text-[#d8454f] transition-colors tracking-widest">
              Бүгд ›
            </Link>
          </div>
          <TrendingHero manga={popularManga} />
        </section>

        {/* Latest Updates Section */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
              <span className="w-2 h-8 bg-[#d8454f] rounded-full" />
              Сүүлд нэмэгдсэн
            </h2>
            <Link href="/manga" className="text-sm text-gray-400 hover:text-[#d8454f] transition-colors tracking-widest">
              Бүгд ›
            </Link>
          </div>

          <div className="relative group">
            <div className="flex gap-4 overflow-x-auto pb-6 -mx-1 px-1 snap-x snap-mandatory no-scrollbar">
              {latestChapters.map((chapter) => (
                <MangaCard
                  key={chapter.id}
                  manga={chapter.manga}
                  customLink={`/manga/${chapter.manga?.id}/read/${chapter.id}`}
                  badge={
                    <div className="absolute top-2 right-2 bg-[#d8454f] text-white px-2 py-1 rounded-lg text-[10px] font-bold tracking-tighter shadow-lg shadow-red-500/20">
                      {chapter.chapterNumber}-р бүлэг
                    </div>
                  }
                  subtitle={getTimeAgo(chapter.createdAt)}
                  className="w-40 md:w-44 snap-start flex-shrink-0"
                />
              ))}
            </div>
          </div>
        </section>

        {/* Popular Manga Section */}
        {/* <ContentSection title="Алдартай" items={popularManga} type="manga" /> */}

        {/* Ongoing Manga Section */}
        <ContentSection title="Гарч байгаа" items={ongoingManga} type="manga" />

        {/* Completed Manga Section */}
        <ContentSection title="Дууссан" items={completedManga} type="manga" />
      </main>
    </div>
  );
}

function ContentSection({ title, items, type }: { title: string, items: any[], type: "manga" | "chapter" }) {
  if (items.length === 0) return null;

  return (
    <section>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
          <span className="w-2 h-8 bg-[#d8454f] rounded-full" />
          {title}
        </h2>
        <Link href="/manga" className="text-sm text-gray-400 hover:text-[#d8454f] transition-colors tracking-widest">
          Бүгд ›
        </Link>
      </div>

      <div className="relative group">
        <div className="flex gap-4 overflow-x-auto pb-6 -mx-1 px-1 snap-x snap-mandatory no-scrollbar">
          {items.map((item) => (
            <MangaCard
              key={item.id}
              manga={type === "chapter" ? item.manga : item}
              className="w-40 md:w-44 snap-start flex-shrink-0"
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// Helper function to get relative time
function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 60) return `${diffMins} минутын өмнө`;
  if (diffHours < 24) return `${diffHours} цагийн өмнө`;
  if (diffDays < 7) return `${diffDays} өдрийн өмнө`;
  return new Date(date).toLocaleDateString('mn-MN');
}
