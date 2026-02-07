"use client";

import { useState, useEffect, useCallback } from "react";
import Header from "@/app/components/Header";
import MangaCard from "@/app/components/MangaCard";
import { X, History } from "lucide-react";
import { useSearchHistory } from "@/lib/hooks/useSearchHistory";
import { useSearchParams } from "next/navigation";

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
    isAdult: boolean;
    isOneshot: boolean;
    _count: {
        chapters: number;
    };
};

const statusMap: Record<string, string> = {
    ALL: "Төлөв",
    ONGOING: "Гарч байгаа",
    COMPLETED: "Дууссан",
    HIATUS: "Түр зогссон"
};

const typeMap: Record<string, string> = {
    ALL: "Төрөл",
    MANGA: "Манга",
    MANHWA: "Манхва",
    MANHUA: "Манхуа"
};

const sortMap: Record<string, string> = {
    latest: "Сүүлд нэмэгдсэн",
    popular: "Их уншсан",
    az: "А-Я",
    za: "Я-А"
};

export default function MangaListClient() {
    // Data State
    const [mangas, setMangas] = useState<Manga[]>([]);
    const [allGenres, setAllGenres] = useState<Genre[]>([]);
    const [totalMangas, setTotalMangas] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(true);

    // Filter State
    const searchParams = useSearchParams();
    const urlSearchQuery = searchParams.get("search") || "";
    const [searchQuery, setSearchQuery] = useState(urlSearchQuery);
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [typeFilter, setTypeFilter] = useState("ALL");
    const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
    const [sortBy, setSortBy] = useState("latest");
    const [isAdultFilter, setIsAdultFilter] = useState(false);
    const [isOneshotFilter, setIsOneshotFilter] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [isInputFocused, setIsInputFocused] = useState(false);

    const { history, addSearchTerm, removeSearchTerm, clearHistory } = useSearchHistory();

    // Sync search query with URL
    useEffect(() => {
        if (urlSearchQuery && urlSearchQuery !== searchQuery) {
            setSearchQuery(urlSearchQuery);
            addSearchTerm(urlSearchQuery);
        }
    }, [urlSearchQuery, addSearchTerm]);

    // Fetch All Genres
    useEffect(() => {
        fetch("/api/genres")
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setAllGenres(data);
                }
            })
            .catch(err => console.error("Genre fetch error:", err));
    }, []);

    // Fetch Mangas with Filters
    useEffect(() => {
        setIsLoading(true);
        const params = new URLSearchParams();

        params.append("page", currentPage.toString());
        params.append("limit", "20");
        if (searchQuery) params.append("search", searchQuery);
        if (statusFilter !== "ALL") params.append("status", statusFilter);
        if (typeFilter !== "ALL") params.append("type", typeFilter);
        if (isAdultFilter) params.append("isAdult", "true");
        if (isOneshotFilter) params.append("isOneshot", "true");
        selectedGenres.forEach(id => params.append("genres", id.toString()));
        params.append("sort", sortBy);

        fetch(`/api/manga/filter?${params.toString()}`)
            .then(res => res.json())
            .then(data => {
                setMangas(data.mangas || []);
                setTotalMangas(data.total || 0);
                setTotalPages(data.totalPages || 0);
            })
            .catch(err => console.error("Filter error:", err))
            .finally(() => setIsLoading(false));
    }, [currentPage, searchQuery, statusFilter, typeFilter, selectedGenres, sortBy, isAdultFilter, isOneshotFilter]);

    const toggleGenre = (genreId: number) => {
        setSelectedGenres(prev =>
            prev.includes(genreId) ? prev.filter(id => id !== genreId) : [...prev, genreId]
        );
        setCurrentPage(1);
    };

    const clearFilters = () => {
        setSearchQuery("");
        setStatusFilter("ALL");
        setTypeFilter("ALL");
        setSelectedGenres([]);
        setIsAdultFilter(false);
        setIsOneshotFilter(false);
        setSortBy("latest");
        setCurrentPage(1);
    };

    const handleHistoryClick = (term: string) => {
        setSearchQuery(term);
        setCurrentPage(1);
        setIsInputFocused(false);
        addSearchTerm(term); // Re-add to move to front
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && searchQuery.trim()) {
            addSearchTerm(searchQuery);
            setIsInputFocused(false);
        }
    };

    return (
        <div className="min-h-screen bg-white">
            <Header />

            <main className="container mx-auto px-4 py-8">
                <h1 className="text-xl font-bold mb-6 text-gray-900">Бүх гаргалт</h1>

                {/* Compact Filter Bar */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 md:p-4 mb-6 md:mb-8">
                    {/* Search Input */}
                    <div className="mb-3 relative">
                        <div className="relative z-20">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                                onKeyDown={handleKeyDown}
                                onFocus={() => setIsInputFocused(true)}
                                onBlur={() => setTimeout(() => setIsInputFocused(false), 200)}
                                placeholder="Хайх..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-[#d8454f] focus:border-[#d8454f] outline-none"
                            />
                        </div>

                        {/* Search History Dropdown */}
                        {isInputFocused && history.length > 0 && !searchQuery && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-30 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                                <div className="p-2 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider pl-1 font-sans">Сүүлийн хайлтууд</span>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); clearHistory(); }}
                                        className="text-xs text-red-500 hover:text-red-600 font-medium px-2 py-1 rounded hover:bg-red-50 transition-colors"
                                    >
                                        Цэвэрлэх
                                    </button>
                                </div>
                                <div className="max-h-64 overflow-y-auto">
                                    {history.map((term, index) => (
                                        <div
                                            key={index}
                                            className="group flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer transition-colors"
                                            onClick={() => handleHistoryClick(term)}
                                        >
                                            <History size={14} className="text-gray-400 mr-3 group-hover:text-[#d8454f] transition-colors" />
                                            <span className="flex-1 text-sm text-gray-700 group-hover:text-gray-900">{term}</span>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); removeSearchTerm(term); }}
                                                className="p-1 opacity-0 group-hover:opacity-100 hover:bg-gray-200 rounded-full transition-all"
                                            >
                                                <X size={14} className="text-gray-400" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Filters - 2 columns on mobile, single row on desktop */}
                    <div className="grid grid-cols-2 md:flex gap-2 md:gap-3">
                        {/* Status Filter */}
                        <div className="relative">
                            <details className="group">
                                <summary className="list-none cursor-pointer px-2 py-1.5 md:px-3 md:py-2 border border-gray-300 rounded-lg text-xs md:text-sm focus:ring-[#d8454f] focus:border-[#d8454f] outline-none bg-white select-none">
                                    {statusMap[statusFilter] || "Төлөв"}
                                </summary>
                                <div className="absolute z-10 mt-1 w-full min-w-[120px] bg-white border border-gray-300 rounded-lg shadow-lg">
                                    <div className="p-1">
                                        {Object.entries(statusMap).map(([value, label]) => (
                                            <button
                                                key={value}
                                                onClick={(e) => {
                                                    setStatusFilter(value);
                                                    setCurrentPage(1);
                                                    e.currentTarget.closest("details")?.removeAttribute("open");
                                                }}
                                                className={`w-full text-left px-2 py-1.5 md:px-3 md:py-2 text-xs md:text-sm rounded hover:bg-gray-50 ${statusFilter === value ? "text-[#d8454f] font-bold bg-red-50" : "text-gray-700"}`}
                                            >
                                                {label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </details>
                        </div>

                        {/* Type Filter */}
                        <div className="relative">
                            <details className="group">
                                <summary className="list-none cursor-pointer px-2 py-1.5 md:px-3 md:py-2 border border-gray-300 rounded-lg text-xs md:text-sm focus:ring-[#d8454f] focus:border-[#d8454f] outline-none bg-white select-none">
                                    {typeMap[typeFilter] || "Төрөл"}
                                </summary>
                                <div className="absolute z-10 mt-1 w-full min-w-[120px] bg-white border border-gray-300 rounded-lg shadow-lg">
                                    <div className="p-1">
                                        {Object.entries(typeMap).map(([value, label]) => (
                                            <button
                                                key={value}
                                                onClick={(e) => {
                                                    setTypeFilter(value);
                                                    setCurrentPage(1);
                                                    e.currentTarget.closest("details")?.removeAttribute("open");
                                                }}
                                                className={`w-full text-left px-2 py-1.5 md:px-3 md:py-2 text-xs md:text-sm rounded hover:bg-gray-50 ${typeFilter === value ? "text-[#d8454f] font-bold bg-red-50" : "text-gray-700"}`}
                                            >
                                                {label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </details>
                        </div>

                        {/* Genre Filter (Multi-select with checkboxes) */}
                        <div className="relative">
                            <details className="group">
                                <summary className="list-none cursor-pointer px-2 py-1.5 md:px-3 md:py-2 border border-gray-300 rounded-lg text-xs md:text-sm focus:ring-[#d8454f] focus:border-[#d8454f] outline-none bg-white select-none">
                                    {selectedGenres.length > 0
                                        ? `Төрөл (${selectedGenres.length})`
                                        : 'Ангилал'}
                                </summary>
                                <div className="absolute z-10 mt-1 w-48 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                    <div className="p-2 space-y-2">
                                        {allGenres.map(genre => (
                                            <label key={genre.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedGenres.includes(genre.id)}
                                                    onChange={() => toggleGenre(genre.id)}
                                                    className="rounded border-gray-300 text-[#d8454f] focus:ring-[#d8454f]"
                                                />
                                                <span className="text-xs md:text-sm text-gray-700">
                                                    {genre.nameMn}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </details>
                        </div>

                        {/* Sort */}
                        <div className="relative">
                            <details className="group">
                                <summary className="list-none cursor-pointer px-2 py-1.5 md:px-3 md:py-2 border border-gray-300 rounded-lg text-xs md:text-sm focus:ring-[#d8454f] focus:border-[#d8454f] outline-none bg-white select-none">
                                    {sortMap[sortBy] || "Эрэмбэ"}
                                </summary>
                                <div className="absolute z-10 mt-1 w-full min-w-[140px] left-0 md:right-0 md:left-auto bg-white border border-gray-300 rounded-lg shadow-lg">
                                    <div className="p-1">
                                        {Object.entries(sortMap).map(([value, label]) => (
                                            <button
                                                key={value}
                                                onClick={(e) => {
                                                    setSortBy(value);
                                                    setCurrentPage(1);
                                                    e.currentTarget.closest("details")?.removeAttribute("open");
                                                }}
                                                className={`w-full text-left px-2 py-1.5 md:px-3 md:py-2 text-xs md:text-sm rounded hover:bg-gray-50 ${sortBy === value ? "text-[#d8454f] font-bold bg-red-50" : "text-gray-700"}`}
                                            >
                                                {label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </details>
                        </div>

                        {/* Boolean Toggles */}
                        <div className="flex gap-2">
                            <button
                                onClick={() => { setIsAdultFilter(!isAdultFilter); setCurrentPage(1); }}
                                className={`px-2 py-1.5 md:px-3 md:py-2 border rounded-lg text-xs md:text-sm font-medium transition-colors ${isAdultFilter ? "bg-[#d8454f] text-white border-[#d8454f]" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"}`}
                            >
                                18+
                            </button>
                            <button
                                onClick={() => { setIsOneshotFilter(!isOneshotFilter); setCurrentPage(1); }}
                                className={`px-2 py-1.5 md:px-3 md:py-2 border rounded-lg text-xs md:text-sm font-medium transition-colors ${isOneshotFilter ? "bg-[#d8454f] text-white border-[#d8454f]" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"}`}
                            >
                                Oneshot
                            </button>
                        </div>

                        {/* Clear Button - spans 2 columns on mobile */}
                        <button
                            onClick={clearFilters}
                            className="col-span-2 md:col-span-1 px-3 py-1.5 md:px-4 md:py-2 bg-red-50 text-red-600 rounded-lg text-xs md:text-sm font-medium hover:bg-red-100 transition-colors whitespace-nowrap"
                        >
                            Цэвэрлэх
                        </button>
                    </div>
                </div>

                {/* Results Count */}
                <div className="mb-6">
                    <p className="text-sm text-gray-500">
                        {totalMangas} илэрц олдлоо
                    </p>
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
                ) : (
                    <div className="text-center py-20 bg-gray-50 rounded-xl border border-gray-200">
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
