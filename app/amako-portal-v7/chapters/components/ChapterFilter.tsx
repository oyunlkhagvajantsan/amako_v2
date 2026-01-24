"use client";

import { useRouter, useSearchParams } from "next/navigation";

interface Manga {
    id: number;
    title: string;
}

interface ChapterFilterProps {
    mangas: Manga[];
}

export default function ChapterFilter({ mangas }: ChapterFilterProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentMangaId = searchParams.get("mangaId") || "";

    const handleMangaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const mangaId = e.target.value;
        const params = new URLSearchParams(searchParams.toString());

        if (mangaId) {
            params.set("mangaId", mangaId);
        } else {
            params.delete("mangaId");
        }

        router.push(`/amako-portal-v7/chapters?${params.toString()}`);
    };

    return (
        <div className="flex items-center gap-2 mb-6 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <label htmlFor="manga-filter" className="text-sm font-medium text-gray-700">
                Мангагаар шүүх:
            </label>
            <select
                id="manga-filter"
                value={currentMangaId}
                onChange={handleMangaChange}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-[#d8454f] focus:border-[#d8454f] outline-none min-w-[200px]"
            >
                <option value="">-- Бүх манга --</option>
                {mangas.map((manga) => (
                    <option key={manga.id} value={String(manga.id)}>
                        {manga.title}
                    </option>
                ))}
            </select>
        </div>
    );
}
