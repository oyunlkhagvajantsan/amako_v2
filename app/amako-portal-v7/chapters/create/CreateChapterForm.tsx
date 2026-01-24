"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

type Manga = {
    id: number;
    title: string;
    coverImage: string;
};

export default function CreateChapterForm({
    mangas,
    preselectedMangaId
}: {
    mangas: Manga[];
    preselectedMangaId?: string | number;
}) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    // Form State - Initialize with preselected manga if provided
    const [selectedMangaId, setSelectedMangaId] = useState(preselectedMangaId?.toString() || "");
    const [selectedImages, setSelectedImages] = useState<File[]>([]);

    // File Input Ref
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            // Append new files to existing ones
            const newFiles = Array.from(e.target.files);
            setSelectedImages(prev => [...prev, ...newFiles]);
        }
    };

    const moveImage = (index: number, direction: 'up' | 'down') => {
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === selectedImages.length - 1) return;

        const newImages = [...selectedImages];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;

        // Swap
        [newImages[index], newImages[targetIndex]] = [newImages[targetIndex], newImages[index]];
        setSelectedImages(newImages);
    };

    const removeImage = (index: number) => {
        setSelectedImages(prev => prev.filter((_, i) => i !== index));
    };

    const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number; stage: 'converting' | 'uploading' } | null>(null);

    const convertToWebP = async (file: File): Promise<{ blob: Blob; type: string }> => {
        return new Promise((resolve, reject) => {
            const url = URL.createObjectURL(file);
            const img = new window.Image();
            img.src = url;
            img.onload = () => {
                URL.revokeObjectURL(url);
                const canvas = document.createElement('canvas');

                // Max width for manga/manhwa - 1200px is a good standard
                const MAX_WIDTH = 1200;
                let width = img.naturalWidth;
                let height = img.naturalHeight;

                if (width > MAX_WIDTH) {
                    height = Math.round((height * MAX_WIDTH) / width);
                    width = MAX_WIDTH;
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error("Failed to get canvas context"));
                    return;
                }

                // Use better image smoothing
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';

                ctx.drawImage(img, 0, 0, width, height);
                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            resolve({ blob, type: blob.type });
                        } else {
                            reject(new Error("Canvas to Blob conversion failed"));
                        }
                    },
                    'image/webp',
                    0.7 // Sweet spot for manga quality vs size
                );
            };
            img.onerror = (err) => {
                URL.revokeObjectURL(url);
                reject(new Error("Image loading failed"));
            };
        });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;

        if (!selectedMangaId) {
            setError("Please select a manga.");
            return;
        }
        if (selectedImages.length === 0) {
            setError("Please select at least one image.");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            const imageUrls: string[] = new Array(selectedImages.length);

            // CONCURRENCY CONTROL: Process 3 uploads at a time
            const CONCURRENCY = 3;
            const tasks = selectedImages.map((file, index) => ({ file, index }));
            let completedCount = 0;

            const runWorker = async () => {
                while (tasks.length > 0) {
                    const task = tasks.shift();
                    if (!task) break;

                    const { file, index } = task;

                    try {
                        // Stage: converting
                        setUploadProgress({ current: completedCount + 1, total: selectedImages.length, stage: 'converting' });

                        let finalBlob: Blob = file;
                        let finalFileName = file.name;

                        // Force conversion to WebP even if already WebP (to resize and compress)
                        if (file.type.startsWith('image/')) {
                            try {
                                const { blob: webpBlob, type: webpType } = await convertToWebP(file);
                                if (webpType === 'image/webp') {
                                    finalBlob = webpBlob;
                                    finalFileName = file.name.replace(/\.[^/.]+$/, "") + ".webp";
                                }
                            } catch (convErr) {
                                console.error(`WebP conversion failed for ${file.name}, using original:`, convErr);
                            }
                        }

                        // Stage: uploading to R2
                        setUploadProgress({ current: completedCount + 1, total: selectedImages.length, stage: 'uploading' });

                        // Create FormData for multipart upload
                        const uploadFormData = new FormData();
                        uploadFormData.append('file', finalBlob, finalFileName);

                        // Capture chapter metadata for R2 folder structure
                        const chapterNumber = (form.elements.namedItem('chapterNumber') as HTMLInputElement).value;
                        uploadFormData.append('mangaId', selectedMangaId);
                        uploadFormData.append('chapterNumber', chapterNumber);

                        const uploadRes = await fetch('/api/upload/chapter', {
                            method: 'POST',
                            body: uploadFormData,
                        });

                        if (!uploadRes.ok) {
                            const error = await uploadRes.json();
                            throw new Error(error.error || 'Upload failed');
                        }

                        const { url } = await uploadRes.json();
                        imageUrls[index] = url;
                        completedCount++;
                        setUploadProgress({ current: completedCount, total: selectedImages.length, stage: 'uploading' });
                    } catch (err) {
                        console.error(`Failed to upload ${file.name}:`, err);
                        throw err; // Fail fast if any upload fails
                    }
                }
            };

            // Start workers
            await Promise.all(
                Array(Math.min(CONCURRENCY, tasks.length))
                    .fill(null)
                    .map(() => runWorker())
            );

            // 2. Submit chapter metadata and Blob URLs to our backend
            const formData = new FormData(form);
            imageUrls.forEach((url) => {
                formData.append("imageUrls", url);
            });
            formData.set("mangaId", selectedMangaId);

            const res = await fetch(`/api/manga/${selectedMangaId}/chapters`, {
                method: "POST",
                body: formData,
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || "Failed to create chapter");
            }

            router.push("/amako-portal-v7/chapters");
            router.refresh();
        } catch (err: any) {
            setError(err.message || "Something went wrong during upload.");
        } finally {
            setIsLoading(false);
            setUploadProgress(null);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm space-y-6">
            {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                    {error}
                </div>
            )}

            {/* Manga Selection */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Manga</label>
                <select
                    value={selectedMangaId}
                    onChange={(e) => setSelectedMangaId(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#d8454f] focus:border-[#d8454f] outline-none"
                    required
                >
                    <option value="">-- Choose a Manga --</option>
                    {mangas.map((manga) => (
                        <option key={manga.id} value={String(manga.id)}>
                            {manga.title}
                        </option>
                    ))}
                </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="text-sm font-medium text-gray-700">Chapter Number</label>
                    <input
                        name="chapterNumber"
                        type="number"
                        step="0.1"
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#d8454f] focus:border-[#d8454f] outline-none mt-1"
                        placeholder="Ex: 1"
                    />
                </div>
                <div>
                    <label className="text-sm font-medium text-gray-700">Chapter Title</label>
                    <input
                        name="title"
                        type="text"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#d8454f] focus:border-[#d8454f] outline-none mt-1"
                        placeholder="Ex: The Beginning"
                    />
                </div>
            </div>

            {/* Image Upload & Reorder */}
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-gray-700">Images ({selectedImages.length})</label>
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-sm text-[#d8454f] font-bold hover:underline"
                    >
                        + Add Images
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                    />
                </div>

                {uploadProgress && (
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-4 animate-pulse">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-blue-700">
                                {uploadProgress.stage === 'converting' ? `Processing image ${uploadProgress.current}...` : `Uploading image ${uploadProgress.current}...`}
                            </span>
                            <span className="text-sm font-bold text-blue-700">{uploadProgress.current} / {uploadProgress.total}</span>
                        </div>
                        <div className="w-full bg-blue-200 rounded-full h-2.5">
                            <div
                                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                                style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
                            ></div>
                        </div>
                        <p className="text-[10px] text-blue-500 mt-2 text-center">
                            Please don't close this page until the upload is finished.
                        </p>
                    </div>
                )}

                {selectedImages.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-[400px] overflow-y-auto p-2 border border-dashed border-gray-300 rounded-lg">
                        {selectedImages.map((file, index) => (
                            <div key={index} className="relative group bg-gray-50 border border-gray-200 rounded-lg p-2 flex flex-col items-center">
                                <div className="absolute top-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1.5 rounded-full z-10">
                                    {index + 1}
                                </div>
                                <div className="relative w-full h-32 mb-2 bg-gray-200 rounded overflow-hidden">
                                    <Image
                                        src={URL.createObjectURL(file)}
                                        alt="preview"
                                        fill
                                        className="object-cover"
                                        onLoad={(e) => URL.revokeObjectURL((e.target as HTMLImageElement).src)}
                                    />
                                </div>
                                <p className="text-[10px] text-gray-500 truncate w-full text-center mb-2">
                                    {file.name}
                                </p>
                                <div className="flex gap-1 w-full justify-center">
                                    <button
                                        type="button"
                                        onClick={() => moveImage(index, 'up')}
                                        disabled={index === 0}
                                        className="p-1 bg-white border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-30"
                                        title="Move Up"
                                    >
                                        ⬆️
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => moveImage(index, 'down')}
                                        disabled={index === selectedImages.length - 1}
                                        className="p-1 bg-white border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-30"
                                        title="Move Down"
                                    >
                                        ⬇️
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => removeImage(index)}
                                        className="p-1 bg-white border border-red-200 text-red-500 rounded hover:bg-red-50"
                                        title="Remove"
                                    >
                                        ❌
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-[#d8454f] hover:bg-red-50 transition-colors"
                    >
                        <p className="text-gray-500 text-sm">Click to upload images</p>
                    </div>
                )}
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                <span className="font-medium text-gray-700">Status</span>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" name="isPublished" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#d8454f]"></div>
                    <span className="ml-3 text-sm font-medium text-gray-900">Publish Immediately</span>
                </label>
            </div>

            <div className="pt-4">
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 px-4 bg-[#d8454f] hover:bg-[#c13a44] text-white font-medium rounded-lg transition-colors disabled:opacity-70"
                >
                    {isLoading ? "Uploading..." : "Create Chapter"}
                </button>
            </div>
        </form>
    );
}
