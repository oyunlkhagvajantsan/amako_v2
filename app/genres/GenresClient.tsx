"use client";

import { useState, useEffect } from "react";
import Header from "@/app/components/Header";
import { useSearchParams, useRouter } from "next/navigation";
import MangaCard from "@/app/components/MangaCard";

// Define Types locally or import
type Genre = {
    id: number;
    name: string;
    nameMn: string;
    slug: string;
};

type Manga = {
    id: number;
    title: string;
    titleMn: string;
    coverImage: string;
    viewCount: number;
    updatedAt: string;
    status: string;
    genres: Genre[];
    _count: {
        chapters: number;
    };
};

export default function GenresClient() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Initial State from URL
    const initialGenre = searchParams.get("genre");

    // Data State
    const [allGenres, setAllGenres] = useState<Genre[]>([]);
    const [mangas, setMangas] = useState<Manga[]>([]);
    const [totalMangas, setTotalMangas] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(true);

    // Filter State
    const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [sortBy, setSortBy] = useState("latest");
    const [currentPage, setCurrentPage] = useState(1);

    // Fetch All Genres
    useEffect(() => {
        fetch("/api/genres")
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setAllGenres(data);
                    // Match URL genre slug to ID if present
                    if (initialGenre) {
                        const matched = data.find(g => g.slug === initialGenre);
                        if (matched) setSelectedGenres([matched.id]);
                    }
                }
            })
            .catch(err => console.error("Genre fetch error:", err));
    }, [initialGenre]);

    // Fetch Mangas with Filters
    useEffect(() => {
        setIsLoading(true);
        const params = new URLSearchParams();

        params.append("page", currentPage.toString());
        params.append("limit", "20");
        if (searchQuery) params.append("search", searchQuery);
        if (statusFilter !== "ALL") params.append("status", statusFilter);
        params.append("sort", sortBy);

        selectedGenres.forEach(id => params.append("genres", id.toString()));

        fetch(`/api/manga/filter?${params.toString()}`)
            .then(res => res.json())
            .then(data => {
                setMangas(data.mangas || []);
                setTotalMangas(data.total || 0);
                setTotalPages(data.totalPages || 0);
            })
            .catch(err => console.error("Filter error:", err))
            .finally(() => setIsLoading(false));
    }, [currentPage, selectedGenres, searchQuery, statusFilter, sortBy]);

    // Handlers
    const toggleGenre = (genreId: number) => {
        setSelectedGenres(prev =>
            prev.includes(genreId) ? prev.filter(id => id !== genreId) : [...prev, genreId]
        );
        setCurrentPage(1); // Reset to page 1 on filter change
    };

    const clearFilters = () => {
        setSelectedGenres([]);
        setSearchQuery("");
        setStatusFilter("ALL");
        setSortBy("latest");
        setCurrentPage(1);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <main className="container mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Sidebar Filters */}
                    <div className="w-full lg:w-64 flex-shrink-0 space-y-6">
                        {/* Mobile Toggle? (Can implement later, for now visible) */}

                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <h2 className="font-bold text-gray-900 mb-4 flex justify-between items-center">
                                Шүүлтүүр
                                <button onClick={clearFilters} className="text-xs text-red-500 hover:underline">
                                    Цэвэрлэх
                                </button>
                            </h2>

                            {/* Search */}
                            <div className="mb-6">
                                <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">Нэрээр хайх</label>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                                    placeholder="Нэр..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-[#d8454f] focus:border-[#d8454f] outline-none"
                                />
                            </div>

                            {/* Status */}
                            <div className="mb-6">
                                <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">Төлөв</label>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-[#d8454f] focus:border-[#d8454f] outline-none"
                                >
                                    <option value="ALL">Бүгд</option>
                                    <option value="ONGOING">Гарч байгаа</option>
                                    <option value="COMPLETED">Дууссан</option>
                                </select>
                            </div>

                            {/* Sort */}
                            <div className="mb-6">
                                <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">Эрэмбэлэх</label>
                                <select
                                    value={sortBy}
                                    onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-[#d8454f] focus:border-[#d8454f] outline-none"
                                >
                                    <option value="latest">Сүүлд нэмэгдсэн</option>
                                    <option value="popular">Хамгийн их уншсан</option>
                                    <option value="az">A-Z</option>
                                    <option value="za">Z-A</option>
                                </select>
                            </div>

                            {/* Genres */}
                            <div>
                                <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">Төрөл</label>
                                <div className="space-y-2 max-h-48 lg:max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                                    {allGenres.map(genre => (
                                        <label key={genre.id} className="flex items-center gap-2 cursor-pointer group">
                                            <input
                                                type="checkbox"
                                                checked={selectedGenres.includes(genre.id)}
                                                onChange={() => toggleGenre(genre.id)}
                                                className="rounded border-gray-300 text-[#d8454f] focus:ring-[#d8454f]"
                                            />
                                            <span className="text-sm text-gray-700 group-hover:text-[#d8454f] transition-colors">
                                                {genre.nameMn}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1">
                        {/* Results Header */}
                        <div className="flex justify-between items-center mb-6">
                            <h1 className="text-xl font-bold text-gray-900">
                                Бүх гаргалт <span className="text-gray-400 text-lg font-normal">({totalMangas})</span>
                            </h1>
                        </div>

                        {/* Grid */}
                        {isLoading ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-pulse">
                                {[...Array(8)].map((_, i) => (
                                    <div key={i} className="aspect-[2/3] bg-gray-200 rounded-xl" />
                                ))}
                            </div>
                        ) : mangas.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
                        ) : (
                            <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
                                <p className="text-gray-500 text-lg">Илэрц олдсонгүй.</p>
                                <button
                                    onClick={clearFilters}
                                    className="mt-4 text-[#d8454f] font-medium hover:underline"
                                >
                                    Шүүлтүүрийг цэвэрлэх
                                </button>
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
                                    // Show first, last, and window around current
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
                    </div>
                </div >
            </main >
        </div >
    );
}
