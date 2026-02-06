"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SelectCoverModal from "@/app/components/SelectCoverModal";

type Genre = {
    id: number;
    name: string;
    nameMn: string;
};

export default function CreateMangaPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [genres, setGenres] = useState<Genre[]>([]);
    const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
    const [showCoverModal, setShowCoverModal] = useState(false);
    const [selectedCoverUrl, setSelectedCoverUrl] = useState("");

    // Fetch genres on mount
    useEffect(() => {
        fetch("/api/genres")
            .then((res) => res.json())
            .then((data) => {
                if (Array.isArray(data)) {
                    setGenres(data);
                } else {
                    console.error("Genres data is not an array:", data);
                    setGenres([]);
                }
            })
            .catch((err) => console.error("Failed to fetch genres:", err));
    }, []);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        const formData = new FormData(e.currentTarget);

        // Append selected genres
        selectedGenres.forEach((genreId) => {
            formData.append("genreIds", genreId.toString());
        });

        if (selectedCoverUrl) {
            formData.append("coverImageUrl", selectedCoverUrl);
        }

        try {
            const res = await fetch("/api/manga", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to create manga");
            }

            router.push("/amako-portal-v7");
            router.refresh();
        } catch (err: any) {
            setError(err.message || "Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const toggleGenre = (genreId: number) => {
        setSelectedGenres((prev) =>
            prev.includes(genreId)
                ? prev.filter((id) => id !== genreId)
                : [...prev, genreId]
        );
    };

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-6 text-gray-900">Шинэ гаргалт нэмэх</h1>

            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm space-y-6">
                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Манга нэр (English)</label>
                        <input
                            name="title"
                            type="text"
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#d8454f] focus:border-[#d8454f] outline-none transition-colors"
                            placeholder="Ex: Solo Leveling"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Манга нэр (Mongolian)</label>
                        <input
                            name="titleMn"
                            type="text"
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#d8454f] focus:border-[#d8454f] outline-none transition-colors"
                            placeholder="Жишээ: Соло Левелинг"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Тайлбар</label>
                    <textarea
                        name="description"
                        rows={4}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#d8454f] focus:border-[#d8454f] outline-none transition-colors"
                        placeholder="Манганы тухай товч..."
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Зохиолч</label>
                        <input
                            name="author"
                            type="text"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#d8454f] focus:border-[#d8454f] outline-none transition-colors"
                            placeholder="Зохиолч"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Зураач</label>
                        <input
                            name="artist"
                            type="text"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#d8454f] focus:border-[#d8454f] outline-none transition-colors"
                            placeholder="Зураач"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Төлөв</label>
                        <select
                            name="status"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#d8454f] focus:border-[#d8454f] outline-none transition-colors"
                        >
                            <option value="ONGOING">Ongoing</option>
                            <option value="COMPLETED">Completed</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Төрөл</label>
                        <select
                            name="type"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#d8454f] focus:border-[#d8454f] outline-none transition-colors"
                        >
                            <option value="MANGA">Манга</option>
                            <option value="MANHWA">Манхва</option>
                            <option value="MANHUA">Манхуа</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Гарч эхэлсэн он</label>
                        <input
                            name="publishYear"
                            type="number"
                            min="1900"
                            max="2100"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#d8454f] focus:border-[#d8454f] outline-none transition-colors"
                            placeholder="жнь: 2020"
                        />
                    </div>
                </div>

                <div className="flex gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            name="isAdult"
                            type="checkbox"
                            className="w-4 h-4 text-[#d8454f] border-gray-300 rounded focus:ring-[#d8454f]"
                        />
                        <span className="text-sm font-medium text-gray-700">18+</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            name="isOneshot"
                            type="checkbox"
                            className="w-4 h-4 text-[#d8454f] border-gray-300 rounded focus:ring-[#d8454f]"
                        />
                        <span className="text-sm font-medium text-gray-700">Oneshot</span>
                    </label>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Төрөл</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-4 border border-gray-300 rounded-lg bg-gray-50 max-h-48 overflow-y-auto">
                        {genres.map((genre) => (
                            <label key={genre.id} className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={selectedGenres.includes(genre.id)}
                                    onChange={() => toggleGenre(genre.id)}
                                    className="w-4 h-4 text-[#d8454f] border-gray-300 rounded focus:ring-[#d8454f]"
                                />
                                <span className="text-sm text-gray-700">{genre.nameMn}</span>
                            </label>
                        ))}
                    </div>
                    {genres.length === 0 && (
                        <p className="text-sm text-gray-500 italic">Төрөл байхгүй байна.</p>
                    )}
                </div>

                <div className="space-y-4">
                    <label className="text-sm font-medium text-gray-700">Cover зураг</label>

                    {selectedCoverUrl ? (
                        <div className="relative aspect-[2/3] w-40 rounded-lg overflow-hidden border border-gray-200 group">
                            <img src={selectedCoverUrl} alt="Selected cover" className="object-cover w-full h-full" />
                            <button
                                type="button"
                                onClick={() => setSelectedCoverUrl("")}
                                className="absolute top-2 right-2 p-1 bg-white/90 rounded-full shadow-sm hover:bg-white text-gray-600 transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <input
                                name="coverImage"
                                type="file"
                                accept="image/*"
                                required={!selectedCoverUrl}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#d8454f] focus:border-[#d8454f] outline-none transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-50 file:text-[#d8454f] hover:file:bg-gray-100"
                            />
                            <button
                                type="button"
                                onClick={() => setShowCoverModal(true)}
                                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                Select from Library
                            </button>
                        </div>
                    )}
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 px-4 bg-[#d8454f] hover:bg-[#c13a44] text-white font-medium rounded-lg transition-colors disabled:opacity-70"
                    >
                        {isLoading ? "Хадгалж байна..." : "Хадгалах"}
                    </button>
                </div>
            </form>

            <SelectCoverModal
                isOpen={showCoverModal}
                onClose={() => setShowCoverModal(false)}
                onSelect={(url) => setSelectedCoverUrl(url)}
            />
        </div>
    );
}
