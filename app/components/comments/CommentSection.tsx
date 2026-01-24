"use client";

import { MessageSquare, LogIn, RefreshCcw } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import CommentItem from "./CommentItem";
import CommentInput from "./CommentInput";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface CommentSectionProps {
    mangaId: number;
    chapterId?: number;
}

export default function CommentSection({ mangaId, chapterId }: CommentSectionProps) {
    const { data: session } = useSession();
    const queryClient = useQueryClient();

    const queryKey = ["comments", mangaId, chapterId];

    // Fetch comments query
    const { data: comments = [], isLoading, refetch } = useQuery({
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
            const previousComments = queryClient.getQueryData(queryKey);

            // Create a pseudo-comment for optimistic UI
            const optimisticComment = {
                id: `temp-${Date.now()}`,
                content: newCommentContent,
                createdAt: new Date().toISOString(),
                user: {
                    id: session?.user?.id,
                    name: session?.user?.name,
                    image: session?.user?.image,
                    role: (session?.user as any)?.role || "USER",
                },
                _count: { likes: 0, replies: 0 },
                likes: [],
                replies: [],
                isOptimistic: true,
            };

            queryClient.setQueryData(queryKey, (old: any) => [optimisticComment, ...(old || [])]);

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
        <section className="py-12 border-t border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[#d8454f]/5 text-[#d8454f] rounded-2xl flex items-center justify-center shadow-sm border border-[#d8454f]/10">
                        <MessageSquare size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 leading-tight">Сэтгэгдэл</h2>
                        <p className="text-gray-400 text-sm font-medium">
                            Нийт {comments.reduce((acc: number, c: any) => acc + 1 + (c.replies?.length || 0), 0)} сэтгэгдэл
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => refetch()}
                    className="p-2.5 hover:bg-gray-50 rounded-xl text-gray-400 hover:text-gray-900 transition-all active:rotate-180 duration-500 border border-transparent hover:border-gray-100"
                    title="Шинэчлэх"
                >
                    <RefreshCcw size={20} />
                </button>
            </div>

            {/* Input Section */}
            {session ? (
                <CommentInput onSubmit={handlePostComment} isLoading={postMutation.isPending} />
            ) : (
                <div className="bg-gray-50/50 border-2 border-dashed border-gray-200 rounded-3xl p-10 text-center mb-10 group hover:border-[#d8454f]/30 hover:bg-white transition-all duration-300">
                    <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                        <LogIn className="text-gray-400 group-hover:text-[#d8454f] transition-colors" size={32} />
                    </div>
                    <p className="text-gray-500 mb-6 font-medium">Сэтгэгдэл бичихийн тулд нэвтэрнэ үү.</p>
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
                            <div className="w-11 h-11 bg-gray-100 rounded-2xl" />
                            <div className="flex-grow space-y-3">
                                <div className="h-4 bg-gray-100 rounded-lg w-1/4" />
                                <div className="h-20 bg-gray-50 rounded-2xl w-full" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : comments.length > 0 ? (
                <div className="space-y-2">
                    {comments.map((comment: any) => (
                        <CommentItem
                            key={comment.id}
                            comment={comment}
                            mangaId={mangaId}
                            onRefresh={() => refetch()}
                        />
                    ))}
                </div>
            ) : null}
        </section>
    );
}
