"use client";

import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';

interface ThumbnailCropperProps {
    image: string;
    onCropComplete: (croppedBlob: Blob) => void;
    onCancel: () => void;
}

export default function ThumbnailCropper({ image, onCropComplete, onCancel }: ThumbnailCropperProps) {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    const onCropChange = useCallback((location: { x: number, y: number }) => {
        setCrop(location);
    }, []);

    const onZoomChange = useCallback((newZoom: number) => {
        setZoom(newZoom);
    }, []);

    const onCropAreaComplete = useCallback((_croppedArea: any, pixels: any) => {
        setCroppedAreaPixels(pixels);
    }, []);

    const createCroppedImage = async () => {
        try {
            setError(null);
            setSaving(true);

            // Use our proxy route for external images to bypass CORS
            // Local blobs (blob:) don't need proxying
            const finalImageUrl = image.startsWith('http')
                ? `/api/proxy-image?url=${encodeURIComponent(image)}`
                : image;

            const img = new Image();
            img.src = finalImageUrl;

            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = (err) => {
                    console.error("Image load error:", err);
                    reject(new Error("Зургийг боловсруулах явцад алдаа гарлаа. Та дахин оролдоно уу."));
                };
            });

            // The new proxy approach doesn't use `blob` or `objectUrl` directly,
            // so revoking object URL is not needed here.
            // if (blob) URL.revokeObjectURL(objectUrl); 

            if (!croppedAreaPixels) {
                throw new Error("Crop area not defined. Please move the image slightly.");
            }

            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) throw new Error("Could not initialize canvas context");

            // Set canvas size to the desired preview size (e.g., 600x400 for 3:2 ratio)
            canvas.width = 600;
            canvas.height = 400;

            ctx.drawImage(
                img,
                croppedAreaPixels.x,
                croppedAreaPixels.y,
                croppedAreaPixels.width,
                croppedAreaPixels.height,
                0,
                0,
                canvas.width,
                canvas.height
            );

            canvas.toBlob(async (resultBlob) => {
                if (resultBlob) {
                    await onCropComplete(resultBlob);
                    setSaving(false);
                } else {
                    setError("Зургийг боловсруулахад алдаа гарлаа.");
                    setSaving(false);
                }
            }, 'image/webp', 0.8);

        } catch (e: any) {
            console.error("Cropping failed:", e);
            setError("Зургийг уншихад алдаа гарлаа. Та дахин оролдоно уу.");
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center p-4">
            <div className="relative w-full max-w-2xl aspect-square bg-gray-900 rounded-xl overflow-hidden mb-6">
                <Cropper
                    image={image}
                    crop={crop}
                    zoom={zoom}
                    aspect={3 / 2} // Professional landscape preview ratio
                    onCropChange={onCropChange}
                    onCropComplete={onCropAreaComplete}
                    onZoomChange={onZoomChange}
                />
            </div>

            <div className="w-full max-w-sm space-y-6">
                <div className="flex flex-col gap-2">
                    <label className="text-white text-xs font-bold uppercase tracking-wider text-center opacity-70">
                        Zoom to fit
                    </label>
                    <input
                        type="range"
                        value={zoom}
                        min={1}
                        max={3}
                        step={0.1}
                        aria-labelledby="Zoom"
                        onChange={(e) => onZoomChange(Number(e.target.value))}
                        className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#d8454f]"
                    />
                </div>

                <div className="flex gap-4">
                    <button
                        onClick={onCancel}
                        disabled={saving}
                        className="flex-1 px-6 py-3 bg-gray-800 text-white font-bold rounded-xl hover:bg-gray-700 transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={createCroppedImage}
                        disabled={saving}
                        className="flex-1 px-6 py-3 bg-[#d8454f] text-white font-bold rounded-xl hover:bg-[#c13a44] transition-colors shadow-lg shadow-red-900/20 disabled:opacity-70 flex items-center justify-center gap-2"
                    >
                        {saving ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Saving...
                            </>
                        ) : "Apply Crop"}
                    </button>
                </div>
            </div>

            <p className="mt-8 text-gray-500 text-xs italic">
                Drag the image to adjust framing.
            </p>

            {error && (
                <div className="mt-4 p-3 bg-red-900/50 border border-red-500 rounded-lg text-red-200 text-xs max-w-sm text-center">
                    {error}
                </div>
            )}
        </div>
    );
}
