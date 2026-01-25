"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { BookOpen } from "lucide-react";
import ThumbnailCropper from "./ThumbnailCropper";

type Manga = {
    id: number;
    title: string;
    coverImage: string;
};

type ImageItem = {
    id: string; // unique internal ID for keys
    url?: string; // present for existing images
    file?: File; // present for newly added images
};

interface ChapterFormProps {
    mangas: Manga[];
    preselectedMangaId?: string | number;
    mode: 'create' | 'edit';
    initialData?: {
        id: number;
        mangaId: number;
        chapterNumber: number;
        title: string | null;
        images: string[];
        thumbnail: string | null;
        caption: string | null;
        isPublished: boolean;
    };
}

export default function ChapterForm({
    mangas,
    preselectedMangaId,
    mode,
    initialData
}: ChapterFormProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    // Form State
    const [selectedMangaId, setSelectedMangaId] = useState(
        initialData?.mangaId.toString() || preselectedMangaId?.toString() || ""
    );
    const [chapterNumber, setChapterNumber] = useState(initialData?.chapterNumber.toString() || "");
    const [title, setTitle] = useState(initialData?.title || "");
    const [caption, setCaption] = useState(initialData?.caption || "");
    const [isPublished, setIsPublished] = useState(initialData?.isPublished || false);
    const [thumbnailUrl, setThumbnailUrl] = useState(initialData?.thumbnail || "");
    const [croppingImageUrl, setCroppingImageUrl] = useState<string | null>(null);

    // Unified Image List (Existing URLs + New Files)
    const [items, setItems] = useState<ImageItem[]>(
        initialData?.images.map((url, idx) => ({
            id: `existing-${idx}`,
            url
        })) || []
    );

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files).map(file => ({
                id: `new-${Date.now()}-${Math.random()}`,
                file
            }));
            setItems(prev => [...prev, ...newFiles]);
        }
    };

    const moveItem = (index: number, direction: 'up' | 'down') => {
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === items.length - 1) return;

        const newItems = [...items];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
        setItems(newItems);
    };

    const removeItem = (index: number) => {
        setItems(prev => prev.filter((_, i) => i !== index));
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
                    0.7
                );
            };
            img.onerror = () => {
                URL.revokeObjectURL(url);
                reject(new Error("Image loading failed"));
            };
        });
    };

    const handleCropSave = async (blob: Blob) => {
        if (!selectedMangaId) {
            setError("Please select a manga before adjusting preview.");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            const formData = new FormData();
            formData.append('file', blob, 'thumbnail.webp');
            formData.append('mangaId', selectedMangaId);
            formData.append('chapterNumber', chapterNumber);

            const res = await fetch('/api/upload/chapter', {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({ error: 'Upload failed' }));
                throw new Error(errData.error || "Thumbnail upload failed");
            }

            const { url } = await res.json();

            // Add a cache-busting timestamp to ensure the UI updates immediately
            setThumbnailUrl(`${url}?t=${Date.now()}`);
            setCroppingImageUrl(null); // Close modal only on success

        } catch (err: any) {
            console.error("Cropping upload error:", err);
            setError(`Thumbnail error: ${err.message}`);
            // Keep modal open so they can see the error in the console or retry
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedMangaId) {
            setError("Please select a manga.");
            return;
        }
        if (items.length === 0) {
            setError("Please add at least one image.");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            const finalImageUrls: string[] = new Array(items.length);

            // 1. Process and Upload ONLY new files
            const uploadTasks = items
                .map((item, index) => ({ item, index }))
                .filter(t => !!t.item.file);

            const totalTasks = uploadTasks.length;
            let completedUploads = 0;

            if (totalTasks > 0) {
                // Use a standard task queue to avoid race conditions and handle progress accurately
                const queue = [...uploadTasks];
                const CONCURRENCY = 2; // Reduced for stability
                const MAX_RETRIES = 3;

                const runWorker = async () => {
                    while (queue.length > 0) {
                        const task = queue.shift();
                        if (!task) break;

                        const { item, index } = task;
                        const file = item.file!;

                        let attempts = 0;
                        let lastError;

                        while (attempts < MAX_RETRIES) {
                            attempts++;
                            try {
                                setUploadProgress({
                                    current: completedUploads + 1,
                                    total: totalTasks,
                                    stage: 'converting'
                                });

                                let finalBlob: Blob = file;
                                let finalFileName = file.name;

                                // Convert to WebP if it's an image
                                if (file.type.startsWith('image/')) {
                                    try {
                                        const { blob } = await convertToWebP(file);
                                        finalBlob = blob;
                                        // Change extension to .webp to trigger server-side detection
                                        finalFileName = file.name.replace(/\.[^/.]+$/, "") + ".webp";
                                    } catch (err) {
                                        console.error("WebP conversion failed, using original", err);
                                    }
                                }

                                setUploadProgress({
                                    current: completedUploads + 1,
                                    total: totalTasks,
                                    stage: 'uploading'
                                });

                                const uploadFormData = new FormData();
                                // Pass the blob and explicitly set the webp filename
                                uploadFormData.append('file', finalBlob, finalFileName);
                                uploadFormData.append('mangaId', selectedMangaId);
                                uploadFormData.append('chapterNumber', chapterNumber);

                                const uploadRes = await fetch('/api/upload/chapter', {
                                    method: 'POST',
                                    body: uploadFormData,
                                });

                                if (!uploadRes.ok) {
                                    const errData = await uploadRes.json();
                                    throw new Error(errData.error || 'Upload failed');
                                }

                                const { url } = await uploadRes.json();
                                finalImageUrls[index] = url;
                                completedUploads++;

                                setUploadProgress({
                                    current: Math.min(completedUploads + 1, totalTasks),
                                    total: totalTasks,
                                    stage: 'uploading'
                                });

                                // Success! Break retry loop
                                break;
                            } catch (err: any) {
                                lastError = err;
                                console.warn(`Upload attempt ${attempts} failed for page ${index + 1}:`, err);
                                if (attempts < MAX_RETRIES) {
                                    // Wait a bit before retrying (exponential backoff)
                                    await new Promise(r => setTimeout(r, 1000 * attempts));
                                } else {
                                    // Throw the last error to be caught by the outer catch
                                    throw new Error(`Failed uploading page ${index + 1} after ${MAX_RETRIES} attempts: ${err.message}`);
                                }
                            }
                        }
                    }
                };

                // Run workers in parallel
                await Promise.all(
                    Array(Math.min(CONCURRENCY, totalTasks))
                        .fill(null)
                        .map(() => runWorker())
                );
            }

            // 2. Fill in existing URLs
            items.forEach((item, index) => {
                if (item.url) finalImageUrls[index] = item.url;
            });

            // 3. Finalize Chapter in DB
            const chapterData = {
                chapterNumber: parseFloat(chapterNumber),
                title,
                images: finalImageUrls,
                isPublished,
                mangaId: parseInt(selectedMangaId),
            };

            const endpoint = mode === 'create'
                ? `/api/manga/${selectedMangaId}/chapters`
                : `/api/manga/${selectedMangaId}/chapters/${initialData?.id}`;

            const method = mode === 'create' ? 'POST' : 'PATCH';

            // Ensure we use JSON for PATCH if we can't easily multi-part the array
            // Actually, chapters route uses FormData for CREATE, let's keep it consistent or use JSON.
            // Let's use JSON for both for simplicity in the reusable component if possible.
            // BUT existing API expects FormData. I'll stick to FormData for CREATE and build PATCH to match.

            const finalFormData = new FormData();
            finalFormData.append('chapterNumber', chapterNumber);
            finalFormData.append('title', title);
            finalFormData.append('caption', caption);
            finalFormData.append('isPublished', isPublished ? "on" : "off");
            finalFormData.append('thumbnailUrl', thumbnailUrl);
            finalImageUrls.forEach(url => finalFormData.append('imageUrls', url));

            const res = await fetch(endpoint, {
                method: method,
                body: finalFormData,
            });

            if (!res.ok) {
                let errorMessage;
                try {
                    const errorData = await res.json();
                    errorMessage = errorData.error || errorData.details || `Failed to ${mode} chapter`;
                } catch (e) {
                    errorMessage = await res.text() || `Failed to ${mode} chapter`;
                }
                throw new Error(errorMessage);
            }

            router.push("/amako-portal-v7/chapters");
            router.refresh();

        } catch (err: any) {
            setError(err.message || "Something went wrong.");
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#d8454f] focus:border-[#d8454f] outline-none disabled:bg-gray-100"
                    required
                    disabled={mode === 'edit'}
                >
                    <option value="">-- Choose a Manga --</option>
                    {mangas.map((manga) => (
                        <option key={manga.id} value={String(manga.id)}>
                            {manga.title}
                        </option>
                    ))}
                </select>
                {mode === 'edit' && <p className="text-[10px] text-gray-400 mt-1">Manga cannot be changed during edit.</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="text-sm font-medium text-gray-700">Chapter Number</label>
                    <input
                        value={chapterNumber}
                        onChange={(e) => setChapterNumber(e.target.value)}
                        type="number"
                        step="0.1"
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#d8454f] focus:border-[#d8454f] outline-none mt-1"
                        placeholder="Ex: 1"
                    />
                </div>
                <div>
                    <label className="text-sm font-medium text-gray-700">Chapter Title (Optional)</label>
                    <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        type="text"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#d8454f] focus:border-[#d8454f] outline-none mt-1"
                        placeholder="Ex: The Beginning"
                    />
                </div>
            </div>

            {/* Chapter Caption */}
            <div>
                <label className="text-sm font-medium text-gray-700">Chapter Caption (Shows at the end of reader)</label>
                <textarea
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#d8454f] focus:border-[#d8454f] outline-none mt-1 resize-none"
                    placeholder="Ex: Thank you for reading! Next chapter coming soon..."
                />
                <p className="text-[10px] text-gray-400 mt-1">This note will be displayed in a special box after the last page of the chapter.</p>
            </div>

            {/* Image Management */}
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-gray-700">Images ({items.length})</label>
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-sm text-[#d8454f] font-bold hover:underline"
                    >
                        + Add Pages
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

                {/* Current Preview Highlight */}
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex flex-col md:flex-row items-center gap-6">
                    <div className="relative w-40 h-28 bg-gray-200 rounded-lg overflow-hidden border-2 border-[#d8454f] shadow-sm flex-shrink-0">
                        {thumbnailUrl ? (
                            <Image
                                src={thumbnailUrl}
                                alt="Current Preview"
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 text-[10px] text-center p-2">
                                <BookOpen size={24} className="mb-1" />
                                No Preview Selected
                            </div>
                        )}
                        {thumbnailUrl && (
                            <div className="absolute top-1 left-1 bg-[#d8454f] text-white text-[8px] px-1.5 py-0.5 rounded font-bold uppercase">
                                Active Preview
                            </div>
                        )}
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <h4 className="font-bold text-gray-900 text-sm mb-1">Chapter Preview (Thumbnail)</h4>
                        <p className="text-xs text-gray-500 mb-3">Pick a page below and click "Adjust Preview" to set it. You can zoom and pan to make it fit perfectly.</p>
                        {thumbnailUrl && (
                            <button
                                type="button"
                                onClick={() => setThumbnailUrl("")}
                                className="text-xs text-red-500 font-medium hover:underline"
                            >
                                Remove Preview
                            </button>
                        )}
                    </div>
                </div>

                {uploadProgress && (
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-4">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-blue-700">
                                {uploadProgress.stage === 'converting' ? `Optimizing page...` : `Uploading page...`}
                            </span>
                            <span className="text-sm font-bold text-blue-700">{uploadProgress.current} / {uploadProgress.total}</span>
                        </div>
                        <div className="w-full bg-blue-200 rounded-full h-2.5">
                            <div
                                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                                style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
                            ></div>
                        </div>
                    </div>
                )}

                {items.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-[500px] overflow-y-auto p-2 border border-dashed border-gray-300 rounded-lg">
                        {items.map((item, index) => (
                            <div key={item.id} className="relative group bg-gray-50 border border-gray-200 rounded-lg p-2 flex flex-col items-center">
                                <div className="absolute top-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1.5 rounded-full z-10 font-bold">
                                    {index + 1}
                                </div>

                                {item.file && (
                                    <div className="absolute top-1 right-1 bg-blue-500 text-white text-[8px] px-1 rounded-sm z-10 font-bold uppercase">
                                        New
                                    </div>
                                )}

                                <div className={`relative w-full h-32 mb-2 bg-gray-200 rounded overflow-hidden border-2 transition-all ${thumbnailUrl === (item.url || "") ? 'border-green-500 ring-2 ring-green-200' : 'border-transparent'}`}>
                                    <Image
                                        src={item.url || (item.file ? URL.createObjectURL(item.file) : "")}
                                        alt="preview"
                                        fill
                                        className="object-cover"
                                        onLoad={(e) => { if (item.file) URL.revokeObjectURL((e.target as HTMLImageElement).src); }}
                                    />
                                    {thumbnailUrl === item.url && item.url && (
                                        <div className="absolute inset-0 bg-green-500/10 flex items-center justify-center">
                                            <span className="bg-green-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">PREVIEW</span>
                                        </div>
                                    )}
                                </div>

                                <p className="text-[10px] text-gray-500 truncate w-full text-center mb-2">
                                    {item.file ? item.file.name : item.url?.split('/').pop()}
                                </p>

                                <div className="flex flex-wrap gap-1 w-full justify-center">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (item.url) {
                                                setCroppingImageUrl(item.url);
                                            } else if (item.file) {
                                                setCroppingImageUrl(URL.createObjectURL(item.file));
                                            }
                                        }}
                                        disabled={!item.url && !item.file}
                                        className={`text-[10px] px-2 py-1 rounded font-bold transition-colors w-full mb-1 ${thumbnailUrl === item.url
                                            ? 'bg-green-500 text-white'
                                            : (item.url || item.file)
                                                ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                : 'bg-gray-50 text-gray-300 cursor-not-allowed opacity-50'
                                            }`}
                                    >
                                        {thumbnailUrl === item.url ? "✅ Preview Selected (Adjust)" : "Adjust Preview"}
                                    </button>
                                    <div className="flex gap-1 w-full justify-center">
                                        <button
                                            type="button"
                                            onClick={() => moveItem(index, 'up')}
                                            disabled={index === 0}
                                            className="p-1 bg-white border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-30"
                                        >
                                            ⬆️
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => moveItem(index, 'down')}
                                            disabled={index === items.length - 1}
                                            className="p-1 bg-white border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-30"
                                        >
                                            ⬇️
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => removeItem(index)}
                                            className="p-1 bg-white border border-red-200 text-red-500 rounded hover:bg-red-50"
                                        >
                                            ❌
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center cursor-pointer hover:border-[#d8454f] hover:bg-red-50 transition-colors"
                    >
                        <p className="text-gray-500 text-sm">Click here to start adding manga pages</p>
                    </div>
                )}
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                <span className="font-medium text-gray-700">Visibility</span>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        checked={isPublished}
                        onChange={(e) => setIsPublished(e.target.checked)}
                        className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#d8454f]"></div>
                    <span className="ml-3 text-sm font-medium text-gray-900">{isPublished ? "Visible to Readers" : "Draft (Staff Only)"}</span>
                </label>
            </div>

            <div className="pt-4">
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-4 px-4 bg-[#d8454f] hover:bg-[#c13a44] text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-70 disabled:transform-none"
                >
                    {isLoading ? (mode === 'create' ? "Creating Chapter..." : "Saving Changes...") : (mode === 'create' ? "🚀 Create Chapter" : "💾 Save Changes")}
                </button>
            </div>

            {/* Cropping Modal */}
            {croppingImageUrl && (
                <ThumbnailCropper
                    image={croppingImageUrl}
                    onCropComplete={handleCropSave}
                    onCancel={() => setCroppingImageUrl(null)}
                />
            )}
        </form>
    );
}
