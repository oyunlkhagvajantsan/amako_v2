"use client";

import { useState } from "react";
import { Send } from "lucide-react";

interface CommentInputProps {
    onSubmit: (content: string) => Promise<void>;
    placeholder?: string;
    initialValue?: string;
    isReply?: boolean;
    onCancel?: () => void;
}

export default function CommentInput({ onSubmit, placeholder = "Сэтгэгдэл бичих...", initialValue = "", isReply, onCancel }: CommentInputProps) {
    const [content, setContent] = useState(initialValue);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim() || isLoading) return;

        setIsLoading(true);
        try {
            await onSubmit(content);
            setContent("");
        } catch (error) {
            console.error("Submit comment error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className={`w-full ${isReply ? "mt-4" : "mb-8 animate-in slide-in-from-bottom-2 duration-300"}`}>
            <div className="relative group">
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder={placeholder}
                    className={`w-full bg-[#1e1e1e] border-2 border-gray-800 focus:border-[#d8454f] rounded-2xl p-4 pr-14 text-white placeholder-gray-500 resize-none transition-all duration-200 outline-none
                        ${isReply ? "text-sm min-h-[80px]" : "min-h-[100px] shadow-lg group-hover:border-gray-700"}
                    `}
                />
                <button
                    type="submit"
                    disabled={!content.trim() || isLoading}
                    className={`absolute right-4 bottom-4 p-2.5 rounded-xl transition-all
                        ${content.trim() && !isLoading
                            ? "bg-[#d8454f] text-white shadow-lg shadow-red-900/20 hover:scale-105 active:scale-95"
                            : "bg-gray-800 text-gray-500 cursor-not-allowed"}
                    `}
                >
                    <Send size={isReply ? 18 : 20} className={isLoading ? "animate-pulse" : ""} />
                </button>
            </div>
            {isReply && onCancel && (
                <div className="flex justify-end mt-2">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="text-gray-500 hover:text-white text-xs font-medium transition-colors px-3 py-1"
                    >
                        Цуцлах
                    </button>
                </div>
            )}
        </form>
    );
}
