"use client";

import { useState, useEffect } from "react";
import { listR2Covers } from "@/app/actions/r2";
import Image from "next/image";

interface SelectCoverModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (url: string) => void;
}

export default function SelectCoverModal({ isOpen, onClose, onSelect }: SelectCoverModalProps) {
    const [covers, setCovers] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (isOpen && covers.length === 0) {
            setIsLoading(true);
            listR2Covers()
                .then((res) => {
                    if (res.success && res.covers) {
                        setCovers(res.covers);
                    } else {
                        setError(res.error || "Failed to load covers");
                    }
                })
                .catch(() => setError("Failed to load covers"))
                .finally(() => setIsLoading(false));
        }
    }, [isOpen, covers.length]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-gray-900">Select Metadata Cover</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-full">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#d8454f]"></div>
                        </div>
                    ) : error ? (
                        <div className="text-center text-red-500 py-10">{error}</div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {covers.map((url, idx) => (
                                <div
                                    key={idx}
                                    className="group relative aspect-[2/3] bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-[#d8454f] transition-all"
                                    onClick={() => {
                                        onSelect(url);
                                        onClose();
                                    }}
                                >
                                    <Image
                                        src={url}
                                        alt={`Cover ${idx}`}
                                        fill
                                        className="object-cover transition-transform group-hover:scale-105"
                                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-gray-100 bg-gray-50 text-right">
                    <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium">
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
