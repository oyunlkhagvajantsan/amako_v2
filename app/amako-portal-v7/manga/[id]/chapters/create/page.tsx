"use client";

import { useState, use } from "react";
import { useRouter, useParams } from "next/navigation";

export default function CreateChapterPage() {
    const params = useParams();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        const formData = new FormData(e.currentTarget);

        try {
            const res = await fetch(`/api/manga/${params.id}/chapters`, {
                method: "POST",
                body: formData,
            });

            if (!res.ok) {
                throw new Error("Failed to create chapter");
            }

            router.push("/amako-portal-v7/manga");
            router.refresh();
        } catch (err) {
            setError("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-6 text-gray-900">Шинэ бүлэг нэмэх</h1>

            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm space-y-6">
                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Бүлгийн дугаар</label>
                        <input
                            name="chapterNumber"
                            type="number"
                            step="0.1"
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#d8454f] focus:border-[#d8454f] outline-none transition-colors"
                            placeholder="Ex: 1"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Бүлгийн нэр (Заавал биш)</label>
                        <input
                            name="title"
                            type="text"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#d8454f] focus:border-[#d8454f] outline-none transition-colors"
                            placeholder="Ex: The Beginning"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Манга зургууд (Олон сонгох)</label>
                    <input
                        name="images"
                        type="file"
                        accept="image/*"
                        multiple
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#d8454f] focus:border-[#d8454f] outline-none transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-50 file:text-[#d8454f] hover:file:bg-gray-100"
                    />
                    <p className="text-xs text-gray-500">
                        Зургуудыг дарааллаар нь сонгоно уу. (01.jpg, 02.jpg...)
                    </p>
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
        </div>
    );
}
