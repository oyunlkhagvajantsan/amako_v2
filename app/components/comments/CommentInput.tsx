"use client";

import { useState } from "react";
import { Send } from "lucide-react";

interface CommentInputProps {
    onSubmit: (content: string) => Promise<void>;
    placeholder?: string;
    initialValue?: string;
    isReply?: boolean;
    onCancel?: () => void;
    isLoading?: boolean;
    variant?: 'light' | 'dark';
}

export default function CommentInput({
    onSubmit,
    placeholder = "Сэтгэгдэл бичих...",
    initialValue = "",
    isReply,
    onCancel,
    isLoading: externalIsLoading,
    variant = 'light'
}: CommentInputProps) {
    const [content, setContent] = useState(initialValue);
    const [internalIsLoading, setInternalIsLoading] = useState(false);

    const isLoading = externalIsLoading ?? internalIsLoading;
    const isDark = variant === 'dark';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim() || isLoading) return;

        setInternalIsLoading(true);
        try {
            await onSubmit(content);
            setContent("");
        } catch (error) {
            console.error("Submit comment error:", error);
        } finally {
            setInternalIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className={`w-full ${isReply ? "mt-4" : "mb-10 animate-in slide-in-from-bottom-2 duration-300"}`}>
            <div className="relative group">
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder={placeholder}
                    className={`w-full border-2 focus:ring-4 focus:ring-[#d8454f]/5 rounded-2xl p-4 pr-16 placeholder-gray-400 resize-none transition-all duration-300 outline-none
                        ${isDark
                            ? "bg-white/5 border-white/10 text-white focus:border-[#d8454f] focus:bg-white/10"
                            : "bg-white border-gray-100 text-gray-900 focus:border-[#d8454f] focus:ring-4"
                        }
                        ${isReply ? "text-sm min-h-[90px]" : "min-h-[120px] shadow-sm hover:border-gray-200 group-focus-within:shadow-md"}
                    `}
                />
                <button
                    type="submit"
                    disabled={!content.trim() || isLoading}
                    className={`absolute right-4 bottom-4 p-3 rounded-xl transition-all duration-300
                        ${content.trim() && !isLoading
                            ? "bg-[#d8454f] text-white shadow-lg shadow-red-500/20 hover:scale-105 active:scale-95 translate-y-0"
                            : isDark ? "bg-white/5 text-gray-600 cursor-not-allowed" : "bg-gray-100 text-gray-300 cursor-not-allowed"}
                    `}
                >
                    <Send size={isReply ? 18 : 20} className={isLoading ? "animate-pulse" : ""} />
                </button>
            </div>
            {isReply && onCancel && (
                <div className="flex justify-end mt-2 px-1">
                    <button
                        type="button"
                        onClick={onCancel}
                        className={`text-xs font-bold transition-colors px-4 py-2 rounded-lg ${isDark ? "text-gray-500 hover:text-white hover:bg-white/5" : "text-gray-400 hover:text-gray-900 hover:bg-gray-50"}`}
                    >
                        Цуцлах
                    </button>
                </div>
            )}
        </form>
    );
}
