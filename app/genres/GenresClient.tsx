"use client";

import { useState, useEffect } from "react";
import Header from "@/app/components/Header";
import MangaCard from "@/app/components/MangaCard";
import { Search } from "lucide-react";

type Manga = {
    id: number;
    title: string;
    titleMn: string;
    coverImage: string;
    viewCount: number;
    updatedAt: string;
    status: string;
    _count: {
        chapters: number;
    };
};

export default function GenresClient() {
    // Data State
    const [mangas, setMangas] = useState<Manga[]>([]);
    const [totalMangas, setTotalMangas] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(false);

    // Filter State
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    // Fetch Mangas with Search
    useEffect(() => {
        if (!searchQuery.trim()) {
            setMangas([]);
            setTotalMangas(0);
            setTotalPages(0);
            return;
        }

        setIsLoading(true);
        const params = new URLSearchParams();

        params.append("page", currentPage.toString());
        params.append("limit", "20");
        params.append("search", searchQuery);
        params.append("sort", "popular");

        fetch(`/api/manga/filter?${params.toString()}`)
            .then(res => res.json())
            .then(data => {
                setMangas(data.mangas || []);
                setTotalMangas(data.total || 0);
                setTotalPages(data.totalPages || 0);
            })
            .catch(err => console.error("Search error:", err))
            .finally(() => setIsLoading(false));
    }, [currentPage, searchQuery]);

    return (
        <div className="min-h-screen bg-white">
            <Header />

            <main className="container mx-auto px-4 py-8">
                <h1 className="text-xl font-bold mb-6 text-gray-900">Хайлт</h1>

                {/* Search Bar */}
                <div className="mb-8">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                            placeholder="Хайх..."
                            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg text-base focus:ring-[#d8454f] focus:border-[#d8454f] outline-none"
                            autoFocus
                        />
                    </div>
                    {searchQuery && (
                        <p className="text-sm text-gray-500 mt-3">
                            {totalMangas} илэрц олдлоо
                        </p>
                    )}
                </div>

                {/* Grid */}
                {isLoading ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 animate-pulse">
                        {[...Array(10)].map((_, i) => (
                            <div key={i} className="aspect-[2/3] bg-gray-200 rounded-xl" />
                        ))}
                    </div>
                ) : mangas.length > 0 ? (
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
                ) : searchQuery ? (
                    <div className="text-center py-20 bg-gray-50 rounded-xl border border-gray-200">
                        <p className="text-gray-500 text-lg">Илэрц олдсонгүй.</p>
                        <p className="text-gray-400 text-sm mt-2">Өөр түлхүүр үг ашиглан хайж үзнэ үү.</p>
                    </div>
                ) : (
                    <div className="text-center py-20 bg-gray-50 rounded-xl border border-gray-200">
                        <Search className="mx-auto mb-4 text-gray-300" size={48} />
                        {/* <p className="text-gray-500 text-lg">Манга хайхын тулд нэрийг оруулна уу</p> */}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center mt-12 gap-2">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Өмнөх
                        </button>

                        {[...Array(totalPages)].map((_, i) => {
                            const page = i + 1;
                            if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                                return (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`w-10 h-10 rounded-lg flex items-center justify-center font-medium transition-colors ${currentPage === page
                                            ? "bg-[#d8454f] text-white"
                                            : "bg-white border border-gray-200 hover:bg-gray-50 text-gray-700"
                                            }`}
                                    >
                                        {page}
                                    </button>
                                );
                            } else if (page === currentPage - 2 || page === currentPage + 2) {
                                return <span key={page} className="w-10 h-10 flex items-center justify-center text-gray-400">...</span>;
                            }
                            return null;
                        })}

                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Дараах
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}
