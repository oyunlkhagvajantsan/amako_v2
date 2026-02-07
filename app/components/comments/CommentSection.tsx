"use client";

import { MessageSquare, LogIn, RefreshCcw } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import CommentItem from "./CommentItem";
import CommentInput from "./CommentInput";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CommentData } from "@/lib/types";
import { logger } from "@/lib/logger";

interface CommentSectionProps {
    mangaId: number;
    chapterId?: number;
    variant?: 'light' | 'dark';
}

export default function CommentSection({ mangaId, chapterId, variant = 'light' }: CommentSectionProps) {
    const { data: session } = useSession();
    const queryClient = useQueryClient();

    const isDark = variant === 'dark';

    const queryKey = ["comments", mangaId, chapterId];

    // Fetch comments query
    const { data: comments = [], isLoading, refetch } = useQuery<CommentData[]>({
        queryKey,
        queryFn: async () => {
            const url = new URL(`/api/manga/${mangaId}/comments`, window.location.origin);
            if (chapterId) url.searchParams.append("chapterId", chapterId.toString());
            const res = await fetch(url.toString());
            if (!res.ok) throw new Error("Failed to fetch comments");
            return res.json();
        },
    });

    // Post comment mutation
    const postMutation = useMutation({
        mutationFn: async (content: string) => {
            const res = await fetch(`/api/manga/${mangaId}/comments`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content, chapterId })
            });
            if (!res.ok) throw new Error("Failed to post comment");
            return res.json();
        },
        // Optimistic Updates
        onMutate: async (newCommentContent) => {
            await queryClient.cancelQueries({ queryKey });
            const previousComments = queryClient.getQueryData<CommentData[]>(queryKey);

            if (!session?.user) return { previousComments };

            // Create a pseudo-comment for optimistic UI
            const optimisticComment: CommentData = {
                id: `temp-${Date.now()}`,
                content: newCommentContent,
                createdAt: new Date().toISOString(),
                userId: session.user.id,
                mangaId,
                chapterId: chapterId || null,
                isHidden: false,
                user: {
                    id: session.user.id,
                    username: session.user.username,
                    image: session.user.image || null,
                    role: session.user.role,
                },
                _count: { likes: 0, replies: 0 },
                likes: [],
                replies: [],
                isOptimistic: true,
            };

            queryClient.setQueryData(queryKey, (old: CommentData[] | undefined) => [optimisticComment, ...(old || [])]);

            return { previousComments };
        },
        onError: (err, newComment, context) => {
            queryClient.setQueryData(queryKey, context?.previousComments);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey });
        },
    });

    const handlePostComment = async (content: string) => {
        postMutation.mutate(content);
    };

    return (
        <section className={`py-12 border-t transform-gpu transition-all duration-700 ${isDark ? "border-gray-800/60" : "border-gray-100"}`}>
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm border ${isDark ? "bg-[#d8454f]/10 text-[#d8454f] border-[#d8454f]/20" : "bg-[#d8454f]/5 text-[#d8454f] border-[#d8454f]/10"}`}>
                        <MessageSquare size={24} />
                    </div>
                    <div>
                        <h2 className={`text-2xl font-bold leading-tight ${isDark ? "text-white" : "text-gray-900"}`}>Сэтгэгдэл</h2>
                        <p className={`text-sm font-medium ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                            Нийт {comments.reduce((acc: number, c: CommentData) => acc + 1 + (c.replies?.length || 0), 0)} сэтгэгдэл
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => refetch()}
                    className={`p-2.5 rounded-xl transition-all active:rotate-180 duration-500 border border-transparent ${isDark ? "text-gray-500 hover:text-white hover:bg-white/5 hover:border-white/10" : "text-gray-400 hover:text-gray-900 hover:bg-gray-50 hover:border-gray-100"}`}
                    title="Шинэчлэх"
                >
                    <RefreshCcw size={20} />
                </button>
            </div>

            {/* Input Section */}
            {session ? (
                <CommentInput onSubmit={handlePostComment} isLoading={postMutation.isPending} variant={variant} />
            ) : (
                <div className={`border-2 border-dashed rounded-3xl p-10 text-center mb-10 group transition-all duration-300 ${isDark ? "bg-white/5 border-white/10 hover:border-[#d8454f]/50 hover:bg-white/10" : "bg-gray-50/50 border-gray-200 hover:border-[#d8454f]/30 hover:bg-white"}`}>
                    <div className={`w-16 h-16 rounded-2xl shadow-sm border flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 ${isDark ? "bg-[#1a1a1a] border-white/10" : "bg-white border-gray-100"}`}>
                        <LogIn className={`transition-colors ${isDark ? "text-gray-500 group-hover:text-[#d8454f]" : "text-gray-400 group-hover:text-[#d8454f]"}`} size={32} />
                    </div>
                    <p className={`mb-6 font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}>Сэтгэгдэл бичихийн тулд нэвтэрнэ үү.</p>
                    <Link
                        href="/login"
                        className="inline-flex items-center px-8 py-3 bg-[#d8454f] hover:bg-[#c13a44] text-white font-bold rounded-2xl transition-all hover:scale-105 shadow-lg shadow-red-500/20 active:scale-95"
                    >
                        Нэвтрэх
                    </Link>
                </div>
            )}

            {/* Comments List */}
            {isLoading && comments.length === 0 ? (
                <div className="space-y-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="flex gap-4 animate-pulse">
                            <div className={`w-11 h-11 rounded-2xl ${isDark ? "bg-white/5" : "bg-gray-100"}`} />
                            <div className="flex-grow space-y-3">
                                <div className={`h-4 rounded-lg w-1/4 ${isDark ? "bg-white/5" : "bg-gray-100"}`} />
                                <div className={`h-20 rounded-2xl w-full ${isDark ? "bg-white/5" : "bg-gray-50"}`} />
                            </div>
                        </div>
                    ))}
                </div>
            ) : comments.length > 0 ? (
                <div className="space-y-2">
                    {comments.map((comment: CommentData) => (
                        <CommentItem
                            key={comment.id}
                            comment={comment}
                            mangaId={mangaId}
                            onRefresh={() => refetch()}
                            variant={variant}
                        />
                    ))}
                </div>
            ) : (
                <div className={`text-center py-16 rounded-3xl border-2 border-dashed ${isDark ? "border-white/5 bg-white/[0.02]" : "border-gray-100 bg-gray-50/30"}`}>
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 ${isDark ? "bg-white/5 text-gray-600" : "bg-white text-gray-300"}`}>
                        <MessageSquare size={28} />
                    </div>
                    <p className={`font-medium ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                        Одоогоор сэтгэгдэл байхгүй байна.
                    </p>
                </div>
            )}
        </section>
    );
}
