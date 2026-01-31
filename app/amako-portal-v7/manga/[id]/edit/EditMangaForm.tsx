"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

type Genre = {
    id: number;
    name: string;
    nameMn: string;
};

type MangaData = {
    id: string;
    title: string;
    titleMn: string;
    description: string | null;
    author: string | null;
    artist: string | null;
    status: string;
    type: string;
    publishYear: number | null;
    isAdult: boolean;
    isOneshot: boolean;
    isPublished: boolean;
    coverImage: string;
    genres: Genre[];
};

export default function EditMangaForm({
    manga,
    allGenres,
    isAdmin
}: {
    manga: MangaData;
    allGenres: Genre[];
    isAdmin: boolean;
}) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [selectedGenres, setSelectedGenres] = useState<number[]>(
        manga.genres.map((g) => g.id)
    );

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        const formData = new FormData(e.currentTarget);

        // Append selected genres
        selectedGenres.forEach((genreId) => {
            formData.append("genreIds", String(genreId));
        });

        // Handle isAdult checkbox (if unchecked, it won't be in formData, so we don't need to do anything special as API checks for "on")
        // But wait, uncheck needs to send false? 
        // HTML checkbox sends "on" if checked, nothing if unchecked.
        // My API uses: const isAdult = formData.get("isAdult") === "on";
        // So if I uncheck it, formData.get("isAdult") is null, which !== "on", so it becomes false. Correct.

        try {
            const res = await fetch(`/api/manga/${manga.id}`, {
                method: "PATCH",
                body: formData,
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to update manga");
            }

            router.push("/amako-portal-v7/manga");
            router.refresh();
        } catch (err: any) {
            setError(err.message || "Something went wrong. Please try again.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this manga? This action cannot be undone.")) {
            return;
        }

        try {
            const res = await fetch(`/api/manga/${manga.id}`, {
                method: "DELETE",
            });

            if (!res.ok) {
                throw new Error("Failed to delete manga");
            }

            router.push("/amako-portal-v7/manga");
            router.refresh();
        } catch (err) {
            alert("Failed to delete manga");
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
            <h1 className="text-2xl font-bold mb-6 text-gray-900">Манга засах: {manga.titleMn}</h1>

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
                            defaultValue={manga.title}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#d8454f] focus:border-[#d8454f] outline-none transition-colors"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Манга нэр (Mongolian)</label>
                        <input
                            name="titleMn"
                            type="text"
                            defaultValue={manga.titleMn}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#d8454f] focus:border-[#d8454f] outline-none transition-colors"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Тайлбар</label>
                    <textarea
                        name="description"
                        defaultValue={manga.description || ""}
                        rows={4}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#d8454f] focus:border-[#d8454f] outline-none transition-colors"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Зохиолч</label>
                        <input
                            name="author"
                            type="text"
                            defaultValue={manga.author || ""}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#d8454f] focus:border-[#d8454f] outline-none transition-colors"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Зураач</label>
                        <input
                            name="artist"
                            type="text"
                            defaultValue={manga.artist || ""}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#d8454f] focus:border-[#d8454f] outline-none transition-colors"
                        />
                    </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <span className="font-medium text-gray-700">Нийтлэх</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            name="isPublished"
                            defaultChecked={manga.isPublished}
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#d8454f]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#d8454f]"></div>
                        <span className="ml-3 text-sm font-medium text-gray-900">
                            Нийтлэх
                        </span>
                    </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Төлөв</label>
                        <select
                            name="status"
                            defaultValue={manga.status}
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
                            defaultValue={manga.type}
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
                            defaultValue={manga.publishYear || ""}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#d8454f] focus:border-[#d8454f] outline-none transition-colors"
                        />
                    </div>
                </div>

                <div className="flex gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            name="isAdult"
                            type="checkbox"
                            defaultChecked={manga.isAdult}
                            className="w-4 h-4 text-[#d8454f] border-gray-300 rounded focus:ring-[#d8454f]"
                        />
                        <span className="text-sm font-medium text-gray-700">18+</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            name="isOneshot"
                            type="checkbox"
                            defaultChecked={manga.isOneshot}
                            className="w-4 h-4 text-[#d8454f] border-gray-300 rounded focus:ring-[#d8454f]"
                        />
                        <span className="text-sm font-medium text-gray-700">Oneshot</span>
                    </label>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Төрөл (Genres)</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-4 border border-gray-300 rounded-lg bg-gray-50 max-h-48 overflow-y-auto">
                        {allGenres.map((genre) => (
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
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Cover зураг (Шинэчлэх бол оруулах)</label>

                    <div className="flex gap-4 items-center mb-2">
                        <div className="relative w-20 h-28 rounded-lg overflow-hidden border border-gray-200">
                            <Image
                                src={manga.coverImage}
                                alt={manga.title}
                                fill
                                className="object-cover"
                            />
                        </div>
                        <p className="text-sm text-gray-500">Одоогийн зураг</p>
                    </div>

                    <input
                        name="coverImage"
                        type="file"
                        accept="image/*"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#d8454f] focus:border-[#d8454f] outline-none transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-50 file:text-[#d8454f] hover:file:bg-gray-100"
                    />
                </div>

                <div className="pt-4 flex items-center justify-between">
                    {isAdmin && (
                        <button
                            type="button"
                            onClick={handleDelete}
                            className="px-4 py-3 bg-white border border-red-200 text-red-600 font-medium rounded-lg hover:bg-red-50 transition-colors"
                        >
                            Устгах
                        </button>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="px-8 py-3 bg-[#d8454f] hover:bg-[#c13a44] text-white font-medium rounded-lg transition-colors disabled:opacity-70"
                    >
                        {isLoading ? "Хадгалж байна..." : "Хадгалах"}
                    </button>
                </div>
            </form>
        </div>
    );
}
