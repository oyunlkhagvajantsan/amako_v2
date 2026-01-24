"use client";

import { useState, useEffect, useCallback } from "react";
import { MessageSquare, LogIn, RefreshCcw } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import CommentItem from "./CommentItem";
import CommentInput from "./CommentInput";

interface CommentSectionProps {
    mangaId: number;
    chapterId?: number;
}

export default function CommentSection({ mangaId, chapterId }: CommentSectionProps) {
    const { data: session } = useSession();
    const [comments, setComments] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isPosting, setIsPosting] = useState(false);

    const fetchComments = useCallback(async () => {
        setIsLoading(true);
        try {
            const url = new URL(`/api/manga/${mangaId}/comments`, window.location.origin);
            if (chapterId) url.searchParams.append("chapterId", chapterId.toString());

            const res = await fetch(url.toString());
            if (res.ok) {
                const data = await res.json();
                setComments(data);
            }
        } catch (error) {
            console.error("Fetch comments error:", error);
        } finally {
            setIsLoading(false);
        }
    }, [mangaId, chapterId]);

    useEffect(() => {
        fetchComments();
    }, [fetchComments]);

    const handlePostComment = async (content: string) => {
        setIsPosting(true);
        try {
            const res = await fetch(`/api/manga/${mangaId}/comments`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content, chapterId })
            });
            if (res.ok) {
                await fetchComments();
            }
        } catch (error) {
            console.error("Post comment error:", error);
        } finally {
            setIsPosting(false);
        }
    };

    return (
        <section className="py-8 border-t border-gray-800/30 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-950/20 text-[#d8454f] rounded-xl flex items-center justify-center">
                        <MessageSquare size={22} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white leading-tight">Сэтгэгдэл</h2>
                        <p className="text-gray-500 text-sm">
                            Нийт {comments.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0)} сэтгэгдэл
                        </p>
                    </div>
                </div>
                <button
                    onClick={fetchComments}
                    className="p-2 hover:bg-gray-800 rounded-lg text-gray-500 hover:text-white transition-all active:rotate-180 duration-500"
                    title="Шинэчлэх"
                >
                    <RefreshCcw size={20} />
                </button>
            </div>

            {/* Input Section */}
            {session ? (
                <CommentInput onSubmit={handlePostComment} />
            ) : (
                <div className="bg-[#1e1e1e]/40 border-2 border-dashed border-gray-800 rounded-2xl p-8 text-center mb-10 group hover:border-[#d8454f]/50 transition-colors duration-300">
                    <LogIn className="mx-auto mb-3 text-gray-600 group-hover:text-[#d8454f] transition-colors" size={32} />
                    <p className="text-gray-400 mb-4">Сэтгэгдэл бичихийн тулд нэвтэрнэ үү.</p>
                    <Link
                        href="/login"
                        className="inline-flex items-center px-6 py-2.5 bg-[#d8454f] hover:bg-[#c13a44] text-white font-semibold rounded-xl transition-all hover:scale-105"
                    >
                        Нэвтрэх
                    </Link>
                </div>
            )}

            {/* Comments List */}
            {isLoading && comments.length === 0 ? (
                <div className="space-y-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="flex gap-3 animate-pulse">
                            <div className="w-10 h-10 bg-gray-800 rounded-full" />
                            <div className="flex-grow space-y-2">
                                <div className="h-4 bg-gray-800 rounded w-1/4" />
                                <div className="h-20 bg-gray-800 rounded-2xl w-full" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : comments.length > 0 ? (
                <div className="space-y-2">
                    {comments.map(comment => (
                        <CommentItem
                            key={comment.id}
                            comment={comment}
                            mangaId={mangaId}
                            onRefresh={fetchComments}
                        />
                    ))}
                </div>
            ) : null}
        </section>
    );
}
