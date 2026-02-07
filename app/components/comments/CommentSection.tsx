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
    variant?: "light" | "dark";
}

export default function CommentSection({ mangaId, chapterId, variant = "light" }: CommentSectionProps) {
    const { data: session } = useSession();
    const queryClient = useQueryClient();


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
        <section className={`py-12 transform-gpu transition-all duration-700 ${variant === 'dark' ? 'bg-background/40' : ''}`}>
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm border bg-surface text-primary border-border hover:border-primary/30 transition-colors">
                        <MessageSquare size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold leading-tight text-foreground/80">Сэтгэгдэл</h2>
                        <p className="text-sm font-medium text-muted">
                            Нийт {comments.reduce((acc: number, c: CommentData) => acc + 1 + (c.replies?.length || 0), 0)} сэтгэгдэл
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => refetch()}
                    className="p-2.5 rounded-xl transition-all active:rotate-180 duration-500 border border-border text-muted hover:text-foreground hover:bg-surface hover:border-primary/30"
                    title="Шинэчлэх"
                >
                    <RefreshCcw size={20} />
                </button>
            </div>

            {/* Input Section */}
            {session ? (
                <CommentInput onSubmit={handlePostComment} isLoading={postMutation.isPending} />
            ) : (
                <div className="border-2 border-dashed rounded-3xl p-10 text-center mb-10 group transition-all duration-300 bg-surface border-border hover:border-primary/30 hover:bg-surface-elevated">
                    <div className="w-16 h-16 rounded-2xl shadow-sm border flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 bg-background border-border">
                        <LogIn className="transition-colors text-muted group-hover:text-primary" size={32} />
                    </div>
                    <p className="mb-6 font-medium text-muted">Сэтгэгдэл бичихийн тулд нэвтэрнэ үү.</p>
                    <Link
                        href="/login"
                        className="inline-flex items-center px-8 py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-2xl transition-all hover:scale-105 shadow-lg shadow-red-500/10 active:scale-95"
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
                            <div className="w-11 h-11 rounded-2xl bg-surface" />
                            <div className="flex-grow space-y-3">
                                <div className="h-4 rounded-lg w-1/4 bg-surface" />
                                <div className="h-20 rounded-2xl w-full bg-surface" />
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
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 rounded-3xl border-2 border-dashed border-border bg-surface">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-background text-muted">
                        <MessageSquare size={28} />
                    </div>
                    <p className="font-medium text-muted">
                        Одоогоор сэтгэгдэл байхгүй байна.
                    </p>
                </div>
            )}
        </section>
    );
}
