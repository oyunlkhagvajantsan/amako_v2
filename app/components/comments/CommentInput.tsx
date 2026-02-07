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
}

export default function CommentInput({
    onSubmit,
    placeholder = "Сэтгэгдэл бичих...",
    initialValue = "",
    isReply,
    onCancel,
    isLoading: externalIsLoading,
}: CommentInputProps) {
    const [content, setContent] = useState(initialValue);
    const [internalIsLoading, setInternalIsLoading] = useState(false);

    const isLoading = externalIsLoading ?? internalIsLoading;

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
                    className={`w-full border-2 focus:ring-4 focus:ring-primary/5 rounded-2xl p-4 pr-16 placeholder:text-muted resize-none transition-all duration-300 outline-none
                        bg-background border-border text-foreground focus:border-primary
                        ${isReply ? "text-sm min-h-[90px]" : "min-h-[120px] shadow-sm hover:border-border/80 group-focus-within:shadow-md"}
                    `}
                />
                <button
                    type="submit"
                    disabled={!content.trim() || isLoading}
                    className={`absolute right-4 bottom-4 p-3 rounded-xl transition-all duration-300
                        ${content.trim() && !isLoading
                            ? "bg-primary text-white shadow-lg shadow-red-500/20 hover:scale-105 active:scale-95 translate-y-0"
                            : "bg-surface text-muted cursor-not-allowed"}
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
                        className="text-xs font-bold transition-colors px-4 py-2 rounded-lg text-muted hover:text-foreground hover:bg-surface"
                    >
                        Цуцлах
                    </button>
                </div>
            )}
        </form>
    );
}
